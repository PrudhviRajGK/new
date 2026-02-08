const { Workflow, WorkflowExecution, Lead, Tenant } = require('../../database/models');
const { AppError } = require('../../shared/middleware/error-handler');
const whatsappService = require('../whatsapp/whatsapp.service');
const webhookService = require('../webhook/webhook.service');
const logger = require('../../shared/utils/logger');

class WorkflowService {
  async _getTenantUuid(tenantId) {
    const tenant = await Tenant.findOne({ where: { tenant_id: tenantId } });
    if (!tenant) throw new AppError('Tenant not found', 404);
    return tenant.id;
  }

  async createWorkflow(tenantId, data) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const workflow = await Workflow.create({
      tenant_id: tenantUuid,
      name: data.name,
      description: data.description,
      trigger_type: data.triggerType,
      trigger_config: data.triggerConfig || {},
      conditions: data.conditions || [],
      actions: data.actions || [],
      status: data.status || 'draft',
      priority: data.priority || 0
    });

    logger.info(`Workflow created: ${workflow.id}`);
    return workflow;
  }

  async getWorkflows(tenantId, filters = {}) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const where = { tenant_id: tenantUuid };
    if (filters.status) where.status = filters.status;
    if (filters.triggerType) where.trigger_type = filters.triggerType;

    return Workflow.findAll({ where, order: [['priority', 'DESC'], ['created_at', 'DESC']] });
  }

  async getWorkflowById(tenantId, workflowId) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const workflow = await Workflow.findOne({
      where: { id: workflowId, tenant_id: tenantUuid }
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    return workflow;
  }

  async updateWorkflow(tenantId, workflowId, data) {
    const workflow = await this.getWorkflowById(tenantId, workflowId);
    await workflow.update(data);
    logger.info(`Workflow updated: ${workflowId}`);
    return workflow;
  }

  async deleteWorkflow(tenantId, workflowId) {
    const workflow = await this.getWorkflowById(tenantId, workflowId);
    await workflow.destroy();
    logger.info(`Workflow deleted: ${workflowId}`);
  }

  async executeWorkflow(workflowId, triggerData) {
    const workflow = await Workflow.findByPk(workflowId);
    if (!workflow || workflow.status !== 'active') {
      throw new AppError('Workflow not active', 400);
    }

    const execution = await WorkflowExecution.create({
      workflow_id: workflowId,
      lead_id: triggerData.leadId,
      status: 'running',
      trigger_data: triggerData,
      execution_log: [],
      started_at: new Date()
    });

    try {
      // Evaluate conditions
      const conditionsMet = await this.evaluateConditions(workflow.conditions, triggerData);
      
      if (!conditionsMet) {
        await execution.update({
          status: 'completed',
          result: { skipped: true, reason: 'Conditions not met' },
          completed_at: new Date()
        });
        return execution;
      }

      // Execute actions - get tenant_id string for external services (whatsapp, webhook)
      const tenant = await Tenant.findByPk(workflow.tenant_id);
      const tenantIdStr = tenant?.tenant_id;
      const results = [];
      for (const action of workflow.actions) {
        const result = await this.executeAction(action, triggerData, tenantIdStr);
        results.push(result);
        execution.execution_log.push({
          action: action.type,
          timestamp: new Date(),
          result
        });
      }

      await execution.update({
        status: 'completed',
        result: { success: true, actions: results },
        execution_log: execution.execution_log,
        completed_at: new Date()
      });

      await workflow.update({
        execution_count: workflow.execution_count + 1,
        success_count: workflow.success_count + 1,
        last_executed_at: new Date()
      });

      logger.info(`Workflow executed successfully: ${workflowId}`);
      return execution;
    } catch (error) {
      await execution.update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date()
      });

      await workflow.update({
        execution_count: workflow.execution_count + 1,
        failure_count: workflow.failure_count + 1
      });

      logger.error(`Workflow execution failed: ${workflowId}`, error);
      throw error;
    }
  }

  async evaluateConditions(conditions, data) {
    if (!conditions || conditions.length === 0) return true;

    for (const condition of conditions) {
      const { field, operator, value } = condition;
      const fieldValue = this.getNestedValue(data, field);

      let met = false;
      switch (operator) {
        case 'equals':
          met = fieldValue == value;
          break;
        case 'not_equals':
          met = fieldValue != value;
          break;
        case 'greater_than':
          met = fieldValue > value;
          break;
        case 'less_than':
          met = fieldValue < value;
          break;
        case 'contains':
          met = String(fieldValue).includes(value);
          break;
        case 'in':
          met = Array.isArray(value) && value.includes(fieldValue);
          break;
        default:
          met = true;
      }

      if (!met) return false;
    }

    return true;
  }

  async executeAction(action, triggerData, tenantId) {
    const { type, config } = action;

    switch (type) {
      case 'send_whatsapp_message':
        return this.sendWhatsAppMessage(tenantId, triggerData.leadId, config);
      
      case 'assign_rep':
        return this.assignRep(tenantId, triggerData.leadId, config);
      
      case 'update_lead_field':
        return this.updateLeadField(tenantId, triggerData.leadId, config);
      
      case 'trigger_webhook':
        return this.triggerWebhook(tenantId, config, triggerData);
      
      case 'delay':
        return this.delay(config.delayMs || 1000);
      
      default:
        logger.warn(`Unknown action type: ${type}`);
        return { success: false, message: 'Unknown action type' };
    }
  }

  async sendWhatsAppMessage(tenantId, leadId, config) {
    const lead = await Lead.findByPk(leadId);
    await whatsappService.sendSessionMessage(tenantId, lead.whatsapp_number, config.message);
    return { success: true, action: 'message_sent' };
  }

  async assignRep(tenantId, leadId, config) {
    await Lead.update({ assigned_to: config.userId }, { where: { id: leadId } });
    return { success: true, action: 'rep_assigned' };
  }

  async updateLeadField(tenantId, leadId, config) {
    const updateData = {};
    updateData[config.field] = config.value;
    await Lead.update(updateData, { where: { id: leadId } });
    return { success: true, action: 'field_updated' };
  }

  async triggerWebhook(tenantId, config, data) {
    await webhookService.sendWebhook(tenantId, config.eventType, data);
    return { success: true, action: 'webhook_triggered' };
  }

  async delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return { success: true, action: 'delayed', duration: ms };
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async triggerWorkflowsByEvent(tenantId, triggerType, data) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const workflows = await Workflow.findAll({
      where: {
        tenant_id: tenantUuid,
        trigger_type: triggerType,
        status: 'active'
      },
      order: [['priority', 'DESC']]
    });

    const executions = [];
    for (const workflow of workflows) {
      try {
        const execution = await this.executeWorkflow(workflow.id, data);
        executions.push(execution);
      } catch (error) {
        logger.error(`Workflow trigger error: ${workflow.id}`, error);
      }
    }

    return executions;
  }
}

module.exports = new WorkflowService();

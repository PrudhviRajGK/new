const { Lead, LeadStage, User, Tenant, sequelize } = require('../../database/models');
const { AppError } = require('../../shared/middleware/error-handler');
const whatsappService = require('../whatsapp/whatsapp.service');
const aiOrchestrator = require('../ai-orchestrator/ai-orchestrator.service');
const logger = require('../../shared/utils/logger');
const { Op } = require('sequelize');

class LeadService {
  async _getTenantUuid(tenantId) {
    const tenant = await Tenant.findOne({ where: { tenant_id: tenantId } });
    if (!tenant) throw new AppError('Tenant not found', 404);
    return tenant.id;
  }

  async createLead(tenantId, data) {
    try {
      const tenantUuid = await this._getTenantUuid(tenantId);

      // Check if lead already exists
      const existing = await Lead.findOne({
        where: { tenant_id: tenantUuid, whatsapp_number: data.whatsappNumber }
      });

      if (existing) {
        throw new AppError('Lead with this WhatsApp number already exists', 400);
      }

      // Get default stage
      const defaultStage = await LeadStage.findOne({
        where: { tenant_id: tenantUuid, is_default: true }
      });

      const lead = await Lead.create({
        tenant_id: tenantUuid,
        whatsapp_number: data.whatsappNumber,
        name: data.name,
        email: data.email,
        company: data.company,
        stage_id: defaultStage?.id,
        source: data.source || 'whatsapp',
        status: 'new',
        tags: data.tags || [],
        custom_fields: data.customFields || {}
      });

      // Add contact to WhatsApp
      try {
        await whatsappService.addContact(tenantId, data.whatsappNumber, {
          name: data.name,
          email: data.email,
          company: data.company
        });
      } catch (error) {
        logger.warn('Failed to add contact to WhatsApp:', error.message);
      }

      logger.info(`Lead created: ${lead.id}`);
      return lead;
    } catch (error) {
      logger.error('Create lead error:', error);
      throw error;
    }
  }

  async getLeads(tenantId, filters = {}, pagination = {}) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const { page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const where = { tenant_id: tenantUuid };

    if (filters.status) where.status = filters.status;
    if (filters.stageId) where.stage_id = filters.stageId;
    if (filters.assignedTo) where.assigned_to = filters.assignedTo;
    if (filters.qualificationStatus) where.qualification_status = filters.qualificationStatus;
    if (filters.minScore) where.lead_score = { [Op.gte]: filters.minScore };
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
        { company: { [Op.iLike]: `%${filters.search}%` } },
        { whatsapp_number: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const { rows: leads, count } = await Lead.findAndCountAll({
      where,
      include: [
        { model: LeadStage, as: 'stage' },
        { model: User, as: 'assignedUser', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      leads,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async getLeadById(tenantId, leadId) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const lead = await Lead.findOne({
      where: { id: leadId, tenant_id: tenantUuid },
      include: [
        { model: LeadStage, as: 'stage' },
        { model: User, as: 'assignedUser', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    return lead;
  }

  async updateLead(tenantId, leadId, data) {
    const lead = await this.getLeadById(tenantId, leadId);
    const tenantUuid = await this._getTenantUuid(tenantId);

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.company) updateData.company = data.company;
    if (data.stageId) updateData.stage_id = data.stageId;
    if (data.assignedTo) updateData.assigned_to = data.assignedTo;
    if (data.status) updateData.status = data.status;
    if (data.tags) updateData.tags = data.tags;
    if (data.customFields) updateData.custom_fields = data.customFields;

    await lead.update(updateData);

    // Update WhatsApp contact attributes (tenantId string for API lookup)
    if (data.name || data.email || data.company) {
      try {
        const tenant = await Tenant.findOne({ where: { id: tenantUuid } });
        await whatsappService.updateContactAttributes(tenant?.tenant_id || tenantId, lead.whatsapp_number, {
          name: data.name || lead.name,
          email: data.email || lead.email,
          company: data.company || lead.company
        });
      } catch (error) {
        logger.warn('Failed to update WhatsApp contact:', error.message);
      }
    }

    logger.info(`Lead updated: ${leadId}`);
    return lead;
  }

  async assignLead(tenantId, leadId, userId) {
    const lead = await this.getLeadById(tenantId, leadId);
    const tenantUuid = await this._getTenantUuid(tenantId);
    
    const user = await User.findOne({
      where: { id: userId, tenant_id: tenantUuid }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await lead.update({ assigned_to: userId });

    // Assign operator in WhatsApp
    try {
      await whatsappService.assignOperator(tenantId, lead.whatsapp_number, userId);
    } catch (error) {
      logger.warn('Failed to assign operator in WhatsApp:', error.message);
    }

    logger.info(`Lead ${leadId} assigned to user ${userId}`);
    return lead;
  }

  async qualifyLead(tenantId, leadId) {
    const lead = await this.getLeadById(tenantId, leadId);

    const qualification = await aiOrchestrator.qualifyLead(tenantId, leadId);
    
    await lead.reload();

    logger.info(`Lead qualified: ${leadId}, score: ${lead.lead_score}`);
    return { lead, qualification };
  }

  async updateLeadStage(tenantId, leadId, stageId) {
    const lead = await this.getLeadById(tenantId, leadId);
    const tenantUuid = await this._getTenantUuid(tenantId);
    
    const stage = await LeadStage.findOne({
      where: { id: stageId, tenant_id: tenantUuid }
    });

    if (!stage) {
      throw new AppError('Stage not found', 404);
    }

    const oldStageId = lead.stage_id;
    await lead.update({ stage_id: stageId });

    logger.info(`Lead ${leadId} moved from stage ${oldStageId} to ${stageId}`);
    
    return lead;
  }

  async deleteLead(tenantId, leadId) {
    const lead = await this.getLeadById(tenantId, leadId);
    await lead.destroy();
    logger.info(`Lead deleted: ${leadId}`);
  }

  async getLeadStats(tenantId) {
    const tenantUuid = await this._getTenantUuid(tenantId);
    const total = await Lead.count({ where: { tenant_id: tenantUuid } });
    const newLeads = await Lead.count({ where: { tenant_id: tenantUuid, status: 'new' } });
    const qualified = await Lead.count({ where: { tenant_id: tenantUuid, qualification_status: 'qualified' } });
    const converted = await Lead.count({ where: { tenant_id: tenantUuid, status: 'converted' } });

    const avgScore = await Lead.findOne({
      where: { tenant_id: tenantUuid },
      attributes: [[sequelize.fn('AVG', sequelize.col('lead_score')), 'avgScore']]
    });

    return {
      total,
      new: newLeads,
      qualified,
      converted,
      averageScore: parseFloat(avgScore?.dataValues?.avgScore || 0).toFixed(2)
    };
  }
}

module.exports = new LeadService();

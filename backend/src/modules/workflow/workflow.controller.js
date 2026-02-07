const workflowService = require('./workflow.service');

class WorkflowController {
  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.params.tenantId, req.body);
      res.status(201).json({ success: true, data: workflow });
    } catch (error) {
      next(error);
    }
  }

  async getWorkflows(req, res, next) {
    try {
      const workflows = await workflowService.getWorkflows(req.params.tenantId, req.query);
      res.json({ success: true, data: workflows });
    } catch (error) {
      next(error);
    }
  }

  async getWorkflowById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.tenantId, req.params.workflowId);
      res.json({ success: true, data: workflow });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.tenantId, req.params.workflowId, req.body);
      res.json({ success: true, data: workflow });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      await workflowService.deleteWorkflow(req.params.tenantId, req.params.workflowId);
      res.json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const execution = await workflowService.executeWorkflow(req.params.workflowId, req.body);
      res.json({ success: true, data: execution });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkflowController();

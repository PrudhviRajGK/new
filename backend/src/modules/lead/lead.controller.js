const leadService = require('./lead.service');

class LeadController {
  async createLead(req, res, next) {
    try {
      const lead = await leadService.createLead(req.params.tenantId, req.body);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async getLeads(req, res, next) {
    try {
      const result = await leadService.getLeads(
        req.params.tenantId,
        req.query,
        {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 50,
          sortBy: req.query.sortBy,
          sortOrder: req.query.sortOrder
        }
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getLeadById(req, res, next) {
    try {
      const lead = await leadService.getLeadById(req.params.tenantId, req.params.leadId);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req, res, next) {
    try {
      const lead = await leadService.updateLead(req.params.tenantId, req.params.leadId, req.body);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async assignLead(req, res, next) {
    try {
      const lead = await leadService.assignLead(req.params.tenantId, req.params.leadId, req.body.userId);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async qualifyLead(req, res, next) {
    try {
      const result = await leadService.qualifyLead(req.params.tenantId, req.params.leadId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateStage(req, res, next) {
    try {
      const lead = await leadService.updateLeadStage(req.params.tenantId, req.params.leadId, req.body.stageId);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req, res, next) {
    try {
      await leadService.deleteLead(req.params.tenantId, req.params.leadId);
      res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await leadService.getLeadStats(req.params.tenantId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadController();

const express = require('express');
const { Lead, Workflow, WorkflowExecution, sequelize } = require('../../database/models');
const Conversation = require('../../database/schemas/conversation.schema');
const { checkPermission } = require('../../shared/middleware/auth.middleware');
const { Op } = require('sequelize');

const router = express.Router({ mergeParams: true });

router.get('/dashboard',
  checkPermission('analytics', 'view'),
  async (req, res, next) => {
    try {
      const tenantId = req.params.tenantId;
      const { startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate) dateFilter[Op.gte] = new Date(startDate);
      if (endDate) dateFilter[Op.lte] = new Date(endDate);

      // Get tenant UUID from tenant_id string
      const { Tenant } = require('../../database/models');
      const tenant = await Tenant.findOne({ where: { tenant_id: tenantId } });
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      const [
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        activeConversations,
        workflowExecutions
      ] = await Promise.all([
        Lead.count({ where: { tenant_id: tenant.id } }),
        Lead.count({ where: { tenant_id: tenant.id, status: 'new' } }),
        Lead.count({ where: { tenant_id: tenant.id, qualification_status: 'qualified' } }),
        Lead.count({ where: { tenant_id: tenant.id, status: 'converted' } }),
        Conversation.countDocuments({ tenant_id: tenantId, status: 'active' }),
        WorkflowExecution.count({ where: { status: 'completed' } })
      ]);

      const avgScore = await Lead.findOne({
        where: { tenant_id: tenant.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('lead_score')), 'avgScore']]
      });

      const activeWorkflows = await Workflow.count({ 
        where: { tenant_id: tenant.id, status: 'active' } 
      });

      res.json({
        success: true,
        data: {
          totalLeads,
          newLeads,
          qualifiedLeads,
          convertedLeads,
          activeConversations,
          workflowExecutions,
          activeWorkflows,
          averageLeadScore: parseFloat(avgScore?.dataValues?.avgScore || 0).toFixed(2),
          conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

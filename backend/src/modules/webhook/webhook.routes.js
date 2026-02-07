const express = require('express');
const webhookService = require('./webhook.service');
const { checkPermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.get('/logs',
  checkPermission('settings', 'view'),
  async (req, res, next) => {
    try {
      const logs = await webhookService.getWebhookLogs(req.params.tenantId, req.query);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

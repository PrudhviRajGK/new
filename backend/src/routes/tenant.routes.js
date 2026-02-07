const express = require('express');
const { authenticate, validateTenant } = require('../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

// Apply authentication and tenant validation to all routes
router.use(authenticate);
router.use(validateTenant);

// Module routes
router.use('/leads', require('../modules/lead/lead.routes'));
router.use('/conversations', require('../modules/conversation/conversation.routes'));
router.use('/workflows', require('../modules/workflow/workflow.routes'));
router.use('/analytics', require('../modules/analytics/analytics.routes'));
router.use('/whatsapp', require('../modules/whatsapp/whatsapp.routes'));
router.use('/webhooks', require('../modules/webhook/webhook.routes'));
router.use('/users', require('../modules/user/user.routes'));
router.use('/settings', require('../modules/tenant/tenant.routes'));
router.use('/ai-prompts', require('../modules/ai-prompt/ai-prompt.routes'));

// WhatsApp API routes (WATI-compatible paths)
router.use('/api/v1', require('../modules/whatsapp/whatsapp.routes'));
router.use('/api/v2', require('../modules/whatsapp/whatsapp.routes'));

module.exports = router;

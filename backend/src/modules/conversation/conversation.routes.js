const express = require('express');
const { body, param } = require('express-validator');
const conversationController = require('./conversation.controller');
const { validate } = require('../../shared/middleware/validation.middleware');
const { checkPermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.get('/',
  checkPermission('conversations', 'view'),
  conversationController.getConversations
);

router.get('/:conversationId',
  checkPermission('conversations', 'view'),
  conversationController.getConversationById
);

router.get('/lead/:leadId',
  checkPermission('conversations', 'view'),
  [param('leadId').isUUID(), validate],
  conversationController.getConversationByLead
);

router.get('/lead/:leadId/messages',
  checkPermission('conversations', 'view'),
  [param('leadId').isUUID(), validate],
  conversationController.getMessages
);

router.post('/lead/:leadId/messages',
  checkPermission('conversations', 'reply'),
  [
    param('leadId').isUUID(),
    body('content').notEmpty().trim(),
    validate
  ],
  conversationController.sendMessage
);

module.exports = router;

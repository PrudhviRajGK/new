const express = require('express');
const multer = require('multer');
const whatsappController = require('./whatsapp.controller');
const { checkPermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });

// Messaging & Contacts - GET endpoints
router.get('/getMessages/:whatsappNumber',
  checkPermission('conversations', 'view'),
  whatsappController.getMessages
);

router.get('/getMessageTemplates',
  checkPermission('conversations', 'view'),
  whatsappController.getMessageTemplates
);

router.get('/getContacts',
  checkPermission('leads', 'view'),
  whatsappController.getContacts
);

router.get('/getMedia',
  checkPermission('conversations', 'view'),
  whatsappController.getMedia
);

// Contact Management - POST endpoints
router.post('/addContact/:whatsappNumber',
  checkPermission('leads', 'create'),
  whatsappController.addContact
);

router.post('/updateContactAttributes/:whatsappNumber',
  checkPermission('leads', 'update'),
  whatsappController.updateContactAttributes
);

router.post('/updateContactAttributesForMultiContacts',
  checkPermission('leads', 'update'),
  whatsappController.updateContactAttributesForMultiContacts
);

// Sending Messages - POST endpoints
router.post('/sendSessionMessage/:whatsappNumber',
  checkPermission('conversations', 'reply'),
  whatsappController.sendSessionMessage
);

router.post('/sendSessionFile/:whatsappNumber',
  checkPermission('conversations', 'reply'),
  upload.single('file'),
  whatsappController.sendSessionFile
);

router.post('/sendSessionFileViaUrl/:whatsappNumber',
  checkPermission('conversations', 'reply'),
  whatsappController.sendSessionFileViaUrl
);

router.post('/sendTemplateMessage',
  checkPermission('conversations', 'reply'),
  whatsappController.sendTemplateMessage
);

router.post('/sendTemplateMessages',
  checkPermission('conversations', 'reply'),
  whatsappController.sendTemplateMessages
);

router.post('/sendTemplateMessageCSV',
  checkPermission('conversations', 'reply'),
  upload.single('file'),
  whatsappController.sendTemplateMessageCSV
);

router.post('/sendInteractiveButtonsMessage',
  checkPermission('conversations', 'reply'),
  whatsappController.sendInteractiveButtonsMessage
);

router.post('/sendInteractiveListMessage',
  checkPermission('conversations', 'reply'),
  whatsappController.sendInteractiveListMessage
);

// Assignment & Automation - POST endpoints
router.post('/assignOperator',
  checkPermission('conversations', 'assign'),
  whatsappController.assignOperator
);

router.post('/assignTeam',
  checkPermission('conversations', 'assign'),
  whatsappController.assignTeam
);

router.get('/chatbots',
  checkPermission('workflows', 'view'),
  whatsappController.getChatbots
);

router.post('/chatbots/start',
  checkPermission('workflows', 'execute'),
  whatsappController.startChatbot
);

router.post('/updateChatStatus',
  checkPermission('conversations', 'update'),
  whatsappController.updateChatStatus
);

// Token & Versioning
router.post('/rotateToken',
  checkPermission('settings', 'manage'),
  whatsappController.rotateToken
);

// V2 API endpoints
router.post('/v2/sendTemplateMessage',
  checkPermission('conversations', 'reply'),
  whatsappController.sendTemplateMessageV2
);

router.post('/v2/sendTemplateMessages',
  checkPermission('conversations', 'reply'),
  whatsappController.sendTemplateMessagesV2
);

// Campaign APIs
router.post('/broadcast/schedule',
  checkPermission('conversations', 'reply'),
  whatsappController.scheduleBroadcast
);

// WhatsApp Payment APIs
router.post('/order_details',
  checkPermission('conversations', 'reply'),
  whatsappController.sendOrderDetails
);

router.post('/order_details_template',
  checkPermission('conversations', 'reply'),
  whatsappController.sendOrderDetailsTemplate
);

router.post('/order_status',
  checkPermission('conversations', 'update'),
  whatsappController.updateOrderStatus
);

router.post('/order_status_template',
  checkPermission('conversations', 'update'),
  whatsappController.updateOrderStatusTemplate
);

router.post('/checkout_button_template',
  checkPermission('conversations', 'reply'),
  whatsappController.sendCheckoutButtonTemplate
);

router.get('/order_details/:referenceId',
  checkPermission('conversations', 'view'),
  whatsappController.getOrderDetails
);

router.get('/payment_status/:referenceId',
  checkPermission('conversations', 'view'),
  whatsappController.getPaymentStatus
);

module.exports = router;

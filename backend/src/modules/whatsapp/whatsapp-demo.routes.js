const express = require('express');
const multer = require('multer');
const whatsappController = require('./whatsapp-demo.controller');

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });

// Messaging & Contacts - GET endpoints
router.get('/getMessages/:whatsappNumber', whatsappController.getMessages);
router.get('/getMessageTemplates', whatsappController.getMessageTemplates);
router.get('/getContacts', whatsappController.getContacts);
router.get('/getMedia', whatsappController.getMedia);

// Contact Management - POST endpoints
router.post('/addContact/:whatsappNumber', whatsappController.addContact);
router.post('/updateContactAttributes/:whatsappNumber', whatsappController.updateContactAttributes);
router.post('/updateContactAttributesForMultiContacts', whatsappController.updateContactAttributesForMultiContacts);

// Sending Messages - POST endpoints
router.post('/sendSessionMessage/:whatsappNumber', whatsappController.sendSessionMessage);
router.post('/sendSessionFile/:whatsappNumber', upload.single('file'), whatsappController.sendSessionFile);
router.post('/sendSessionFileViaUrl/:whatsappNumber', whatsappController.sendSessionFileViaUrl);
router.post('/sendTemplateMessage', whatsappController.sendTemplateMessage);
router.post('/sendTemplateMessages', whatsappController.sendTemplateMessages);
router.post('/sendTemplateMessageCSV', upload.single('file'), whatsappController.sendTemplateMessageCSV);
router.post('/sendInteractiveButtonsMessage', whatsappController.sendInteractiveButtonsMessage);
router.post('/sendInteractiveListMessage', whatsappController.sendInteractiveListMessage);

// Assignment & Automation - POST endpoints
router.post('/assignOperator', whatsappController.assignOperator);
router.post('/assignTeam', whatsappController.assignTeam);
router.get('/chatbots', whatsappController.getChatbots);
router.post('/chatbots/start', whatsappController.startChatbot);
router.post('/updateChatStatus', whatsappController.updateChatStatus);

// Token & Versioning
router.post('/rotateToken', whatsappController.rotateToken);

// Campaign APIs
router.post('/broadcast/schedule', whatsappController.scheduleBroadcast);

// WhatsApp Payment APIs
router.post('/order_details', whatsappController.sendOrderDetails);
router.post('/order_details_template', whatsappController.sendOrderDetailsTemplate);
router.post('/order_status', whatsappController.updateOrderStatus);
router.post('/order_status_template', whatsappController.updateOrderStatusTemplate);
router.post('/checkout_button_template', whatsappController.sendCheckoutButtonTemplate);
router.get('/order_details/:referenceId', whatsappController.getOrderDetails);
router.get('/payment_status/:referenceId', whatsappController.getPaymentStatus);

module.exports = router;

const whatsappService = require('./whatsapp-demo.service');

class WhatsAppDemoController {
  // Messaging & Contacts
  async getMessages(req, res, next) {
    try {
      const messages = await whatsappService.getMessages(
        req.params.tenantId,
        req.params.whatsappNumber,
        req.query
      );
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async getMessageTemplates(req, res, next) {
    try {
      const templates = await whatsappService.getMessageTemplates(req.params.tenantId);
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  async getContacts(req, res, next) {
    try {
      const contacts = await whatsappService.getContacts(req.params.tenantId, req.query);
      res.json({ success: true, data: contacts });
    } catch (error) {
      next(error);
    }
  }

  async getMedia(req, res, next) {
    try {
      const media = await whatsappService.getMedia(req.params.tenantId, req.query.mediaId);
      res.json({ success: true, data: media });
    } catch (error) {
      next(error);
    }
  }

  async addContact(req, res, next) {
    try {
      const result = await whatsappService.addContact(
        req.params.tenantId,
        req.params.whatsappNumber,
        req.body
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Contact Updates
  async updateContactAttributes(req, res, next) {
    try {
      const result = await whatsappService.updateContactAttributes(
        req.params.tenantId,
        req.params.whatsappNumber,
        req.body.attributes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateContactAttributesForMultiContacts(req, res, next) {
    try {
      const result = await whatsappService.updateContactAttributesForMultiContacts(
        req.params.tenantId,
        req.body.contacts
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Sending Messages
  async sendSessionMessage(req, res, next) {
    try {
      const result = await whatsappService.sendSessionMessage(
        req.params.tenantId,
        req.params.whatsappNumber,
        req.body.message
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendSessionFile(req, res, next) {
    try {
      const result = await whatsappService.sendSessionFile(
        req.params.tenantId,
        req.params.whatsappNumber,
        req.file,
        req.body.caption
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendSessionFileViaUrl(req, res, next) {
    try {
      const result = await whatsappService.sendSessionFileViaUrl(
        req.params.tenantId,
        req.params.whatsappNumber,
        req.body.fileUrl,
        req.body.caption
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendTemplateMessage(req, res, next) {
    try {
      const result = await whatsappService.sendTemplateMessage(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendTemplateMessages(req, res, next) {
    try {
      const result = await whatsappService.sendTemplateMessages(req.params.tenantId, req.body.messages);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendTemplateMessageCSV(req, res, next) {
    try {
      const result = await whatsappService.sendTemplateMessageCSV(
        req.params.tenantId,
        req.file,
        req.body.templateName
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendInteractiveButtonsMessage(req, res, next) {
    try {
      const result = await whatsappService.sendInteractiveButtonsMessage(
        req.params.tenantId,
        req.body.whatsappNumber,
        req.body
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendInteractiveListMessage(req, res, next) {
    try {
      const result = await whatsappService.sendInteractiveListMessage(
        req.params.tenantId,
        req.body.whatsappNumber,
        req.body
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Assignment & Automation
  async assignOperator(req, res, next) {
    try {
      const result = await whatsappService.assignOperator(
        req.params.tenantId,
        req.body.whatsappNumber,
        req.body.operatorId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async assignTeam(req, res, next) {
    try {
      const result = await whatsappService.assignTeam(
        req.params.tenantId,
        req.body.whatsappNumber,
        req.body.teamId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getChatbots(req, res, next) {
    try {
      const chatbots = await whatsappService.getChatbots(req.params.tenantId);
      res.json({ success: true, data: chatbots });
    } catch (error) {
      next(error);
    }
  }

  async startChatbot(req, res, next) {
    try {
      const result = await whatsappService.startChatbot(
        req.params.tenantId,
        req.body.whatsappNumber,
        req.body.chatbotId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateChatStatus(req, res, next) {
    try {
      const result = await whatsappService.updateChatStatus(
        req.params.tenantId,
        req.body.whatsappNumber,
        req.body.status
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Token & Versioning
  async rotateToken(req, res, next) {
    try {
      const result = await whatsappService.rotateToken(req.params.tenantId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendTemplateMessageV2(req, res, next) {
    try {
      const result = await whatsappService.sendTemplateMessageV2(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendTemplateMessagesV2(req, res, next) {
    try {
      const result = await whatsappService.sendTemplateMessagesV2(req.params.tenantId, req.body.messages);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Campaign APIs
  async scheduleBroadcast(req, res, next) {
    try {
      const result = await whatsappService.scheduleBroadcast(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // WhatsApp Payment APIs
  async sendOrderDetails(req, res, next) {
    try {
      const result = await whatsappService.sendOrderDetails(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendOrderDetailsTemplate(req, res, next) {
    try {
      const result = await whatsappService.sendOrderDetailsTemplate(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const result = await whatsappService.updateOrderStatus(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatusTemplate(req, res, next) {
    try {
      const result = await whatsappService.updateOrderStatusTemplate(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendCheckoutButtonTemplate(req, res, next) {
    try {
      const result = await whatsappService.sendCheckoutButtonTemplate(req.params.tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetails(req, res, next) {
    try {
      const result = await whatsappService.getOrderDetails(req.params.tenantId, req.params.referenceId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatus(req, res, next) {
    try {
      const result = await whatsappService.getPaymentStatus(req.params.tenantId, req.params.referenceId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WhatsAppDemoController();

const conversationService = require('./conversation.service');

class ConversationController {
  async getConversations(req, res, next) {
    try {
      const conversations = await conversationService.getConversations(req.params.tenantId, req.query);
      res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  }

  async getConversationById(req, res, next) {
    try {
      const conversation = await conversationService.getConversationById(
        req.params.tenantId,
        req.params.conversationId
      );
      res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }

  async getConversationByLead(req, res, next) {
    try {
      const conversation = await conversationService.getConversationByLead(
        req.params.tenantId,
        req.params.leadId
      );
      res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const result = await conversationService.sendMessage(
        req.params.tenantId,
        req.params.leadId,
        req.body.content,
        req.user.id
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await conversationService.getMessages(
        req.params.tenantId,
        req.params.leadId,
        parseInt(req.query.limit) || 100
      );
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConversationController();

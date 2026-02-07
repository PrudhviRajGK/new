const Conversation = require('../../database/schemas/conversation.schema');
const { Lead } = require('../../database/models');
const { AppError } = require('../../shared/middleware/error-handler');
const aiOrchestrator = require('../ai-orchestrator/ai-orchestrator.service');
const whatsappService = require('../whatsapp/whatsapp.service');
const logger = require('../../shared/utils/logger');
const { v4: uuidv4 } = require('uuid');

class ConversationService {
  async getConversations(tenantId, filters = {}) {
    const query = { tenant_id: tenantId };
    
    if (filters.leadId) query.lead_id = filters.leadId;
    if (filters.status) query.status = filters.status;

    const conversations = await Conversation.find(query)
      .sort({ last_message_at: -1 })
      .limit(filters.limit || 50);

    return conversations;
  }

  async getConversationById(tenantId, conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      tenant_id: tenantId
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return conversation;
  }

  async getConversationByLead(tenantId, leadId) {
    let conversation = await Conversation.findOne({
      tenant_id: tenantId,
      lead_id: leadId
    });

    if (!conversation) {
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        throw new AppError('Lead not found', 404);
      }

      conversation = await Conversation.create({
        tenant_id: tenantId,
        lead_id: leadId,
        whatsapp_number: lead.whatsapp_number,
        messages: [],
        ai_interactions: [],
        status: 'active'
      });
    }

    return conversation;
  }

  async addMessage(tenantId, leadId, messageData) {
    const conversation = await this.getConversationByLead(tenantId, leadId);

    const message = {
      message_id: messageData.messageId || uuidv4(),
      direction: messageData.direction,
      content: messageData.content,
      content_type: messageData.contentType || 'text',
      media_url: messageData.mediaUrl,
      status: messageData.status || 'sent',
      sender: messageData.sender,
      timestamp: new Date(),
      metadata: messageData.metadata || {}
    };

    conversation.messages.push(message);
    conversation.message_count = conversation.messages.length;
    conversation.last_message_at = new Date();
    await conversation.save();

    // Update lead
    await Lead.update(
      { 
        last_message_at: new Date(),
        conversation_count: conversation.message_count
      },
      { where: { id: leadId } }
    );

    // If inbound message, trigger AI response
    if (messageData.direction === 'inbound' && messageData.autoReply !== false) {
      this.handleInboundMessage(tenantId, leadId, messageData.content).catch(err => {
        logger.error('Auto-reply error:', err);
      });
    }

    return { conversation, message };
  }

  async handleInboundMessage(tenantId, leadId, message) {
    try {
      // Detect intent
      const intent = await aiOrchestrator.detectIntent(tenantId, leadId, message);

      // Generate AI response
      const { response, confidence } = await aiOrchestrator.generateResponse(
        tenantId, 
        leadId, 
        message,
        { intent: intent.intent }
      );

      // Send response if confidence is high enough
      if (confidence >= parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || 0.7)) {
        const lead = await Lead.findByPk(leadId);
        await whatsappService.sendSessionMessage(tenantId, lead.whatsapp_number, response);

        // Add AI response to conversation
        await this.addMessage(tenantId, leadId, {
          direction: 'outbound',
          content: response,
          sender: 'AI',
          autoReply: false,
          metadata: { ai_generated: true, confidence }
        });
      }

      // Trigger qualification if enough messages
      const conversation = await this.getConversationByLead(tenantId, leadId);
      if (conversation.message_count >= 5) {
        aiOrchestrator.qualifyLead(tenantId, leadId).catch(err => {
          logger.error('Auto-qualification error:', err);
        });
      }
    } catch (error) {
      logger.error('Handle inbound message error:', error);
    }
  }

  async sendMessage(tenantId, leadId, content, userId) {
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Send via WhatsApp
    await whatsappService.sendSessionMessage(tenantId, lead.whatsapp_number, content);

    // Add to conversation
    const result = await this.addMessage(tenantId, leadId, {
      direction: 'outbound',
      content,
      sender: userId,
      autoReply: false
    });

    // Update lead
    await Lead.update(
      { last_reply_at: new Date() },
      { where: { id: leadId } }
    );

    return result;
  }

  async getMessages(tenantId, leadId, limit = 100) {
    const conversation = await this.getConversationByLead(tenantId, leadId);
    return conversation.messages.slice(-limit);
  }
}

module.exports = new ConversationService();

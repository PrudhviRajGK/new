const OpenAI = require('openai');
const { AIPrompt, Lead } = require('../../database/models');
const AIDecisionLog = require('../../database/schemas/ai-decision-log.schema');
const Conversation = require('../../database/schemas/conversation.schema');
const { AppError } = require('../../shared/middleware/error-handler');
const logger = require('../../shared/utils/logger');

class AIOrchestratorService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  async detectIntent(tenantId, leadId, message) {
    const startTime = Date.now();
    
    try {
      const prompt = await this.getPrompt(tenantId, 'intent_detection', 'en');
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt.system_message },
          { role: 'user', content: this.fillTemplate(prompt.prompt_template, { message }) }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response);

      await this.logDecision(tenantId, leadId, 'intent_detection', {
        message,
        prompt_used: prompt.name,
        model_used: this.model,
        ai_response: parsed,
        confidence_score: parsed.confidence || 0,
        processing_time_ms: Date.now() - startTime,
        tokens_used: completion.usage.total_tokens
      });

      return parsed;
    } catch (error) {
      logger.error('Intent detection error:', error);
      throw new AppError('Failed to detect intent', 500);
    }
  }

  async qualifyLead(tenantId, leadId) {
    const startTime = Date.now();
    
    try {
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        throw new AppError('Lead not found', 404);
      }

      const conversation = await Conversation.findOne({ 
        tenant_id: tenantId, 
        lead_id: leadId 
      });

      if (!conversation || conversation.messages.length === 0) {
        throw new AppError('No conversation history found', 400);
      }

      const prompt = await this.getPrompt(tenantId, 'qualification', lead.language || 'en');
      
      const conversationHistory = conversation.messages
        .slice(-20)
        .map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.content}`)
        .join('\n');

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt.system_message },
          { 
            role: 'user', 
            content: this.fillTemplate(prompt.prompt_template, { 
              conversation: conversationHistory,
              leadName: lead.name || 'Unknown',
              company: lead.company || 'Unknown'
            }) 
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content);

      // Update lead with qualification data
      await lead.update({
        bant: {
          budget: response.bant?.budget || lead.bant.budget,
          authority: response.bant?.authority || lead.bant.authority,
          need: response.bant?.need || lead.bant.need,
          timeline: response.bant?.timeline || lead.bant.timeline
        },
        lead_score: response.lead_score || lead.lead_score,
        qualification_status: response.qualification_status || 'in_progress',
        ai_summary: response.summary || lead.ai_summary,
        ai_next_action: response.next_action || lead.ai_next_action
      });

      await this.logDecision(tenantId, leadId, 'qualification', {
        conversation_length: conversation.messages.length,
        prompt_used: prompt.name,
        model_used: this.model,
        ai_response: response,
        confidence_score: response.confidence || 0,
        extracted_data: response.bant,
        processing_time_ms: Date.now() - startTime,
        tokens_used: completion.usage.total_tokens
      });

      return response;
    } catch (error) {
      logger.error('Lead qualification error:', error);
      throw new AppError('Failed to qualify lead', 500);
    }
  }

  async generateResponse(tenantId, leadId, message, context = {}) {
    const startTime = Date.now();
    
    try {
      const lead = await Lead.findByPk(leadId);
      const conversation = await Conversation.findOne({ 
        tenant_id: tenantId, 
        lead_id: leadId 
      });

      const prompt = await this.getPrompt(tenantId, 'response', lead?.language || 'en');
      
      const conversationHistory = conversation?.messages
        .slice(-10)
        .map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.content}`)
        .join('\n') || '';

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt.system_message },
          { 
            role: 'user', 
            content: this.fillTemplate(prompt.prompt_template, { 
              message,
              conversation: conversationHistory,
              leadName: lead?.name || 'there',
              company: lead?.company || '',
              context: JSON.stringify(context)
            }) 
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;

      await this.logDecision(tenantId, leadId, 'response_generation', {
        input_message: message,
        prompt_used: prompt.name,
        model_used: this.model,
        ai_response: response,
        confidence_score: 0.8,
        processing_time_ms: Date.now() - startTime,
        tokens_used: completion.usage.total_tokens
      });

      return {
        response,
        confidence: 0.8,
        shouldSend: true
      };
    } catch (error) {
      logger.error('Response generation error:', error);
      throw new AppError('Failed to generate response', 500);
    }
  }

  async scoreLead(tenantId, leadId) {
    const startTime = Date.now();
    
    try {
      const lead = await Lead.findByPk(leadId);
      const conversation = await Conversation.findOne({ 
        tenant_id: tenantId, 
        lead_id: leadId 
      });

      const prompt = await this.getPrompt(tenantId, 'scoring', 'en');
      
      const leadData = {
        bant: lead.bant,
        conversationCount: conversation?.messages.length || 0,
        responseTime: 'fast',
        engagement: 'high'
      };

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt.system_message },
          { 
            role: 'user', 
            content: this.fillTemplate(prompt.prompt_template, { 
              leadData: JSON.stringify(leadData, null, 2)
            }) 
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      const score = Math.min(10, Math.max(0, response.score || 0));

      await lead.update({ lead_score: score });

      await this.logDecision(tenantId, leadId, 'scoring', {
        lead_data: leadData,
        prompt_used: prompt.name,
        model_used: this.model,
        ai_response: response,
        confidence_score: response.confidence || 0,
        processing_time_ms: Date.now() - startTime,
        tokens_used: completion.usage.total_tokens
      });

      return { score, reasoning: response.reasoning };
    } catch (error) {
      logger.error('Lead scoring error:', error);
      throw new AppError('Failed to score lead', 500);
    }
  }

  async generateSummary(tenantId, leadId) {
    const startTime = Date.now();
    
    try {
      const conversation = await Conversation.findOne({ 
        tenant_id: tenantId, 
        lead_id: leadId 
      });

      if (!conversation || conversation.messages.length === 0) {
        return { summary: 'No conversation history available' };
      }

      const prompt = await this.getPrompt(tenantId, 'summary', 'en');
      
      const conversationHistory = conversation.messages
        .map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.content}`)
        .join('\n');

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt.system_message },
          { 
            role: 'user', 
            content: this.fillTemplate(prompt.prompt_template, { 
              conversation: conversationHistory
            }) 
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const summary = completion.choices[0].message.content;

      await Lead.update(
        { ai_summary: summary },
        { where: { id: leadId } }
      );

      await this.logDecision(tenantId, leadId, 'summary', {
        conversation_length: conversation.messages.length,
        prompt_used: prompt.name,
        model_used: this.model,
        ai_response: summary,
        processing_time_ms: Date.now() - startTime,
        tokens_used: completion.usage.total_tokens
      });

      return { summary };
    } catch (error) {
      logger.error('Summary generation error:', error);
      throw new AppError('Failed to generate summary', 500);
    }
  }

  async getPrompt(tenantId, type, language = 'en') {
    let prompt = await AIPrompt.findOne({
      where: {
        tenant_id: tenantId,
        type,
        language,
        is_active: true
      },
      order: [['version', 'DESC']]
    });

    if (!prompt) {
      prompt = await AIPrompt.findOne({
        where: {
          type,
          language,
          is_default: true,
          is_active: true
        }
      });
    }

    if (!prompt) {
      throw new AppError(`No prompt found for type: ${type}`, 404);
    }

    return prompt;
  }

  fillTemplate(template, variables) {
    let filled = template;
    for (const [key, value] of Object.entries(variables)) {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return filled;
  }

  async logDecision(tenantId, leadId, decisionType, data) {
    try {
      await AIDecisionLog.create({
        tenant_id: tenantId,
        lead_id: leadId,
        decision_type: decisionType,
        input_data: data,
        prompt_used: data.prompt_used,
        model_used: data.model_used,
        ai_response: data.ai_response,
        confidence_score: data.confidence_score,
        reasoning: data.ai_response?.reasoning || '',
        extracted_data: data.extracted_data || {},
        tokens_used: data.tokens_used,
        processing_time_ms: data.processing_time_ms,
        status: 'success'
      });
    } catch (error) {
      logger.error('Failed to log AI decision:', error);
    }
  }
}

module.exports = new AIOrchestratorService();

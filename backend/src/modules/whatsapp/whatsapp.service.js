const axios = require('axios');
const FormData = require('form-data');
const { AppError } = require('../../shared/middleware/error-handler');
const { Tenant } = require('../../database/models');
const logger = require('../../shared/utils/logger');
const crypto = require('crypto');

class WhatsAppService {
  constructor() {
    this.baseUrl = process.env.WHATSAPP_API_BASE_URL;
  }

  async getApiKey(tenantId) {
    const tenant = await Tenant.findOne({ where: { tenant_id: tenantId } });
    if (!tenant || !tenant.whatsapp_api_key) {
      throw new AppError('WhatsApp API key not configured', 400);
    }
    // Decrypt API key (implement decryption based on your encryption method)
    return tenant.whatsapp_api_key;
  }

  async makeRequest(method, url, data = null, headers = {}) {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      logger.error('WhatsApp API error:', error.response?.data || error.message);
      throw new AppError(
        error.response?.data?.message || 'WhatsApp API request failed',
        error.response?.status || 500
      );
    }
  }

  // GET /{tenantId}/api/v1/getMessages/{whatsappNumber}
  async getMessages(tenantId, whatsappNumber, params = {}) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/getMessages/${whatsappNumber}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /{tenantId}/api/v1/getMessageTemplates
  async getMessageTemplates(tenantId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/getMessageTemplates`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`
    });
  }

  // GET /{tenantId}/api/v1/getContacts
  async getContacts(tenantId, params = {}) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/getContacts`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`
    });
  }

  // GET /{tenantId}/api/v1/getMedia
  async getMedia(tenantId, mediaId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/getMedia?mediaId=${mediaId}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`
    });
  }

  // POST /{tenantId}/api/v1/addContact/{whatsappNumber}
  async addContact(tenantId, whatsappNumber, contactData) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/addContact/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, contactData, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/updateContactAttributes/{whatsappNumber}
  async updateContactAttributes(tenantId, whatsappNumber, attributes) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/updateContactAttributes/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, { attributes }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/updateContactAttributesForMultiContacts
  async updateContactAttributesForMultiContacts(tenantId, contacts) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/updateContactAttributesForMultiContacts`;
    
    return this.makeRequest('POST', url, { contacts }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendSessionMessage/{whatsappNumber}
  async sendSessionMessage(tenantId, whatsappNumber, message) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendSessionMessage/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, { message }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendSessionFile/{whatsappNumber}
  async sendSessionFile(tenantId, whatsappNumber, file, caption = '') {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendSessionFile/${whatsappNumber}`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    
    return this.makeRequest('POST', url, formData, {
      'Authorization': `Bearer ${apiKey}`,
      ...formData.getHeaders()
    });
  }

  // POST /{tenantId}/api/v1/sendSessionFileViaUrl/{whatsappNumber}
  async sendSessionFileViaUrl(tenantId, whatsappNumber, fileUrl, caption = '') {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendSessionFileViaUrl/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, { fileUrl, caption }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendTemplateMessage
  async sendTemplateMessage(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendTemplateMessage`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendTemplateMessages
  async sendTemplateMessages(tenantId, messages) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendTemplateMessages`;
    
    return this.makeRequest('POST', url, { messages }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendTemplateMessageCSV
  async sendTemplateMessageCSV(tenantId, csvFile, templateName) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendTemplateMessageCSV`;
    
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('templateName', templateName);
    
    return this.makeRequest('POST', url, formData, {
      'Authorization': `Bearer ${apiKey}`,
      ...formData.getHeaders()
    });
  }

  // POST /{tenantId}/api/v1/sendInteractiveButtonsMessage
  async sendInteractiveButtonsMessage(tenantId, whatsappNumber, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendInteractiveButtonsMessage`;
    
    return this.makeRequest('POST', url, { whatsappNumber, ...data }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendInteractiveListMessage
  async sendInteractiveListMessage(tenantId, whatsappNumber, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendInteractiveListMessage`;
    
    return this.makeRequest('POST', url, { whatsappNumber, ...data }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/assignOperator
  async assignOperator(tenantId, whatsappNumber, operatorId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/assignOperator`;
    
    return this.makeRequest('POST', url, { whatsappNumber, operatorId }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/assignTeam
  async assignTeam(tenantId, whatsappNumber, teamId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/assignTeam`;
    
    return this.makeRequest('POST', url, { whatsappNumber, teamId }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /{tenantId}/api/v1/chatbots
  async getChatbots(tenantId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/chatbots`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`
    });
  }

  // POST /{tenantId}/api/v1/chatbots/start
  async startChatbot(tenantId, whatsappNumber, chatbotId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/chatbots/start`;
    
    return this.makeRequest('POST', url, { whatsappNumber, chatbotId }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/updateChatStatus
  async updateChatStatus(tenantId, whatsappNumber, status) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/updateChatStatus`;
    
    return this.makeRequest('POST', url, { whatsappNumber, status }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/rotateToken
  async rotateToken(tenantId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/rotateToken`;
    
    return this.makeRequest('POST', url, {}, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v2/sendTemplateMessage
  async sendTemplateMessageV2(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v2/sendTemplateMessage`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v2/sendTemplateMessages
  async sendTemplateMessagesV2(tenantId, messages) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v2/sendTemplateMessages`;
    
    return this.makeRequest('POST', url, { messages }, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // CAMPAIGN APIs
  // POST /{tenantId}/api/v1/broadcast/schedule
  async scheduleBroadcast(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/broadcast/schedule`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // WHATSAPP PAYMENT APIs
  // POST /{tenantId}/api/v1/order_details
  async sendOrderDetails(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_details`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/order_details_template
  async sendOrderDetailsTemplate(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_details_template`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/order_status
  async updateOrderStatus(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_status`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/order_status_template
  async updateOrderStatusTemplate(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_status_template`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/checkout_button_template
  async sendCheckoutButtonTemplate(tenantId, data) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/checkout_button_template`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /{tenantId}/api/v1/order_details/{referenceId}
  async getOrderDetails(tenantId, referenceId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_details/${referenceId}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`
    });
  }

  // GET /{tenantId}/api/v1/payment_status/{referenceId}
  async getPaymentStatus(tenantId, referenceId) {
    const apiKey = await this.getApiKey(tenantId);
    const url = `${this.baseUrl}/${tenantId}/api/v1/payment_status/${referenceId}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${apiKey}`
    });
  }
}

module.exports = new WhatsAppService();

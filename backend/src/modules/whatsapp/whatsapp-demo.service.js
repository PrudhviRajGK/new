const axios = require('axios');
const FormData = require('form-data');
const { AppError } = require('../../shared/middleware/error-handler');
const logger = require('../../shared/utils/logger');

class WhatsAppDemoService {
  constructor() {
    this.baseUrl = process.env.WHATSAPP_API_BASE_URL;
    this.apiKey = process.env.WHATSAPP_API_KEY || 'demo-api-key';
  }

  async makeRequest(method, url, data = null, headers = {}) {
    try {
      logger.info(`WhatsApp API Request: ${method} ${url}`);
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
    const url = `${this.baseUrl}/${tenantId}/api/v1/getMessages/${whatsappNumber}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /{tenantId}/api/v1/getMessageTemplates
  async getMessageTemplates(tenantId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/getMessageTemplates`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  // GET /{tenantId}/api/v1/getContacts
  async getContacts(tenantId, params = {}) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/getContacts`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  // GET /{tenantId}/api/v1/getMedia
  async getMedia(tenantId, mediaId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/getMedia?mediaId=${mediaId}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  // POST /{tenantId}/api/v1/addContact/{whatsappNumber}
  async addContact(tenantId, whatsappNumber, contactData) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/addContact/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, contactData, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/updateContactAttributes/{whatsappNumber}
  async updateContactAttributes(tenantId, whatsappNumber, attributes) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/updateContactAttributes/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, { attributes }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/updateContactAttributesForMultiContacts
  async updateContactAttributesForMultiContacts(tenantId, contacts) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/updateContactAttributesForMultiContacts`;
    
    return this.makeRequest('POST', url, { contacts }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendSessionMessage/{whatsappNumber}
  async sendSessionMessage(tenantId, whatsappNumber, message) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendSessionMessage/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, { message }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendSessionFile/{whatsappNumber}
  async sendSessionFile(tenantId, whatsappNumber, file, caption = '') {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendSessionFile/${whatsappNumber}`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    
    return this.makeRequest('POST', url, formData, {
      'Authorization': `Bearer ${this.apiKey}`,
      ...formData.getHeaders()
    });
  }

  // POST /{tenantId}/api/v1/sendSessionFileViaUrl/{whatsappNumber}
  async sendSessionFileViaUrl(tenantId, whatsappNumber, fileUrl, caption = '') {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendSessionFileViaUrl/${whatsappNumber}`;
    
    return this.makeRequest('POST', url, { fileUrl, caption }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendTemplateMessage
  async sendTemplateMessage(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendTemplateMessage`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendTemplateMessages
  async sendTemplateMessages(tenantId, messages) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendTemplateMessages`;
    
    return this.makeRequest('POST', url, { messages }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendTemplateMessageCSV
  async sendTemplateMessageCSV(tenantId, csvFile, templateName) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendTemplateMessageCSV`;
    
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('templateName', templateName);
    
    return this.makeRequest('POST', url, formData, {
      'Authorization': `Bearer ${this.apiKey}`,
      ...formData.getHeaders()
    });
  }

  // POST /{tenantId}/api/v1/sendInteractiveButtonsMessage
  async sendInteractiveButtonsMessage(tenantId, whatsappNumber, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendInteractiveButtonsMessage`;
    
    return this.makeRequest('POST', url, { whatsappNumber, ...data }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/sendInteractiveListMessage
  async sendInteractiveListMessage(tenantId, whatsappNumber, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/sendInteractiveListMessage`;
    
    return this.makeRequest('POST', url, { whatsappNumber, ...data }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/assignOperator
  async assignOperator(tenantId, whatsappNumber, operatorId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/assignOperator`;
    
    return this.makeRequest('POST', url, { whatsappNumber, operatorId }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/assignTeam
  async assignTeam(tenantId, whatsappNumber, teamId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/assignTeam`;
    
    return this.makeRequest('POST', url, { whatsappNumber, teamId }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /{tenantId}/api/v1/chatbots
  async getChatbots(tenantId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/chatbots`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  // POST /{tenantId}/api/v1/chatbots/start
  async startChatbot(tenantId, whatsappNumber, chatbotId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/chatbots/start`;
    
    return this.makeRequest('POST', url, { whatsappNumber, chatbotId }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/updateChatStatus
  async updateChatStatus(tenantId, whatsappNumber, status) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/updateChatStatus`;
    
    return this.makeRequest('POST', url, { whatsappNumber, status }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/rotateToken
  async rotateToken(tenantId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/rotateToken`;
    
    return this.makeRequest('POST', url, {}, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v2/sendTemplateMessage
  async sendTemplateMessageV2(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v2/sendTemplateMessage`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v2/sendTemplateMessages
  async sendTemplateMessagesV2(tenantId, messages) {
    const url = `${this.baseUrl}/${tenantId}/api/v2/sendTemplateMessages`;
    
    return this.makeRequest('POST', url, { messages }, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // CAMPAIGN APIs
  // POST /{tenantId}/api/v1/broadcast/schedule
  async scheduleBroadcast(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/broadcast/schedule`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // WHATSAPP PAYMENT APIs
  // POST /{tenantId}/api/v1/order_details
  async sendOrderDetails(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_details`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/order_details_template
  async sendOrderDetailsTemplate(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_details_template`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/order_status
  async updateOrderStatus(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_status`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/order_status_template
  async updateOrderStatusTemplate(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_status_template`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // POST /{tenantId}/api/v1/checkout_button_template
  async sendCheckoutButtonTemplate(tenantId, data) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/checkout_button_template`;
    
    return this.makeRequest('POST', url, data, {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /{tenantId}/api/v1/order_details/{referenceId}
  async getOrderDetails(tenantId, referenceId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/order_details/${referenceId}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  // GET /{tenantId}/api/v1/payment_status/{referenceId}
  async getPaymentStatus(tenantId, referenceId) {
    const url = `${this.baseUrl}/${tenantId}/api/v1/payment_status/${referenceId}`;
    
    return this.makeRequest('GET', url, null, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }
}

module.exports = new WhatsAppDemoService();

const axios = require('axios');
const crypto = require('crypto');
const { WebhookLog } = require('../../database/models');
const logger = require('../../shared/utils/logger');

class WebhookService {
  constructor() {
    this.n8nBaseUrl = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook';
    this.webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    this.maxRetries = parseInt(process.env.WORKFLOW_MAX_RETRIES) || 5;
  }

  async sendWebhook(tenantId, eventType, payload) {
    const webhookUrl = `${this.n8nBaseUrl}/${tenantId}/${eventType}`;
    
    const webhookPayload = {
      event: eventType,
      tenant_id: tenantId,
      timestamp: new Date().toISOString(),
      data: payload
    };

    const signature = this.generateSignature(webhookPayload);

    const log = await WebhookLog.create({
      tenant_id: tenantId,
      event_type: eventType,
      webhook_url: webhookUrl,
      payload: webhookPayload,
      signature,
      status: 'pending',
      retry_count: 0
    });

    try {
      const response = await axios.post(webhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Event-Type': eventType
        },
        timeout: 30000
      });

      await log.update({
        status: 'success',
        response_status: response.status,
        response_body: response.data
      });

      logger.info(`Webhook sent successfully: ${eventType}`);
      return { success: true, log };
    } catch (error) {
      await log.update({
        status: 'failed',
        response_status: error.response?.status,
        error_message: error.message
      });

      logger.error(`Webhook failed: ${eventType}`, error.message);

      // Schedule retry
      if (log.retry_count < this.maxRetries) {
        this.scheduleRetry(log.id, log.retry_count + 1);
      }

      throw error;
    }
  }

  async retryWebhook(logId) {
    const log = await WebhookLog.findByPk(logId);
    if (!log) return;

    if (log.retry_count >= this.maxRetries) {
      await log.update({ status: 'failed' });
      return;
    }

    await log.update({
      status: 'retrying',
      retry_count: log.retry_count + 1,
      last_retry_at: new Date()
    });

    try {
      const response = await axios.post(log.webhook_url, log.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': log.signature,
          'X-Event-Type': log.event_type
        },
        timeout: 30000
      });

      await log.update({
        status: 'success',
        response_status: response.status,
        response_body: response.data
      });

      logger.info(`Webhook retry successful: ${log.event_type}`);
    } catch (error) {
      await log.update({
        status: 'failed',
        error_message: error.message
      });

      if (log.retry_count < this.maxRetries) {
        this.scheduleRetry(logId, log.retry_count + 1);
      }
    }
  }

  scheduleRetry(logId, retryCount) {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 300000); // Exponential backoff, max 5 minutes
    setTimeout(() => {
      this.retryWebhook(logId).catch(err => {
        logger.error('Retry webhook error:', err);
      });
    }, delay);
  }

  generateSignature(payload) {
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  verifySignature(payload, signature) {
    const expectedSignature = this.generateSignature(payload);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async getWebhookLogs(tenantId, filters = {}) {
    const where = { tenant_id: tenantId };
    if (filters.eventType) where.event_type = filters.eventType;
    if (filters.status) where.status = filters.status;

    return WebhookLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters.limit || 100
    });
  }

  // Webhook event triggers
  async triggerLeadQualified(tenantId, leadData) {
    return this.sendWebhook(tenantId, 'lead_qualified', leadData);
  }

  async triggerMessageReceived(tenantId, messageData) {
    return this.sendWebhook(tenantId, 'message_received', messageData);
  }

  async triggerStageChanged(tenantId, stageChangeData) {
    return this.sendWebhook(tenantId, 'stage_changed', stageChangeData);
  }

  async triggerCallCompleted(tenantId, callData) {
    return this.sendWebhook(tenantId, 'call_completed', callData);
  }
}

module.exports = new WebhookService();

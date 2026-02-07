const request = require('supertest');
const { app } = require('../src/server');

describe('WhatsApp API Integration Tests', () => {
  const tenantId = 'demo-tenant';
  const whatsappNumber = '+1234567890';
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  describe('Messaging & Contacts', () => {
    test('GET /getMessages/:whatsappNumber - should get messages', async () => {
      const response = await request(app)
        .get(`/api/${tenantId}/whatsapp/getMessages/${whatsappNumber}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /getMessageTemplates - should get templates', async () => {
      const response = await request(app)
        .get(`/api/${tenantId}/whatsapp/getMessageTemplates`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /getContacts - should get contacts', async () => {
      const response = await request(app)
        .get(`/api/${tenantId}/whatsapp/getContacts`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /getMedia - should get media', async () => {
      const response = await request(app)
        .get(`/api/${tenantId}/whatsapp/getMedia?mediaId=test123`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Contact Management', () => {
    test('POST /addContact/:whatsappNumber - should add contact', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/addContact/${whatsappNumber}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          email: 'test@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /updateContactAttributes/:whatsappNumber - should update contact', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/updateContactAttributes/${whatsappNumber}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          attributes: {
            company: 'Test Company'
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /updateContactAttributesForMultiContacts - should update multiple contacts', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/updateContactAttributesForMultiContacts`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contacts: [
            {
              whatsappNumber: '+1234567890',
              attributes: { status: 'active' }
            }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Sending Messages', () => {
    test('POST /sendSessionMessage/:whatsappNumber - should send message', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/sendSessionMessage/${whatsappNumber}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Test message'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /sendSessionFileViaUrl/:whatsappNumber - should send file via URL', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/sendSessionFileViaUrl/${whatsappNumber}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileUrl: 'https://example.com/file.pdf',
          caption: 'Test file'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /sendTemplateMessage - should send template message', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/sendTemplateMessage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          templateName: 'welcome_message',
          languageCode: 'en',
          parameters: [{ type: 'text', text: 'John' }]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /sendInteractiveButtonsMessage - should send interactive buttons', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/sendInteractiveButtonsMessage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          bodyText: 'Select an option',
          buttons: [
            { id: 'btn_1', title: 'Option 1' }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /sendInteractiveListMessage - should send interactive list', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/sendInteractiveListMessage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          bodyText: 'Select from list',
          buttonText: 'View Options',
          sections: [
            {
              title: 'Section 1',
              rows: [{ id: 'row_1', title: 'Option 1' }]
            }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Assignment & Automation', () => {
    test('POST /assignOperator - should assign operator', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/assignOperator`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          operatorId: 'op_123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /assignTeam - should assign team', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/assignTeam`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          teamId: 'team_456'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /chatbots - should get chatbots', async () => {
      const response = await request(app)
        .get(`/api/${tenantId}/whatsapp/chatbots`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /chatbots/start - should start chatbot', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/chatbots/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          chatbotId: 'bot_1'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /updateChatStatus - should update chat status', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/updateChatStatus`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          status: 'open'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Token & Versioning', () => {
    test('POST /rotateToken - should rotate token', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/rotateToken`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /v2/sendTemplateMessage - should send template message v2', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/v2/sendTemplateMessage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsappNumber: whatsappNumber,
          templateName: 'welcome_message_v2',
          languageCode: 'en',
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: 'John' }]
            }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /v2/sendTemplateMessages - should send template messages v2', async () => {
      const response = await request(app)
        .post(`/api/${tenantId}/whatsapp/v2/sendTemplateMessages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          messages: [
            {
              whatsappNumber: whatsappNumber,
              templateName: 'welcome_message_v2',
              languageCode: 'en',
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: 'John' }]
                }
              ]
            }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

const logger = require('./shared/utils/logger');
const errorHandler = require('./shared/middleware/error-handler');
const { setupSwagger } = require('./config/swagger');
const whatsappDemoRoutes = require('./modules/whatsapp/whatsapp-demo.routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'demo', timestamp: new Date().toISOString() });
});

// Mock data
const mockUser = {
  id: '1',
  email: 'admin@kraya.ai',
  name: 'Admin User',
  role: 'admin',
  tenantId: '1029339'
};

const mockToken = 'demo-jwt-token-12345';

// Mock Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password, tenantId } = req.body;
  if (email === 'admin@kraya.ai' && password === 'Admin@123' && tenantId === '1029339') {
    res.json({
      success: true,
      data: {
        token: mockToken,
        user: mockUser
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: mockUser
  });
});

// Mock Dashboard Stats (tenant-based)
app.get('/api/:tenantId/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalLeads: 45,
      activeConversations: 12,
      conversionRate: 28,
      activeWorkflows: 3
    }
  });
});

// Mock Leads (tenant-based)
app.get('/api/:tenantId/leads', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'John Doe',
        whatsappNumber: '+1234567890',
        email: 'john@example.com',
        company: 'Tech Corp',
        status: 'qualified',
        leadScore: 8,
        stage: 'contacted',
        createdAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Jane Smith',
        whatsappNumber: '+1234567891',
        email: 'jane@example.com',
        company: 'Business Inc',
        status: 'contacted',
        leadScore: 6,
        stage: 'new',
        createdAt: new Date()
      }
    ]
  });
});

app.get('/api/:tenantId/leads/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 45,
      new: 24,
      contacted: 12,
      qualified: 6,
      converted: 8
    }
  });
});

app.get('/api/:tenantId/leads/:leadId', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.leadId,
      name: 'Atul Patil',
      whatsappNumber: '+91 83XXXXXXXX',
      email: 'atu.p@gmail.com',
      company: 'Tech Corp',
      status: 'qualified',
      leadScore: 8,
      stage: 'In Conversation',
      state: 'Uttar Pradesh',
      notes: '- Son is 10 years old, interested in Robotics.\n- enjoys STEM activities.\n- Asked for fee details and installment options.',
      lastResponse: '18-Nov-2024, 01:47 PM',
      daysSinceInception: '17-Nov-2024, 10:33 AM',
      aiAutoReply: true,
      createdAt: new Date()
    }
  });
});

// Mock Conversations (tenant-based)
app.get('/api/:tenantId/conversations', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        leadId: '550e8400-e29b-41d4-a716-446655440001',
        leadName: 'Atul Patil',
        lastMessage: 'Thanks for expressing interest in our courses at Talent Champ.',
        unreadCount: 0,
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        leadId: '550e8400-e29b-41d4-a716-446655440002',
        leadName: 'Ravi Kumar',
        lastMessage: 'I want to know about courses',
        unreadCount: 2,
        updatedAt: new Date(Date.now() - 3600000)
      }
    ]
  });
});

app.get('/api/:tenantId/conversations/:conversationId', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.conversationId,
      leadId: '550e8400-e29b-41d4-a716-446655440001',
      leadName: 'Atul Patil',
      lastMessage: 'Thanks for the information!',
      unreadCount: 0,
      updatedAt: new Date()
    }
  });
});

app.get('/api/:tenantId/conversations/lead/:leadId', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '660e8400-e29b-41d4-a716-446655440001',
      leadId: req.params.leadId,
      leadName: 'Atul Patil',
      lastMessage: 'Thanks for the information!',
      unreadCount: 0,
      updatedAt: new Date()
    }
  });
});

app.get('/api/:tenantId/conversations/lead/:leadId/messages', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        content: 'Hi there! Thanks for reaching out to Talent Champ. How can I assist you today?',
        direction: 'outbound',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '2',
        content: 'I want to know about courses',
        direction: 'inbound',
        timestamp: new Date(Date.now() - 7000000)
      },
      {
        id: '3',
        content: 'Thanks for expressing interest in our courses at Talent Champ. Could you please let me know the age group your child into? This will help us suggest the most suitable programs for them.',
        direction: 'outbound',
        timestamp: new Date(Date.now() - 6800000)
      },
      {
        id: '4',
        content: '10 years',
        direction: 'inbound',
        timestamp: new Date(Date.now() - 6600000)
      },
      {
        id: '5',
        content: 'Thank you for sharing that your child is 10 years old.',
        direction: 'outbound',
        timestamp: new Date(Date.now() - 6400000)
      },
      {
        id: '6',
        content: 'What specific skills or programs are you interested in for your child? We offer options like coding, applied robotics, creative writing, and more.',
        direction: 'outbound',
        timestamp: new Date(Date.now() - 6200000)
      },
      {
        id: '7',
        content: 'Robotics',
        direction: 'inbound',
        timestamp: new Date(Date.now() - 6000000)
      },
      {
        id: '8',
        content: "That's wonderful! Our applied Robotics program is a fantastic choice for teaching creativity and innovation.",
        direction: 'outbound',
        timestamp: new Date(Date.now() - 5800000)
      }
    ]
  });
});

app.post('/api/:tenantId/conversations/lead/:leadId/messages', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      content: req.body.content,
      direction: 'outbound',
      timestamp: new Date()
    }
  });
});

// Mock Workflows (tenant-based)
app.get('/api/:tenantId/workflows', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'Lead Qualification',
        description: 'Automatically qualify leads using BANT framework',
        triggerType: 'message_received',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        name: 'Follow-up Reminder',
        description: 'Send follow-up messages after 24 hours',
        triggerType: 'scheduled',
        isActive: true,
        createdAt: new Date()
      }
    ]
  });
});

// Mock Analytics (tenant-based)
app.get('/api/:tenantId/analytics/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      leadSources: [
        { name: 'WhatsApp', count: 25, percentage: 55 },
        { name: 'Website', count: 15, percentage: 33 },
        { name: 'Referral', count: 5, percentage: 12 }
      ],
      conversionFunnel: [
        { stage: 'New', count: 45, percentage: 100 },
        { stage: 'Contacted', count: 30, percentage: 67 },
        { stage: 'Qualified', count: 20, percentage: 44 },
        { stage: 'Converted', count: 12, percentage: 27 }
      ],
      metrics: {
        responseTime: '2.5 min',
        satisfaction: 92,
        aiAccuracy: 87
      }
    }
  });
});

// Mock authentication middleware bypass for demo mode
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    ...mockUser,
    permissions: {
      conversations: { view: true, reply: true, assign: true, update: true },
      leads: { view: true, create: true, update: true },
      workflows: { view: true, execute: true },
      settings: { manage: true }
    }
  };
  req.tenantId = req.params.tenantId || 'demo-tenant';
  next();
};

// Apply mock auth to all routes
app.use(mockAuthMiddleware);

// WhatsApp API Routes (Real Implementation - Demo Mode)
// Mount at /api/:tenantId/api/v1/* to match the expected pattern
app.use('/api/:tenantId/api/v1', whatsappDemoRoutes);

// Also mount v2 routes
const whatsappDemoRoutesV2 = express.Router({ mergeParams: true });
const whatsappDemoController = require('./modules/whatsapp/whatsapp-demo.controller');
whatsappDemoRoutesV2.post('/sendTemplateMessage', whatsappDemoController.sendTemplateMessageV2);
whatsappDemoRoutesV2.post('/sendTemplateMessages', whatsappDemoController.sendTemplateMessagesV2);
app.use('/api/:tenantId/api/v2', whatsappDemoRoutesV2);

// Swagger Documentation
setupSwagger(app);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  logger.info(`🚀 Kraya-AI Backend (DEMO MODE) running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`⚠️  Running in DEMO mode - no database required`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = { app, server, io };

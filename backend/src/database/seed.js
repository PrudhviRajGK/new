require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Tenant, User, LeadStage, AIPrompt } = require('./models');
const { connectMongoDB } = require('./mongodb');
const logger = require('../shared/utils/logger');

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Create demo tenant
    const [tenant] = await Tenant.findOrCreate({
      where: { tenant_id: 'demo-tenant' },
      defaults: {
        tenant_id: 'demo-tenant',
        name: 'Demo Company',
        email: 'demo@kraya.ai',
        phone: '+1234567890',
        whatsapp_number: '+1234567890',
        whatsapp_api_key: process.env.WHATSAPP_API_KEY,
        status: 'active',
        subscription_plan: 'professional'
      }
    });
    
    // Update tenant with WATI API key if it exists
    if (process.env.WHATSAPP_API_KEY && tenant) {
      await tenant.update({ whatsapp_api_key: process.env.WHATSAPP_API_KEY });
    }
    
    logger.info('Demo tenant created/updated with WATI API key');

    // Create admin user
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@kraya.ai', tenant_id: tenant.id },
      defaults: {
        tenant_id: tenant.id,
        email: 'admin@kraya.ai',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        status: 'active',
        permissions: {
          leads: { view: true, create: true, edit: true, delete: true },
          conversations: { view: true, reply: true },
          workflows: { view: true, create: true, edit: true, delete: true },
          analytics: { view: true },
          settings: { view: true, edit: true },
          'ai-prompts': { view: true, create: true, update: true, delete: true }
        }
      }
    });

    // Ensure admin has ai-prompts permissions (for existing users)
    await admin.update({
      permissions: {
        leads: { view: true, create: true, edit: true, delete: true },
        conversations: { view: true, reply: true },
        workflows: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true },
        settings: { view: true, edit: true },
        'ai-prompts': { view: true, create: true, update: true, delete: true }
      }
    });
    logger.info('Admin user created');

    // Create lead stages
    const stages = [
      { name: 'New Lead', description: 'Newly captured leads', color: '#3B82F6', order: 1, is_default: true },
      { name: 'Contacted', description: 'Initial contact made', color: '#8B5CF6', order: 2 },
      { name: 'Qualified', description: 'Lead is qualified', color: '#10B981', order: 3 },
      { name: 'Proposal Sent', description: 'Proposal sent to lead', color: '#F59E0B', order: 4 },
      { name: 'Negotiation', description: 'In negotiation phase', color: '#EF4444', order: 5 },
      { name: 'Won', description: 'Deal won', color: '#059669', order: 6, is_final: true },
      { name: 'Lost', description: 'Deal lost', color: '#DC2626', order: 7, is_final: true }
    ];

    for (const stage of stages) {
      await LeadStage.findOrCreate({
        where: { tenant_id: tenant.id, name: stage.name },
        defaults: { ...stage, tenant_id: tenant.id }
      });
    }
    logger.info('Lead stages created');

    // Create default AI prompts
    const prompts = [
      {
        name: 'Intent Detection - English',
        type: 'intent_detection',
        language: 'en',
        system_message: 'You are an AI assistant that detects user intent from messages. Respond in JSON format.',
        prompt_template: `Analyze this message and detect the intent: "{{message}}"
        
Return JSON with:
{
  "intent": "inquiry|complaint|purchase|support|other",
  "confidence": 0.0-1.0,
  "entities": {},
  "sentiment": "positive|neutral|negative"
}`,
        is_default: true,
        is_active: true
      },
      {
        name: 'Lead Qualification - English',
        type: 'qualification',
        language: 'en',
        system_message: 'You are an expert sales qualification AI using the BANT framework. Analyze conversations and extract qualification data.',
        prompt_template: `Analyze this conversation and qualify the lead using BANT framework:

Conversation:
{{conversation}}

Lead: {{leadName}} from {{company}}

Return JSON with:
{
  "bant": {
    "budget": {"value": "extracted budget or null", "confidence": 0.0-1.0, "extracted_at": "ISO date"},
    "authority": {"value": "decision maker status", "confidence": 0.0-1.0, "extracted_at": "ISO date"},
    "need": {"value": "identified need", "confidence": 0.0-1.0, "extracted_at": "ISO date"},
    "timeline": {"value": "purchase timeline", "confidence": 0.0-1.0, "extracted_at": "ISO date"}
  },
  "lead_score": 0-10,
  "qualification_status": "qualified|disqualified|in_progress",
  "summary": "brief summary",
  "next_action": "suggested next action",
  "confidence": 0.0-1.0
}`,
        is_default: true,
        is_active: true
      },
      {
        name: 'Response Generation - English',
        type: 'response',
        language: 'en',
        system_message: 'You are a helpful sales assistant. Generate professional, friendly responses to leads.',
        prompt_template: `Generate a response to this message from {{leadName}}:

Message: "{{message}}"

Previous conversation:
{{conversation}}

Context: {{context}}

Generate a helpful, professional response that moves the conversation forward.`,
        is_default: true,
        is_active: true
      },
      {
        name: 'Lead Scoring - English',
        type: 'scoring',
        language: 'en',
        system_message: 'You are an AI that scores leads from 0-10 based on their qualification data and engagement.',
        prompt_template: `Score this lead from 0-10:

Lead Data:
{{leadData}}

Return JSON with:
{
  "score": 0-10,
  "reasoning": "explanation of score",
  "confidence": 0.0-1.0
}`,
        is_default: true,
        is_active: true
      },
      {
        name: 'Conversation Summary - English',
        type: 'summary',
        language: 'en',
        system_message: 'You are an AI that creates concise summaries of sales conversations.',
        prompt_template: `Summarize this conversation in 2-3 sentences:

{{conversation}}

Focus on key points, needs identified, and next steps.`,
        is_default: true,
        is_active: true
      }
    ];

    for (const prompt of prompts) {
      await AIPrompt.findOrCreate({
        where: { 
          tenant_id: tenant.id, 
          type: prompt.type, 
          language: prompt.language 
        },
        defaults: { ...prompt, tenant_id: tenant.id }
      });
    }
    logger.info('AI prompts created');

    // Connect to MongoDB for any additional seeding
    await connectMongoDB();
    logger.info('MongoDB connected');

    logger.info('✅ Seeding completed successfully');
    logger.info('\n📧 Login credentials:');
    logger.info('   Email: admin@kraya.ai');
    logger.info('   Password: Admin@123');
    logger.info('   Tenant: demo-tenant\n');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

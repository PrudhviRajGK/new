const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  message_id: { type: String, required: true, unique: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  content: { type: String, required: true },
  content_type: { type: String, enum: ['text', 'image', 'video', 'audio', 'document', 'location'], default: 'text' },
  media_url: { type: String },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  sender: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const ConversationSchema = new mongoose.Schema({
  tenant_id: { type: String, required: true, index: true },
  lead_id: { type: String, required: true, index: true },
  whatsapp_number: { type: String, required: true, index: true },
  messages: [MessageSchema],
  ai_interactions: [{
    interaction_id: { type: String, required: true },
    prompt_type: { type: String },
    prompt_used: { type: String },
    ai_response: { type: String },
    confidence_score: { type: Number, min: 0, max: 1 },
    intent_detected: { type: String },
    entities_extracted: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
    model_used: { type: String },
    tokens_used: { type: Number }
  }],
  summary: { type: String },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  language: { type: String, default: 'en' },
  status: { type: String, enum: ['active', 'closed', 'archived'], default: 'active' },
  last_message_at: { type: Date },
  message_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

ConversationSchema.index({ tenant_id: 1, whatsapp_number: 1 });
ConversationSchema.index({ tenant_id: 1, lead_id: 1 });
ConversationSchema.index({ last_message_at: -1 });
ConversationSchema.index({ status: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);

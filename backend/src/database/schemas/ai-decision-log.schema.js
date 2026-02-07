const mongoose = require('mongoose');

const AIDecisionLogSchema = new mongoose.Schema({
  tenant_id: { type: String, required: true, index: true },
  lead_id: { type: String, required: true, index: true },
  decision_type: { 
    type: String, 
    enum: ['qualification', 'scoring', 'intent_detection', 'response_generation', 'next_action'],
    required: true 
  },
  input_data: { type: mongoose.Schema.Types.Mixed, required: true },
  prompt_used: { type: String },
  model_used: { type: String, default: 'gpt-4-turbo-preview' },
  ai_response: { type: mongoose.Schema.Types.Mixed, required: true },
  confidence_score: { type: Number, min: 0, max: 1 },
  reasoning: { type: String },
  extracted_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  human_override: {
    overridden: { type: Boolean, default: false },
    overridden_by: { type: String },
    overridden_at: { type: Date },
    override_reason: { type: String },
    original_decision: { type: mongoose.Schema.Types.Mixed }
  },
  tokens_used: { type: Number },
  processing_time_ms: { type: Number },
  status: { type: String, enum: ['success', 'failed', 'overridden'], default: 'success' },
  error_message: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

AIDecisionLogSchema.index({ tenant_id: 1, lead_id: 1, created_at: -1 });
AIDecisionLogSchema.index({ decision_type: 1 });
AIDecisionLogSchema.index({ 'human_override.overridden': 1 });

module.exports = mongoose.model('AIDecisionLog', AIDecisionLogSchema);

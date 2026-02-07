module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define('Lead', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Lead WhatsApp number with country code'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stage_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'lead_stages',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    source: {
      type: DataTypes.STRING(100),
      defaultValue: 'whatsapp',
      comment: 'Lead source: whatsapp, website, referral, etc.'
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'),
      defaultValue: 'new'
    },
    lead_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10
      },
      comment: 'AI-generated lead score 0-10'
    },
    qualification_status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'qualified', 'disqualified'),
      defaultValue: 'pending'
    },
    bant: {
      type: DataTypes.JSONB,
      defaultValue: {
        budget: { value: null, confidence: 0, extracted_at: null },
        authority: { value: null, confidence: 0, extracted_at: null },
        need: { value: null, confidence: 0, extracted_at: null },
        timeline: { value: null, confidence: 0, extracted_at: null }
      },
      comment: 'BANT qualification framework data'
    },
    ai_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'AI-generated conversation summary'
    },
    ai_next_action: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'AI-suggested next action'
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_reply_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    conversation_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    custom_fields: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'leads',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'whatsapp_number'], unique: true },
      { fields: ['tenant_id', 'status'] },
      { fields: ['tenant_id', 'stage_id'] },
      { fields: ['tenant_id', 'assigned_to'] },
      { fields: ['lead_score'] },
      { fields: ['qualification_status'] },
      { fields: ['last_message_at'] }
    ]
  });

  return Lead;
};

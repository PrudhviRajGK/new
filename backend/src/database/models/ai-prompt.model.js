module.exports = (sequelize, DataTypes) => {
  const AIPrompt = sequelize.define('AIPrompt', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('qualification', 'response', 'summary', 'scoring', 'intent_detection'),
      allowNull: false
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      comment: 'Language code: en, hi, etc.'
    },
    prompt_template: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Prompt template with variables'
    },
    system_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ab_test_group: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'A/B testing group identifier'
    },
    performance_metrics: {
      type: DataTypes.JSONB,
      defaultValue: {
        usage_count: 0,
        avg_confidence: 0,
        success_rate: 0
      }
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
    tableName: 'ai_prompts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'type', 'is_active'] },
      { fields: ['tenant_id', 'language'] },
      { fields: ['version'] }
    ]
  });

  return AIPrompt;
};

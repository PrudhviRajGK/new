module.exports = (sequelize, DataTypes) => {
  const LeadStage = sequelize.define('LeadStage', {
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
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#3B82F6',
      comment: 'Hex color code for UI'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if this is a final stage (won/lost)'
    },
    automation_rules: {
      type: DataTypes.JSONB,
      defaultValue: {
        auto_assign: false,
        auto_followup: false,
        followup_delay_hours: 24,
        notification_enabled: true
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
    tableName: 'lead_stages',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'order'] },
      { fields: ['tenant_id', 'is_default'] }
    ]
  });

  return LeadStage;
};

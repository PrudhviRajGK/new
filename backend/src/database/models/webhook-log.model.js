module.exports = (sequelize, DataTypes) => {
  const WebhookLog = sequelize.define('WebhookLog', {
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
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'lead_qualified, message_received, stage_changed, etc.'
    },
    webhook_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    response_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    response_body: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'retrying'),
      defaultValue: 'pending'
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_retry_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    signature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'HMAC-SHA256 signature'
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
    tableName: 'webhook_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'event_type'] },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ]
  });

  return WebhookLog;
};

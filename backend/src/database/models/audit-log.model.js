module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action performed: create, update, delete, login, etc.'
    },
    resource_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Resource type: lead, user, workflow, etc.'
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    changes: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Before/after values for updates'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'created_at'] },
      { fields: ['user_id'] },
      { fields: ['resource_type', 'resource_id'] },
      { fields: ['action'] }
    ]
  });

  return AuditLog;
};

module.exports = (sequelize, DataTypes) => {
  const Workflow = sequelize.define('Workflow', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trigger_type: {
      type: DataTypes.ENUM('message_received', 'no_reply', 'stage_change', 'qualification_complete', 'manual', 'scheduled'),
      allowNull: false
    },
    trigger_config: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Configuration for trigger (e.g., delay time, stage IDs)'
    },
    conditions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of condition objects to evaluate'
    },
    actions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of action objects to execute'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft'),
      defaultValue: 'draft'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Higher priority workflows execute first'
    },
    execution_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    success_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    failure_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_executed_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'workflows',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'status'] },
      { fields: ['tenant_id', 'trigger_type'] },
      { fields: ['priority'] }
    ]
  });

  return Workflow;
};

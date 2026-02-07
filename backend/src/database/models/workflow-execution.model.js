module.exports = (sequelize, DataTypes) => {
  const WorkflowExecution = sequelize.define('WorkflowExecution', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    workflow_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workflows',
        key: 'id'
      }
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'leads',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    trigger_data: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Data that triggered the workflow'
    },
    execution_log: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Step-by-step execution log'
    },
    result: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Final execution result'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'workflow_executions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['workflow_id', 'status'] },
      { fields: ['lead_id'] },
      { fields: ['created_at'] }
    ]
  });

  return WorkflowExecution;
};

const { sequelize } = require('../postgres');
const { DataTypes } = require('sequelize');

// Import all models
const Tenant = require('./tenant.model')(sequelize, DataTypes);
const User = require('./user.model')(sequelize, DataTypes);
const Lead = require('./lead.model')(sequelize, DataTypes);
const LeadStage = require('./lead-stage.model')(sequelize, DataTypes);
const Workflow = require('./workflow.model')(sequelize, DataTypes);
const WorkflowExecution = require('./workflow-execution.model')(sequelize, DataTypes);
const AIPrompt = require('./ai-prompt.model')(sequelize, DataTypes);
const WebhookLog = require('./webhook-log.model')(sequelize, DataTypes);
const AuditLog = require('./audit-log.model')(sequelize, DataTypes);

// Define associations
// Tenant associations
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });
Tenant.hasMany(Lead, { foreignKey: 'tenant_id', as: 'leads' });
Tenant.hasMany(LeadStage, { foreignKey: 'tenant_id', as: 'stages' });
Tenant.hasMany(Workflow, { foreignKey: 'tenant_id', as: 'workflows' });
Tenant.hasMany(AIPrompt, { foreignKey: 'tenant_id', as: 'prompts' });

// User associations
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
User.hasMany(Lead, { foreignKey: 'assigned_to', as: 'assignedLeads' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

// Lead associations
Lead.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
Lead.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });
Lead.belongsTo(LeadStage, { foreignKey: 'stage_id', as: 'stage' });

// LeadStage associations
LeadStage.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
LeadStage.hasMany(Lead, { foreignKey: 'stage_id', as: 'leads' });

// Workflow associations
Workflow.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
Workflow.hasMany(WorkflowExecution, { foreignKey: 'workflow_id', as: 'executions' });

// WorkflowExecution associations
WorkflowExecution.belongsTo(Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
WorkflowExecution.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });

// AIPrompt associations
AIPrompt.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// WebhookLog associations
WebhookLog.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// AuditLog associations
AuditLog.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Lead,
  LeadStage,
  Workflow,
  WorkflowExecution,
  AIPrompt,
  WebhookLog,
  AuditLog
};

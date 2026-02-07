module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenant_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      comment: 'Unique tenant identifier used in URLs'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Primary WhatsApp business number'
    },
    whatsapp_api_key: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Encrypted WhatsApp API key'
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'trial', 'cancelled'),
      defaultValue: 'trial'
    },
    subscription_plan: {
      type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
      defaultValue: 'free'
    },
    subscription_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        timezone: 'UTC',
        language: 'en',
        business_hours: {
          enabled: true,
          schedule: {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' },
            wednesday: { start: '09:00', end: '18:00' },
            thursday: { start: '09:00', end: '18:00' },
            friday: { start: '09:00', end: '18:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: { start: null, end: null }
          }
        },
        ai_enabled: true,
        auto_qualification: true,
        auto_followup: true
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
    tableName: 'tenants',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id'], unique: true },
      { fields: ['email'], unique: true },
      { fields: ['status'] }
    ]
  });

  return Tenant;
};

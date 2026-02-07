module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'agent'),
      defaultValue: 'agent',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    mfa_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mfa_secret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {
        leads: { view: true, create: true, edit: true, delete: false },
        conversations: { view: true, reply: true },
        workflows: { view: true, create: false, edit: false, delete: false },
        analytics: { view: true },
        settings: { view: false, edit: false }
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tenant_id', 'email'], unique: true },
      { fields: ['tenant_id', 'role'] },
      { fields: ['status'] }
    ]
  });

  return User;
};

const jwt = require('jsonwebtoken');
const { AppError } = require('./error-handler');
const { User } = require('../../database/models');
const { getRedisClient } = require('../../database/redis');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Check if token is blacklisted
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash', 'mfa_secret'] }
    });

    if (!user || user.status !== 'active') {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    req.tenantId = user.tenant_id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const permissions = req.user.permissions || {};
    const resourcePermissions = permissions[resource] || {};

    if (!resourcePermissions[action]) {
      return next(new AppError(`No permission to ${action} ${resource}`, 403));
    }

    next();
  };
};

const validateTenant = async (req, res, next) => {
  try {
    const tenantIdParam = req.params.tenantId || req.body.tenantId;
    
    if (!tenantIdParam) {
      return next(new AppError('Tenant ID required', 400));
    }

    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Get tenant by tenant_id string to compare with user's tenant UUID
    const { Tenant } = require('../../database/models');
    const tenant = await Tenant.findOne({ where: { tenant_id: tenantIdParam } });
    
    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    // Compare UUIDs
    if (req.user.tenant_id !== tenant.id) {
      return next(new AppError('Access denied to this tenant', 403));
    }

    // Store tenant UUID for use in routes
    req.tenantUuid = tenant.id;
    req.tenantId = tenantIdParam;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  validateTenant
};

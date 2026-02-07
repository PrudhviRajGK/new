const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Tenant } = require('../../database/models');
const { AppError } = require('../../shared/middleware/error-handler');
const { getRedisClient } = require('../../database/redis');
const logger = require('../../shared/utils/logger');

class AuthService {
  async register(data) {
    const { email, password, firstName, lastName, tenantId, role = 'agent' } = data;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email, tenant_id: tenantId } });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Verify tenant exists
    const tenant = await Tenant.findOne({ where: { tenant_id: tenantId } });
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      tenant_id: tenant.id,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role,
      status: 'active'
    });

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async login(email, password, tenantId) {
    const tenant = await Tenant.findOne({ where: { tenant_id: tenantId } });
    if (!tenant) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = await User.findOne({ 
      where: { email, tenant_id: tenant.id },
      include: [{ model: Tenant, as: 'tenant' }]
    });

    if (!user || user.status !== 'active') {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    const tokens = this.generateTokens(user);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findByPk(decoded.userId);
      if (!user || user.status !== 'active') {
        throw new AppError('Invalid refresh token', 401);
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(token) {
    const redis = getRedisClient();
    const decoded = jwt.decode(token);
    
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setex(`blacklist:${token}`, ttl, 'true');
      }
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash: passwordHash });

    logger.info(`Password changed for user: ${user.email}`);
  }

  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Tenant, as: 'tenant' }],
      attributes: { exclude: ['password_hash', 'mfa_secret'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        tenantId: user.tenant_id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : user;
    delete userData.password_hash;
    delete userData.mfa_secret;
    return userData;
  }
}

module.exports = new AuthService();

const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const { apiLimiter } = require('../shared/middleware/rate-limit.middleware');

const router = express.Router();

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Tenant-specific routes (all require authentication)
router.use('/:tenantId', require('./tenant.routes'));

module.exports = router;

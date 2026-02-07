const express = require('express');
const { body } = require('express-validator');
const authController = require('./auth.controller');
const { validate } = require('../../shared/middleware/validation.middleware');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { authLimiter } = require('../../shared/middleware/rate-limit.middleware');

const router = express.Router();

router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('tenantId').notEmpty(),
    validate
  ],
  authController.register
);

router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('tenantId').notEmpty(),
    validate
  ],
  authController.login
);

router.post('/refresh-token',
  [
    body('refreshToken').notEmpty(),
    validate
  ],
  authController.refreshToken
);

router.post('/logout',
  authenticate,
  authController.logout
);

router.post('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
    validate
  ],
  authController.changePassword
);

router.get('/profile',
  authenticate,
  authController.getProfile
);

module.exports = router;

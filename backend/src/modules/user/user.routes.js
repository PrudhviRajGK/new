const express = require('express');
const { User } = require('../../database/models');
const { checkPermission, authorize } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.get('/',
  checkPermission('settings', 'view'),
  async (req, res, next) => {
    try {
      const users = await User.findAll({
        where: { tenant_id: req.params.tenantId },
        attributes: { exclude: ['password_hash', 'mfa_secret'] }
      });
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

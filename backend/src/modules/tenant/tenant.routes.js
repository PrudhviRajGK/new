const express = require('express');
const { Tenant } = require('../../database/models');
const { authorize } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.get('/',
  authorize('admin'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({
        where: { tenant_id: req.params.tenantId }
      });
      res.json({ success: true, data: tenant });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/',
  authorize('admin'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({
        where: { tenant_id: req.params.tenantId }
      });
      await tenant.update(req.body);
      res.json({ success: true, data: tenant });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

const express = require('express');
const { body, param } = require('express-validator');
const leadController = require('./lead.controller');
const { validate } = require('../../shared/middleware/validation.middleware');
const { checkPermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.post('/',
  checkPermission('leads', 'create'),
  [
    body('whatsappNumber').notEmpty().matches(/^\+[1-9]\d{1,14}$/),
    body('name').optional().trim(),
    body('email').optional().isEmail(),
    body('company').optional().trim(),
    validate
  ],
  leadController.createLead
);

router.get('/',
  checkPermission('leads', 'view'),
  leadController.getLeads
);

router.get('/stats',
  checkPermission('leads', 'view'),
  leadController.getStats
);

router.get('/:leadId',
  checkPermission('leads', 'view'),
  [param('leadId').isUUID(), validate],
  leadController.getLeadById
);

router.put('/:leadId',
  checkPermission('leads', 'edit'),
  [param('leadId').isUUID(), validate],
  leadController.updateLead
);

router.post('/:leadId/assign',
  checkPermission('leads', 'edit'),
  [
    param('leadId').isUUID(),
    body('userId').isUUID(),
    validate
  ],
  leadController.assignLead
);

router.post('/:leadId/qualify',
  checkPermission('leads', 'edit'),
  [param('leadId').isUUID(), validate],
  leadController.qualifyLead
);

router.put('/:leadId/stage',
  checkPermission('leads', 'edit'),
  [
    param('leadId').isUUID(),
    body('stageId').isUUID(),
    validate
  ],
  leadController.updateStage
);

router.delete('/:leadId',
  checkPermission('leads', 'delete'),
  [param('leadId').isUUID(), validate],
  leadController.deleteLead
);

module.exports = router;

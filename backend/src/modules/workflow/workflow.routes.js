const express = require('express');
const { body, param } = require('express-validator');
const workflowController = require('./workflow.controller');
const { validate } = require('../../shared/middleware/validation.middleware');
const { checkPermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.post('/',
  checkPermission('workflows', 'create'),
  [
    body('name').notEmpty().trim(),
    body('triggerType').isIn(['message_received', 'no_reply', 'stage_change', 'qualification_complete', 'manual', 'scheduled']),
    validate
  ],
  workflowController.createWorkflow
);

router.get('/',
  checkPermission('workflows', 'view'),
  workflowController.getWorkflows
);

router.get('/:workflowId',
  checkPermission('workflows', 'view'),
  [param('workflowId').isUUID(), validate],
  workflowController.getWorkflowById
);

router.put('/:workflowId',
  checkPermission('workflows', 'edit'),
  [param('workflowId').isUUID(), validate],
  workflowController.updateWorkflow
);

router.delete('/:workflowId',
  checkPermission('workflows', 'delete'),
  [param('workflowId').isUUID(), validate],
  workflowController.deleteWorkflow
);

router.post('/:workflowId/execute',
  checkPermission('workflows', 'edit'),
  [param('workflowId').isUUID(), validate],
  workflowController.executeWorkflow
);

module.exports = router;

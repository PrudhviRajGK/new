const express = require('express');
const { checkPermission } = require('../../shared/middleware/auth.middleware');
const { AIPrompt, Tenant } = require('../../database/models');

const router = express.Router({ mergeParams: true });

// Get all AI prompts for tenant
router.get('/',
  checkPermission('ai-prompts', 'view'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({ where: { tenant_id: req.params.tenantId } });
      
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      const prompts = await AIPrompt.findAll({
        where: { tenant_id: tenant.id },
        order: [['created_at', 'DESC']]
      });

      res.json({ success: true, data: prompts });
    } catch (error) {
      next(error);
    }
  }
);

// Get single AI prompt
router.get('/:id',
  checkPermission('ai-prompts', 'view'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({ where: { tenant_id: req.params.tenantId } });
      
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      const prompt = await AIPrompt.findOne({
        where: { 
          id: req.params.id,
          tenant_id: tenant.id 
        }
      });

      if (!prompt) {
        return res.status(404).json({ success: false, message: 'Prompt not found' });
      }

      res.json({ success: true, data: prompt });
    } catch (error) {
      next(error);
    }
  }
);

// Create AI prompt
router.post('/',
  checkPermission('ai-prompts', 'create'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({ where: { tenant_id: req.params.tenantId } });
      
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      const { prompt_type, prompt_text, context, is_active } = req.body;

      if (!prompt_type || !prompt_text) {
        return res.status(400).json({ 
          success: false, 
          message: 'prompt_type and prompt_text are required' 
        });
      }

      // Map frontend types to backend enum (qualification, response, summary, scoring, intent_detection)
      const typeMap = { summarization: 'summary', response_generation: 'response' };
      const mappedType = typeMap[prompt_type] || prompt_type;

      const prompt = await AIPrompt.create({
        tenant_id: tenant.id,
        name: `${prompt_type} - ${new Date().toISOString().slice(0, 10)}`,
        type: mappedType,
        prompt_template: prompt_text,
        system_message: prompt_text,
        metadata: context ? { context } : {},
        is_active: is_active !== undefined ? is_active : true
      });

      res.status(201).json({ success: true, data: prompt });
    } catch (error) {
      next(error);
    }
  }
);

// Update AI prompt
router.put('/:id',
  checkPermission('ai-prompts', 'update'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({ where: { tenant_id: req.params.tenantId } });
      
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      const prompt = await AIPrompt.findOne({
        where: { 
          id: req.params.id,
          tenant_id: tenant.id 
        }
      });

      if (!prompt) {
        return res.status(404).json({ success: false, message: 'Prompt not found' });
      }

      const { prompt_type, prompt_text, context, is_active } = req.body;

      const typeMap = { summarization: 'summary', response_generation: 'response' };
      const mappedType = prompt_type ? (typeMap[prompt_type] || prompt_type) : null;

      await prompt.update({
        ...(mappedType && { type: mappedType }),
        ...(prompt_text && { prompt_template: prompt_text, system_message: prompt_text }),
        ...(is_active !== undefined && { is_active })
      });

      res.json({ success: true, data: prompt });
    } catch (error) {
      next(error);
    }
  }
);

// Delete AI prompt
router.delete('/:id',
  checkPermission('ai-prompts', 'delete'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findOne({ where: { tenant_id: req.params.tenantId } });
      
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      const prompt = await AIPrompt.findOne({
        where: { 
          id: req.params.id,
          tenant_id: tenant.id 
        }
      });

      if (!prompt) {
        return res.status(404).json({ success: false, message: 'Prompt not found' });
      }

      await prompt.destroy();

      res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

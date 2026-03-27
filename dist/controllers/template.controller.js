import { TemplateService } from '../services/template.service.js';
import { z } from 'zod';
const sectionSchema = z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(['text', 'list', 'metrics', 'category_breakdown']),
    placeholder: z.string().optional(),
    order: z.number(),
});
const createTemplateSchema = z.object({
    userId: z.string().min(1),
    name: z.string().min(1).max(50),
    sections: z.array(sectionSchema).min(1),
});
const updateTemplateSchema = z.object({
    userId: z.string().min(1),
    name: z.string().min(1).max(50).optional(),
    sections: z.array(sectionSchema).optional(),
});
/** GET /templates?userId=... */
export const getTemplates = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId)
            return res.status(400).json({ success: false, message: 'userId required' });
        const templates = await TemplateService.getTemplates(userId);
        res.json({ success: true, templates });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
/** GET /templates/:id?userId=... */
export const getTemplate = async (req, res) => {
    try {
        const userId = req.query.userId;
        const templateId = req.params.id;
        if (!userId)
            return res.status(400).json({ success: false, message: 'userId required' });
        const template = await TemplateService.getTemplate(templateId, userId);
        res.json({ success: true, template });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
/** POST /templates */
export const createTemplate = async (req, res) => {
    try {
        const { userId, name, sections } = createTemplateSchema.parse(req.body);
        const template = await TemplateService.createTemplate(userId, name, sections);
        res.json({ success: true, template });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Template with this name already exists' });
        }
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
/** PUT /templates/:id */
export const updateTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        const { userId, name, sections } = updateTemplateSchema.parse(req.body);
        const template = await TemplateService.updateTemplate(templateId, userId, { name, sections });
        res.json({ success: true, template });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
/** DELETE /templates/:id?userId=... */
export const deleteTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        const userId = req.query.userId;
        if (!userId)
            return res.status(400).json({ success: false, message: 'userId required' });
        const template = await TemplateService.deleteTemplate(templateId, userId);
        res.json({ success: true, template });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};

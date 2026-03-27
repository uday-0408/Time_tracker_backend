import express from 'express';
import { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate, } from '../controllers/template.controller.js';
const router = express.Router();
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
export default router;

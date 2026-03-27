import express from 'express';
import { getCategories, addCategory, deleteCategory } from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', addCategory);
router.delete('/:id', deleteCategory);

export default router;

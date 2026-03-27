import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';
import { z } from 'zod';

const addCategorySchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, 'Category name is required').max(30),
  color: z.string().optional(),
  tag: z.string().optional(),
  isProductive: z.boolean().optional(),
});

/** GET /categories?userId=... */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const categories = await CategoryService.getCategories(userId);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
};

/** POST /categories */
export const addCategory = async (req: Request, res: Response) => {
  try {
    const { userId, name, color, tag, isProductive } = addCategorySchema.parse(req.body);
    const category = await CategoryService.addCategory(userId, name, color, tag, isProductive);
    res.json({ success: true, category });
  } catch (error: any) {
    // Handle duplicate key error from Mongoose
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
};

/** DELETE /categories/:id?userId=... */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const category = await CategoryService.deleteCategory(categoryId, userId);
    res.json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
};

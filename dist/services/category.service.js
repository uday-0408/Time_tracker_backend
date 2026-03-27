import Category, { DEFAULT_CATEGORIES } from '../models/Category.js';
/**
 * CategoryService manages user-specific work categories.
 * On first access, default categories are seeded automatically.
 */
export class CategoryService {
    /**
     * Get all categories for a user.
     * If the user has none yet, seed with defaults.
     */
    static async getCategories(userId) {
        let categories = await Category.find({ userId }).sort({ order: 1 });
        // First-time user — seed with defaults
        if (categories.length === 0) {
            const docs = DEFAULT_CATEGORIES.map((c) => ({ ...c, userId }));
            await Category.insertMany(docs);
            categories = await Category.find({ userId }).sort({ order: 1 });
        }
        return categories;
    }
    /** Add a new category for a user */
    static async addCategory(userId, name, color = 'blue', tag = 'Other', isProductive = true) {
        // Determine next order value
        const maxOrder = await Category.findOne({ userId })
            .sort({ order: -1 })
            .select('order')
            .lean();
        const order = maxOrder ? maxOrder.order + 1 : 0;
        const category = await Category.create({
            userId,
            name: name.trim(),
            color,
            tag,
            isProductive,
            order,
        });
        return category;
    }
    /** Delete a category by ID (only if it belongs to the user) */
    static async deleteCategory(categoryId, userId) {
        const category = await Category.findOneAndDelete({ _id: categoryId, userId });
        if (!category)
            throw new Error('Category not found or access denied');
        return category;
    }
    /**
     * Returns the list of productive category names for a user.
     * Used by analytics to compute productivity score dynamically.
     */
    static async getProductiveNames(userId) {
        const categories = await this.getCategories(userId);
        return categories.filter((c) => c.isProductive).map((c) => c.name);
    }
}

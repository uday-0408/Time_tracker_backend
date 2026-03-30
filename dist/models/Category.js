import mongoose, { Schema } from 'mongoose';
// Available tags for task categorization
export const AVAILABLE_TAGS = [
    'Development',
    'Meetings',
    'Bug Fixes',
    'Code Review',
    'Research',
    'Documentation',
    'Testing',
    'DevOps',
    'Design',
    'Learning',
    'Other',
];
// Palette of Tailwind-friendly colors users can pick from
export const AVAILABLE_COLORS = [
    'blue', 'green', 'purple', 'orange', 'red', 'gray',
    'pink', 'teal', 'cyan', 'yellow', 'indigo', 'emerald',
];
// Seed categories created for new users
export const DEFAULT_CATEGORIES = [
    { name: 'Python', color: 'blue', tag: 'Development', isProductive: true, order: 0 },
    { name: 'SQL', color: 'green', tag: 'Development', isProductive: true, order: 1 },
    { name: 'Midas', color: 'purple', tag: 'Development', isProductive: true, order: 2 },
    { name: 'Datasetu', color: 'orange', tag: 'Development', isProductive: true, order: 3 },
    { name: 'TT', color: 'red', tag: 'Other', isProductive: false, order: 4 },
];
const CategorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        default: 'blue',
    },
    tag: {
        type: String,
        default: 'Other',
    },
    isProductive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
// Each user's category names must be unique
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export default Category;

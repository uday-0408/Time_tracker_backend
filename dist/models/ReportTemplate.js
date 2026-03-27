import mongoose, { Schema } from 'mongoose';
const TemplateSectionSchema = new Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'list', 'metrics', 'category_breakdown'], default: 'text' },
    placeholder: { type: String, default: '' },
    order: { type: Number, default: 0 },
}, { _id: false });
const ReportTemplateSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['daily_standup', 'weekly_summary', 'project_status', 'custom'],
        default: 'custom',
    },
    isDefault: { type: Boolean, default: false },
    sections: [TemplateSectionSchema],
}, { timestamps: true });
ReportTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });
// Built-in templates seeded for each new user
export const DEFAULT_TEMPLATES = [
    {
        name: 'Daily Standup',
        type: 'daily_standup',
        isDefault: true,
        sections: [
            { key: 'yesterday', label: 'What I did yesterday', type: 'text', placeholder: 'Summarize yesterday\'s work...', order: 0 },
            { key: 'today', label: 'What I\'m doing today', type: 'text', placeholder: 'Plan for today...', order: 1 },
            { key: 'blockers', label: 'Blockers', type: 'list', placeholder: 'Any impediments?', order: 2 },
            { key: 'metrics', label: 'Time Metrics', type: 'metrics', placeholder: '', order: 3 },
        ],
    },
    {
        name: 'Weekly Summary',
        type: 'weekly_summary',
        isDefault: true,
        sections: [
            { key: 'accomplishments', label: 'Key Accomplishments', type: 'list', placeholder: 'What did you accomplish this week?', order: 0 },
            { key: 'challenges', label: 'Challenges', type: 'list', placeholder: 'What challenges did you face?', order: 1 },
            { key: 'next_week', label: 'Plans for Next Week', type: 'text', placeholder: 'What are your goals for next week?', order: 2 },
            { key: 'category_breakdown', label: 'Category Breakdown', type: 'category_breakdown', placeholder: '', order: 3 },
            { key: 'metrics', label: 'Weekly Metrics', type: 'metrics', placeholder: '', order: 4 },
        ],
    },
    {
        name: 'Project Status',
        type: 'project_status',
        isDefault: true,
        sections: [
            { key: 'project_name', label: 'Project Name', type: 'text', placeholder: 'Project name...', order: 0 },
            { key: 'status', label: 'Current Status', type: 'text', placeholder: 'On track / At risk / Blocked', order: 1 },
            { key: 'completed', label: 'Completed Tasks', type: 'list', placeholder: 'What tasks have been completed?', order: 2 },
            { key: 'in_progress', label: 'In Progress', type: 'list', placeholder: 'What\'s currently being worked on?', order: 3 },
            { key: 'risks', label: 'Risks & Blockers', type: 'list', placeholder: 'Any risks or blockers?', order: 4 },
            { key: 'metrics', label: 'Time Invested', type: 'metrics', placeholder: '', order: 5 },
        ],
    },
];
const ReportTemplate = mongoose.models.ReportTemplate || mongoose.model('ReportTemplate', ReportTemplateSchema);
export default ReportTemplate;

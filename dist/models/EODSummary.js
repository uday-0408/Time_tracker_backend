import mongoose, { Schema } from 'mongoose';
const EODVersionSchema = new Schema({
    summary: { type: String, default: '' },
    highlights: [{ type: String }],
    blockers: [{ type: String }],
    editedAt: { type: Date, default: Date.now },
}, { _id: false });
const EODSummarySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    totalHours: {
        type: Number,
        default: 0,
    },
    productiveHours: {
        type: Number,
        default: 0,
    },
    categoryBreakdown: {
        type: Schema.Types.Mixed,
        default: {},
    },
    summary: {
        type: String,
        default: '',
    },
    highlights: {
        type: [String],
        default: [],
    },
    blockers: {
        type: [String],
        default: [],
    },
    versions: [EODVersionSchema],
}, { timestamps: true });
// Enforce uniqueness: one EOD per user per day
EODSummarySchema.index({ userId: 1, date: 1 }, { unique: true });
EODSummarySchema.index({ userId: 1, date: -1 });
const EODSummary = mongoose.models.EODSummary || mongoose.model('EODSummary', EODSummarySchema);
export default EODSummary;

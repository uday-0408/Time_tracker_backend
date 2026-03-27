import mongoose, { Schema } from 'mongoose';
const WorkNoteVersionSchema = new Schema({
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
}, { _id: false });
const WorkNoteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    linkedType: {
        type: String,
        enum: ['SESSION', 'DAY'],
        required: true,
    },
    referenceId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
    versions: [WorkNoteVersionSchema],
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
// Efficient lookup: user + linked context
WorkNoteSchema.index({ userId: 1, linkedType: 1, referenceId: 1 });
const WorkNote = mongoose.models.WorkNote || mongoose.model('WorkNote', WorkNoteSchema);
export default WorkNote;

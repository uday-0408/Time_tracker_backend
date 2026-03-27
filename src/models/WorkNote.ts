import mongoose, { Schema, Model, Document } from 'mongoose';

// Stores a snapshot of previous content whenever a note is edited.
// This preserves an audit trail — every version is kept.
export interface IWorkNoteVersion {
  content: string;
  editedAt: Date;
}

export interface IWorkNote extends Document {
  userId: mongoose.Types.ObjectId;
  /** SESSION = tied to a specific TimeEntry, DAY = tied to a date */
  linkedType: 'SESSION' | 'DAY';
  /** TimeEntry ObjectId (SESSION) or ISO date string "YYYY-MM-DD" (DAY) */
  referenceId: string;
  content: string;
  versions: IWorkNoteVersion[];
  isDeleted: boolean; // soft-delete flag
  createdAt: Date;
  updatedAt: Date;
}

const WorkNoteVersionSchema = new Schema<IWorkNoteVersion>(
  {
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WorkNoteSchema = new Schema<IWorkNote>(
  {
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
  },
  { timestamps: true }
);

// Efficient lookup: user + linked context
WorkNoteSchema.index({ userId: 1, linkedType: 1, referenceId: 1 });

const WorkNote: Model<IWorkNote> =
  mongoose.models.WorkNote || mongoose.model<IWorkNote>('WorkNote', WorkNoteSchema);

export default WorkNote;

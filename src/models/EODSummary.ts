import mongoose, { Schema, Model, Document } from 'mongoose';

// Snapshot of a previous EOD version for audit purposes
export interface IEODVersion {
  summary: string;
  highlights: string[];
  blockers: string[];
  editedAt: Date;
}

export interface IEODSummary extends Document {
  userId: mongoose.Types.ObjectId;
  /** ISO date string "YYYY-MM-DD" — one summary per user per date */
  date: string;
  /** Auto-calculated from completed TimeEntries for this date */
  totalHours: number;
  productiveHours: number;
  /** Category breakdown { Python: 3600, SQL: 1200, ... } in seconds */
  categoryBreakdown: Record<string, number>;
  /** User-editable fields */
  summary: string;
  highlights: string[];
  blockers: string[];
  /** Audit trail of edits to user-editable fields */
  versions: IEODVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const EODVersionSchema = new Schema<IEODVersion>(
  {
    summary: { type: String, default: '' },
    highlights: [{ type: String }],
    blockers: [{ type: String }],
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EODSummarySchema = new Schema<IEODSummary>(
  {
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
  },
  { timestamps: true }
);

// Enforce uniqueness: one EOD per user per day
EODSummarySchema.index({ userId: 1, date: 1 }, { unique: true });
EODSummarySchema.index({ userId: 1, date: -1 });

const EODSummary: Model<IEODSummary> =
  mongoose.models.EODSummary || mongoose.model<IEODSummary>('EODSummary', EODSummarySchema);

export default EODSummary;

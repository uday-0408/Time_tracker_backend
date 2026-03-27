import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITimeEntryHistory {
  updatedAt: Date;
  reason: string;
  previousDuration: number;
  previousStartTime: Date;
  previousEndTime: Date | null;
}

export interface ITimeEntry extends Document {
  category: string;
  startTime: Date;
  endTime: Date | null;
  date: string;
  durationSeconds: number;
  userId: mongoose.Types.ObjectId;
  description?: string;
  isIdle?: boolean;
  history?: ITimeEntryHistory[];
  status: 'running' | 'completed' | 'paused';
}

const TimeEntryHistorySchema = new Schema({
  updatedAt: { type: Date, default: Date.now },
  reason: String,
  previousDuration: Number,
  previousStartTime: Date,
  previousEndTime: Date,
}, { _id: false });

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    category: {
      type: String,
      required: true,
      // enum constraint removed to allow dynamic categories if needed, but keeping simple for now
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    date: {
      type: String,
      required: true,
      index: true, 
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    isIdle: {
      type: Boolean,
      default: false,
    },
    history: [TimeEntryHistorySchema],
    status: {
      type: String,
      enum: ['running', 'completed', 'paused'],
      default: 'running',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying of user's daily data
TimeEntrySchema.index({ userId: 1, date: 1 });
// Index for finding running entries
TimeEntrySchema.index({ userId: 1, status: 1 });
// Covers frequently used filters for recent completed and running entry lookups
TimeEntrySchema.index({ userId: 1, status: 1, startTime: -1 });
TimeEntrySchema.index({ userId: 1, status: 1, date: 1 });

const TimeEntry: Model<ITimeEntry> =
  mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);

export default TimeEntry;

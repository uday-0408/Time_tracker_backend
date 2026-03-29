import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Tracks pomodoro session metadata per user per day.
 * Pomodoro timer operates independently from the main time-tracker, 
 * tracking its own cycles and phases without creating TimeEntry records.
 */
export interface IPomodoroSession extends Document {
  userId: mongoose.Types.ObjectId | string;
  date: string; // YYYY-MM-DD
  completedPomodoros: number;
  completedBreaks: number;
  /** User's chosen mode for the day — stored so we can resume after refresh */
  mode: '25/5' | '50/10' | 'custom';
  /** Custom durations (only used when mode === 'custom') */
  customWorkMinutes: number;
  customBreakMinutes: number;
  /** Persisted phase state — survives page reloads */
  activePhase: 'idle' | 'work' | 'break';
  phaseStartedAt: Date | null;
  phaseCategory: string;
  pausedAt: Date | null;
  totalPausedSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const PomodoroSessionSchema = new Schema<IPomodoroSession>(
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
    completedPomodoros: {
      type: Number,
      default: 0,
    },
    completedBreaks: {
      type: Number,
      default: 0,
    },
    mode: {
      type: String,
      enum: ['25/5', '50/10', 'custom'],
      default: '25/5',
    },
    customWorkMinutes: {
      type: Number,
      default: 25,
      min: 1,
      max: 180,
    },
    customBreakMinutes: {
      type: Number,
      default: 5,
      min: 0,
      max: 60,
    },
    activePhase: {
      type: String,
      enum: ['idle', 'work', 'break'],
      default: 'idle',
    },
    phaseStartedAt: {
      type: Date,
      default: null,
    },
    phaseCategory: {
      type: String,
      default: '',
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    totalPausedSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One record per user per day
PomodoroSessionSchema.index({ userId: 1, date: 1 }, { unique: true });

const PomodoroSession: Model<IPomodoroSession> =
  mongoose.models.PomodoroSession ||
  mongoose.model<IPomodoroSession>('PomodoroSession', PomodoroSessionSchema);

export default PomodoroSession;

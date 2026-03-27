import PomodoroSession from '../models/PomodoroSession.js';
import { TimeService } from './time.service.js';

/**
 * PomodoroService orchestrates pomodoro cycles on top of the existing
 * time-tracking system. Work and break periods are recorded as normal
 * TimeEntries so they feed into analytics and EOD summaries seamlessly.
 *
 * Phase state (activePhase, phaseStartedAt, pausedAt, totalPausedSeconds)
 * is persisted in the PomodoroSession document so the timer survives
 * page reloads.
 */
export class PomodoroService {
  /** Helper: get phase duration in seconds based on mode */
  private static getPhaseDuration(
    session: { mode: string; customWorkMinutes?: number; customBreakMinutes?: number },
    phase: 'work' | 'break'
  ): number {
    if (phase === 'work') {
      if (session.mode === 'custom') return (session.customWorkMinutes || 25) * 60;
      if (session.mode === '50/10') return 50 * 60;
      return 25 * 60;
    } else {
      if (session.mode === 'custom') return (session.customBreakMinutes || 5) * 60;
      if (session.mode === '50/10') return 10 * 60;
      return 5 * 60;
    }
  }

  /** Get (or create) today's pomodoro record for a user.
   *  Auto-expires stale phases so the frontend never sees an expired timer. */
  static async getTodaySession(userId: string) {
    const date = new Date().toISOString().split('T')[0];
    let session = await PomodoroSession.findOne({ userId, date });

    if (!session) {
      session = await PomodoroSession.create({
        userId,
        date,
        completedPomodoros: 0,
        completedBreaks: 0,
        mode: '25/5',
        activePhase: 'idle',
      });
      return session;
    }

    // Auto-expire stale phases (user closed tab / was away while timer ran out)
    if (
      session.activePhase !== 'idle' &&
      session.phaseStartedAt &&
      !session.pausedAt // don't expire if paused
    ) {
      const elapsedSec =
        (Date.now() - new Date(session.phaseStartedAt).getTime()) / 1000 -
        (session.totalPausedSeconds || 0);
      const phaseDuration = this.getPhaseDuration(
        session,
        session.activePhase as 'work' | 'break'
      );

      if (elapsedSec >= phaseDuration) {
        // Phase expired while user was away — reset to idle.
        // Increment the completed counter so the user gets credit.
        // Do NOT call TimeService.stopEntry — the original entry may
        // already be stopped or a different entry may be running now.
        const wasPhase = session.activePhase;
        session.activePhase = 'idle';
        session.phaseStartedAt = null;
        session.phaseCategory = '';
        session.pausedAt = null;
        session.totalPausedSeconds = 0;
        if (wasPhase === 'work') session.completedPomodoros += 1;
        else session.completedBreaks += 1;
        await session.save();
      }
    }

    return session;
  }

  /**
   * Start a work pomodoro — creates a TimeEntry and records phase state.
   */
  static async startWork(userId: string, category: string) {
    const date = new Date().toISOString().split('T')[0];

    // Create the time entry for tracking
    const entry = await TimeService.startEntry(
      userId,
      category,
      `Pomodoro work`
    );

    // Persist phase state
    const session = await PomodoroSession.findOneAndUpdate(
      { userId, date },
      {
        $set: {
          activePhase: 'work',
          phaseStartedAt: new Date(),
          phaseCategory: category,
          pausedAt: null,
          totalPausedSeconds: 0,
        },
        $setOnInsert: { completedPomodoros: 0, completedBreaks: 0, mode: '25/5' },
      },
      { upsert: true, new: true }
    );

    return { session, entry };
  }

  /**
   * Called when a work pomodoro finishes.
   * - Stops the running TimeEntry
   * - Increments the pomodoro counter
   * - Auto-starts a "Break" TimeEntry for the break period
   * - Transitions phase to 'break'
   */
  static async completePomodoro(userId: string, category: string) {
    // Stop the current work entry
    await TimeService.stopEntry(userId);

    const date = new Date().toISOString().split('T')[0];
    const session = await PomodoroSession.findOneAndUpdate(
      { userId, date },
      {
        $inc: { completedPomodoros: 1 },
        $set: {
          activePhase: 'break',
          phaseStartedAt: new Date(),
          phaseCategory: category,
          pausedAt: null,
          totalPausedSeconds: 0,
        },
        $setOnInsert: { mode: '25/5', completedBreaks: 0 },
      },
      { upsert: true, new: true }
    );

    // Auto-start a break entry so it shows in time tracking
    const breakEntry = await TimeService.startEntry(
      userId,
      'Break',
      `Pomodoro break after ${category}`
    );

    return { session, breakEntry };
  }

  /**
   * Called when a break period finishes.
   * Stops the break TimeEntry, increments break counter, resets phase to idle.
   */
  static async completeBreak(userId: string) {
    await TimeService.stopEntry(userId);

    const date = new Date().toISOString().split('T')[0];
    const session = await PomodoroSession.findOneAndUpdate(
      { userId, date },
      {
        $inc: { completedBreaks: 1 },
        $set: {
          activePhase: 'idle',
          phaseStartedAt: null,
          phaseCategory: '',
          pausedAt: null,
          totalPausedSeconds: 0,
        },
      },
      { new: true }
    );

    return { session };
  }

  /**
   * Cancel an active pomodoro — stops the TimeEntry and resets phase to idle.
   */
  static async cancelPomodoro(userId: string) {
    await TimeService.stopEntry(userId);

    const date = new Date().toISOString().split('T')[0];
    const session = await PomodoroSession.findOneAndUpdate(
      { userId, date },
      {
        $set: {
          activePhase: 'idle',
          phaseStartedAt: null,
          phaseCategory: '',
          pausedAt: null,
          totalPausedSeconds: 0,
        },
      },
      { new: true }
    );

    return { session };
  }

  /**
   * Pause the current pomodoro phase.
   * Records pausedAt timestamp for elapsed-time calculation on resume.
   */
  static async pausePomodoro(userId: string) {
    const date = new Date().toISOString().split('T')[0];
    const session = await PomodoroSession.findOneAndUpdate(
      { userId, date, activePhase: { $ne: 'idle' }, pausedAt: null },
      { $set: { pausedAt: new Date() } },
      { new: true }
    );
    return { session };
  }

  /**
   * Resume a paused pomodoro.
   * Adds paused duration to totalPausedSeconds and clears pausedAt.
   */
  static async resumePomodoro(userId: string) {
    const date = new Date().toISOString().split('T')[0];
    const session = await PomodoroSession.findOne({ userId, date });
    if (!session || !session.pausedAt) return { session };

    const pausedDuration = Math.floor(
      (Date.now() - new Date(session.pausedAt).getTime()) / 1000
    );

    session.totalPausedSeconds += pausedDuration;
    session.pausedAt = null;
    await session.save();

    return { session };
  }

  /** Update the user's preferred pomodoro mode for today */
  static async setMode(
    userId: string,
    mode: '25/5' | '50/10' | 'custom',
    customWorkMinutes?: number,
    customBreakMinutes?: number
  ) {
    const date = new Date().toISOString().split('T')[0];

    const updateFields: Record<string, unknown> = { mode };
    if (mode === 'custom') {
      updateFields.customWorkMinutes = customWorkMinutes ?? 25;
      updateFields.customBreakMinutes = customBreakMinutes ?? 5;
    }

    const session = await PomodoroSession.findOneAndUpdate(
      { userId, date },
      { $set: updateFields, $setOnInsert: { completedPomodoros: 0, completedBreaks: 0 } },
      { upsert: true, new: true }
    );
    return session;
  }
}

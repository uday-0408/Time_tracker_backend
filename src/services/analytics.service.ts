import TimeEntry from '../models/TimeEntry.js';

export class AnalyticsService {
    static async getProductivityStats(userId: string, range: 'day' | 'week' | 'month') {
        const now = new Date();
        const startDate = new Date();

        if (range === 'day') startDate.setHours(0, 0, 0, 0);
        else if (range === 'week') startDate.setDate(now.getDate() - 7);
        else startDate.setDate(now.getDate() - 30);

        const entries = await TimeEntry.find({
            userId,
            startTime: { $gte: startDate },
            status: 'completed'
        });

        const productiveCategories = ['Python', 'SQL', 'Midas', 'Datasetu'];
        let productiveSeconds = 0;
        let totalSeconds = 0;
        let streak = 0;
        let maxStreak = 0;

        // Sort by startTime
        entries.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        entries.forEach(entry => {
            totalSeconds += entry.durationSeconds;
            if (productiveCategories.includes(entry.category)) {
                productiveSeconds += entry.durationSeconds;
                streak++;
            } else {
                streak = 0;
            }
            if (streak > maxStreak) maxStreak = streak;
        });

        const score = totalSeconds > 0 ? Math.round((productiveSeconds / totalSeconds) * 100) : 0;

        return {
            totalHours: (totalSeconds / 3600).toFixed(2),
            productiveHours: (productiveSeconds / 3600).toFixed(2),
            productivityScore: score,
            maxFocusStreak: maxStreak, // in number of sessions
        };
    }
}

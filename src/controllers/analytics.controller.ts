import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

export const getProductivity = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        const range = (req.query.range as 'day' | 'week' | 'month') || 'day';

        const data = await AnalyticsService.getProductivityStats(userId, range);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
};

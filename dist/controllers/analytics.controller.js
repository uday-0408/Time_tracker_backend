import { AnalyticsService } from '../services/analytics.service.js';
import { z } from 'zod';
const productivityQuerySchema = z.object({
    userId: z.string().min(1),
    range: z.enum(['day', 'week', 'month']).optional().default('day'),
});
const dailyTrendQuerySchema = z.object({
    userId: z.string().min(1),
    days: z.coerce.number().int().min(1).max(365).optional().default(30),
});
const weeklyCategoryQuerySchema = z.object({
    userId: z.string().min(1),
    weeks: z.coerce.number().int().min(1).max(52).optional().default(4),
});
const heatmapQuerySchema = z.object({
    userId: z.string().min(1),
    days: z.coerce.number().int().min(1).max(365).optional().default(365),
});
const userIdQuerySchema = z.object({
    userId: z.string().min(1),
});
export const getProductivity = async (req, res) => {
    try {
        const { userId, range } = productivityQuerySchema.parse(req.query);
        const data = await AnalyticsService.getProductivityStats(userId, range);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
export const getDailyTrend = async (req, res) => {
    try {
        const { userId, days } = dailyTrendQuerySchema.parse(req.query);
        const data = await AnalyticsService.getDailyTrend(userId, days);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
export const getWeeklyCategories = async (req, res) => {
    try {
        const { userId, weeks } = weeklyCategoryQuerySchema.parse(req.query);
        const data = await AnalyticsService.getWeeklyCategoryComparison(userId, weeks);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
export const getHeatmap = async (req, res) => {
    try {
        const { userId, days } = heatmapQuerySchema.parse(req.query);
        const data = await AnalyticsService.getHeatmapData(userId, days);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};
export const getInsights = async (req, res) => {
    try {
        const { userId } = userIdQuerySchema.parse(req.query);
        const data = await AnalyticsService.getInsights(userId);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};

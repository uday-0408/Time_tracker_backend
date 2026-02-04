import { Request, Response } from 'express';
import { TimeService } from '../services/time.service.js';
import { z } from 'zod';

const startSchema = z.object({
    userId: z.string(),
    category: z.string(),
    description: z.string().optional(),
});

const stopSchema = z.object({
    userId: z.string(),
});

export const startTracking = async (req: Request, res: Response) => {
    try {
        const { userId, category, description } = startSchema.parse(req.body);
        const entry = await TimeService.startEntry(userId, category, description);
        res.json({ success: true, entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
};

export const stopTracking = async (req: Request, res: Response) => {
    try {
        const { userId } = stopSchema.parse(req.body);
        const entry = await TimeService.stopEntry(userId);
        res.json({ success: true, entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
};

export const getToday = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) throw new Error('UserId required');

        const data = await TimeService.getTodayData(userId);
        res.json({ success: true, ...data });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        const days = parseInt(req.query.days as string) || 7;

        const history = await TimeService.getHistory(userId, days);
        res.json({ success: true, history });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
};

export const updateEntry = async (req: Request, res: Response) => {
    try {
        const { entryId, userId, updates } = req.body;
        const entry = await TimeService.updateEntry(entryId, userId, updates);
        res.json({ success: true, entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
}

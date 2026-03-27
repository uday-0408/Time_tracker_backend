import express from 'express';
import { getProductivity, getDailyTrend, getWeeklyCategories, getHeatmap, getInsights, } from '../controllers/analytics.controller.js';
const router = express.Router();
router.get('/productivity', getProductivity);
router.get('/trend', getDailyTrend);
router.get('/weekly-categories', getWeeklyCategories);
router.get('/heatmap', getHeatmap);
router.get('/insights', getInsights);
export default router;

import express from 'express';
import { startTracking, stopTracking, getToday, getHistory, updateEntry } from '../controllers/time.controller.js';
const router = express.Router();
router.post('/start', startTracking);
router.post('/stop', stopTracking);
router.get('/today', getToday);
router.get('/history', getHistory);
router.put('/update', updateEntry);
export default router;

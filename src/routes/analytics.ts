import express from 'express';
import { getProductivity } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/productivity', getProductivity);

export default router;

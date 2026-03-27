import express from 'express';
import { getEOD, updateEOD } from '../controllers/eod.controller.js';
const router = express.Router();
router.get('/:date', getEOD);
router.put('/:date', updateEOD);
export default router;

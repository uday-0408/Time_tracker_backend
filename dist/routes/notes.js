import express from 'express';
import { createNote, updateNote, getNotes, deleteNote } from '../controllers/notes.controller.js';
const router = express.Router();
router.post('/', createNote);
router.put('/:id', updateNote);
router.get('/', getNotes);
router.delete('/:id', deleteNote);
export default router;

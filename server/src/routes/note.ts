import express from 'express';
import { postNote, deleteNote, updateNote, getNotes } from '../controllers/note';
import middleware from '../middleware';

const router = express.Router();
const { auth } = middleware;

router.get('/:bugId', auth, getNotes);
router.post('/:bugId/notes', auth, postNote);
router.delete('/:bugId/notes/:noteId', auth, deleteNote);
router.put('/:bugId/notes/:noteId', auth, updateNote);

export default router;

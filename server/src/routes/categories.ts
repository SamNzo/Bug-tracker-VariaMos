import express from 'express';
import { createCategory, getCategories, removeCategory } from '../controllers/category';
import middleware from '../middleware';

const router = express.Router();
const { auth } = middleware;

router.get('/', auth, getCategories);
router.post('/create', auth, createCategory);
router.delete('/delete/:categoryName', auth, removeCategory);

export default router;
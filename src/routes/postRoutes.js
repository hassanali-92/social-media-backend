import express from 'express';
import { createPost, getFeed, likePost, addComment, getCommentsByPost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Saare post routes protected hain (User ka login hona zaroori hai)
router.post('/', protect, createPost);
router.get('/feed', protect, getFeed);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
// Kisi specific post ke saare comments get karne ke liye
router.get('/:id/comments', protect, getCommentsByPost);

export default router;
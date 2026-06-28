import express from 'express';
import { sendFriendRequest, acceptFriendRequest, togglePrivacy } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request/:id', protect, sendFriendRequest);
router.put('/accept/:id', protect, acceptFriendRequest);
router.put('/privacy', protect, togglePrivacy);

export default router;
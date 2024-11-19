import express from 'express';
import passport from 'passport';
import {
  registerUser,
  authenticateUser,
  logoutUser,
  googleCallback,
  authStatus,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authenticateUser);
router.post('/logout', authenticate, logoutUser);
router.get('/status', authStatus);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback', googleCallback);

export default router;

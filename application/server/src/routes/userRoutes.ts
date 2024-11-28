import express from 'express';
import {
  getUser,
  getUserByEmail,
  updateUserProfilePicture,
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { fileUploadMiddleware } from '../middleware/fileUploadMiddleware';
import { getPool } from '../connections/database';

declare global {
  namespace Express {
    interface User {
      id: number; // Ensure compatibility with the `User` type in `@types/passport`
    }
  }
}

const router = express.Router();

/**
 * Route: PUT /:id
 * Description: Update user details (name, email) by ID.
 * Middleware: Requires authentication.
 */
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Missing required fields: name or email' });
  }

  if (!req.user || req.user.id !== parseInt(id, 10)) {
    return res.status(403).json({ message: 'Forbidden: Access denied' });
  }

  const pool = getPool();
  try {
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Database error', error });
  }
});

export default router;

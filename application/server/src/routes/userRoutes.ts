import express from 'express';
import {
  getUser,
  getUserByEmail,
  updateUserProfilePicture,
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { fileUploadMiddleware } from '../middleware/fileUploadMiddleware';
import { getPool } from '../connections/database'; // Ensure this import exists for database queries

const router = express.Router();

/**
 * Route: GET /:id
 * Description: Fetch user details by ID.
 * Middleware: Requires authentication.
 */
router.get('/:id', authenticate, getUser);

/**
 * Route: GET /email/:email
 * Description: Fetch user details by email.
 * Middleware: Requires authentication.
 */
router.get('/email/:email', authenticate, getUserByEmail);

/**
 * Route: POST /upload-profile-picture
 * Description: Upload or update the user's profile picture.
 * Middleware: Requires authentication and file upload handling.
 */
router.post(
  '/upload-profile-picture',
  authenticate,
  fileUploadMiddleware,
  updateUserProfilePicture
);

/**
 * Route: PUT /:id
 * Description: Update user details (name, email) by ID.
 * Middleware: Requires authentication.
 */
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  // Ensure the user is authorized to modify their own profile
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }
  if (req.user.id !== parseInt(id, 10)) {
    return res.status(403).json({ message: 'Forbidden: Access denied' });
  }

  const pool = getPool();
  try {
    // Perform the database update
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error); // Log error for debugging
    res.status(500).json({ message: 'Database error', error });
  }
});

// Commented-out legacy code for reference
// router.get('/:id', authenticate, getUser); // Existing route for fetching user by ID
// router.get('/email/:email', authenticate, getUserByEmail); // Existing route for fetching user by email
// router.post('/upload-profile-picture', authenticate, fileUploadMiddleware, updateUserProfilePicture); // Existing profile picture upload

export default router;

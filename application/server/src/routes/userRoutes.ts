import express from 'express';
import multer from 'multer';
import {
  getUser,
  getUserByEmail,
  getUserByUserName,
  updateUserProfilePicture,
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * Route: GET /me
 * Description: Fetches the authenticated user's details.
 * Controller: getUser
 * Middleware: authenticate
 * Response:
 * - 200: User details successfully retrieved.
 * - 401: Unauthorized access.
 */
router.get('/me', authenticate, getUser);

/**
 * Route: GET /email/:email
 * Description: Fetches user details by email.
 * Controller: getUserByEmail
 * URL Parameters:
 * - email: The email of the user to fetch.
 * Response:
 * - 200: User details successfully retrieved.
 * - 404: User not found.
 */
router.get('/email/:email', getUserByEmail);

/**
 * Route: GET /username/:name
 * Description: Fetches user details by username.
 * Controller: getUserByUserName
 * URL Parameters:
 * - name: The username of the user to fetch.
 * Response:
 * - 200: User details successfully retrieved.
 * - 404: User not found.
 */
router.get('/username/:name', getUserByUserName);

/**
 * Route: PUT /me/profile-picture
 * Description: Updates the authenticated user's profile picture.
 * Controller: updateUserProfilePicture
 * Middleware: authenticate, upload.single('profilePic')
 * Request Body:
 * - profilePic: The file to upload as the user's profile picture.
 * Response:
 * - 200: Profile picture successfully updated.
 * - 400: No file uploaded.
 * - 401: Unauthorized access.
 */
router.put('/me/profile-picture', authenticate, upload.single('profilePic'), updateUserProfilePicture);

export default router;

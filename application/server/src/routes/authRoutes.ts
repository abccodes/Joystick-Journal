import express from 'express';
import passport from 'passport';
import {
  registerUser,
  authenticateUser,
  logoutUser,
  googleLogin,
  googleCallback,
  authStatus,
} from '../controllers/authController';

const router = express.Router();

/**
 * Route: POST /register
 * Description: Registers a new user.
 * Controller: registerUser
 * Response:
 * - 201: User registered successfully.
 * - 400: User already exists.
 * - 500: Internal server error during registration.
 */
router.post('/register', registerUser);

/**
 * Route: POST /login
 * Description: Authenticates a user.
 * Controller: authenticateUser
 * Response:
 * - 200: Authentication successful.
 * - 401: Invalid credentials.
 * - 500: Internal server error during authentication.
 */
router.post('/login', authenticateUser);

/**
 * Route: POST /logout
 * Description: Logs out the user.
 * Controller: logoutUser
 * Response:
 * - 200: Logout successful.
 */
router.post('/logout', logoutUser);

/**
 * Route: GET /status
 * Description: Checks user's authentication status.
 * Controller: authStatus
 * Response:
 * - 200: User authentication status.
 */
router.get('/status', authStatus);

/**
 * Route: GET /google
 * Description: Initiates Google OAuth authentication.
 * Middleware: passport.authenticate
 */
router.get('/google', googleLogin);

/**
 * Route: GET /google/callback
 * Description: Handles the callback after Google OAuth authentication.
 * Controller: googleCallback
 * Response:
 * - 200: Authentication successful.
 * - 400: Authentication failed.
 */
router.get('/google/callback', googleCallback);

export default router;

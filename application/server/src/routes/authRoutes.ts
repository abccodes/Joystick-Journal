import express from 'express';
import passport from 'passport';
import {
  registerUser,
  authenticateUser,
  logoutUser,
  googleCallback,
  authStatus,
} from '../controllers/authController';

const router = express.Router();

/**
 * Route: POST /register
 * Description: Registers a new user with the provided credentials.
 * Controller: registerUser
 * Request Body:
 * - username: The username of the new user (string).
 * - password: The password for the new user (string).
 * Response:
 * - 201: User registered successfully.
 * - 400: Missing or invalid request body fields.
 * - 500: Internal server error during registration.
 */
router.post('/register', registerUser);

/**
 * Route: POST /login
 * Description: Authenticates a user with the provided credentials.
 * Controller: authenticateUser
 * Request Body:
 * - username: The username of the user (string).
 * - password: The password of the user (string).
 * Response:
 * - 200: User authenticated successfully with session token.
 * - 401: Invalid credentials.
 * - 500: Internal server error during authentication.
 */
router.post('/login', authenticateUser);

/**
 * Route: POST /logout
 * Description: Logs out the currently authenticated user.
 * Controller: logoutUser
 * Response:
 * - 200: User logged out successfully.
 * - 401: User not authenticated.
 * - 500: Internal server error during logout.
 */
router.post('/logout', logoutUser);

/**
 * Route: GET /status
 * Description: Checks the authentication status of the user.
 * Controller: authStatus
 * Response:
 * - 200: User is authenticated with session details.
 * - 401: User is not authenticated.
 * - 500: Internal server error during authentication status check.
 */
router.get('/status', authStatus);

/**
 * Route: GET /google
 * Description: Initiates Google OAuth authentication.
 * Middleware: passport.authenticate('google') with profile and email scope.
 * Response:
 * - 302: Redirects to Google's OAuth login page.
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * Route: GET /google/callback
 * Description: Handles the callback after Google OAuth authentication.
 * Controller: googleCallback
 * Response:
 * - 200: User authenticated successfully.
 * - 401: Authentication failed.
 * - 500: Internal server error during Google callback processing.
 */
router.get('/google/callback', googleCallback);

export default router;

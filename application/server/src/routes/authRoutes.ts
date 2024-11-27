import express from 'express';
import passport from 'passport';
import { getPool } from '../connections/database';
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

/**
 * Route: POST /api/auth/forgot-password
 * Description: Handle password reset email requests.
 * Request Body:
 * - email: The email address of the user requesting a password reset.
 * Response:
 * - 200: Password reset email sent successfully.
 * - 400: Missing or invalid email.
 * - 500: Internal server error.
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const pool = getPool();
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    // Simulate sending a password reset email
    console.log(`Password reset link sent to ${email}`);

    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


export default router;

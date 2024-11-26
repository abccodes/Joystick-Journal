import jwt from 'jsonwebtoken';
import { Response } from 'express';

/**
 * Utility Function: generateToken
 * Description: Generates a JSON Web Token (JWT) for a user and sets it as a cookie in the response.
 * @param res - The Express response object used to set the cookie.
 * @param userId - The unique identifier of the user for whom the token is being generated.
 */
const generateToken = (res: Response, userId: string) => {
  const jwtSecret = process.env.JWT_SECRET || ''; // Retrieve the JWT secret from environment variables
  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: '1h', // Token expiration time
  });

  // Set the token as a cookie in the response
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: false, // Set to `true` in production for HTTPS
    sameSite: 'lax', // Ensures cookies are sent with same-site requests
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  });
};

/**
 * Utility Function: clearToken
 * Description: Clears the JWT cookie by setting its value to an empty string and expiration to the past.
 * @param res - The Express response object used to clear the cookie.
 */
const clearToken = (res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    expires: new Date(0), // Sets the expiration date to the past, effectively clearing the cookie
  });
};

export { generateToken, clearToken };

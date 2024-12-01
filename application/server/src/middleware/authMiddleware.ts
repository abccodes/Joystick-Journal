import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel';
import { User as UserInterface } from '../interfaces/User';

/**
 * Middleware: authenticate
 * Description: Verifies the user's authentication by validating the JWT in the cookies.
 * If the JWT is valid, it adds the user object to the `req` object and proceeds to the next middleware.
 * Otherwise, it sends a 401 Unauthorized response.
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 * @param next - The next middleware function in the stack.
 */
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt; // Retrieve the JWT from cookies

  // Ensure the secret key is set in environment variables
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in the environment variables');
    return res.status(500).json({ message: 'Server error: Missing secret key' });
  }

  // If no token is provided, respond with a 401 status
  if (!token || typeof token !== 'string') {
    console.warn('Invalid or missing token:', token);
    return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
  }

  try {
    // Verify the JWT and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    console.log('Decoded Token:', decoded); // Debugging log for the decoded token

    // Fetch the user from the database using the decoded userId
    const user = (await User.findById(decoded.userId)) as UserInterface;

    console.log('User Found:', user); // Debugging log for the user retrieved

    // If the user does not exist, respond with a 401 status
    if (!user) {
      console.warn('User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Attach the user object to the request object for downstream use
    req.user = user as UserInterface;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error); // Log the error for debugging
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export { authenticate };

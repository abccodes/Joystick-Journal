import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel';
import { User as UserInterface } from '../interfaces/User';

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;

  console.log('Token received in middleware:', token); // Log token from cookie

  if (!token) {
    console.log('No token provided'); // Log if no token
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    console.log('Decoded token:', decoded); // Log decoded token

    const user = await User.findById(decoded.userId);
    console.log('User fetched from DB:', user); // Log user fetched from database

    if (!user) {
      console.log('No user found with ID:', decoded.userId); // Log if user not found
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error); // Log token verification errors
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};





export { authenticate };

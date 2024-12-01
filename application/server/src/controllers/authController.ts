import { Request, Response, NextFunction } from 'express';
import User from '../models/UserModel';
import { User as UserInterface } from '../interfaces/User';
import { UserData as UserDataInterface } from '../interfaces/UserData';
import UserData from '../models/UserDataModel';
import passport from 'passport';
import { generateToken, clearToken } from '../utils/auth';
import jwt from 'jsonwebtoken';

const userDataModel = new UserData();

/**
 * Controller: authStatus
 * Description: Checks the user's authentication status based on the JWT token.
 * @param req - The incoming HTTP request containing the JWT cookie.
 * @param res - The outgoing HTTP response with the user's login status and ID.
 */
export const authStatus = async (req: Request, res: Response) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.json({ loggedIn: false, userId: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById((decoded as any).userId);

    if (user) {
      return res.json({ loggedIn: true, userId: user.id });
    } else {
      return res.json({ loggedIn: false, userId: null });
    }
  } catch (error) {
    console.error('Error verifying authentication status:', error);
    return res.json({ loggedIn: false, userId: null });
  }
};

/**
 * Controller: registerUser
 * Description: Registers a new user and initializes their associated user data.
 * @param req - The incoming HTTP request containing user details.
 * @param res - The outgoing HTTP response confirming the registration.
 */
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, profile_pic, theme_preference } = req.body;

  const profilePic = profile_pic || '/path/to/default-profile-pic.jpg'; // Update path as needed.

  try {
    // Check if email or username already exists
    const [existingEmail, existingUsername] = await Promise.all([
      User.findByEmail(email),
      User.findByUsername(name),
    ]);

    if (existingEmail) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    if (existingUsername) {
      return res.status(400).json({ message: 'This username is already taken.' });
    }

    // Create associated user data
    const userData: Omit<UserDataInterface, 'id' | 'created_at' | 'updated_at'> = {
      search_history: [],
      interests: [],
      view_history: [],
      review_history: [],
      genres: [],
    };

    const userDataId = await userDataModel.createUserData(userData);

    // Create user
    const user: UserInterface = await User.create({
      name,
      email,
      password,
      profile_pic: profilePic,
      theme_preference,
      user_data_id: userDataId,
    });

    // Generate token and send response
    const userIdStr = user.id.toString();
    generateToken(res, userIdStr);

    return res.status(201).json({
      id: userIdStr,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      theme_preference: user.theme_preference,
      user_data_id: user.user_data_id,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error during registration.', error });
  }
};

/**
 * Controller: authenticateUser
 * Description: Authenticates a user by email or username and password.
 * @param req - The incoming HTTP request containing credentials.
 * @param res - The outgoing HTTP response with authentication status.
 */
export const authenticateUser = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  console.log('Login attempt:', { email, name }); // Log request details for debugging

  const user = email
    ? await User.findByEmail(email)
    : await User.findByUsername(name);

  if (!user) {
    console.warn('User not found for email/name:', { email, name }); // Debug user retrieval
    return res.status(401).json({ message: 'Invalid username/email or password' });
  }

  const isPasswordValid = await User.comparePassword(user.password, password);

  console.log('Password validation:', isPasswordValid); // Debug password validation

  if (isPasswordValid) {
    const userIdStr = user.id.toString();
    generateToken(res, userIdStr);
    return res.status(200).json({
      id: userIdStr,
      name: user.name,
      email: user.email,
    });
  } else {
    return res.status(401).json({ message: 'Invalid username/email or password' });
  }
};


/**
 * Controller: logoutUser
 * Description: Logs the user out by clearing the JWT token.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response confirming logout.
 */
export const logoutUser = (req: Request, res: Response) => {
  clearToken(res);
  return res.status(200).json({ message: 'User logged out successfully.' });
};

/**
 * Controller: googleLogin
 * Description: Initiates Google OAuth login.
 */
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

/**
 * Controller: googleCallback
 * Description: Handles the callback from Google OAuth login and generates a JWT.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response with user details and session token.
 * @param next - The next middleware function.
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      console.error('Error during Google OAuth:', err);
      return res.status(400).json({ message: 'Google authentication failed.' });
    }

    generateToken(res, user.id.toString());
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  })(req, res, next);
};

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
const authStatus = async (req: Request, res: Response) => {
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
    return res.json({ loggedIn: false, userId: null });
  }
};

/**
 * Controller: registerUser
 * Description: Registers a new user and initializes their associated user data.
 * @param req - The incoming HTTP request containing user details.
 * @param res - The outgoing HTTP response confirming the registration.
 */
const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, profile_pic, theme_preference } = req.body;

  // Use provided profile picture or default to a predefined path
  const profilePic = profile_pic || 'application/web/public/Default-Profile-Picture.jpg';

  try {
    // Check for existing users by email or username
    const userExistsByEmail = await User.findByEmail(email);
    if (userExistsByEmail) {
      return res
        .status(400)
        .json({ message: 'A user with this email already exists' });
    }

    const userExistsByUsername = await User.findByUsername(name);
    if (userExistsByUsername) {
      return res
        .status(400)
        .json({ message: 'This username is already taken' });
    }

    // Create associated user data entry
    const userData: Omit<
      UserDataInterface,
      'id' | 'created_at' | 'updated_at'
    > = {
      search_history: [],
      interests: [],
      view_history: [],
      review_history: [],
      genres: [],
    };

    const userDataId = await userDataModel.createUserData(userData);

    // Create the user
    const user: UserInterface = await User.create({
      name,
      email,
      password,
      profile_pic: profilePic,
      theme_preference,
      user_data_id: userDataId,
    });

    // Generate JWT and return the user details
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
    return res.status(500).json({ message: 'Error registering user', error });
  }
};

/**
 * Controller: authenticateUser
 * Description: Authenticates a user by email or username and password.
 * @param req - The incoming HTTP request containing credentials.
 * @param res - The outgoing HTTP response with authentication status.
 */
const authenticateUser = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  const user = email
    ? await User.findByEmail(email)
    : await User.findByUsername(name);

  if (user && (await User.comparePassword(user.password, password))) {
    const userIdStr = user.id.toString();
    generateToken(res, userIdStr);
    return res.status(200).json({
      id: userIdStr,
      name: user.name,
      email: user.email,
    });
  } else {
    return res
      .status(401)
      .json({ message: 'User not found / password incorrect' });
  }
};

/**
 * Controller: logoutUser
 * Description: Logs the user out by clearing the JWT token.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response confirming logout.
 */
const logoutUser = (req: Request, res: Response) => {
  clearToken(res);
  return res.status(200).json({ message: 'User logged out' });
};

/**
 * Controller: googleLogin
 * Description: Initiates Google login by redirecting the user to the Google OAuth page.
 */
const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * Controller: googleCallback
 * Description: Handles the callback from Google OAuth login and generates a JWT.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response with user details and session token.
 * @param next - The next middleware function in the Express pipeline.
 */
const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'google',
    { session: false },
    (err: Error | null, user: UserInterface | null) => {
      if (err || !user) {
        console.log('Authentication error or no user:', err);
        return res
          .status(400)
          .json({ message: 'Google authentication failed' });
      }

      const token = generateToken(res, user.id.toString());
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }
  )(req, res, next);
};

export {
  registerUser,
  authenticateUser,
  logoutUser,
  googleCallback,
  googleLogin,
  authStatus,
};

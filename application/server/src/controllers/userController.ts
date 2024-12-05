import { Request, Response } from 'express';
import { User as UserInterface } from '../interfaces/User';
import User from '../models/UserModel';

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;

    if (id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const fullUserData = await User.findById(id);

    if (!fullUserData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sends selected user info fetched from the database as a JSON response
    res.json({
      id: fullUserData.id,
      name: fullUserData.name,
      email: fullUserData.email,
      profile_pic: fullUserData.profile_pic,
      theme_preference: fullUserData.theme_preference,
      user_data_id: fullUserData.user_data_id,
      created_at: fullUserData.created_at,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;

    if (!id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Please sign in to get profile' });
    }
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Missing email parameter' });
    }

    const userByEmail = await User.findByEmail(email);

    if (user.id != userByEmail?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Can only view own profile' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserByUserName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ message: 'Missing username parameter' });
    }

    const user = await User.findByUsername(name);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserProfilePicture = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;

    if (!id) {
      return res.status(401).json({
        message: 'Unauthorized: Please sign in to update profile picture',
      });
    }

    const userId = req.body.userId;
    const file = req.file;

    if (!id !== userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Not your profile' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate a mock URL for now (later this will be replaced with an actual AWS S3 URL)
    const imageUrl = `http://localhost:3000/uploads/${file.filename}`;

    // Use the User model to update the user's profile picture URL in the database
    const updateSuccessful = await User.updateUserProfilePicture(
      userId,
      imageUrl
    );

    if (!updateSuccessful) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile picture uploaded successfully!',
      imageUrl,
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture.' });
  }
};

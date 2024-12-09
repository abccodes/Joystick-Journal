import { Request, Response } from 'express';
import { User as UserInterface } from '../interfaces/User';
import User from '../models/UserModel';
import path from 'path';
import { S3Client, PutObjectCommand, PutObjectCommandInput} from '@aws-sdk/client-s3';


export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;

    if (!id) {
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
      profile_pic: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fullUserData.profile_pic}`,
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

// Initialize S3 client with credentials from environment variables
const s3 = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export const updateUserProfilePicture = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    if (!user || !user.id) {
      console.error('User not authenticated');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const file = req.file;
    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${path.basename(file.originalname)}`;
    console.log('Uploading file:', fileName);

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await s3.send(new PutObjectCommand(params));
    

    try {
      await s3.send(new PutObjectCommand(params));
      console.log('File uploaded to S3:', fileName);
    } catch (err) {
      console.error('S3 upload failed:', err);
      throw new Error('S3 upload error');
    }

    await User.updateUserProfilePicture(user.id, fileName);

    return res.json({
      message: 'Profile picture uploaded successfully!',
      imageUrl: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileName}`,
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture.' });
  }
};
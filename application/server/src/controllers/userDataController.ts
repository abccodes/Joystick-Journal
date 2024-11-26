import { Request, Response } from 'express';
import UserDataModel from '../models/UserDataModel';
import { UserData as UserDataInterface } from '../interfaces/UserData';
import { getGameRecommendations } from '../services/recommendationService';
import { RowDataPacket } from 'mysql2';
import { getPool } from '../connections/database';
import { verifyOwnership } from './helper/auth';

const userDataModel = new UserDataModel();

/**
 * Controller: getUserDataById
 * Description: Retrieves user data by its ID and verifies ownership before returning it.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response.
 */
export const getUserDataById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (!verifyOwnership(req, res, userId)) return;

    const userData = await userDataModel.getUserDataById(userId);
    if (!userData) {
      res.status(404).json({ message: 'User data not found' });
    } else {
      res.status(200).json(userData);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data', error });
  }
};

/**
 * Controller: updateUserData
 * Description: Updates user data by its ID after verifying ownership.
 * @param req - The incoming HTTP request containing update fields.
 * @param res - The outgoing HTTP response.
 */
export const updateUserData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (!verifyOwnership(req, res, userId)) return;

    const updates: Partial<UserDataInterface> = req.body;
    await userDataModel.updateUserData(userId, updates);
    res.status(200).json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Error updating user data', error });
  }
};

/**
 * Controller: getRecommendations
 * Description: Fetches game recommendations for a user based on their data.
 * @param req - The incoming HTTP request containing the user's ID.
 * @param res - The outgoing HTTP response containing the recommendations.
 */
export const getRecommendations = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const userId = Number(id);

    if (!verifyOwnership(req, res, userId)) return;

    const [userData] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM user_data WHERE id = ?',
      [userId]
    );

    if (!userData.length) {
      throw new Error('User data not found');
    }

    const recommendations = await getGameRecommendations(userId);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error });
  }
};

/**
 * Controller: createUserData
 * Description: Creates a new user data entry in the database.
 * @param req - The incoming HTTP request containing user data fields.
 * @param res - The outgoing HTTP response with the newly created user data ID.
 */
export const createUserData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userData: Omit<
      UserDataInterface,
      'id' | 'created_at' | 'updated_at'
    > = req.body;
    const userDataId = await userDataModel.createUserData(userData);
    res
      .status(201)
      .json({ message: 'User data created successfully', userDataId });
  } catch (error) {
    console.error('Error creating user data:', error);
    res.status(500).json({ message: 'Error creating user data', error });
  }
};

/**
 * Controller: deleteUserData
 * Description: Deletes a user data entry by its ID.
 * @param req - The incoming HTTP request containing the user data ID.
 * @param res - The outgoing HTTP response confirming the deletion.
 */
export const deleteUserData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await userDataModel.deleteUserData(Number(id));
    res.status(200).json({ message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ message: 'Error deleting user data', error });
  }
};

/**
 * Controller: fetchUserData
 * Description: Fetches user data by user ID.
 * @param req - The incoming HTTP request containing the user's ID.
 * @param res - The outgoing HTTP response containing the user data.
 */
export const fetchUserData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const userData = await userDataModel.getUserDataById(userId);
    if (!userData) {
      res.status(404).json({ message: 'User data not found' });
    } else {
      res.status(200).json(userData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
};

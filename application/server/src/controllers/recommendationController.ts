// controllers/recommendationController.ts
import { Request, Response } from 'express';
import {
  fetchGamesData as fetchGames,
  fetchUserData as fetchUser,
  generateGameEmbeddingsWithPCA as generateEmbeddings,
} from '../ml/embeddingService';

/**
 * Controller: fetchGamesData
 * Description: Fetches the list of games from the embedding service.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response containing the list of games.
 */
export const fetchGamesData = async (req: Request, res: Response) => {
  try {
    const games = await fetchGames();
    res.status(200).json(games);
  } catch (error) {
    console.error('Error fetching games data:', error);
    res.status(500).json({ message: 'Error fetching games data', error });
  }
};

/**
 * Controller: fetchUserData
 * Description: Fetches user-specific data using their user ID.
 * @param req - The incoming HTTP request containing the user ID in params.
 * @param res - The outgoing HTTP response containing the user data.
 */
export const fetchUserData = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  // Validate the user ID
  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const userData = await fetchUser(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User data not found' });
    }
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data', error });
  }
};

/**
 * Controller: generateGameEmbeddingsWithPCA
 * Description: Generates game embeddings using PCA from the embedding service.
 * @param req - The incoming HTTP request.
 * @param res - The outgoing HTTP response containing the generated embeddings.
 */
export const generateGameEmbeddingsWithPCA = async (
  req: Request,
  res: Response
) => {
  try {
    const embeddings = await generateEmbeddings();
    res.status(200).json(embeddings);
  } catch (error) {
    console.error('Error generating game embeddings:', error);
    res.status(500).json({ message: 'Error generating game embeddings', error });
  }
};

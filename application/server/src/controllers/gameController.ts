// gameController.ts

import { Request, Response } from 'express';
import Game from '../models/GameModel';
import { Game as GameInterface } from '../interfaces/Game';

// Instantiate Game class
const gameModel = new Game();

/**
 * Controller: createGame
 * Description: Creates a new game entry in the database.
 * @param req - The incoming HTTP request containing game details in the body.
 * @param res - The outgoing HTTP response confirming the game creation.
 */
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const game: Omit<GameInterface, 'game_id' | 'created_at' | 'updated_at'> = {
      ...req.body,
      tags: req.body.tags || [], // Default to an empty array if tags are not provided
      platforms: req.body.platforms || [], // Default to an empty array if platforms are not provided
    };
    await gameModel.addGame(game);
    res.status(201).json({ message: 'Game created successfully' });
  } catch (error) {
    console.error('Error in createGame controller:', error);
    res.status(500).json({ message: 'Error creating game', error });
  }
};

/**
 * Controller: searchGames
 * Description: Searches for games based on query parameters.
 * @param req - The incoming HTTP request containing search filters in query parameters.
 * @param res - The outgoing HTTP response containing matching games or an error message.
 */
export const searchGames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, genre, review_rating, game_mode } = req.query;
    const games = await gameModel.findGames(
      query as string,
      genre as string,
      Number(review_rating),
      game_mode as 'single-player' | 'multiplayer' | 'both'
    );

    if (!games.length) {
      res.status(404).json({ message: 'No games found' });
    } else {
      res.status(200).json(games);
    }
  } catch (error) {
    console.error('Error in searchGames controller:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Controller: removeGame
 * Description: Deletes a game by its ID.
 * @param req - The incoming HTTP request containing the game ID in params.
 * @param res - The outgoing HTTP response confirming the deletion.
 */
export const removeGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { gameId } = req.params;
    await gameModel.deleteGame(Number(gameId));
    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error in removeGame controller:', error);
    res.status(500).json({ message: 'Error deleting game', error });
  }
};

/**
 * Controller: editGame
 * Description: Updates a game by its ID with the provided details.
 * @param req - The incoming HTTP request containing game ID in params and updates in the body.
 * @param res - The outgoing HTTP response confirming the update.
 */
export const editGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const updates: Partial<GameInterface> = {
      ...req.body,
      tags: req.body.tags || [], // Default to an empty array if tags are not provided
      platforms: req.body.platforms || [], // Default to an empty array if platforms are not provided
    };
    await gameModel.updateGame(Number(gameId), updates);
    res.status(200).json({ message: 'Game updated successfully' });
  } catch (error) {
    console.error('Error in editGame controller:', error);
    res.status(500).json({ message: 'Error updating game', error });
  }
};

/**
 * Controller: getGame
 * Description: Retrieves a specific game by its ID.
 * @param req - The incoming HTTP request containing the game ID in params.
 * @param res - The outgoing HTTP response containing the game details or an error message.
 */
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const game = await gameModel.getGameById(Number(gameId));

    if (!game) {
      res.status(404).json({ message: 'Game not found' });
    } else {
      res.status(200).json(game);
    }
  } catch (error) {
    console.error('Error in getGame controller:', error);
    res.status(500).json({ message: 'Error fetching game', error });
  }
};

/**
 * Controller: getAllGames
 * Description: Retrieves all games with an optional limit on the number of results.
 * @param req - The incoming HTTP request containing the limit in query parameters.
 * @param res - The outgoing HTTP response containing the list of games.
 */
export const getAllGames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let limit = parseInt(req.query.limit as string, 10) || 50;

    // Validate the limit and set a default value if invalid
    if (isNaN(limit) || limit <= 0) {
      limit = 50;
    }

    const games = await gameModel.getAllGames(limit);

    if (games.length === 0) {
      res.status(404).json({ message: 'No games found' });
      return;
    }

    res.status(200).json(games);
  } catch (error) {
    console.error('Error in getAllGames controller:', error);
    res.status(500).json({ message: 'Error fetching games', error });
  }
};

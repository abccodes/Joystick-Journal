// gameController.ts

import { Request, Response } from 'express';
import Game from '../models/GameModel';
import { Game as GameInterface } from '../interfaces/Game';

// Instantiate Game class
const gameModel = new Game();

// Controller to add a new game
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const game: Omit<GameInterface, 'game_id' | 'created_at' | 'updated_at'> = {
      ...req.body,
      tags: req.body.tags || [],
      platforms: req.body.platforms || [],
    };
    await gameModel.addGame(game);
    res.status(201).json({ message: 'Game created successfully' });
  } catch (error) {
    console.error('Error in createGame controller:', error);
    res.status(500).json({ message: 'Error creating game', error });
  }
};

// Controller to find games based on filters
export const searchGames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, genre, review_rating, game_mode, price_range } = req.query;
    const games = await gameModel.findGames(
      query as string,
      genre as string,
      Number(review_rating),
      game_mode as 'single-player' | 'multiplayer' | 'both',
      price_range as 'free' | 'budget' | 'mid-range' | 'premium'
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

// Controller to delete a game by ID
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

// Controller to update game details
export const editGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const updates: Partial<GameInterface> = {
      ...req.body,
      tags: req.body.tags || [],
      platforms: req.body.platforms || [],
    };
    await gameModel.updateGame(Number(gameId), updates);
    res.status(200).json({ message: 'Game updated successfully' });
  } catch (error) {
    console.error('Error in editGame controller:', error);
    res.status(500).json({ message: 'Error updating game', error });
  }
};

// Controller to get a single game by ID
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

// Controller to get all games with a limit
export const getAllGames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const games = await gameModel.getAllGames(limit);
    res.status(200).json(games);
  } catch (error) {
    console.error('Error in getAllGames controller:', error);
    res.status(500).json({ message: 'Error fetching games', error });
  }
};

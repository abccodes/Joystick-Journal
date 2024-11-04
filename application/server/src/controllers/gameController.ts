import { Request, Response } from "express";
import Game from "../models/GameModel";
import { Game as GameInterface } from "../interfaces/Game";

// Instantiate Game class
const gameModel = new Game();

// Controller to add a new game
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const game: Omit<GameInterface, "game_id" | "created_at" | "updated_at"> =
      req.body;
    await gameModel.addGame(game);
    res.status(201).json({ message: "Game created successfully" });
  } catch (error) {
    console.error("Error in createGame controller:", error); // Log error details
    res.status(500).json({ message: "Error creating game", error });
  }
};

// Controller to find games based on filters
export const searchGames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, genre, review_rating } = req.query;
    console.log("Recieved parameters", { query, genre, review_rating});
    const games = await gameModel.findGames(
      query as string,
      genre as string,
      Number(review_rating)
    );

    console.log("Games retrieved from database:", games); // Log the retrieved games

    if (!games.length) {
      res.status(404).json({ message: "No games found" });
    } else {
      res.status(200).json(games);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
    res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting game", error });
  }
};

// Controller to update game details
export const editGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const updates: Partial<GameInterface> = req.body;
    await gameModel.updateGame(Number(gameId), updates);
    res.status(200).json({ message: "Game updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating game", error });
  }
};

// Controller to get a single game by ID
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const game = await gameModel.getGameById(Number(gameId));

    if (!game) {
      res.status(404).json({ message: "Game not found" });
    } else {
      res.status(200).json(game);
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching game", error });
  }
};

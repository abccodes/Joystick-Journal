// gameRoutes.ts

import { Router } from 'express';
import {
  createGame,
  searchGames,
  removeGame,
  editGame,
  getGame,
  getAllGames,
} from '../controllers/gameController';

const router = Router();

/**
 * Route: GET /all
 * Description: Fetches a list of all games.
 * Controller: getAllGames
 * Response:
 * - 200: Successfully retrieved the list of games.
 * - 500: Internal server error while fetching the data.
 */
router.get('/all', getAllGames);

/**
 * Route: POST /create
 * Description: Creates a new game entry.
 * Controller: createGame
 * Request Body:
 * - name: The name of the game (string).
 * - description: A brief description of the game (string).
 * - release_date: The release date of the game (string or Date).
 * - genre: The genre of the game (string).
 * Response:
 * - 201: Game created successfully.
 * - 400: Missing or invalid request body fields.
 * - 500: Internal server error during game creation.
 */
router.post('/create', createGame);

/**
 * Route: GET /search
 * Description: Searches for games based on query parameters.
 * Controller: searchGames
 * Query Parameters:
 * - name: The name of the game to search for (string).
 * - genre: The genre of the game to filter by (string).
 * Response:
 * - 200: Successfully retrieved search results.
 * - 400: Missing or invalid query parameters.
 * - 500: Internal server error during the search.
 */
router.get('/search', searchGames);

/**
 * Route: GET /:gameId
 * Description: Fetches details for a specific game by its ID.
 * Controller: getGame
 * URL Parameters:
 * - gameId: The unique ID of the game (number or string).
 * Response:
 * - 200: Successfully retrieved game details.
 * - 404: Game not found.
 * - 500: Internal server error while fetching the game data.
 */
router.get('/:gameId', getGame);

/**
 * Route: PUT /:gameId
 * Description: Updates details for a specific game by its ID.
 * Controller: editGame
 * URL Parameters:
 * - gameId: The unique ID of the game to update (number or string).
 * Request Body:
 * - JSON object containing fields to update (e.g., name, description, genre).
 * Response:
 * - 200: Game updated successfully.
 * - 400: Missing or invalid request body fields.
 * - 404: Game not found.
 * - 500: Internal server error during the update.
 */
router.put('/:gameId', editGame);

// Commented-out legacy code for reference
/**
 * Route: DELETE /:gameId
 * Description: Deletes a game entry by its ID.
 * Controller: removeGame
 * Status: Legacy, not currently exposed for public use.
 */
// router.delete('/:gameId', removeGame);

export default router;

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
 * Description: Fetches a list of all games with an optional limit.
 * Controller: getAllGames
 * Query Parameters:
 * - limit: The maximum number of games to retrieve (number, optional).
 * Response:
 * - 200: Successfully retrieved the list of games.
 * - 404: No games found.
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
 * - tags: Array of tags associated with the game (optional, array of strings).
 * - platforms: Platforms the game is available on (optional, array of strings).
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
 * - query: The search term for the game name (string, optional).
 * - genre: The genre of the game to filter by (string, optional).
 * - review_rating: Minimum review rating (number, optional).
 * - game_mode: The game mode to filter by ('single-player', 'multiplayer', or 'both').
 * Response:
 * - 200: Successfully retrieved search results.
 * - 404: No games found.
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
 * - JSON object containing fields to update (e.g., name, description, genre, tags, platforms).
 * Response:
 * - 200: Game updated successfully.
 * - 400: Missing or invalid request body fields.
 * - 404: Game not found.
 * - 500: Internal server error during the update.
 */
router.put('/:gameId', editGame);

/**
 * Route: DELETE /:gameId
 * Description: Deletes a game entry by its ID.
 * Controller: removeGame
 * URL Parameters:
 * - gameId: The unique ID of the game to delete (number or string).
 * Response:
 * - 200: Game deleted successfully.
 * - 404: Game not found.
 * - 500: Internal server error during deletion.
 */
router.delete('/:gameId', removeGame);

export default router;

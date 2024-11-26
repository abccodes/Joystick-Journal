import { getPool } from '../connections/database';
import { Game as GameInterface } from '../interfaces/Game';

class Game {
  /**
   * Method: addGame
   * Description: Inserts a new game into the database.
   * @param game - The game object without `game_id`, `created_at`, or `updated_at` fields.
   * @returns A promise that resolves when the game is added.
   */
  addGame = async (
    game: Omit<GameInterface, 'game_id' | 'created_at' | 'updated_at'>
  ): Promise<void> => {
    const sql = `
      INSERT INTO games (title, description, genre, tags, platforms, playtime_estimate, developer, publisher, game_mode, release_date, review_rating, cover_image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const pool = getPool();
    const values = [
      game.title,
      game.description,
      game.genre,
      JSON.stringify(game.tags),
      JSON.stringify(game.platforms),
      game.playtime_estimate,
      game.developer,
      game.publisher,
      game.game_mode,
      game.release_date,
      game.review_rating,
      game.cover_image,
    ];

    await pool.query(sql, values); // Execute the insert query
  };

  /**
   * Method: findGames
   * Description: Searches for games based on query parameters.
   * @param query - The title of the game to search for (optional).
   * @param genres - A comma-separated list of genres to filter by (optional).
   * @param minReviewRating - The minimum review rating to filter by (optional).
   * @param gameMode - The game mode to filter by (optional).
   * @returns A promise resolving to an array of matching games.
   */
  findGames = async (
    query: string = '',
    genres: string = '',
    minReviewRating: number = 0,
    gameMode?: GameInterface['game_mode']
  ): Promise<GameInterface[]> => {
    const pool = getPool();
    let sql = 'SELECT * FROM games WHERE 1=1';
    const values: (string | number)[] = [];

    // Add title filter
    if (query) {
      sql += ' AND title LIKE ?';
      values.push(`%${query}%`);
    }

    // Add genres filter
    if (genres) {
      const genreList = genres.split(',').map(g => g.trim());
      sql += ' AND (' + genreList.map(() => 'genre LIKE ?').join(' OR ') + ')';
      values.push(...genreList.map(genre => `%${genre}%`));
    }

    // Add minimum review rating filter
    if (minReviewRating) {
      sql += ' AND review_rating >= ?';
      values.push(minReviewRating);
    }

    // Add game mode filter
    if (gameMode) {
      sql += ' AND game_mode = ?';
      values.push(gameMode);
    }

    const [rows] = await pool.query(sql, values); // Execute the search query
    return rows as GameInterface[];
  };

  /**
   * Method: deleteGame
   * Description: Deletes a game from the database by its ID.
   * @param gameId - The ID of the game to delete.
   * @returns A promise that resolves when the game is deleted.
   */
  deleteGame = async (gameId: number): Promise<void> => {
    const sql = 'DELETE FROM games WHERE game_id = ?';
    const pool = getPool();
    await pool.query(sql, [gameId]); // Execute the delete query
  };

  /**
   * Method: updateGame
   * Description: Updates a game's details in the database by its ID.
   * @param gameId - The ID of the game to update.
   * @param updates - Partial game object containing fields to update.
   * @returns A promise that resolves when the update is complete.
   */
  updateGame = async (
    gameId: number,
    updates: Partial<GameInterface>
  ): Promise<void> => {
    const fields = [];
    const values: (string | number)[] = [];
    const pool = getPool();

    // Dynamically build the update query
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'tags' || key === 'platforms') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value as string | number);
      }
    }
    values.push(gameId);

    const sql = `UPDATE games SET ${fields.join(', ')} WHERE game_id = ?`;
    await pool.query(sql, values); // Execute the update query
  };

  /**
   * Method: getGameById
   * Description: Fetches a game by its unique ID.
   * @param gameId - The ID of the game to fetch.
   * @returns A promise resolving to the game object or null if not found.
   */
  getGameById = async (gameId: number): Promise<GameInterface | null> => {
    const sql = 'SELECT * FROM games WHERE game_id = ?';
    const pool = getPool();
    const [rows] = await pool.query(sql, [gameId]);

    return (rows as GameInterface[])[0] || null; // Return the game or null
  };

  /**
   * Method: getAllGames
   * Description: Fetches all games with an optional limit.
   * @param limit - The maximum number of games to fetch (default: 50).
   * @returns A promise resolving to an array of games.
   */
  getAllGames = async (limit: number = 50): Promise<GameInterface[]> => {
    const sql = 'SELECT * FROM games LIMIT ?';
    const pool = getPool();

    console.log(`Executing SQL: ${sql} with limit = ${limit}`);

    const [rows] = await pool.query(sql, [limit]); // Execute the query
    return rows as GameInterface[];
  };
}

export default Game;

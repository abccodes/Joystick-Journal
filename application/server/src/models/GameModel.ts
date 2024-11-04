import { getPool } from "../connections/database";
import { Game as GameInterface } from "../interfaces/Game";

class Game {
  addGame = async (
    game: Omit<GameInterface, "game_id" | "created_at" | "updated_at">
  ): Promise<void> => {
    const sql = `
      INSERT INTO games (title, description, genre, release_date, cover_image, review_rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const pool = getPool();
    const values = [
      game.title,
      game.description,
      game.genre,
      game.release_date,
      game.cover_image,
      game.review_rating,
    ];

    await pool.query(sql, values);
  };

  findGames = async (
    query: string = "",
    genres: string = "",
    minReviewRating: number = 0
  ): Promise<GameInterface[]> => {
    const pool = getPool();
    let sql = "SELECT * FROM games WHERE 1=1";
    const values: (string | number)[] = [];
  
    console.log(
      `Searching games with query: "${query}", genres: "${genres}", minimum review rating: ${minReviewRating}`
    );
  
    // Title search
    if (query) {
      sql += " AND title LIKE ?";
      values.push(`%${query}%`);
    }
  
    // Genre filtering with partial matching
    if (genres) {
      const genreList = genres.split(",").map((g) => g.trim());
      sql += " AND (" + genreList.map(() => "genre LIKE ?").join(" OR ") + ")";
      values.push(...genreList.map((genre) => `%${genre}%`));
    }
  
    // Minimum review rating
    if (minReviewRating > 0) {
      sql += " AND review_rating >= ?";
      values.push(minReviewRating);
    }
  
    console.log(`Final SQL Query: ${sql} with values:`, values);
  
    try {
      const [rows] = await pool.query(sql, values);
      console.log("Rows returned by query:", rows); // This should execute if query runs successfully
      return rows as GameInterface[];
    } catch (error) {
      console.error("Error executing query in findGames:", error);
      return []; // Return an empty array to handle gracefully if an error occurs
    }
  };
  

  deleteGame = async (gameId: number): Promise<void> => {
    const sql = "DELETE FROM games WHERE game_id = ?";
    const pool = getPool();
    await pool.query(sql, [gameId]);
  };

  updateGame = async (
    gameId: number,
    updates: Partial<GameInterface>
  ): Promise<void> => {
    const fields = [];
    const values: (string | number)[] = [];
    const pool = getPool();

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value as string | number);
    }
    values.push(gameId);

    const sql = `UPDATE games SET ${fields.join(", ")} WHERE game_id = ?`;
    await pool.query(sql, values);
  };

  getGameById = async (gameId: number): Promise<GameInterface | null> => {
    const sql = "SELECT * FROM games WHERE game_id = ?";
    const pool = getPool();
    const [rows] = await pool.query(sql, [gameId]);

    return (rows as GameInterface[])[0] || null;
  };

  getAllGames = async (limit: number = 50): Promise<GameInterface[]> => {
    const sql = "SELECT * FROM games LIMIT ?";
    const pool = getPool();
    const [rows] = await pool.query(sql, [limit]);
    return rows as GameInterface[];
  };
}

export default Game;

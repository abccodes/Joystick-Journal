import { getPool } from '../connections/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Review as ReviewInterface } from '../interfaces/Review';

class ReviewModel {
  /**
   * Method: createReview
   * Description: Inserts a new review into the database.
   * @param review - The review object without `review_id`, `created_at`, or `updated_at` fields.
   * @returns A promise resolving to the ID of the newly created review.
   */
  async createReview(
    review: Omit<ReviewInterface, 'review_id' | 'created_at' | 'updated_at'>
  ): Promise<number> {
    const pool = getPool();
    const sql = `
      INSERT INTO reviews (user_id, game_id, rating, review_text)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(sql, [
      review.user_id,
      review.game_id,
      review.rating,
      review.review_text,
    ]);

    return result.insertId; // Return the ID of the new review
  }

  /**
   * Method: getReviewById
   * Description: Fetches a review by its unique ID.
   * @param game_id - The ID of the game for which the review is being fetched.
   * @returns A promise resolving to the review object or null if not found.
   */
  async getReviewById(game_id: number): Promise<ReviewInterface | null> {
    const pool = getPool();
    const sql = 'SELECT * FROM reviews WHERE review_id = ?';
    const [rows] = await pool.query<RowDataPacket[]>(sql, [game_id]);

    return rows.length ? (rows[0] as ReviewInterface) : null;
  }

  /**
   * Method: getReviewByGameId
   * Description: Fetches all reviews for a specific game by its game ID.
   * @param game_id - The ID of the game for which reviews are being fetched.
   * @returns A promise resolving to an array of review objects (empty if no reviews are found).
   */
  async getReviewByGameId(game_id: number): Promise<ReviewInterface[]> {
    const pool = getPool();
    const sql = 'SELECT * FROM reviews WHERE game_id = ?';
    const [rows] = await pool.query<RowDataPacket[]>(sql, [game_id]);

    return rows as ReviewInterface[]; // Return all matching reviews
  }

  /**
   * Method: updateReview
   * Description: Updates a review by its unique ID with the provided fields.
   * @param review_id - The ID of the review to update.
   * @param updates - A partial review object containing the fields to update.
   * @returns A promise resolving when the update is complete.
   */
  async updateReview(
    review_id: number,
    updates: Partial<ReviewInterface>
  ): Promise<void> {
    const pool = getPool();
    const fields = [];
    const values: any[] = [];

    // Dynamically build the SQL update query
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(review_id);
    const sql = `UPDATE reviews SET ${fields.join(', ')} WHERE review_id = ?`;
    await pool.query(sql, values);
  }

  /**
   * Method: deleteReview
   * Description: Deletes a review from the database by its unique ID.
   * @param review_id - The ID of the review to delete.
   * @returns A promise resolving when the deletion is complete.
   */
  async deleteReview(review_id: number): Promise<void> {
    const pool = getPool();
    const sql = 'DELETE FROM reviews WHERE review_id = ?';
    await pool.query(sql, [review_id]);
  }
}

export default ReviewModel;

import { Router, Request, Response } from 'express';
import { getPool } from '../connections/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticate } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    interface User {
      id: number; // Ensure compatibility with the `User` type in `@types/passport`
    }
  }
}

// Initialize the router
const router = Router();

// Initialize database pool
const pool = getPool();

/**
 * Function: createReview
 * Description: Handles creating a new review for a game.
 * Middleware: Requires authentication.
 */
const createReview = async (req: Request, res: Response): Promise<Response> => {
  const { game_id, rating, review_text } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !game_id || !rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [user_id, game_id, rating, review_text]
    );

    if (result.insertId) {
      return res.status(201).json({ message: 'Review created successfully', reviewId: result.insertId });
    } else {
      throw new Error('Review creation failed: insertId missing');
    }
  } catch (error: any) {
    console.error('Error creating review:', error.message);
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
};

/**
 * Function: getReviewsByGameId
 * Description: Retrieves all reviews for a specific game.
 */
const getReviewsByGameId = async (req: Request, res: Response): Promise<Response> => {
  const { gameId } = req.params;

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required' });
  }

  try {
    const [reviews] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE game_id = ?',
      [gameId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this game' });
    }

    return res.status(200).json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Function: updateReview
 * Description: Updates an existing review by its ID.
 * Middleware: Requires authentication.
 */
const updateReview = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { rating, review_text } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [id]
    );

    if (rows.length === 0 || rows[0]?.user_id !== user_id) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    await pool.query('UPDATE reviews SET rating = ?, review_text = ? WHERE review_id = ?', [
      rating,
      review_text,
      id,
    ]);

    return res.status(200).json({ message: 'Review updated successfully' });
  } catch (error: any) {
    console.error('Error updating review:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Function: deleteReview
 * Description: Deletes a review by its ID.
 * Middleware: Requires authentication.
 */
const deleteReview = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(403).json({ message: 'You can only delete your own reviews' });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [id]
    );

    if (rows.length === 0 || rows[0]?.user_id !== user_id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await pool.query('DELETE FROM reviews WHERE review_id = ?', [id]);

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Routes
/**
 * Route: POST /
 * Description: Create a new review for a game.
 */
router.post('/', authenticate, createReview);

/**
 * Route: GET /game/:gameId
 * Description: Fetch all reviews for a specific game.
 */
router.get('/game/:gameId', getReviewsByGameId);

/**
 * Route: PUT /:id
 * Description: Update a review by its ID.
 */
router.put('/:id', authenticate, updateReview);

/**
 * Route: DELETE /:id
 * Description: Delete a review by its ID.
 */
router.delete('/:id', authenticate, deleteReview);

export default router;

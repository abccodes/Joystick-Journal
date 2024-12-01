import { Request, Response } from 'express';
import ReviewModel from '../models/ReviewModel';
import { verifyOwnership } from './helper/auth';

const reviewModel = new ReviewModel();

/**
 * Controller: createReview
 * Description: Creates a new review for a game.
 * @param req - The incoming HTTP request containing review details in the body.
 * @param res - The outgoing HTTP response with the newly created review ID.
 */
export const createReview = async (
  req: Request,
  res: Response
): Promise<Response | void> => { // Updated return type to match Response or void
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Please sign in to create a review' });
    }

    const { game_id, rating, review_text } = req.body;

    if (!game_id || !rating || !review_text) {
      return res.status(400).json({ message: 'Missing required fields: game_id, rating, or review_text' });
    }

    const reviewId = await reviewModel.createReview({
      user_id: userId,
      game_id,
      rating,
      review_text,
    });

    return res
      .status(201)
      .json({ message: 'Review created successfully', reviewId });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Error creating review', error });
  }
};


/**
 * Controller: getReviewById
 * Description: Fetches a single review by its ID.
 * @param req - The incoming HTTP request containing the review ID in params.
 * @param res - The outgoing HTTP response containing the review data.
 */
export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await reviewModel.getReviewById(Number(id));

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
    } else {
      res.status(200).json(review);
    }
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Error fetching review', error });
  }
};

/**
 * Controller: getReviewByGameId
 * Description: Fetches all reviews for a specific game by its game ID.
 * @param req - The incoming HTTP request containing the game ID in params.
 * @param res - The outgoing HTTP response containing an array of reviews.
 */
export const getReviewByGameId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const reviews = await reviewModel.getReviewByGameId(Number(gameId));

    if (!reviews || reviews.length === 0) {
      res.status(404).json({ message: 'No reviews found for this game' });
    } else {
      res.status(200).json(reviews);
    }
  } catch (error) {
    console.error('Error fetching reviews by gameId:', error);
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

/**
 * Controller: updateReview
 * Description: Updates a review by its ID after verifying ownership.
 * @param req - The incoming HTTP request containing review ID in params and updates in the body.
 * @param res - The outgoing HTTP response confirming the update.
 */
export const updateReview = async (req: Request, res: Response): Promise<Response | void> => { // Updated return type
  try {
    const { id } = req.params;
    const reviewId = Number(id);

    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!verifyOwnership(req, res, review.user_id)) return;

    await reviewModel.updateReview(reviewId, req.body);
    return res.status(200).json({ message: 'Review updated successfully' }); // Ensure consistent return
  } catch (err) {
    console.error('Error updating review:', err);
    return res.status(500).json({ message: 'Error updating review' }); // Ensure consistent return
  }
};


/**
 * Controller: deleteReview
 * Description: Deletes a review by its ID after verifying ownership.
 * @param req - The incoming HTTP request containing review ID in params.
 * @param res - The outgoing HTTP response confirming the deletion.
 */
export const deleteReview = async (req: Request, res: Response): Promise<Response | void> => { // Updated return type
  try {
    const { id } = req.params;
    const reviewId = Number(id);

    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!verifyOwnership(req, res, review.user_id)) return;

    await reviewModel.deleteReview(reviewId);
    return res.status(200).json({ message: 'Review deleted successfully' }); // Ensure consistent return
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ message: 'Error deleting review' }); // Ensure consistent return
  }
};

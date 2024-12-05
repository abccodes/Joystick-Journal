import { Request, Response } from 'express';
import ReviewModel from '../models/ReviewModel';
import { verifyOwnership } from './helper/auth';
import { User as UserInterface } from '../interfaces/User';

const reviewModel = new ReviewModel();

export const createReview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;

    if (!id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Please sign in to create a review' });
    }

    const { game_id, rating, review_text } = req.body;

    if (!game_id || !rating || !review_text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const reviewId = await reviewModel.createReview({
      user_id: Number(id),
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

export const getReviewById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;
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

export const getReviewByGameId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { gameId } = req.params;
    const reviews = await reviewModel.getReviewByGameId(Number(gameId));

    if (!reviews || reviews.length === 0) {
      res.status(404).json({ message: 'No reviews found for this game' });
    } else {
      res.status(200).json(reviews); // Send the array of reviews
    }
  } catch (error) {
    console.error('Error fetching reviews by gameId:', error);
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;
    const reviewId = Number(id);

    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!verifyOwnership(req, res, review.user_id)) return;

    await reviewModel.updateReview(Number(id), req.body);
    res.status(200).json({ message: 'Review updated successfully' });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: 'Error updating review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    const id = user.id;
    const reviewId = Number(id);

    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!verifyOwnership(req, res, review.user_id)) return;

    await reviewModel.deleteReview(Number(id));
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

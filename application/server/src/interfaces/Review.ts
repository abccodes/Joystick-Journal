/**
 * Interface: Review
 * Description: Represents a review in the application, including the user ID, game ID, and review details.
 */
export interface Review {
  /**
   * The unique identifier for the review.
   */
  review_id: number;

  /**
   * The ID of the user who created the review.
   */
  user_id: number;

  /**
   * The ID of the game being reviewed.
   */
  game_id: number;

  /**
   * The rating given by the user (e.g., 1-5 stars).
   */
  rating: number;

  /**
   * The text content of the review.
   */
  review_text: string;

  /**
   * The timestamp when the review was created.
   */
  created_at: Date;

  /**
   * The timestamp when the review was last updated.
   */
  updated_at: Date;
}

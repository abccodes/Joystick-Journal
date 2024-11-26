import request from 'supertest';
import app from '../app';
import { getPool } from '../connections/database';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import {
  resetDatabase,
  seedDatabase,
  closeDatabase,
} from './scripts/setupTests';

let pool = getPool();

/**
 * Helper function to generate a mock JWT token for testing
 * @param {number} userId - The ID of the user for whom the token is generated
 * @returns {string} JWT token
 */
function generateMockToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '1h',
  });
}

/**
 * Helper function to create authenticated requests
 * @param {number} userId - ID of the authenticated user
 * @param {'get' | 'post' | 'put' | 'delete'} method - HTTP method
 * @param {string} url - Endpoint URL
 * @returns {request.Test} The Supertest request object with authentication
 */
function authenticatedRequest(
  userId: number,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string
) {
  const token = generateMockToken(userId);

  return request(app)[method](url).set('Cookie', [`jwt=${token}`]);
}

describe('Review Routes API Tests', () => {
  // Reset and seed the database before each test case
  beforeEach(async () => {
    await resetDatabase();
    await seedDatabase();
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await closeDatabase();
  });

  /**
   * Test case: Creating a review successfully when authenticated
   */
  it('should create a review successfully when authenticated', async () => {
    const reviewData = {
      game_id: 1,
      rating: 4,
      review_text: 'Great game!',
    };

    const res = await authenticatedRequest(1, 'post', '/api/reviews').send(
      reviewData
    );

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Review created successfully');
    expect(res.body).toHaveProperty('reviewId');

    // Verify the review exists in the database
    const [reviews] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [res.body.reviewId]
    );
    expect(reviews.length).toEqual(1);
    expect(reviews[0].review_text).toEqual(reviewData.review_text);
  });

  /**
   * Test case: Attempting to create a review without authentication
   */
  it('should not create a review when unauthenticated', async () => {
    const reviewData = {
      game_id: 1,
      rating: 4,
      review_text: 'Great game!',
    };

    const res = await request(app).post('/api/reviews').send(reviewData);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized: No token provided');
  });

  /**
   * Test case: Updating a review successfully when authenticated
   */
  it('should update a review successfully when authenticated', async () => {
    const reviewId = 1; // Ensure the review_id belongs to user_id=1 in seeded data
    const updates = { rating: 5, review_text: 'Excellent game!' };

    const res = await authenticatedRequest(
      1,
      'put',
      `/api/reviews/${reviewId}`
    ).send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Review updated successfully');

    // Verify the review updates in the database
    const [updatedReview] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [reviewId]
    );
    expect(updatedReview[0].rating).toEqual(updates.rating);
    expect(updatedReview[0].review_text).toEqual(updates.review_text);
  });

  /**
   * Test case: Attempting to update a review without authentication
   */
  it('should not update a review when unauthenticated', async () => {
    const reviewId = 1; // Ensure the review_id exists in seeded data
    const updates = { rating: 5, review_text: 'Excellent game!' };

    const res = await request(app).put(`/api/reviews/${reviewId}`).send(updates);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized: No token provided');
  });

  /**
   * Test case: Deleting a review by ID when authenticated
   */
  it('should delete a review by ID when authenticated', async () => {
    const reviewId = 1; // Ensure the review_id belongs to user_id=1 in seeded data

    const res = await authenticatedRequest(
      1,
      'delete',
      `/api/reviews/${reviewId}`
    ).send();

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Review deleted successfully');

    // Verify the review no longer exists in the database
    const [deletedReview] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [reviewId]
    );
    expect(deletedReview.length).toEqual(0);
  });

  /**
   * Test case: Attempting to delete a review without authentication
   */
  it('should not delete a review by ID when unauthenticated', async () => {
    const reviewId = 1; // Ensure the review_id exists in seeded data

    const res = await request(app).delete(`/api/reviews/${reviewId}`).send();

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized: No token provided');
  });

  /**
   * Test case: Fetching a review by ID
   */
  it('should fetch a review by ID successfully', async () => {
    const reviewId = 1; // Ensure the review_id exists in seeded data

    const res = await authenticatedRequest(
      1,
      'get',
      `/api/reviews/${reviewId}`
    ).send();

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('review_id', reviewId);
    expect(res.body).toHaveProperty('rating');
    expect(res.body).toHaveProperty('review_text');
  });
});

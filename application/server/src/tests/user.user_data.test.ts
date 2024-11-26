import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import {
  resetDatabase,
  seedDatabase,
  closeDatabase,
} from './scripts/setupTests';

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

describe('User Data API Tests', () => {
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
   * Test case: Retrieve user data by ID when authenticated
   */
  it('should retrieve user data by ID when authenticated', async () => {
    const token = generateMockToken(1); // User ID 1

    const res = await request(app)
      .get('/api/userdata/1')
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('interests', ['sports', 'action']);
    expect(res.body).toHaveProperty('genres', ['RPG', 'Adventure']);
  });

  /**
   * Test case: Attempting to retrieve another user's data
   */
  it("should not retrieve another user's data", async () => {
    const token = generateMockToken(2); // User ID 2

    const res = await request(app)
      .get('/api/userdata/1') // Attempt to access User ID 1's data
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: Access denied');
  });

  /**
   * Test case: Update user data successfully when authenticated
   */
  it('should update user data successfully when authenticated', async () => {
    const token = generateMockToken(1); // User ID 1

    const updates = {
      interests: ['sports', 'adventure'],
      genres: ['RPG', 'Sports'],
    };

    const res = await request(app)
      .put('/api/userdata/1')
      .set('Cookie', [`jwt=${token}`])
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      'message',
      'User data updated successfully'
    );

    // Verify the database state
    const getRes = await request(app)
      .get('/api/userdata/1')
      .set('Cookie', [`jwt=${token}`]);

    expect(getRes.body).toHaveProperty('interests', updates.interests);
    expect(getRes.body).toHaveProperty('genres', updates.genres);
  });

  /**
   * Test case: Attempting to update another user's data
   */
  it("should not update another user's data", async () => {
    const token = generateMockToken(2); // User ID 2

    const updates = {
      interests: ['sports', 'adventure'],
      genres: ['RPG', 'Sports'],
    };

    const res = await request(app)
      .put('/api/userdata/1') // Attempt to update User ID 1's data
      .set('Cookie', [`jwt=${token}`])
      .send(updates);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: Access denied');
  });

  /**
   * Test case: Retrieve recommendations for the authenticated user
   */
  it('should retrieve recommendations for the authenticated user', async () => {
    const token = generateMockToken(1); // User ID 1

    const res = await request(app)
      .get('/api/userdata/1/recommendations')
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('genre');
    }
  });

  /**
   * Test case: Attempting to retrieve recommendations for another user
   */
  it("should not retrieve recommendations for another user's data", async () => {
    const token = generateMockToken(2); // User ID 2

    const res = await request(app)
      .get('/api/userdata/1/recommendations') // Attempt to access User ID 1's recommendations
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: Access denied');
  });
});

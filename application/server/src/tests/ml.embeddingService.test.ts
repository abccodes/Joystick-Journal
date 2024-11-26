import request from 'supertest';
import app from '../app';
import * as tf from '@tensorflow/tfjs';
import { generateEmbeddings } from '../ml/embeddingService';
import { Game as GameInterface } from '../interfaces/Game';
import {
  resetDatabase,
  seedDatabase,
  closeDatabase,
} from './scripts/setupTests';

// Mock Universal Sentence Encoder to simulate embedding behavior
jest.mock('@tensorflow-models/universal-sentence-encoder', () => ({
  load: jest.fn().mockResolvedValue({
    embed: jest.fn(async (input: string[]) => {
      return tf.tensor2d(
        input.map(() => [0.1, 0.2, 0.3, 0.4]), // Example embedding for test cases
        [input.length, 4]
      );
    }),
  }),
}));

// Mock database pool to simulate database queries
jest.mock('../connections/database', () => {
  const originalModule = jest.requireActual('../connections/database');
  return {
    ...originalModule,
    getPool: jest.fn().mockReturnValue({
      query: jest.fn((query: string, values: any[]) => {
        if (query.includes('FROM games')) {
          return [
            [
              { title: 'Game1', description: 'Desc1' },
              { title: 'Game2', description: 'Desc2' },
            ],
          ];
        }
        if (query.includes('FROM user_data WHERE id = ?') && values[0] === 1) {
          return [[{ id: 1, interests: ['Action', 'Adventure'] }]];
        }
        return [[]];
      }),
      end: jest.fn().mockResolvedValue(null),
    }),
  };
});

describe('Recommendations API Tests', () => {
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
   * Test case: Fetching games data
   * Verifies that the `/fetchGames` endpoint retrieves a list of games with titles and descriptions.
   */
  it('should fetch games data successfully', async () => {
    const res = await request(app).get('/api/recommendations/fetchGames');

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('description');
    }
  });

  /**
   * Test case: Fetching user data
   * Verifies that the `/fetchUser/:id` endpoint retrieves user data with specific properties.
   */
  it('should fetch user data successfully', async () => {
    const res = await request(app).get('/api/recommendations/fetchUser/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('interests');
    expect(Array.isArray(res.body.interests)).toBe(true);
  });

  /**
   * Test case: Generating PCA-reduced embeddings
   * Validates that embeddings are generated and reduced to the correct dimensions via PCA.
   */
  it('should generate PCA-reduced embeddings successfully', async () => {
    const res = await request(app).get(
      '/api/recommendations/generateEmbeddingsWithPCA'
    );

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(Array.isArray(res.body[0])).toBe(true);
      expect(res.body[0].length).toEqual(2); // Assuming PCA reduces to 2 dimensions
    }
  });

  /**
   * Test case: Generating embeddings directly
   * Verifies that the `generateEmbeddings` function creates embeddings with the correct tensor shape.
   */
  it('generateEmbeddings should create embeddings with correct shape', async () => {
    const sampleGames: GameInterface[] = [
      {
        game_id: 1,
        title: 'Sample Game 1',
        description: 'An exciting adventure',
        genre: 'Adventure',
        tags: [],
        platforms: [],
        playtime_estimate: 20,
        developer: 'Sample Dev',
        publisher: 'Sample Publisher',
        game_mode: 'single-player',
        release_date: new Date('2022-01-01'),
        review_rating: 5,
        cover_image: '/path/to/image1.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        game_id: 2,
        title: 'Sample Game 2',
        description: 'A thrilling mystery',
        genre: 'Mystery',
        tags: [],
        platforms: [],
        playtime_estimate: 30,
        developer: 'Sample Dev',
        publisher: 'Sample Publisher',
        game_mode: 'multiplayer',
        release_date: new Date('2022-06-01'),
        review_rating: 4,
        cover_image: '/path/to/image2.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const embeddings = await generateEmbeddings(sampleGames);

    // Validate the embeddings tensor
    expect(embeddings).toBeInstanceOf(tf.Tensor);
    expect(embeddings.shape[0]).toBe(sampleGames.length); // Rows equal number of games
    expect(embeddings.shape[1]).toBeGreaterThan(0); // Columns > 0
  });
});

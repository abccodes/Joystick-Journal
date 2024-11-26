import request from 'supertest';
import app from '../app';
import { getPool } from '../connections/database';
import { RowDataPacket } from 'mysql2';
import {
  resetDatabase,
  seedDatabase,
  closeDatabase,
} from './scripts/setupTests';

let pool = getPool();

describe('Games API Tests', () => {
  // Reset and seed the database before each test
  beforeEach(async () => {
    await resetDatabase();
    await seedDatabase();

    // Insert some initial game data for testing
    await pool.query('DELETE FROM games');
    await pool.query(`
      INSERT INTO games (title, description, genre, tags, platforms, playtime_estimate, developer, publisher, game_mode, release_date, review_rating, cover_image)
      VALUES
        ('Fortnite', 'Battle royale shooter where the last player standing wins!', 'Shooter', '["battle-royale"]', '["PC", "PlayStation", "Xbox"]', 50, 'Epic Games', 'Epic Games', 'multiplayer', '2018-03-12', 8, '/assets/images/fortnite.jpg'),
        ('FIFA 21', 'Soccer simulation game with the latest player rosters.', 'Sports', '["sports", "simulation"]', '["PC", "PlayStation", "Xbox"]', 40, 'EA Sports', 'Electronic Arts', 'multiplayer', '2020-10-06', 7, '/assets/images/fifa21.jpg'),
        ('Minecraft', 'Create and explore worlds, and build anything your imagination can create.', 'Sandbox', '["sandbox", "creative"]', '["PC", "PlayStation", "Xbox", "Mobile"]', 1000, 'Mojang Studios', 'Mojang Studios', 'both', '2011-11-18', 9, '/assets/images/minecraft.jpg');
    `);
  });

  // Close the database connection after all tests are complete
  afterAll(async () => {
    await closeDatabase();
  });

  /**
   * Test case: Adding a new game
   * Verifies that a new game can be successfully added to the database.
   * Also checks if the inserted data is correctly stored and matches the request payload.
   */
  it('should add a new game successfully', async () => {
    const newGame = {
      title: 'New Game',
      description: 'A fun new game to play.',
      genre: 'Adventure',
      tags: ['exploration', 'indie'],
      platforms: ['PC', 'Switch'],
      playtime_estimate: 30,
      developer: 'Indie Dev',
      publisher: 'Indie Publisher',
      game_mode: 'single-player',
      release_date: '2021-11-25',
      review_rating: 8,
      cover_image: '/assets/images/newgame.jpg',
    };

    const res = await request(app).post('/api/games/create').send(newGame);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Game created successfully');

    const [games] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM games WHERE title = ?',
      [newGame.title]
    );

    expect(games.length).toEqual(1);

    // Parse JSON fields and validate against the payload
    const dbTags =
      typeof games[0].tags === 'string'
        ? JSON.parse(games[0].tags)
        : games[0].tags;
    const dbPlatforms =
      typeof games[0].platforms === 'string'
        ? JSON.parse(games[0].platforms)
        : games[0].platforms;

    expect(dbTags).toEqual(newGame.tags);
    expect(dbPlatforms).toEqual(newGame.platforms);
  });

  /**
   * Test case: Searching games by a partial query
   * Ensures that the search endpoint can retrieve games based on a partial title match.
   */
  it('should return games that partially match the query', async () => {
    const res = await request(app).get('/api/games/search?query=Fort').send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title', 'Fortnite');
  });

  /**
   * Test case: Handling a search with no results
   * Validates that the API returns a 404 status and an appropriate error message when no games are found.
   */
  it('should return 404 if no games match the query', async () => {
    const res = await request(app)
      .get('/api/games/search?query=UnknownGame')
      .send();

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'No games found');
  });

  /**
   * Test case: Retrieving a game by ID
   * Checks that a game can be fetched by its unique ID and that all relevant fields are returned.
   */
  it('should retrieve a game by ID', async () => {
    const [game] = await pool.query<RowDataPacket[]>(
      "SELECT game_id FROM games WHERE title = 'Minecraft'"
    );
    const gameId = game[0].game_id;

    const res = await request(app).get(`/api/games/${gameId}`).send();

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Minecraft');
    expect(res.body).toHaveProperty('game_mode', 'both');
  });

  /**
   * Test case: Updating an existing game
   * Validates that game details can be updated and that the changes are correctly reflected in the database.
   */
  it('should update a game successfully', async () => {
    const [game] = await pool.query<RowDataPacket[]>(
      "SELECT game_id FROM games WHERE title = 'FIFA 21'"
    );
    const gameId = game[0].game_id;

    const updates = {
      title: 'FIFA 22',
      review_rating: 9,
    };

    const res = await request(app).put(`/api/games/${gameId}`).send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Game updated successfully');

    const [updatedGame] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM games WHERE game_id = ?',
      [gameId]
    );

    expect(updatedGame[0].title).toEqual('FIFA 22');
    expect(updatedGame[0].review_rating).toEqual(9);
  });

  /**
   * Test case: Deleting a game by ID
   * Verifies that a game can be deleted by its ID and is removed from the database.
   */
  // Uncomment this test if the delete functionality is active in the app
  // it('should delete a game by ID', async () => {
  //   const [game] = await pool.query<RowDataPacket[]>(
  //     "SELECT game_id FROM games WHERE title = 'Fortnite'"
  //   );
  //   const gameId = game[0].game_id;

  //   const res = await request(app)
  //     .delete(`/api/games/${gameId}`)
  //     .send();

  //   expect(res.statusCode).toEqual(200);
  //   expect(res.body).toHaveProperty('message', 'Game deleted successfully');

  //   const [deletedGame] = await pool.query<RowDataPacket[]>(
  //     'SELECT * FROM games WHERE game_id = ?',
  //     [gameId]
  //   );
  //   expect(deletedGame.length).toEqual(0);
  // });
});

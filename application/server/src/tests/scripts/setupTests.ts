import { getPool } from '../../connections/database';

/**
 * Resets the database by truncating all tables.
 * Foreign key checks are temporarily disabled to allow truncation of related tables.
 */
export const resetDatabase = async (): Promise<void> => {
  const pool = getPool();
  try {
    console.log('Resetting the database...');
    await pool.query('SET FOREIGN_KEY_CHECKS=0'); // Disable foreign key checks
    const tables = ['reviews', 'users', 'games', 'user_data'];

    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE ${table}`); // Truncate each table
    }

    await pool.query('SET FOREIGN_KEY_CHECKS=1'); // Re-enable foreign key checks
    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error; // Re-throw the error for debugging in tests
  }
};

/**
 * Seeds the database with initial test data.
 * Includes mock data for users, user_data, games, and reviews tables.
 */
export const seedDatabase = async (): Promise<void> => {
  const pool = getPool();
  try {
    console.log('Seeding the database with test data...');

    // Insert test users
    await pool.query(`
      INSERT INTO users (id, name, email, password, theme_preference, user_data_id)
      VALUES
        (1, 'Test User 1', 'testuser1@example.com', 'password123', 'dark', 1),
        (2, 'Test User 2', 'testuser2@example.com', 'password123', 'light', 2)
    `);

    // Insert test user_data
    await pool.query(`
      INSERT INTO user_data (id, search_history, interests, view_history, review_history, genres)
      VALUES
        (1, '["game1", "game2"]', '["sports", "action"]', '["game1"]', '["1", "2"]', '["RPG", "Adventure"]'),
        (2, '["game3", "game4"]', '["strategy", "puzzle"]', '["game3"]', '["3", "4"]', '["Puzzle", "Strategy"]')
    `);

    // Insert test games
    await pool.query(`
      INSERT INTO games (game_id, title, description, genre, developer, publisher, game_mode, release_date, review_rating, platforms)
      VALUES
        (1, 'Test Game 1', 'An exciting action game.', 'Action', 'Test Developer', 'Test Publisher', 'single-player', '2023-01-01', 8, '["PC", "Xbox"]'),
        (2, 'Test Game 2', 'A strategic puzzle game.', 'Puzzle', 'Another Developer', 'Another Publisher', 'multiplayer', '2023-06-01', 7, '["PC", "PlayStation"]')
    `);

    // Insert test reviews
    await pool.query(`
      INSERT INTO reviews (review_id, user_id, game_id, rating, review_text)
      VALUES
        (1, 1, 1, 4, 'Good game'),
        (2, 2, 2, 5, 'Amazing puzzle game')
    `);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Re-throw the error for debugging in tests
  }
};

/**
 * Closes the database connection pool.
 * Ensures all connections are released and the pool is properly closed.
 */
export const closeDatabase = async (): Promise<void> => {
  const pool = getPool();
  try {
    console.log('Closing the database connection...');
    await pool.end();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error; // Re-throw the error for debugging in tests
  }
};

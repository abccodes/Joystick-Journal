import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { getPool } from '../connections/database';
import { RowDataPacket } from 'mysql2';
import { CronJob } from 'cron';

dotenv.config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!RAWG_API_KEY) {
  throw new Error('Missing RAWG_API_KEY in .env file');
}

interface GameData {
  id: number;
  name: string;
  description: string | null;
  genres: { name: string }[];
  tags: { name: string }[];
  platforms: { platform: { name: string } }[];
  playtime: number | null;
  developers: { name: string }[];
  publishers: { name: string }[];
  released: string | null;
  rating: number;
  background_image: string | null;
  esrb_rating: { name: string } | null;
  metacritic: number | null;
}

/**
 * Utility: stripHtmlTags
 * Description: Removes HTML tags from a given string.
 * @param str - The string to process.
 * @returns A clean string without HTML tags.
 */
const stripHtmlTags = (str: string | null): string => {
  if (!str) return '';
  return str.replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Function: getMostPopularGames
 * Description: Fetches the most popular games from the RAWG API based on rating.
 * @param limit - The maximum number of games to fetch (default: 100).
 * @returns An array of GameData objects.
 */
const getMostPopularGames = async (
  limit: number = 100
): Promise<GameData[]> => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?ordering=-rating&key=${RAWG_API_KEY}&page_size=${limit}`
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch most popular games: ${response.statusText}`
      );
      return [];
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching most popular games:', error);
    return [];
  }
};

/**
 * Function: getGameById
 * Description: Fetches a game's details from the RAWG API by its ID.
 * @param gameId - The ID of the game to fetch.
 * @returns A GameData object or null if not found.
 */
const getGameById = async (gameId: number): Promise<GameData | null> => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch game: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
};

/**
 * Function: addNewGamesToDatabase
 * Description: Adds an array of games to the database after processing them.
 * @param games - An array of games fetched from the RAWG API.
 */
const addNewGamesToDatabase = async (games: any[]): Promise<void> => {
  const pool = getPool();
  const gamesToInsert: any[] = [];

  for (const game of games) {
    try {
      if (!game || typeof game !== 'object') {
        console.error(`Invalid game object: ${JSON.stringify(game)}`);
        continue;
      }

      const title = game.name;
      if (!title) {
        console.error('Game title is undefined or empty');
        continue;
      }

      const description = stripHtmlTags(game.description) || '';
      const genre = game.genres?.map((g: any) => g.name).join(', ') || null;
      const tags = JSON.stringify(game.tags?.map((tag: any) => tag.name) || []);
      const platforms = JSON.stringify(
        game.platforms?.map((p: any) => p.platform.name) || []
      );
      const playtime_estimate = game.playtime || 0;
      const developer =
        game.developers?.length > 0 ? game.developers[0].name : 'Unknown';
      const publisher =
        game.publishers?.length > 0 ? game.publishers[0].name : 'Unknown';

      let game_mode: string = 'single-player';
      const lowerCasePlatforms = platforms.toLowerCase();
      if (lowerCasePlatforms.includes('multiplayer')) {
        game_mode = 'multiplayer';
      } else if (lowerCasePlatforms.includes('both')) {
        game_mode = 'both';
      }

      const rawRating = game.rating || 0;
      const review_rating = Math.min(Math.max(Math.round(rawRating), 1), 10);

      const release_date = game.released;
      const cover_image = game.background_image;

      const checkQuery = 'SELECT * FROM games WHERE title = ?';
      const [rows] = await pool.query<RowDataPacket[]>(checkQuery, [title]);

      if (rows.length > 0) {
        console.log(`Game "${title}" already exists in the database.`);
        continue;
      }

      gamesToInsert.push([
        title,
        description,
        genre,
        tags,
        platforms,
        playtime_estimate,
        developer,
        publisher,
        game_mode,
        release_date,
        review_rating,
        cover_image,
      ]);
    } catch (error) {
      console.error(`Error processing game "${game?.name}":`, error);
    }
  }

  if (gamesToInsert.length > 0) {
    try {
      const insertQuery = `
        INSERT INTO games (title, description, genre, tags, platforms, playtime_estimate, developer, publisher, game_mode, release_date, review_rating, cover_image)
        VALUES ?
      `;
      await pool.query(insertQuery, [gamesToInsert]);
      console.log(`${gamesToInsert.length} new games added to the database.`);
    } catch (error) {
      console.error('Error inserting games into the database:', error);
    }
  } else {
    console.log('No new games to add.');
  }
};

/**
 * Function: fetchNewGames
 * Description: Fetches games released in the last 10 days.
 * @param maxFetch - The maximum number of games to fetch (default: 50).
 * @returns An array of games or an empty array if none found.
 */
const fetchNewGames = async (maxFetch: number = 50): Promise<any[]> => {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const today = new Date();

  const startDate = tenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?dates=${startDate},${endDate}&key=${RAWG_API_KEY}&page_size=${maxFetch}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch new games: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.results.slice(0, maxFetch) || [];
  } catch (error) {
    console.error('Error fetching new games:', error);
    return [];
  }
};

/**
 * Function: testAddGames
 * Description: Tests the process of fetching and adding games to the database.
 */
const testAddGames = async () => {
  try {
    console.log('Fetching new games...');
    const gamesData = await fetchNewGames(50);

    if (gamesData.length > 0) {
      console.log(`Fetched ${gamesData.length} games. Adding them to the database...`);
      await addNewGamesToDatabase(gamesData);
      console.log('Test games added successfully.');
    } else {
      console.log('No new games fetched.');
    }
  } catch (error) {
    console.error('Error during testAddGames:', error);
  }
};

export {
  getGameById,
  addNewGamesToDatabase,
  fetchNewGames,
  testAddGames,
  getMostPopularGames,
};

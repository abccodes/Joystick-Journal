/**
 * Interface: Game
 * Description: Represents a game in the application, including metadata and descriptive details.
 */
export interface Game {
  /**
   * The unique identifier for the game.
   */
  game_id?: number;

  /**
   * The title of the game.
   */
  title: string;

  /**
   * A description of the game.
   */
  description: string;

  /**
   * The genre of the game.
   */
  genre: string;

  /**
   * Tags associated with the game.
   * Stored as an array of strings in code and serialized to JSON in the database.
   */
  tags: string[];

  /**
   * Platforms on which the game is available.
   * Stored as an array of strings in code and serialized to JSON in the database.
   */
  platforms: string[];

  /**
   * Estimated playtime for the game in hours.
   */
  playtime_estimate: number;

  /**
   * The developer of the game.
   */
  developer: string;

  /**
   * The publisher of the game.
   */
  publisher: string;

  /**
   * The mode of gameplay (e.g., single-player, multiplayer).
   */
  game_mode: string;

  /**
   * The release date of the game.
   */
  release_date: Date | string;

  /**
   * The average review rating for the game.
   */
  review_rating: number;

  /**
   * The URL or path to the cover image of the game.
   */
  cover_image: string;

  /**
   * The timestamp when the game was created.
   */
  created_at?: Date;

  /**
   * The timestamp when the game was last updated.
   */
  updated_at?: Date;
}

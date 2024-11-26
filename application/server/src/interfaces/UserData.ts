/**
 * Interface: UserData
 * Description: Represents user-related data stored in the application, including their search history, interests, and associated metadata.
 */
export interface UserData {
  /**
   * The unique identifier for the user data entry.
   * Optional because it may not be available before creation.
   */
  id?: number;

  /**
   * The user's search history, stored as an array of strings.
   */
  search_history?: string[];

  /**
   * The user's interests, stored as an array of strings.
   */
  interests?: string[];

  /**
   * The user's view history, stored as an array of strings.
   */
  view_history?: string[];

  /**
   * The user's review history, stored as an array of strings.
   */
  review_history?: string[];

  /**
   * The genres the user prefers, stored as an array of strings.
   */
  genres?: string[];

  /**
   * The timestamp when this user data entry was created.
   */
  created_at?: Date;

  /**
   * The timestamp when this user data entry was last updated.
   */
  updated_at?: Date;
}

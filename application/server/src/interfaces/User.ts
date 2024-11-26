/**
 * Interface: User
 * Description: Represents a user in the application, including their personal details, preferences, and associated metadata.
 */
export interface User {
  /**
   * The unique identifier for the user.
   */
  id: number;

  /**
   * The user's full name.
   */
  name: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The hashed password of the user.
   * This is stored securely and not directly accessible in plaintext.
   */
  password: string;

  /**
   * The URL of the user's profile picture.
   * Null if the user has not uploaded a profile picture.
   */
  profile_pic: string | null;

  /**
   * The user's theme preference.
   * Can be either 'light' or 'dark'.
   */
  theme_preference: 'light' | 'dark';

  /**
   * The foreign key linking this user to their user data entry.
   * Null if no associated user data exists.
   */
  user_data_id: number | null;

  /**
   * The timestamp when the user was created.
   */
  created_at: Date;

  /**
   * The timestamp when the user was last updated.
   */
  updated_at: Date;
}

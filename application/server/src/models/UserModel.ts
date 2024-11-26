import bcrypt from 'bcryptjs';
import { getPool } from '../connections/database';
import { RowDataPacket } from 'mysql2/promise';
import { User as UserInterface } from '../interfaces/User';

class User {
  /**
   * Method: updateProfilePicture
   * Description: Placeholder method for updating a user's profile picture.
   * Throws an error if called, as it's not yet implemented.
   * @param id - The ID of the user.
   * @param profilePicUrl - The URL of the new profile picture.
   */
  static updateProfilePicture(id: number, profilePicUrl: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Method: create
   * Description: Creates a new user in the database.
   * @param user - The user object without ID, created_at, or updated_at fields.
   * @returns A promise resolving to the newly created user object.
   */
  static async create(
    user: Omit<UserInterface, 'id' | 'created_at' | 'updated_at'>
  ): Promise<UserInterface> {
    const { name, email, password, profile_pic, theme_preference, user_data_id } = user;
    const pool = getPool();

    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the user into the database
    await pool.query(
      'INSERT INTO users (name, email, password, profile_pic, theme_preference, user_data_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, profile_pic, theme_preference, user_data_id]
    );

    // Retrieve the newly created user
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const userRow = rows[0] as UserInterface;
    return userRow;
  }

  /**
   * Method: findByEmail
   * Description: Finds a user by their email address.
   * @param email - The email address to search for.
   * @returns A promise resolving to the user object or undefined if not found.
   */
  static async findByEmail(email: string): Promise<UserInterface | undefined> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const userRow = rows[0] as UserInterface;
    return userRow || undefined;
  }

  /**
   * Method: comparePassword
   * Description: Compares a stored hashed password with an entered password.
   * @param storedPassword - The hashed password stored in the database.
   * @param enteredPassword - The plain text password entered by the user.
   * @returns A promise resolving to true if passwords match, otherwise false.
   */
  static async comparePassword(
    storedPassword: string,
    enteredPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, storedPassword);
  }

  /**
   * Method: findByUsername
   * Description: Finds a user by their username.
   * @param username - The username to search for.
   * @returns A promise resolving to the user object or undefined if not found.
   */
  static async findByUsername(
    username: string
  ): Promise<UserInterface | undefined> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE name = ?',
      [username]
    );
    const userRow = rows[0] as UserInterface;
    return userRow || undefined;
  }

  /**
   * Method: findById
   * Description: Finds a user by their unique ID.
   * @param userId - The ID of the user to search for.
   * @returns A promise resolving to the user object or undefined if not found.
   */
  static async findById(userId: number): Promise<UserInterface | undefined> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    const userRow = rows[0] as UserInterface;
    return userRow || undefined;
  }

  /**
   * Method: updateUserProfilePicture
   * Description: Updates the profile picture URL for a user.
   * @param userId - The ID of the user to update.
   * @param profilePicUrl - The new profile picture URL.
   * @returns A promise resolving to true if the update was successful, otherwise false.
   */
  static async updateUserProfilePicture(
    userId: number,
    profilePicUrl: string
  ): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE users SET profile_pic = ? WHERE id = ?',
      [profilePicUrl, userId]
    );

    // Check if any row was updated
    const updateResult = result as { affectedRows: number };
    return updateResult.affectedRows > 0;
  }
}

export default User;

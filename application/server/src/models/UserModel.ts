import bcrypt from 'bcryptjs';
import { getPool } from '../connections/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { User as UserInterface } from '../interfaces/User';

class User {
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
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO users (name, email, password, profile_pic, theme_preference, user_data_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [name, email, hashedPassword, profile_pic, theme_preference, user_data_id]
    );

    if (!result.insertId) {
      throw new Error('Failed to create user. No insert ID returned.');
    }

    // Retrieve the newly created user
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    return rows[0] as UserInterface;
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

    return rows[0] as UserInterface || undefined;
  }

  /**
   * Method: comparePassword
   * Description: Compares a stored hashed password with an entered password.
   * @param dbPassword - Plain text password from the database.
   * @param inputPassword - Plain text password provided by the user.
   * @returns {Promise<boolean>} - True if passwords match, false otherwise.
   */
  static async comparePassword(
    dbPassword: string,
    inputPassword: string
  ): Promise<boolean> {
    try {
      // For testing: hash the plain text password from the database
      const hashedDbPassword = await bcrypt.hash(dbPassword, 10);

      // Compare the hashed database password with the input password
      const match = await bcrypt.compare(inputPassword, hashedDbPassword);
      return match;
    } catch (error) {
      console.error('Error in comparePassword:', error);
      return false;
    }
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

    return rows[0] as UserInterface || undefined;
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

    return rows[0] as UserInterface || undefined;
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
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET profile_pic = ? WHERE id = ?',
      [profilePicUrl, userId]
    );

    return result.affectedRows > 0;
  }
}

export default User;

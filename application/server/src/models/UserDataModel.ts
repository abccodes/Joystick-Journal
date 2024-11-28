import { getPool } from '../connections/database';
import { UserData as UserDataInterface } from '../interfaces/UserData';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class UserData {
  /**
   * Helper Function: stringifyFields
   * Description: Converts array fields in the user data to JSON strings for storage in the database.
   * @param data - The user data object.
   * @returns An object with array fields stringified.
   */
  private stringifyFields(data: UserDataInterface): Record<string, string> {
    return {
      search_history: JSON.stringify(data.search_history || []),
      interests: JSON.stringify(data.interests || []),
      view_history: JSON.stringify(data.view_history || []),
      review_history: JSON.stringify(data.review_history || []),
      genres: JSON.stringify(data.genres || []),
    };
  }

  /**
   * Helper Function: parseFields
   * Description: Parses JSON string fields from the database into arrays for application use.
   * @param row - The database row object.
   * @returns A user data object with parsed fields.
   */
  private parseFields(row: any): UserDataInterface {
    const safeParse = (field: any) => {
      try {
        return typeof field === 'string' ? JSON.parse(field) : [];
      } catch {
        return [];
      }
    };

    return {
      ...row,
      search_history: safeParse(row.search_history),
      interests: safeParse(row.interests),
      view_history: safeParse(row.view_history),
      review_history: safeParse(row.review_history),
      genres: safeParse(row.genres),
    };
  }

  /**
   * Method: createUserData
   * Description: Inserts a new user data entry into the database.
   * @param userData - The user data object without ID, created_at, or updated_at fields.
   * @returns A promise resolving to the ID of the newly created user data entry.
   */
  async createUserData(
    userData: Omit<UserDataInterface, 'id' | 'created_at' | 'updated_at'>
  ): Promise<number> {
    const pool = getPool();
    const stringifiedData = this.stringifyFields(userData);

    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO user_data (search_history, interests, view_history, review_history, genres) VALUES (?, ?, ?, ?, ?)',
        [
          stringifiedData.search_history,
          stringifiedData.interests,
          stringifiedData.view_history,
          stringifiedData.review_history,
          stringifiedData.genres,
        ]
      );

      return result.insertId; // Return the ID of the newly created entry
    } catch (error) {
      console.error('Error creating user data:', error);
      throw new Error('Database error occurred while creating user data.');
    }
  }

  /**
   * Method: getUserDataById
   * Description: Fetches user data by its unique ID.
   * @param id - The ID of the user data entry.
   * @returns A promise resolving to the user data object or null if not found.
   */
  async getUserDataById(id: number): Promise<UserDataInterface | null> {
    const pool = getPool();
    const sql = 'SELECT * FROM user_data WHERE id = ?';

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
      return rows.length ? this.parseFields(rows[0]) : null;
    } catch (error) {
      console.error(`Error fetching user data with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Method: updateUserData
   * Description: Updates user data fields in the database by ID.
   * @param id - The ID of the user data entry to update.
   * @param updates - Partial user data object containing fields to update.
   * @returns A promise resolving when the update is complete.
   */
  async updateUserData(
    id: number,
    updates: Partial<UserDataInterface>
  ): Promise<void> {
    const pool = getPool();
    const stringifiedUpdates = this.stringifyFields(updates);
    const fields = [];
    const values: (string | number)[] = [];

    for (const [key, value] of Object.entries(stringifiedUpdates)) {
      fields.push(`${key} = ?`);
      values.push(value as string | number);
    }

    values.push(id);
    const sql = `UPDATE user_data SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await pool.query(sql, values);
    } catch (error) {
      console.error(`Error updating user data with ID ${id}:`, error);
      throw new Error('Database error occurred while updating user data.');
    }
  }

  /**
   * Method: deleteUserData
   * Description: Deletes a user data entry from the database by ID.
   * @param id - The ID of the user data entry to delete.
   * @returns A promise resolving when the deletion is complete.
   */
  async deleteUserData(id: number): Promise<void> {
    const pool = getPool();
    const sql = 'DELETE FROM user_data WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (error) {
      console.error(`Error deleting user data with ID ${id}:`, error);
      throw new Error('Database error occurred while deleting user data.');
    }
  }
}

export default UserData;

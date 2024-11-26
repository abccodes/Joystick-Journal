import app from "./app";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Log the Google Client ID for debugging purposes.
 * Note: Ensure sensitive information is not logged in production environments.
 */
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);

/**
 * The port on which the server will listen.
 * Defaults to 8000 if the PORT environment variable is not set.
 */
const port = process.env.PORT || 8000;

/**
 * Start the server.
 * Logs a message indicating that the server is running and listening on the specified port.
 */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Optional: Ensure the 'uploads' directory exists before using it
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
}

/**
 * Multer Storage Configuration
 * Configures multer to save uploaded files temporarily in the 'uploads/' folder.
 */
const storage = multer.diskStorage({
  /**
   * Determines the destination directory for uploaded files.
   * @param req - The incoming HTTP request.
   * @param file - The file being uploaded.
   * @param cb - Callback function to set the destination.
   */
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the resolved 'uploads' directory
  },

  /**
   * Determines the filename for uploaded files.
   * @param req - The incoming HTTP request.
   * @param file - The file being uploaded.
   * @param cb - Callback function to set the filename.
   */
  filename: (req, file, cb) => {
    // Use a timestamp to ensure unique filenames
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

/**
 * Multer Instance
 * Set up the Multer instance for handling single file uploads with the field name 'profilePicture'.
 */
const upload = multer({ storage });

/**
 * Middleware: fileUploadMiddleware
 * Description: Middleware for handling single file uploads with the field name 'profilePicture'.
 * Usage: Attach this middleware to routes requiring file uploads.
 */
export const fileUploadMiddleware = upload.single('profilePicture');

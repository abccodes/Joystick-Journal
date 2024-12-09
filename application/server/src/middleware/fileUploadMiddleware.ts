import multer from 'multer';

// Use Multer's memory storage to keep the file in memory
const storage = multer.memoryStorage();

export const fileUploadMiddleware = multer({ storage }).single('profilePic'); // Match the HTML name attribute

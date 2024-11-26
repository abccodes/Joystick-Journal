import { NextFunction, Request, Response } from "express";

/**
 * Middleware: errorHandler
 * Description: Handles errors in the application and sends appropriate responses to the client.
 * @param err - The error object representing the error.
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 * @param next - The next middleware function in the stack.
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack); // Log the error stack trace for debugging

  if (err instanceof AuthenticationError) {
    // Handle authentication errors with a 401 status code
    res.status(401).json({ message: "Unauthorized: " + err.message });
  } else {
    // Handle other errors with a 500 status code
    res.status(500).json({ 
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

/**
 * Class: AuthenticationError
 * Description: Represents an authentication-specific error in the application.
 * Extends the base Error class.
 */
class AuthenticationError extends Error {
  /**
   * Constructor for AuthenticationError
   * @param message - The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError"; // Set the error name
  }
}

export { errorHandler, AuthenticationError };

import { Request, Response } from 'express';
import { User as UserInterface } from '../../interfaces/User';

/**
 * Helper: verifyOwnership
 * Description: Verifies if the authenticated user has access rights to the target resource.
 * Responds with a 403 status code if access is denied.
 * @param req - The incoming HTTP request containing the authenticated user.
 * @param res - The outgoing HTTP response to send in case of access denial.
 * @param targetUserId - The ID of the user who owns the target resource.
 * @returns A boolean indicating whether the authenticated user owns the resource.
 */
export const verifyOwnership = (
  req: Request,
  res: Response,
  targetUserId: number
): boolean => {
  const user = req.user as UserInterface;

  if (user.id !== targetUserId) {
    res.status(403).json({ message: 'Forbidden: Access denied' });
    return false;
  }

  return true;
};

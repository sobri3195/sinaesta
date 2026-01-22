import { Request, Response, NextFunction } from 'express';

// Simple authentication middleware
// In production, use JWT or session-based auth
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // For now, use a simple header-based auth
  // In production, implement proper JWT or session auth
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  const userName = req.headers['x-user-name'] as string;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  req.user = {
    id: userId,
    role: userRole || 'STUDENT',
    name: userName || 'User',
  };

  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR']);

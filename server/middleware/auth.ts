import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } 
    // Check cookies if not in header
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource',
      });
    }

    next();
  };
};

export const isAdmin = authorize('SUPER_ADMIN', 'PROGRAM_ADMIN');
export const isMentor = authorize('SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR');
export const isReviewer = authorize('SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR', 'REVIEWER');
export const isProctor = authorize('SUPER_ADMIN', 'PROGRAM_ADMIN', 'PROCTOR');
export const isStudent = authorize('STUDENT');

// Aliases for backward compatibility
export const authenticateUser = authenticate;
export const requireAdmin = isAdmin;
export type AuthenticatedRequest = AuthRequest;

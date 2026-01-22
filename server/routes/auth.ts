import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from '../validations/authValidation';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from '../services/authService';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData.email, validatedData.password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
});

// Refresh token
router.post('/refresh', authenticate, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
});

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Logout failed',
    });
  }
});

export default router;

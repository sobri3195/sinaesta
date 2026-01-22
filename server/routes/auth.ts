import { Router, Request, Response } from 'express';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyEmailSchema
} from '../validations/authValidation';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../services/authService';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerUser(validatedData);

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
});

// Login
router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData.email, validatedData.password);

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: validatedData.rememberMe ? REFRESH_TOKEN_MAX_AGE : undefined,
    });

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      });
    }

    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await refreshAccessToken(refreshToken);

    // Update refresh token cookie (rotation)
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body.refreshToken;
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

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

// Verify Email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    await verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Email verification failed',
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await requestPasswordReset(email);

    res.json({
      success: true,
      message: 'Password reset email sent if account exists',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to request password reset',
    });
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Password reset failed',
    });
  }
});

export default router;

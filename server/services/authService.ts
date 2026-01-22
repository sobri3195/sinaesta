import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

export const deleteAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

export const registerUser = async (data: any) => {
  const { email, password, name, role, targetSpecialty, institution, strNumber } = data;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date();
  verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

  // Insert user
  const result = await query(
    `INSERT INTO users (email, password_hash, name, role, target_specialty, institution, str_number, status, verification_token, verification_token_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9)
     RETURNING id, email, name, role, target_specialty, institution, str_number, status, created_at`,
    [email, passwordHash, name, role, targetSpecialty, institution, strNumber, verificationToken, verificationExpires]
  );

  const user = result.rows[0];

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      targetSpecialty: user.target_specialty,
      institution: user.institution,
      strNumber: user.str_number,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (email: string, password: string) => {
  // Find user
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  // Check if account is locked
  if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.lockout_until).getTime() - new Date().getTime()) / 60000);
    throw new Error(`Account is temporarily locked. Try again in ${minutesLeft} minutes.`);
  }

  // Check if user is suspended
  if (user.status === 'SUSPENDED') {
    throw new Error('Account is suspended');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    // Update failed attempts
    const failedAttempts = (user.failed_login_attempts || 0) + 1;
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
      await query(
        'UPDATE users SET failed_login_attempts = $1, lockout_until = $2 WHERE id = $3',
        [failedAttempts, lockoutUntil, user.id]
      );
      throw new Error('Too many failed attempts. Account is locked for 15 minutes.');
    } else {
      await query(
        'UPDATE users SET failed_login_attempts = $1 WHERE id = $2',
        [failedAttempts, user.id]
      );
      throw new Error('Invalid credentials');
    }
  }

  // Reset failed attempts on successful login
  await query(
    'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      targetSpecialty: user.target_specialty,
      institution: user.institution,
      strNumber: user.str_number,
      status: user.status,
      avatar: user.avatar,
      emailVerified: user.email_verified,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (oldRefreshToken: string) => {
  // Verify refresh token exists and is not expired
  const result = await query(
    `SELECT rt.*, u.id, u.email, u.role, u.name
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token = $1 AND rt.expires_at > NOW()`,
    [oldRefreshToken]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired refresh token');
  }

  const user = result.rows[0];

  // Token rotation: delete old refresh token and generate new one
  await deleteRefreshToken(oldRefreshToken);
  const newRefreshToken = await generateRefreshToken(user.id);

  // Generate new access token
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { 
    accessToken, 
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await deleteRefreshToken(refreshToken);
};

export const verifyEmail = async (token: string) => {
  const result = await query(
    'SELECT id FROM users WHERE verification_token = $1 AND verification_token_expires_at > NOW()',
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired verification token');
  }

  const userId = result.rows[0].id;

  await query(
    "UPDATE users SET email_verified = TRUE, status = 'VERIFIED', verification_token = NULL, verification_token_expires_at = NULL WHERE id = $1",
    [userId]
  );

  return true;
};

export const requestPasswordReset = async (email: string) => {
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (result.rows.length === 0) {
    // Return true even if user doesn't exist for security (don't reveal email existence)
    return true;
  }

  const userId = result.rows[0].id;
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date();
  resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

  await query(
    'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
    [resetToken, resetExpires, userId]
  );

  await sendPasswordResetEmail(email, resetToken);

  return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const result = await query(
    'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired reset token');
  }

  const userId = result.rows[0].id;
  const passwordHash = await hashPassword(newPassword);

  await query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL, failed_login_attempts = 0, lockout_until = NULL WHERE id = $2',
    [passwordHash, userId]
  );

  // Invalidate all sessions on password reset
  await deleteAllUserRefreshTokens(userId);

  return true;
};

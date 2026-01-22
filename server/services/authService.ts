import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

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

  // Insert user
  const result = await query(
    `INSERT INTO users (email, password_hash, name, role, target_specialty, institution, str_number, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
     RETURNING id, email, name, role, target_specialty, institution, str_number, status, created_at`,
    [email, passwordHash, name, role, targetSpecialty, institution, strNumber]
  );

  const user = result.rows[0];

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

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Check if user is suspended
  if (user.status === 'SUSPENDED') {
    throw new Error('Account is suspended');
  }

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
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token exists and is not expired
  const result = await query(
    `SELECT rt.*, u.id, u.email, u.role, u.name
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token = $1 AND rt.expires_at > NOW()`,
    [refreshToken]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired refresh token');
  }

  const user = result.rows[0];

  // Generate new access token
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { accessToken, user: user.id };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await deleteRefreshToken(refreshToken);
};

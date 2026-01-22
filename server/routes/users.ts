import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, avatar, status, target_specialty, institution, str_number, batch_id, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        targetSpecialty: user.target_specialty,
        institution: user.institution,
        strNumber: user.str_number,
        batchId: user.batch_id,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, avatar, status, target_specialty, institution, str_number, batch_id, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        targetSpecialty: user.target_specialty,
        institution: user.institution,
        strNumber: user.str_number,
        batchId: user.batch_id,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar, targetSpecialty, institution, strNumber } = req.body;

    // Users can only update their own profile
    if (req.params.id !== req.user!.id && !['SUPER_ADMIN', 'PROGRAM_ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user',
      });
    }

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           avatar = COALESCE($2, avatar),
           target_specialty = COALESCE($3, target_specialty),
           institution = COALESCE($4, institution),
           str_number = COALESCE($5, str_number)
       WHERE id = $6
       RETURNING id, email, name, role, avatar, status, target_specialty, institution, str_number, batch_id, created_at`,
      [name, avatar, targetSpecialty, institution, strNumber, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        targetSpecialty: user.target_specialty,
        institution: user.institution,
        strNumber: user.str_number,
        batchId: user.batch_id,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List all users (admin only)
router.get('/', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, specialty, status, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT id, email, name, role, avatar, status, target_specialty, institution, str_number, batch_id, created_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      queryText += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (specialty) {
      paramCount++;
      queryText += ` AND target_specialty = $${paramCount}`;
      params.push(specialty);
    }

    if (status) {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const users = result.rows.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      targetSpecialty: user.target_specialty,
      institution: user.institution,
      strNumber: user.str_number,
      batchId: user.batch_id,
      createdAt: user.created_at,
    }));

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: users.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

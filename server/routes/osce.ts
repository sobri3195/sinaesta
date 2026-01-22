import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest, isMentor } from '../middleware/auth';

const router = Router();

// Get all OSCE stations
router.get('/stations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { specialty, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Filter by specialty (students see only their specialty, mentors see all)
    let queryText = `
      SELECT os.*, u.name as examiner_name
      FROM osce_stations os
      LEFT JOIN users u ON os.examiner_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (req.user!.role === 'STUDENT') {
      // Students see stations relevant to their specialty
      // For now, we'll show all stations (you can add specialty filtering logic)
    }

    queryText += ` ORDER BY os.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const stations = result.rows.map((s: any) => ({
      id: s.id,
      title: s.title,
      scenario: s.scenario,
      instruction: s.instruction,
      durationMinutes: s.duration_minutes,
      checklist: s.checklist,
      rubricId: s.rubric_id,
      examinerId: s.examiner_id,
      examinerName: s.examiner_name,
      calibrationVideoUrl: s.calibration_video_url,
      createdAt: s.created_at,
    }));

    res.json({
      success: true,
      data: stations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: stations.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get OSCE station by ID
router.get('/stations/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT os.*, u.name as examiner_name
       FROM osce_stations os
       LEFT JOIN users u ON os.examiner_id = u.id
       WHERE os.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'OSCE station not found',
      });
    }

    const station = result.rows[0];

    res.json({
      success: true,
      data: {
        id: station.id,
        title: station.title,
        scenario: station.scenario,
        instruction: station.instruction,
        durationMinutes: station.duration_minutes,
        checklist: station.checklist,
        rubricId: station.rubric_id,
        examinerId: station.examiner_id,
        examinerName: station.examiner_name,
        calibrationVideoUrl: station.calibration_video_url,
        createdAt: station.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create OSCE station
router.post('/stations', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const { title, scenario, instruction, durationMinutes, checklist, rubricId, examinerId, calibrationVideoUrl } = req.body;

    if (!title || !scenario || !instruction || !durationMinutes || !checklist) {
      return res.status(400).json({
        success: false,
        error: 'Title, scenario, instruction, duration, and checklist are required',
      });
    }

    const result = await query(
      `INSERT INTO osce_stations (
        title, scenario, instruction, duration_minutes, checklist,
        rubric_id, examiner_id, calibration_video_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [title, scenario, instruction, durationMinutes, JSON.stringify(checklist), rubricId, examinerId, calibrationVideoUrl]
    );

    const station = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: station.id,
        title: station.title,
        scenario: station.scenario,
        instruction: station.instruction,
        durationMinutes: station.duration_minutes,
        checklist: station.checklist,
        rubricId: station.rubric_id,
        examinerId: station.examiner_id,
        calibrationVideoUrl: station.calibration_video_url,
        createdAt: station.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update OSCE station
router.put('/stations/:id', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const { title, scenario, instruction, durationMinutes, checklist, rubricId, examinerId, calibrationVideoUrl } = req.body;

    // Verify station exists
    const existing = await query('SELECT * FROM osce_stations WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'OSCE station not found',
      });
    }

    const result = await query(
      `UPDATE osce_stations
       SET title = COALESCE($1, title),
           scenario = COALESCE($2, scenario),
           instruction = COALESCE($3, instruction),
           duration_minutes = COALESCE($4, duration_minutes),
           checklist = COALESCE($5, checklist),
           rubric_id = COALESCE($6, rubric_id),
           examiner_id = COALESCE($7, examiner_id),
           calibration_video_url = COALESCE($8, calibration_video_url)
       WHERE id = $9
       RETURNING *`,
      [title, scenario, instruction, durationMinutes, checklist ? JSON.stringify(checklist) : null, rubricId, examinerId, calibrationVideoUrl, req.params.id]
    );

    const station = result.rows[0];

    res.json({
      success: true,
      data: {
        id: station.id,
        title: station.title,
        scenario: station.scenario,
        instruction: station.instruction,
        durationMinutes: station.duration_minutes,
        checklist: station.checklist,
        rubricId: station.rubric_id,
        examinerId: station.examiner_id,
        calibrationVideoUrl: station.calibration_video_url,
        createdAt: station.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete OSCE station
router.delete('/stations/:id', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM osce_stations WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'OSCE station not found',
      });
    }

    res.json({
      success: true,
      message: 'OSCE station deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get OSCE attempts for user
router.get('/attempts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { stationId, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT oa.*, os.title as station_title, u.name as student_name
      FROM osce_attempts oa
      JOIN osce_stations os ON oa.station_id = os.id
      JOIN users u ON oa.user_id = u.id
      WHERE oa.user_id = $1
    `;
    const params: any[] = [req.user!.id];
    let paramCount = 1;

    if (stationId) {
      paramCount++;
      queryText += ` AND oa.station_id = $${paramCount}`;
      params.push(stationId);
    }

    queryText += ` ORDER BY oa.completed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const attempts = result.rows.map((a: any) => ({
      id: a.id,
      stationId: a.station_id,
      stationTitle: a.station_title,
      userId: a.user_id,
      studentName: a.student_name,
      performance: a.performance,
      feedback: a.feedback,
      score: a.score,
      completedAt: a.completed_at,
    }));

    res.json({
      success: true,
      data: attempts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: attempts.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get OSCE attempt by ID
router.get('/attempts/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT oa.*, os.title as station_title, u.name as student_name
       FROM osce_attempts oa
       JOIN osce_stations os ON oa.station_id = os.id
       JOIN users u ON oa.user_id = u.id
       WHERE oa.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'OSCE attempt not found',
      });
    }

    const attempt = result.rows[0];

    // Check authorization
    if (attempt.user_id !== req.user!.id && !['SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR'].includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this attempt',
      });
    }

    res.json({
      success: true,
      data: {
        id: attempt.id,
        stationId: attempt.station_id,
        stationTitle: attempt.station_title,
        userId: attempt.user_id,
        studentName: attempt.student_name,
        performance: attempt.performance,
        feedback: attempt.feedback,
        score: attempt.score,
        completedAt: attempt.completed_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit OSCE attempt
router.post('/attempts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { stationId, performance } = req.body;

    if (!stationId || !performance) {
      return res.status(400).json({
        success: false,
        error: 'Station ID and performance are required',
      });
    }

    // Verify station exists
    const stationCheck = await query('SELECT * FROM osce_stations WHERE id = $1', [stationId]);
    if (stationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'OSCE station not found',
      });
    }

    // Calculate score from checklist
    let score = 0;
    const checklist = stationCheck.rows[0].checklist;
    if (checklist && Array.isArray(performance)) {
      const totalPoints = checklist.reduce((sum: number, item: any) => sum + item.points, 0);
      const earnedPoints = performance.reduce((sum: number, item: any) => sum + (item.points || 0), 0);
      score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    }

    const result = await query(
      `INSERT INTO osce_attempts (user_id, station_id, performance, score)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user!.id, stationId, JSON.stringify(performance), score]
    );

    const attempt = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: attempt.id,
        stationId: attempt.station_id,
        userId: attempt.user_id,
        performance: attempt.performance,
        score: attempt.score,
        completedAt: attempt.completed_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update OSCE attempt (add feedback)
router.put('/attempts/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { feedback, score } = req.body;

    // Only mentors and admins can update attempts
    if (!['SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR'].includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update OSCE attempts',
      });
    }

    const result = await query(
      `UPDATE osce_attempts
       SET feedback = COALESCE($1, feedback),
           score = COALESCE($2, score)
       WHERE id = $3
       RETURNING *`,
      [feedback, score, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'OSCE attempt not found',
      });
    }

    const attempt = result.rows[0];

    res.json({
      success: true,
      data: {
        id: attempt.id,
        stationId: attempt.station_id,
        userId: attempt.user_id,
        performance: attempt.performance,
        feedback: attempt.feedback,
        score: attempt.score,
        completedAt: attempt.completed_at,
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

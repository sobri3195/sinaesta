import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest, isMentor } from '../middleware/auth';

const router = Router();

// Get all results for current user
router.get('/my-results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT er.*, e.title as exam_title, e.topic as exam_specialty, e.difficulty as exam_difficulty
       FROM exam_results er
       JOIN exams e ON er.exam_id = e.id
       WHERE er.user_id = $1
       ORDER BY er.completed_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, Number(limit), offset]
    );

    const results = result.rows.map((r: any) => ({
      id: r.id,
      examId: r.exam_id,
      examTitle: r.exam_title,
      examSpecialty: r.exam_specialty,
      examDifficulty: r.exam_difficulty,
      userId: r.user_id,
      score: r.score,
      totalQuestions: r.total_questions,
      answers: r.answers,
      completedAt: r.completed_at,
      aiFeedback: r.ai_feedback,
      domainAnalysis: r.domain_analysis,
      auditLog: r.audit_log,
      errorProfile: r.error_profile,
      fatigueData: r.fatigue_data,
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: results.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get result by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT er.*, e.title as exam_title, e.topic as exam_specialty, e.difficulty as exam_difficulty,
              q.text as question_text, q.options as question_options, q.correct_answer_index, q.explanation as question_explanation
       FROM exam_results er
       JOIN exams e ON er.exam_id = e.id
       LEFT JOIN questions q ON q.exam_id = e.id
       WHERE er.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Result not found',
      });
    }

    const firstRow = result.rows[0];

    // Check authorization
    if (
      firstRow.user_id !== req.user!.id &&
      !['SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR'].includes(req.user!.role)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this result',
      });
    }

    // Group questions
    const questions = result.rows
      .filter((r: any) => r.question_text)
      .map((r: any, index: number) => ({
        id: index,
        text: r.question_text,
        options: r.question_options,
        correctAnswerIndex: r.correct_answer_index,
        explanation: r.question_explanation,
        userAnswer: firstRow.answers[index],
        isCorrect: firstRow.answers[index] === r.correct_answer_index,
      }));

    const examResult = {
      id: firstRow.id,
      examId: firstRow.exam_id,
      examTitle: firstRow.exam_title,
      examSpecialty: firstRow.exam_specialty,
      examDifficulty: firstRow.exam_difficulty,
      userId: firstRow.user_id,
      score: firstRow.score,
      totalQuestions: firstRow.total_questions,
      answers: firstRow.answers,
      completedAt: firstRow.completed_at,
      aiFeedback: firstRow.ai_feedback,
      domainAnalysis: firstRow.domain_analysis,
      auditLog: firstRow.audit_log,
      errorProfile: firstRow.error_profile,
      fatigueData: firstRow.fatigue_data,
      questions,
    };

    res.json({
      success: true,
      data: examResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all results (admin/mentor only)
router.get('/', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, examId, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT er.*, u.name as student_name, e.title as exam_title, e.topic as exam_specialty
      FROM exam_results er
      JOIN users u ON er.user_id = u.id
      JOIN exams e ON er.exam_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      queryText += ` AND er.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (examId) {
      paramCount++;
      queryText += ` AND er.exam_id = $${paramCount}`;
      params.push(examId);
    }

    queryText += ` ORDER BY er.completed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const results = result.rows.map((r: any) => ({
      id: r.id,
      examId: r.exam_id,
      examTitle: r.exam_title,
      examSpecialty: r.exam_specialty,
      userId: r.user_id,
      studentName: r.student_name,
      score: r.score,
      totalQuestions: r.total_questions,
      completedAt: r.completed_at,
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: results.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get statistics for results (admin/mentor only)
router.get('/stats/overview', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const { examId, specialty } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (examId) {
      paramCount++;
      whereClause += ` AND er.exam_id = $${paramCount}`;
      params.push(examId);
    }

    if (specialty) {
      paramCount++;
      whereClause += ` AND e.topic = $${paramCount}`;
      params.push(specialty);
    }

    // Get average score
    const avgScoreResult = await query(
      `SELECT AVG(score) as avg_score, COUNT(*) as total_attempts
       FROM exam_results er
       JOIN exams e ON er.exam_id = e.id
       ${whereClause}`,
      params
    );

    // Get score distribution
    const distributionResult = await query(
      `SELECT
         CASE
           WHEN score >= 90 THEN 'A'
           WHEN score >= 80 THEN 'B'
           WHEN score >= 70 THEN 'C'
           WHEN score >= 60 THEN 'D'
           ELSE 'F'
         END as grade,
         COUNT(*) as count
       FROM exam_results er
       JOIN exams e ON er.exam_id = e.id
       ${whereClause}
       GROUP BY grade
       ORDER BY grade`,
      params
    );

    // Get average by difficulty
    const difficultyResult = await query(
      `SELECT e.difficulty, AVG(er.score) as avg_score, COUNT(*) as count
       FROM exam_results er
       JOIN exams e ON er.exam_id = e.id
       ${whereClause}
       GROUP BY e.difficulty
       ORDER BY e.difficulty`,
      params
    );

    res.json({
      success: true,
      data: {
        overview: {
          averageScore: Math.round(avgScoreResult.rows[0]?.avg_score || 0),
          totalAttempts: parseInt(avgScoreResult.rows[0]?.total_attempts || 0),
        },
        gradeDistribution: distributionResult.rows.map((r: any) => ({
          grade: r.grade,
          count: parseInt(r.count),
        })),
        byDifficulty: difficultyResult.rows.map((r: any) => ({
          difficulty: r.difficulty,
          averageScore: Math.round(r.avg_score),
          count: parseInt(r.count),
        })),
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

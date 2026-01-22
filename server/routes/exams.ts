import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest, isMentor, isAdmin } from '../middleware/auth';
import { examSchema, questionSchema, submitExamSchema } from '../validations/examValidation';

const router = Router();

// Get all exams
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { specialty, difficulty, mode, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT e.*, u.name as created_by_name
      FROM exams e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Students can only see exams for their specialty
    if (req.user!.role === 'STUDENT') {
      paramCount++;
      queryText += ` AND e.topic = $${paramCount}`;
      params.push(req.user!.targetSpecialty || '');
    }

    if (specialty) {
      paramCount++;
      queryText += ` AND e.topic = $${paramCount}`;
      params.push(specialty);
    }

    if (difficulty) {
      paramCount++;
      queryText += ` AND e.difficulty = $${paramCount}`;
      params.push(difficulty);
    }

    if (mode) {
      paramCount++;
      queryText += ` AND e.mode = $${paramCount}`;
      params.push(mode);
    }

    queryText += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const exams = await Promise.all(result.rows.map(async (exam: any) => {
      // Get question count
      const qResult = await query(
        'SELECT COUNT(*) as count FROM questions WHERE exam_id = $1',
        [exam.id]
      );

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.duration_minutes,
        questionsCount: parseInt(qResult.rows[0].count),
        topic: exam.topic,
        subtopics: exam.subtopics,
        difficulty: exam.difficulty,
        thumbnailUrl: exam.thumbnail_url,
        createdAt: exam.created_at,
        mode: exam.mode,
        createdBy: exam.created_by_name,
        scheduledStart: exam.scheduled_start,
        scheduledEnd: exam.scheduled_end,
      };
    }));

    res.json({
      success: true,
      data: exams,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: exams.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get exam by ID with questions
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;

    // Get exam details
    const examResult = await query(
      `SELECT e.*, u.name as created_by_name
       FROM exams e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [examId]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
      });
    }

    const exam = examResult.rows[0];

    // Get questions
    const questionsResult = await query(
      `SELECT * FROM questions
       WHERE exam_id = $1
       ORDER BY created_at`,
      [examId]
    );

    // Get vignettes if any
    const vignetteIds = questionsResult.rows
      .map((q: any) => q.vignette_id)
      .filter((id: any) => id !== null);

    const vignettes: any[] = [];
    if (vignetteIds.length > 0) {
      const vignetteResult = await query(
        'SELECT * FROM case_vignettes WHERE id = ANY($1)',
        [vignetteIds]
      );
      vignettes.push(
        ...vignetteResult.rows.map((v: any) => ({
          id: v.id,
          title: v.title,
          content: v.content,
          tabs: v.tabs,
          labTrends: v.lab_trends,
        }))
      );
    }

    const questions = questionsResult.rows.map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correct_answer_index,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty,
      timeLimit: q.time_limit,
      points: q.points,
      imageUrl: q.image_url,
      type: q.type,
      vignetteId: q.vignette_id,
      domain: q.domain,
      reasoningSteps: q.reasoning_steps,
      errorTaxonomy: q.error_taxonomy,
      guidelineId: q.guideline_id,
      blueprintTopicId: q.blueprint_topic_id,
      status: q.status,
      itemAnalysis: q.item_analysis,
      qualityMetrics: q.quality_metrics,
    }));

    res.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.duration_minutes,
        topic: exam.topic,
        subtopics: exam.subtopics,
        difficulty: exam.difficulty,
        thumbnailUrl: exam.thumbnail_url,
        createdAt: exam.created_at,
        mode: exam.mode,
        blueprintId: exam.blueprint_id,
        scheduledStart: exam.scheduled_start,
        scheduledEnd: exam.scheduled_end,
        proctoring: exam.proctoring_config,
        sections: exam.sections,
        questions,
        vignettes,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create exam
router.post('/', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = examSchema.parse(req.body);

    const result = await query(
      `INSERT INTO exams (
        title, description, duration_minutes, topic, subtopics, difficulty,
        thumbnail_url, mode, blueprint_id, scheduled_start, scheduled_end,
        proctoring_config, sections, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        validatedData.title,
        validatedData.description,
        validatedData.durationMinutes,
        validatedData.topic,
        validatedData.subtopics || [],
        validatedData.difficulty,
        validatedData.thumbnailUrl,
        validatedData.mode,
        validatedData.blueprintId,
        validatedData.scheduledStart ? new Date(validatedData.scheduledStart) : null,
        validatedData.scheduledEnd ? new Date(validatedData.scheduledEnd) : null,
        validatedData.proctoring,
        validatedData.sections,
        req.user!.id,
      ]
    );

    const exam = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.duration_minutes,
        topic: exam.topic,
        subtopics: exam.subtopics,
        difficulty: exam.difficulty,
        thumbnailUrl: exam.thumbnail_url,
        createdAt: exam.created_at,
        mode: exam.mode,
        blueprintId: exam.blueprint_id,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update exam
router.put('/:id', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = examSchema.parse(req.body);

    // Check if exam exists and user is the creator or admin
    const existing = await query(
      'SELECT * FROM exams WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
      });
    }

    if (
      existing.rows[0].created_by !== req.user!.id &&
      !['SUPER_ADMIN', 'PROGRAM_ADMIN'].includes(req.user!.role)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this exam',
      });
    }

    const result = await query(
      `UPDATE exams
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           duration_minutes = COALESCE($3, duration_minutes),
           topic = COALESCE($4, topic),
           subtopics = COALESCE($5, subtopics),
           difficulty = COALESCE($6, difficulty),
           thumbnail_url = COALESCE($7, thumbnail_url),
           mode = COALESCE($8, mode),
           blueprint_id = COALESCE($9, blueprint_id),
           scheduled_start = COALESCE($10, scheduled_start),
           scheduled_end = COALESCE($11, scheduled_end),
           proctoring_config = COALESCE($12, proctoring_config),
           sections = COALESCE($13, sections)
       WHERE id = $14
       RETURNING *`,
      [
        validatedData.title,
        validatedData.description,
        validatedData.durationMinutes,
        validatedData.topic,
        validatedData.subtopics,
        validatedData.difficulty,
        validatedData.thumbnailUrl,
        validatedData.mode,
        validatedData.blueprintId,
        validatedData.scheduledStart ? new Date(validatedData.scheduledStart) : null,
        validatedData.scheduledEnd ? new Date(validatedData.scheduledEnd) : null,
        validatedData.proctoring,
        validatedData.sections,
        req.params.id,
      ]
    );

    const exam = result.rows[0];

    res.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.duration_minutes,
        topic: exam.topic,
        subtopics: exam.subtopics,
        difficulty: exam.difficulty,
        thumbnailUrl: exam.thumbnail_url,
        createdAt: exam.created_at,
        mode: exam.mode,
        blueprintId: exam.blueprint_id,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete exam
router.delete('/:id', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    // Check if exam exists and user is the creator or admin
    const existing = await query(
      'SELECT * FROM exams WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
      });
    }

    if (
      existing.rows[0].created_by !== req.user!.id &&
      !['SUPER_ADMIN', 'PROGRAM_ADMIN'].includes(req.user!.role)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this exam',
      });
    }

    await query('DELETE FROM exams WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add question to exam
router.post('/:id/questions', isMentor, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const validatedData = questionSchema.parse({ ...req.body, examId });

    // Verify exam exists
    const examCheck = await query('SELECT id FROM exams WHERE id = $1', [examId]);
    if (examCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
      });
    }

    const result = await query(
      `INSERT INTO questions (
        exam_id, vignette_id, text, options, correct_answer_index, explanation,
        category, difficulty, time_limit, points, image_url, type, domain,
        reasoning_steps, error_taxonomy, guideline_id, blueprint_topic_id,
        status, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        examId,
        validatedData.vignetteId,
        validatedData.text,
        validatedData.options,
        validatedData.correctAnswerIndex,
        validatedData.explanation,
        validatedData.category,
        validatedData.difficulty,
        validatedData.timeLimit,
        validatedData.points,
        validatedData.imageUrl,
        validatedData.type,
        validatedData.domain,
        validatedData.reasoningSteps,
        validatedData.errorTaxonomy,
        validatedData.guidelineId,
        validatedData.blueprintTopicId,
        validatedData.status,
        req.user!.id,
      ]
    );

    const question = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: question.id,
        text: question.text,
        options: question.options,
        correctAnswerIndex: question.correct_answer_index,
        explanation: question.explanation,
        category: question.category,
        difficulty: question.difficulty,
        timeLimit: question.time_limit,
        points: question.points,
        imageUrl: question.image_url,
        type: question.type,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit exam result
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const validatedData = submitExamSchema.parse(req.body);

    // Verify exam exists
    const examResult = await query(
      'SELECT * FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
      });
    }

    // Get questions to calculate score
    const questionsResult = await query(
      'SELECT id, correct_answer_index, points FROM questions WHERE exam_id = $1',
      [examId]
    );

    if (questionsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Exam has no questions',
      });
    }

    // Calculate score
    let score = 0;
    const domainAnalysis: Record<string, { total: number; correct: number }> = {};

    questionsResult.rows.forEach((q: any, index: number) => {
      const userAnswer = validatedData.answers[index];
      const domain = q.domain || 'Other';

      if (!domainAnalysis[domain]) {
        domainAnalysis[domain] = { total: 0, correct: 0 };
      }

      domainAnalysis[domain].total += q.points || 1;

      if (userAnswer === q.correct_answer_index) {
        score += q.points || 1;
        domainAnalysis[domain].correct += q.points || 1;
      }
    });

    // Calculate domain accuracy
    Object.keys(domainAnalysis).forEach((domain) => {
      domainAnalysis[domain].correct = Math.round(
        (domainAnalysis[domain].correct / domainAnalysis[domain].total) * 100
      );
    });

    const totalQuestions = questionsResult.rows.length;
    const percentageScore = Math.round((score / totalQuestions) * 100);

    // Save result
    const result = await query(
      `INSERT INTO exam_results (
        exam_id, user_id, score, total_questions, answers,
        audit_log, domain_analysis, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        examId,
        req.user!.id,
        percentageScore,
        totalQuestions,
        validatedData.answers,
        validatedData.auditLog,
        domainAnalysis,
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        examId,
        userId: req.user!.id,
        score: percentageScore,
        totalQuestions,
        completedAt: result.rows[0].completed_at,
        domainAnalysis,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get exam results for a user
router.get('/:id/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const userId = req.query.userId || req.user!.id;

    // Check authorization (users can only see their own results, admins can see all)
    if (userId !== req.user!.id && !['SUPER_ADMIN', 'PROGRAM_ADMIN', 'MENTOR'].includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these results',
      });
    }

    const result = await query(
      `SELECT er.*, u.name as student_name, e.title as exam_title
       FROM exam_results er
       JOIN users u ON er.user_id = u.id
       JOIN exams e ON er.exam_id = e.id
       WHERE er.exam_id = $1 ${userId !== req.user!.id ? 'AND er.user_id = $2' : ''}
       ORDER BY er.completed_at DESC`,
      userId !== req.user!.id ? [examId, userId] : [examId]
    );

    const results = result.rows.map((r: any) => ({
      id: r.id,
      examId: r.exam_id,
      examTitle: r.exam_title,
      userId: r.user_id,
      studentName: r.student_name,
      score: r.score,
      totalQuestions: r.total_questions,
      completedAt: r.completed_at,
      aiFeedback: r.ai_feedback,
      domainAnalysis: r.domain_analysis,
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

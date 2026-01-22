import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all flashcards for user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category, mastered, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT * FROM flashcards
      WHERE user_id = $1
    `;
    const params: any[] = [req.user!.id];
    let paramCount = 1;

    if (category) {
      paramCount++;
      queryText += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (mastered !== undefined) {
      paramCount++;
      queryText += ` AND mastered = $${paramCount}`;
      params.push(mastered === 'true');
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const flashcards = result.rows.map((f: any) => ({
      id: f.id,
      front: f.front,
      back: f.back,
      category: f.category,
      mastered: f.mastered,
    }));

    res.json({
      success: true,
      data: flashcards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: flashcards.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get flashcard by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM flashcards WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    const flashcard = result.rows[0];

    res.json({
      success: true,
      data: {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        category: flashcard.category,
        mastered: flashcard.mastered,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create flashcard
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { front, back, category } = req.body;

    if (!front || !back) {
      return res.status(400).json({
        success: false,
        error: 'Front and back are required',
      });
    }

    const result = await query(
      `INSERT INTO flashcards (user_id, front, back, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user!.id, front, back, category]
    );

    const flashcard = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        category: flashcard.category,
        mastered: flashcard.mastered,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update flashcard
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { front, back, category, mastered } = req.body;

    // Verify ownership
    const existing = await query(
      'SELECT * FROM flashcards WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    const result = await query(
      `UPDATE flashcards
       SET front = COALESCE($1, front),
           back = COALESCE($2, back),
           category = COALESCE($3, category),
           mastered = COALESCE($4, mastered)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [front, back, category, mastered, req.params.id, req.user!.id]
    );

    const flashcard = result.rows[0];

    res.json({
      success: true,
      data: {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        category: flashcard.category,
        mastered: flashcard.mastered,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete flashcard
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM flashcards WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    res.json({
      success: true,
      message: 'Flashcard deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get flashcard decks
router.get('/decks/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM flashcard_decks
       WHERE user_id = $1 OR is_system_deck = true
       ORDER BY created_at DESC`,
      [req.user!.id]
    );

    const decks = result.rows.map((deck: any) => ({
      id: deck.id,
      title: deck.title,
      topic: deck.topic,
      cards: deck.cards,
      isSystemDeck: deck.is_system_deck,
      createdAt: deck.created_at,
    }));

    res.json({
      success: true,
      data: decks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create flashcard deck
router.post('/decks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, topic, cards } = req.body;

    if (!title || !topic || !cards || !Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        error: 'Title, topic, and cards are required',
      });
    }

    const result = await query(
      `INSERT INTO flashcard_decks (user_id, title, topic, cards)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user!.id, title, topic, JSON.stringify(cards)]
    );

    const deck = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: deck.id,
        title: deck.title,
        topic: deck.topic,
        cards: deck.cards,
        isSystemDeck: deck.is_system_deck,
        createdAt: deck.created_at,
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

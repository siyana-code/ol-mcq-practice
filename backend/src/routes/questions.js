const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Admin-only question browsing.
 *
 * This route was public and returned `correct_answer`, which shipped the full
 * answer key to every client. Practice now goes through /api/practice, which
 * withholds the key until an answer is submitted — so this endpoint is a
 * content-management view and is gated accordingly.
 */
router.use(requireAdmin);

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Browse the question bank (Admin)
 *     description: >
 *       Includes correct answers, so it is restricted to administrators.
 *       Students use /api/practice/sessions, which never returns the key
 *       before an answer is submitted.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topic_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: paper_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [easy, medium, hard] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Matching questions }
 *       403: { description: Administrator access required }
 */
router.get('/', async (req, res) => {
  try {
    const { topic_id, paper_id, difficulty } = req.query;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    let query = db('questions')
      .join('topics', 'questions.topic_id', 'topics.id')
      .select(
        'questions.*',
        'topics.name_si as topic_name_si',
        'topics.name_en as topic_name_en',
      );

    if (topic_id) query = query.where('questions.topic_id', topic_id);
    if (paper_id) query = query.where('questions.paper_id', paper_id);
    if (difficulty) query = query.where('questions.difficulty', difficulty);

    const questions = await query
      .orderBy('questions.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({ questions, limit, offset, count: questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a single question (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Question details }
 *       404: { description: Question not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const question = await db('questions').where({ id: req.params.id }).first();
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get user progress stats
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User progress stats
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const stats = await db('user_stats').where({ user_id: req.user.id });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Record an answer
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question_id, selected_answer, is_correct]
 *             properties:
 *               question_id: { type: 'string', format: 'uuid' }
 *               selected_answer: { type: 'integer' }
 *               is_correct: { type: 'boolean' }
 *               time_taken: { type: 'integer' }
 *     responses:
 *       201:
 *         description: Progress recorded
 */
router.post('/', authRequired, async (req, res) => {
  try {
    const { question_id, selected_answer, is_correct, time_taken } = req.body;

    const [progress] = await db('user_progress').insert({
      user_id: req.user.id,
      question_id,
      selected_answer,
      is_correct,
      time_taken
    }).returning('*');

    const question = await db('questions').where({ id: question_id }).first();
    if (question) {
      const topic = await db('topics').where({ id: question.topic_id }).first();
      if (topic) {
        await db('user_stats')
          .insert({
            user_id: req.user.id,
            subject_id: topic.subject_id,
            total_answered: 1,
            correct_count: is_correct ? 1 : 0,
            last_active: new Date()
          })
          .onConflict(['user_id', 'subject_id'])
          .merge({
            total_answered: db.raw('user_stats.total_answered + 1'),
            correct_count: db.raw('user_stats.correct_count + ?', [is_correct ? 1 : 0]),
            last_active: new Date()
          });
      }
    }

    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/progress/history:
 *   get:
 *     summary: Get answer history
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: 'integer', default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: 'integer', default: 0 }
 *     responses:
 *       200:
 *         description: Answer history
 */
router.get('/history', authRequired, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const history = await db('user_progress')
      .where({ user_id: req.user.id })
      .orderBy('answered_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

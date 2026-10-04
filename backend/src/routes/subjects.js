const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Public, read-only subject catalogue.
 *
 * Writes live in /api/admin behind requireAdmin. Topics are only attached for
 * subjects the student actually takes, which is served by
 * /api/profile/my-subjects.
 */

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: List subjects
 *     description: >
 *       Only MCQ subjects are returned by default, since practical and essay
 *       subjects have nothing to drill. Pass `all=true` to widen the result.
 *       Read-only; content management is under /api/admin.
 *     tags: [Subjects]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [mandatory, basket1, basket2, basket3]
 *       - in: query
 *         name: all
 *         schema: { type: string, default: 'false' }
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/', async (req, res) => {
  try {
    const { category, all } = req.query;

    let query = db('subjects').select('*');
    if (category) query = query.where({ category });
    if (all !== 'true') query = query.where({ is_mcq: true });

    const subjects = await query
      .orderBy('category', 'asc')
      .orderBy('sort_order', 'asc');

    // Catalogue data changes only when an admin edits it.
    res.set('Cache-Control', 'public, max-age=300');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get a subject with its topics and question counts
 *     description: >
 *       Each topic carries a `question_count` so clients can tell a drillable
 *       topic from an empty one without fetching every question.
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Subject with topics
 *       404:
 *         description: Subject not found
 */
router.get('/:id', async (req, res) => {
  try {
    const subject = await db('subjects').where({ id: req.params.id }).first();
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const topics = await db('topics')
      .where({ subject_id: req.params.id })
      .leftJoin('questions', 'questions.topic_id', 'topics.id')
      .groupBy('topics.id')
      .orderBy('topics.sort_order', 'asc')
      .select('topics.*')
      .count({ question_count: 'questions.id' });

    res.json({ ...subject, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
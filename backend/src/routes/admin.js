const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { validate, subjectUpsert, topicUpsert, questionUpsert, questionPatch, paperUpsert } = require('../middleware/validate');

const router = express.Router();

/**
 * Everything below mutates the shared question bank, so every route is
 * behind requireAdmin. GET /api/subjects stays public and read-only.
 */

// ------------------------------------------------------------------
// Subject expectations
// ------------------------------------------------------------------

/**
 * @swagger
 * /api/admin/subjects:
 *   get:
 *     summary: Subject catalogue with content completeness (Admin)
 *     description: >
 *       Includes how many questions each subject actually holds against the
 *       admin's expected_mcq_count, so gaps in the bank are visible.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Subjects with actual vs expected counts }
 *       403: { description: Administrator access required }
 */
router.get('/subjects', requireAdmin, async (req, res) => {
  try {
    const rows = await db('subjects')
      .leftJoin('topics', 'topics.subject_id', 'subjects.id')
      .leftJoin('questions', 'questions.topic_id', 'topics.id')
      .groupBy('subjects.id')
      .orderBy('subjects.category', 'asc')
      .orderBy('subjects.sort_order', 'asc')
      .select('subjects.*')
      .count({ distinct_topics: db.raw('COUNT(DISTINCT topics.id)') })
      .count({ question_count: db.raw('COUNT(questions.id)') });

    res.json(
      rows.map((s) => ({
        ...s,
        question_count: Number(s.question_count) || 0,
        topic_count: Number(s.distinct_topics) || 0,
        // How far the bank is from the admin's target, for the completeness bar.
        completeness:
          s.expected_mcq_count && s.is_mcq
            ? Math.min(
                100,
                Math.round(
                  ((Number(s.question_count) || 0) / s.expected_mcq_count) * 100,
                ),
              )
            : null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/subjects/:id — edit any subject field, incl. the target. */
router.patch(
  '/subjects/:id',
  requireAdmin,
  validate(subjectUpsert.partial()),
  async (req, res) => {
    try {
      const patch = { ...req.body, updated_at: new Date() };

      // A subject with no expected count is treated as having no MCQ paper.
      if (patch.expected_mcq_count === null && patch.is_mcq === undefined) {
        patch.is_mcq = false;
      }

      const [subject] = await db('subjects')
        .where({ id: req.params.id })
        .update(patch)
        .returning('*');

      if (!subject) return res.status(404).json({ error: 'Subject not found' });
      res.json(subject);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ------------------------------------------------------------------
// Topics
// ------------------------------------------------------------------

/** POST /api/admin/topics */
router.post(
  '/topics',
  requireAdmin,
  validate(topicUpsert),
  async (req, res) => {
    try {
      const [topic] = await db('topics').insert(req.body).returning('*');
      res.status(201).json(topic);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/** PATCH /api/admin/topics/:id */
router.patch(
  '/topics/:id',
  requireAdmin,
  validate(topicUpsert.partial().omit({ subject_id: true })),
  async (req, res) => {
    try {
      const [topic] = await db('topics')
        .where({ id: req.params.id })
        .update({ ...req.body, updated_at: new Date() })
        .returning('*');
      if (!topic) return res.status(404).json({ error: 'Topic not found' });
      res.json(topic);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/** DELETE /api/admin/topics/:id — cascades to that topic's questions. */
router.delete('/topics/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db('topics').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Topic not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Questions
// ------------------------------------------------------------------

/**
 * POST /api/admin/questions — supports bulk insert.
 *
 * Bulk import is how the bank actually gets built, so an array is accepted;
 * the whole batch is inserted in one transaction so a single bad row cannot
 * leave a half-imported paper behind.
 */
router.post(
  '/questions',
  requireAdmin,
  async (req, res) => {
    try {
      const body = Array.isArray(req.body) ? { questions: req.body } : req.body;
      const rows = body.questions;

      if (!Array.isArray(rows)) {
        return res.status(400).json({ error: 'questions: must be an array' });
      }
      if (rows.length > 500) {
        return res.status(400).json({ error: 'questions: at most 500 per request' });
      }

      const single = questionUpsert;
      const prepared = [];

      for (let i = 0; i < rows.length; i += 1) {
        const parsed = single.safeParse(rows[i]);
        if (!parsed.success) {
          const issue = parsed.error.issues[0];
          return res.status(400).json({
            error: `questions[${i}].${issue.path.join('.')}: ${issue.message}`,
          });
        }
        const q = parsed.data;
        prepared.push({
          topic_id: q.topic_id,
          paper_id: q.paper_id ?? null,
          question_text_si: q.question_text_si,
          question_text_en: q.question_text_en,
          options: JSON.stringify(q.options),
          correct_answer: q.correct_answer,
          explanation_si: q.explanation_si ?? null,
          explanation_en: q.explanation_en ?? null,
          difficulty: q.difficulty,
          image_url: q.image_url ?? null,
        });
      }

      const inserted = await db.transaction((trx) =>
        trx('questions').insert(prepared).returning('id'),
      );

      res.status(201).json({ inserted: inserted.length, ids: inserted.map((r) => r.id) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/** PATCH /api/admin/questions/:id */
router.patch(
  '/questions/:id',
  requireAdmin,
  validate(questionPatch),
  async (req, res) => {
    try {
      const patch = { ...req.body, updated_at: new Date() };
      if (patch.options) patch.options = JSON.stringify(patch.options);

      // The cross-field rule only applies when both halves are present.
      if (Array.isArray(patch.options) && patch.correct_answer !== undefined) {
        if (patch.correct_answer >= patch.options.length) {
          return res.status(400).json({
            error: 'correct_answer: outside the options range',
          });
        }
      }

      const [question] = await db('questions')
        .where({ id: req.params.id })
        .update(patch)
        .returning('*');

      if (!question) return res.status(404).json({ error: 'Question not found' });
      res.json(question);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/** DELETE /api/admin/questions/:id */
router.delete('/questions/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db('questions').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Question not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/questions/bulk-delete — clears a topic or a whole paper. */
router.post('/questions/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { topic_id, paper_id } = req.body || {};

    if (!topic_id && !paper_id) {
      return res.status(400).json({ error: 'Provide topic_id or paper_id' });
    }

    const deleted = topic_id
      ? await db('questions').where({ topic_id }).del()
      : await db('questions').where({ paper_id }).del();

    res.json({ deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/papers */
router.post(
  '/papers',
  requireAdmin,
  validate(paperUpsert),
  async (req, res) => {
    try {
      const [paper] = await db('past_papers').insert(req.body).returning('*');
      res.status(201).json(paper);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ------------------------------------------------------------------
// Content audit
// ------------------------------------------------------------------

/** GET /api/admin/stats — headline numbers for the admin dashboard. */
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Headline counts for the admin dashboard
 *     description: >
 *       `questions` against `expected_total` shows how much of the planned bank
 *       has actually been entered.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Counts }
 *       403: { description: Administrator access required }
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [[counts]] = await db.raw(`
      SELECT
        (SELECT COUNT(*) FROM subjects)                       AS subjects,
        (SELECT COUNT(*) FROM subjects WHERE is_mcq)          AS mcq_subjects,
        (SELECT COUNT(*) FROM topics)                         AS topics,
        (SELECT COUNT(*) FROM questions)                      AS questions,
        (SELECT COUNT(*) FROM users)                          AS users,
        (SELECT COUNT(*) FROM practice_sessions)              AS sessions,
        (SELECT COALESCE(SUM(expected_mcq_count), 0) FROM subjects WHERE is_mcq)
                                                              AS expected_total
    `);

    res.json({
      ...counts,
      questions: Number(counts.questions),
      expected_total: Number(counts.expected_total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
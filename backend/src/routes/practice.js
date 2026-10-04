const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');
const { validate, startSession, submitAnswer, finishSession } = require('../middleware/validate');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(res, err) {
  return res.status(err.status || 400).json({
    error: err.error || err.message || 'Request failed',
  });
}

/**
 * Shapes a question for a student: text and options only.
 *
 * `correct_answer` and the explanations are deliberately withheld. They are
 * returned only after an answer is submitted, so the answer key never reaches
 * the device and cannot be read out of a proxy or devtools.
 */
function toStudentQuestion(row) {
  return {
    id: row.id,
    question_text_si: row.question_text_si,
    question_text_en: row.question_text_en,
    options: row.options,
    difficulty: row.difficulty,
    image_url: row.image_url,
  };
}

/**
 * POST /api/practice/sessions
 * Starts a session. Freezes the chosen question ids so the attempt stays
 * coherent even if the admin edits the bank mid-session.
 */
/**
 * @swagger
 * /api/practice/sessions:
 *   post:
 *     summary: Start a practice session
 *     description: >
 *       Freezes the chosen question ids so the attempt stays coherent even if
 *       the bank changes mid-session. Length defaults to the subject's
 *       admin-set expected_mcq_count. One active session per student.
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject_id]
 *             properties:
 *               subject_id: { type: string, format: uuid }
 *               topic_id: { type: string, format: uuid, nullable: true }
 *               mode:
 *                 type: string
 *                 enum: [timed, untimed]
 *                 description: timed runs a clock; untimed lets the student set their own pace.
 *               limit: { type: integer, minimum: 1, maximum: 200 }
 *     responses:
 *       201: { description: Session created }
 *       400: { description: Subject has no MCQ paper, or no questions yet }
 *       409: { description: A session is already in progress }
 */
router.post('/sessions', authRequired, validate(startSession), async (req, res) => {
  try {
    const { subject_id, topic_id, mode, limit } = req.body;

    const subject = await db('subjects').where({ id: subject_id }).first();
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    if (!subject.is_mcq) {
      return res.status(400).json({ error: 'This subject has no MCQ paper' });
    }

    // Refuse a second concurrent attempt; the partial index backs this too.
    const active = await db('practice_sessions')
      .where({ user_id: req.user.id, status: 'active' })
      .first();
    if (active) {
      return res.status(409).json({
        error: 'You already have a session in progress',
        session_id: active.id,
      });
    }

    let q;

    if (topic_id) {
      const topic = await db('topics').where({ id: topic_id }).first();
      if (!topic) return res.status(404).json({ error: 'Topic not found' });
      if (topic.subject_id !== subject_id) {
        return res.status(400).json({ error: 'Topic does not belong to that subject' });
      }
      q = db('questions').where({ topic_id });
    } else {
      const topicIds = (await db('topics').where({ subject_id }).pluck('id')).map(
        (r) => r.id,
      );
      if (!topicIds.length) {
        return res.status(400).json({ error: 'This subject has no topics yet' });
      }
      q = db('questions').whereIn('topic_id', topicIds);
    }

    // Default the length to whatever the admin expects for this subject.
    const size = Math.min(
      limit || subject.expected_mcq_count || 40,
      200,
    );

    const rows = await q.select('id').limit(size);

    if (!rows.length) {
      return res.status(400).json({ error: 'No questions available yet' });
    }

    const ids = rows.map((r) => r.id);

    const [session] = await db('practice_sessions')
      .insert({
        user_id: req.user.id,
        subject_id,
        topic_id: topic_id || null,
        mode,
        question_ids: ids,
        total_questions: ids.length,
      })
      .returning('*');

    res.status(201).json({
      session: summarise(session),
      questions: [],
    });
  } catch (err) {
    fail(res, err);
  }
});

/**
 * GET /api/practice/sessions/:id/questions
 * Ordered question list with no answer key. Supports paging so a large paper
 * does not have to arrive in one payload.
 */
/**
 * @swagger
 * /api/practice/sessions/{id}/questions:
 *   get:
 *     summary: List the session's questions
 *     description: >
 *       Question text and options only. `correct_answer` and the explanations
 *       are never included, so the answer key cannot be read from the device
 *       or a proxy. Each item carries the student's prior choice, so
 *       navigating back restores their state.
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Ordered questions without the answer key }
 *       404: { description: Session not found }
 */
router.get('/sessions/:id/questions', authRequired, async (req, res) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ error: 'Malformed session id' });
    }

    const session = await db('practice_sessions')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const answers = await db('practice_answers')
      .where({ session_id: session.id })
      .select('question_id', 'selected_answer');

    const answeredBy = new Map(
      answers.map((a) => [a.question_id, a.selected_answer]),
    );

    const rows = await db('questions')
      .whereIn('id', session.question_ids)
      .select(
        'id',
        'question_text_si',
        'question_text_en',
        'options',
        'difficulty',
        'image_url',
      );

    // Preserve the order the ids were frozen in, not the table's.
    const order = new Map(session.question_ids.map((id, i) => [id, i]));
    rows.sort((a, b) => order.get(a.id) - order.get(b.id));

    res.json({
      session: summarise(session),
      questions: rows.map((row) => ({
        ...toStudentQuestion(row),
        // What the student already chose, so revisiting restores their state.
        selected_answer: answeredBy.has(row.id) ? answeredBy.get(row.id) : null,
      })),
    });
  } catch (err) {
    fail(res, err);
  }
});

/**
 * POST /api/practice/sessions/:id/answers
 * Grades one answer server-side and returns the outcome. Sending
 * `selected_answer: null` records a skip without grading.
 *
 * Re-answering the same question is allowed: the row is upserted, which is
 * what lets a student change their mind and come back later.
 */
/**
 * @swagger
 * /api/practice/sessions/{id}/answers:
 *   post:
 *     summary: Grade one answer
 *     description: >
 *       Grades server-side and releases the answer key in the response. Send
 *       `selected_answer: null` to record a deliberate skip without grading.
 *       Re-posting the same question overwrites the previous choice, which is
 *       what lets a student revisit and change their mind.
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question_id]
 *             properties:
 *               question_id: { type: string, format: uuid }
 *               selected_answer:
 *                 type: integer
 *                 nullable: true
 *                 description: null records a skip.
 *               time_taken: { type: integer, description: Seconds since the session started. }
 *     responses:
 *       200:
 *         description: Outcome plus the correct index and explanation
 *       400: { description: Question not in session, or answer out of range }
 *       409: { description: Session already ended }
 */
router.post(
  '/sessions/:id/answers',
  authRequired,
  validate(submitAnswer),
  async (req, res) => {
    try {
      if (!UUID_RE.test(req.params.id)) {
        return res.status(400).json({ error: 'Malformed session id' });
      }

      const { question_id, selected_answer, time_taken } = req.body;

      const session = await db('practice_sessions')
        .where({ id: req.params.id, user_id: req.user.id })
        .first();
      if (!session) return res.status(404).json({ error: 'Session not found' });
      if (session.status !== 'active') {
        return res.status(409).json({ error: 'This session has already ended' });
      }
      if (!session.question_ids.includes(question_id)) {
        return res.status(400).json({ error: 'That question is not in this session' });
      }

      const question = await db('questions').where({ id: question_id }).first();
      if (!question) return res.status(404).json({ error: 'Question not found' });

      const isSkipped = selected_answer === null;

      if (!isSkipped && selected_answer >= question.options.length) {
        return res.status(400).json({ error: 'Answer is outside the options range' });
      }

      const isCorrect = isSkipped ? null : selected_answer === question.correct_answer;

      await db('practice_answers')
        .insert({
          session_id: session.id,
          question_id,
          selected_answer,
          is_correct: isCorrect,
          time_taken: time_taken ?? null,
        })
        .onConflict(['session_id', 'question_id'])
        .merge({
          selected_answer,
          is_correct: isCorrect,
          time_taken: time_taken ?? null,
          answered_at: new Date(),
        });

      await refreshCounters(session.id);

      res.json({
        is_skipped: isSkipped,
        is_correct: isCorrect,
        // Only now is the key released.
        correct_index: question.correct_answer,
        explanation_si: question.explanation_si,
        explanation_en: question.explanation_en,
      });
    } catch (err) {
      fail(res, err);
    }
  },
);

/**
 * POST /api/practice/sessions/:id/finish
 * The student decides when to stop. Returns the marks.
 */
/**
 * @swagger
 * /api/practice/sessions/{id}/finish:
 *   post:
 *     summary: End the session and receive marks
 *     description: >
 *       The student decides when to stop, so this is idempotent: finishing an
 *       already-finished session returns the stored marks rather than failing.
 *       `abandoned` records an attempt the student cut short, which is kept
 *       separate from `completed` so the two are distinguishable in history.
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               elapsed_seconds: { type: integer }
 *               status:
 *                 type: string
 *                 enum: [completed, abandoned]
 *     responses:
 *       200: { description: Marks and per-question review }
 *       404: { description: Session not found }
 */
router.post(
  '/sessions/:id/finish',
  authRequired,
  validate(finishSession),
  async (req, res) => {
    try {
      if (!UUID_RE.test(req.params.id)) {
        return res.status(400).json({ error: 'Malformed session id' });
      }

      const { elapsed_seconds, status } = req.body;

      const session = await db('practice_sessions')
        .where({ id: req.params.id, user_id: req.user.id })
        .first();
      if (!session) return res.status(404).json({ error: 'Session not found' });

      if (session.status === 'active') {
        await db('practice_sessions')
          .where({ id: session.id })
          .update({
            status,
            ended_at: new Date(),
            elapsed_seconds: elapsed_seconds ?? session.elapsed_seconds,
            updated_at: new Date(),
          });
      }

      await refreshCounters(session.id);
      const final = await db('practice_sessions').where({ id: session.id }).first();

      // Per-question breakdown for the review screen.
      const review = await db('practice_answers')
        .join('questions', 'practice_answers.question_id', 'questions.id')
        .where('practice_answers.session_id', session.id)
        .select(
          'practice_answers.question_id',
          'practice_answers.selected_answer',
          'practice_answers.is_correct',
          'questions.correct_answer',
          'questions.question_text_si',
          'questions.options',
        );

      res.json({ ...marks(final), review });
    } catch (err) {
      fail(res, err);
    }
  },
);

/** GET /api/practice/sessions — recent history. */
/**
 * @swagger
 * /api/practice/sessions:
 *   get:
 *     summary: Recent session history
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { description: Sessions with marks }
 */
router.get('/sessions', authRequired, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const sessions = await db('practice_sessions')
      .where({ user_id: req.user.id })
      .orderBy('started_at', 'desc')
      .limit(limit)
      .select(
        'id',
        'subject_id',
        'topic_id',
        'mode',
        'status',
        'total_questions',
        'answered_count',
        'correct_count',
        'skipped_count',
        'elapsed_seconds',
        'started_at',
        'ended_at',
      );

    res.json(sessions.map(marks));
  } catch (err) {
    fail(res, err);
  }
});

/** Recomputes denormalised counters from the answers table. */
async function refreshCounters(sessionId) {
  const agg = await db('practice_answers')
    .where({ session_id: sessionId })
    .select(
      db.raw('COUNT(*)::int as answered'),
      db.raw('COUNT(*) FILTER (WHERE is_correct)::int as correct'),
      db.raw('COUNT(*) FILTER (WHERE selected_answer IS NULL)::int as skipped'),
    )
    .first();

  await db('practice_sessions')
    .where({ id: sessionId })
    .update({
      answered_count: agg?.answered ?? 0,
      correct_count: agg?.correct ?? 0,
      skipped_count: agg?.skipped ?? 0,
      updated_at: new Date(),
    });
}

function summarise(session) {
  return {
    id: session.id,
    subject_id: session.subject_id,
    topic_id: session.topic_id,
    mode: session.mode,
    status: session.status,
    total_questions: session.total_questions,
    answered_count: session.answered_count,
    correct_count: session.correct_count,
    skipped_count: session.skipped_count,
    started_at: session.started_at,
  };
}

function marks(session) {
  const total = session.total_questions || 0;
  const percentage = total ? Math.round((session.correct_count / total) * 100) : 0;
  return {
    ...summarise(session),
    elapsed_seconds: session.elapsed_seconds,
    ended_at: session.ended_at,
    percentage,
  };
}

module.exports = router;
const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: List questions with filters
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema: { type: 'string', format: 'uuid' }
 *       - in: query
 *         name: topic_id
 *         schema: { type: 'string', format: 'uuid' }
 *       - in: query
 *         name: paper_id
 *         schema: { type: 'string', format: 'uuid' }
 *       - in: query
 *         name: difficulty
 *         schema: { type: 'string', enum: [easy, medium, hard] }
 *       - in: query
 *         name: limit
 *         schema: { type: 'integer', default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: 'integer', default: 0 }
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get('/', async (req, res) => {
  try {
    const { subject_id, topic_id, paper_id, difficulty, limit = 50, offset = 0 } = req.query;

    let query = db('questions')
      .join('topics', 'questions.topic_id', 'topics.id')
      .select('questions.*', 'topics.name_si as topic_name_si', 'topics.name_en as topic_name_en');

    if (subject_id) query = query.where('topics.subject_id', subject_id);
    if (topic_id) query = query.where('questions.topic_id', topic_id);
    if (paper_id) query = query.where('questions.paper_id', paper_id);
    if (difficulty) query = query.where('questions.difficulty', difficulty);

    const questions = await query.limit(parseInt(limit)).offset(parseInt(offset));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a single question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string', format: 'uuid' }
 *     responses:
 *       200:
 *         description: Question details
 *       404:
 *         description: Question not found
 */
router.get('/:id', async (req, res) => {
  try {
    const question = await db('questions').where({ id: req.params.id }).first();
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a question (Admin)
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic_id, question_text_si, question_text_en, options, correct_answer]
 *             properties:
 *               topic_id: { type: 'string', format: 'uuid' }
 *               paper_id: { type: 'string', format: 'uuid' }
 *               question_text_si: { type: 'string' }
 *               question_text_en: { type: 'string' }
 *               options:
 *                 type: 'array'
 *                 items:
 *                   type: 'object'
 *                   properties:
 *                     text_si: { type: 'string' }
 *                     text_en: { type: 'string' }
 *               correct_answer: { type: 'integer' }
 *               explanation_si: { type: 'string' }
 *               explanation_en: { type: 'string' }
 *               difficulty: { type: 'string', enum: [easy, medium, hard] }
 *               image_url: { type: 'string' }
 *     responses:
 *       201:
 *         description: Question created
 */
router.post('/', async (req, res) => {
  try {
    const { topic_id, paper_id, question_text_si, question_text_en, options, correct_answer, explanation_si, explanation_en, difficulty, image_url } = req.body;
    const [question] = await db('questions').insert({
      topic_id, paper_id, question_text_si, question_text_en,
      options: JSON.stringify(options), correct_answer,
      explanation_si, explanation_en, difficulty, image_url
    }).returning('*');
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question (Admin)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string', format: 'uuid' }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic_id: { type: 'string', format: 'uuid' }
 *               question_text_si: { type: 'string' }
 *               question_text_en: { type: 'string' }
 *               options: { type: 'array' }
 *               correct_answer: { type: 'integer' }
 *               explanation_si: { type: 'string' }
 *               explanation_en: { type: 'string' }
 *               difficulty: { type: 'string', enum: [easy, medium, hard] }
 *     responses:
 *       200:
 *         description: Question updated
 *       404:
 *         description: Question not found
 */
router.put('/:id', async (req, res) => {
  try {
    const { topic_id, paper_id, question_text_si, question_text_en, options, correct_answer, explanation_si, explanation_en, difficulty, image_url } = req.body;
    const [question] = await db('questions').where({ id: req.params.id }).update({
      topic_id, paper_id, question_text_si, question_text_en,
      options: options ? JSON.stringify(options) : undefined,
      correct_answer, explanation_si, explanation_en, difficulty, image_url,
      updated_at: new Date()
    }).returning('*');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question (Admin)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string', format: 'uuid' }
 *     responses:
 *       204:
 *         description: Question deleted
 *       404:
 *         description: Question not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('questions').where({ id: req.params.id }).del();
    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

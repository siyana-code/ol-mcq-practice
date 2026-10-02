const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/questions - List questions (with filters)
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

// GET /api/questions/:id - Get single question
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

// POST /api/questions - Create question (admin)
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

// PUT /api/questions/:id - Update question (admin)
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

// DELETE /api/questions/:id - Delete question (admin)
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

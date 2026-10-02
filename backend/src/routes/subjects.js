const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/subjects - List all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await db('subjects').orderBy('sort_order', 'asc');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subjects/:id - Get subject with topics
router.get('/:id', async (req, res) => {
  try {
    const subject = await db('subjects').where({ id: req.params.id }).first();
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const topics = await db('topics').where({ subject_id: req.params.id }).orderBy('sort_order', 'asc');
    res.json({ ...subject, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subjects - Create subject (admin)
router.post('/', async (req, res) => {
  try {
    const { name_si, name_en, icon, sort_order } = req.body;
    const [subject] = await db('subjects').insert({ name_si, name_en, icon, sort_order }).returning('*');
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/subjects/:id - Update subject (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name_si, name_en, icon, sort_order } = req.body;
    const [subject] = await db('subjects').where({ id: req.params.id }).update({ name_si, name_en, icon, sort_order, updated_at: new Date() }).returning('*');
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/subjects/:id - Delete subject (admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('subjects').where({ id: req.params.id }).del();
    if (!deleted) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

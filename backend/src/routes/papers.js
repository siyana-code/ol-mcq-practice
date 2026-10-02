const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/papers - List past papers
router.get('/', async (req, res) => {
  try {
    const { subject_id, year } = req.query;

    let query = db('past_papers').select('*');

    if (subject_id) query = query.where('subject_id', subject_id);
    if (year) query = query.where('year', year);

    const papers = await query.orderBy('year', 'desc');
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/papers/:id - Get paper with questions
router.get('/:id', async (req, res) => {
  try {
    const paper = await db('past_papers').where({ id: req.params.id }).first();
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const questions = await db('questions').where({ paper_id: req.params.id });
    res.json({ ...paper, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/papers - Create past paper (admin)
router.post('/', async (req, res) => {
  try {
    const { subject_id, year, paper_number, title_si, title_en, pdf_url } = req.body;
    const [paper] = await db('past_papers').insert({ subject_id, year, paper_number, title_si, title_en, pdf_url }).returning('*');
    res.status(201).json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

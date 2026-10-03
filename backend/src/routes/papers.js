const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/papers:
 *   get:
 *     summary: List past papers
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema: { type: 'string', format: 'uuid' }
 *       - in: query
 *         name: year
 *         schema: { type: 'integer' }
 *     responses:
 *       200:
 *         description: List of past papers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PastPaper'
 */
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

/**
 * @swagger
 * /api/papers/{id}:
 *   get:
 *     summary: Get paper with questions
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string', format: 'uuid' }
 *     responses:
 *       200:
 *         description: Paper with questions
 *       404:
 *         description: Paper not found
 */
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

/**
 * @swagger
 * /api/papers:
 *   post:
 *     summary: Create a past paper (Admin)
 *     tags: [Papers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject_id, year]
 *             properties:
 *               subject_id: { type: 'string', format: 'uuid' }
 *               year: { type: 'integer' }
 *               paper_number: { type: 'integer' }
 *               title_si: { type: 'string' }
 *               title_en: { type: 'string' }
 *               pdf_url: { type: 'string' }
 *     responses:
 *       201:
 *         description: Paper created
 */
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

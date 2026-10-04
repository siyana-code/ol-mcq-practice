const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Public, read-only past paper metadata. Paper writes live in /api/admin.
 */

/**
 * @swagger
 * /api/papers:
 *   get:
 *     summary: List past papers
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of past papers
 */
router.get('/', async (req, res) => {
  try {
    const { subject_id, year } = req.query;

    let query = db('past_papers').select('*');
    if (subject_id) query = query.where('subject_id', subject_id);
    if (year) query = query.where('year', year);

    const papers = await query.orderBy('year', 'desc');

    res.set('Cache-Control', 'public, max-age=300');
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/papers/{id}:
 *   get:
 *     summary: Get paper metadata
 *     description: >
 *       Question counts only. Question text is served through
 *       /api/practice so the answer key is never delivered here.
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Paper details }
 *       404: { description: Paper not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const paper = await db('past_papers').where({ id: req.params.id }).first();
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const [[{ count }]] = await db('questions')
      .where({ paper_id: req.params.id })
      .count({ count: 'id' });

    res.json({ ...paper, question_count: Number(count) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
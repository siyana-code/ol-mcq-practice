const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: List all subjects
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: List of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 */
router.get('/', async (req, res) => {
  try {
    const subjects = await db('subjects').orderBy('sort_order', 'asc');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject with topics
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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

    const topics = await db('topics').where({ subject_id: req.params.id }).orderBy('sort_order', 'asc');
    res.json({ ...subject, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject (Admin)
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name_si, name_en]
 *             properties:
 *               name_si: { type: 'string' }
 *               name_en: { type: 'string' }
 *               icon: { type: 'string' }
 *               sort_order: { type: 'integer' }
 *     responses:
 *       201:
 *         description: Subject created
 */
router.post('/', async (req, res) => {
  try {
    const { name_si, name_en, icon, sort_order } = req.body;
    const [subject] = await db('subjects').insert({ name_si, name_en, icon, sort_order }).returning('*');
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update a subject (Admin)
 *     tags: [Subjects]
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
 *               name_si: { type: 'string' }
 *               name_en: { type: 'string' }
 *               icon: { type: 'string' }
 *               sort_order: { type: 'integer' }
 *     responses:
 *       200:
 *         description: Subject updated
 *       404:
 *         description: Subject not found
 */
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

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete a subject (Admin)
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string', format: 'uuid' }
 *     responses:
 *       204:
 *         description: Subject deleted
 *       404:
 *         description: Subject not found
 */
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

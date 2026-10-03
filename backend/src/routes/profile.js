const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const MOTHER_LANGUAGES = ['sinhala', 'tamil'];
const RELIGIONS = ['buddhism', 'christianity', 'islam', 'shaivism'];
const BASKETS = [1, 2, 3];

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the student's profile and subject selections
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profile with selected basket subjects }
 *       401: { description: Unauthorized }
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first([
      'id',
      'email',
      'name',
      'mother_language',
      'religion',
      'onboarded_at',
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const picks = await db('user_subjects')
      .join('subjects', 'user_subjects.subject_id', 'subjects.id')
      .where('user_subjects.user_id', req.user.id)
      .select(
        'user_subjects.basket',
        'subjects.id',
        'subjects.name_si',
        'subjects.name_en',
        'subjects.icon',
        'subjects.category',
        'subjects.is_mcq',
      );

    const selections = { basket1: null, basket2: null, basket3: null };
    picks.forEach((p) => {
      if (BASKETS.includes(p.basket)) {
        selections[`basket${p.basket}`] = {
          id: p.id,
          name_si: p.name_si,
          name_en: p.name_en,
          icon: p.icon,
          is_mcq: p.is_mcq,
        };
      }
    });

    const complete =
      !!user.mother_language &&
      !!user.religion &&
      BASKETS.every((b) => !!selections[`basket${b}`]);

    res.json({ ...user, selections, onboarded: !!user.onboarded_at, complete });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update mother language and/or religion
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               mother_language:
 *                 type: string
 *                 enum: [sinhala, tamil]
 *               religion:
 *                 type: string
 *                 enum: [buddhism, christianity, islam, shaivism]
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid value }
 */
router.patch('/', authRequired, async (req, res) => {
  try {
    const { name, mother_language, religion } = req.body;

    if (mother_language && !MOTHER_LANGUAGES.includes(mother_language)) {
      return res.status(400).json({ error: 'Invalid mother_language' });
    }
    if (religion && !RELIGIONS.includes(religion)) {
      return res.status(400).json({ error: 'Invalid religion' });
    }

    const patch = { updated_at: new Date() };
    if (name) patch.name = name;
    if (mother_language) patch.mother_language = mother_language;
    if (religion) patch.religion = religion;

    const [user] = await db('users')
      .where({ id: req.user.id })
      .update(patch)
      .returning(['id', 'email', 'name', 'mother_language', 'religion', 'onboarded_at']);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/profile/subjects:
 *   put:
 *     summary: Replace all basket subject selections
 *     description: >
 *       Accepts exactly one subject per basket. Sending `{ "basket1": "id" }`
 *       alone clears baskets 2 and 3, since a candidate must pick one from each.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               basket1: { type: string, format: uuid }
 *               basket2: { type: string, format: uuid }
 *               basket3: { type: string, format: uuid }
 *     responses:
 *       200: { description: Selections saved }
 *       400: { description: Missing basket, bad category, or duplicate subject }
 */
router.put('/subjects', authRequired, async (req, res) => {
  try {
    const { basket1, basket2, basket3 } = req.body || {};
    const incoming = { 1: basket1, 2: basket2, 3: basket3 };

    const chosen = [];
    for (const basket of BASKETS) {
      const id = incoming[basket];
      if (!id) {
        return res.status(400).json({ error: `A subject is required for basket ${basket}` });
      }
      chosen.push({ basket, id });
    }

    const ids = chosen.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ error: 'Each basket must be a different subject' });
    }

    const subjects = await db('subjects').whereIn('id', ids);
    if (subjects.length !== ids.length) {
      return res.status(400).json({ error: 'Unknown subject id' });
    }

    for (const { basket, id } of chosen) {
      const subject = subjects.find((s) => s.id === id);
      if (subject.category !== `basket${basket}`) {
        return res.status(400).json({
          error: `${subject.name_en} does not belong to basket ${basket}`,
        });
      }
    }

    await db.transaction(async (trx) => {
      await trx('user_subjects').where({ user_id: req.user.id }).del();
      await trx('user_subjects').insert(
        chosen.map((c) => ({ user_id: req.user.id, subject_id: c.id, basket: c.basket }))
      );

      // Only stamp onboarding once identity fields are also present.
      const user = await trx('users').where({ id: req.user.id }).first([
        'mother_language',
        'religion',
        'onboarded_at',
      ]);
      if (!user.onboarded_at && user.mother_language && user.religion) {
        await trx('users')
          .where({ id: req.user.id })
          .update({ onboarded_at: new Date(), updated_at: new Date() });
      }
    });

    res.json({ saved: chosen });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A subject can only be chosen once' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/profile/my-subjects:
 *   get:
 *     summary: Every subject the student should practise
 *     description: >
 *       Mandatory subjects plus the three chosen basket subjects. Requires
 *       authentication so the result reflects the individual candidate.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: The student's subject list }
 *       401: { description: Unauthorized }
 */
router.get('/my-subjects', authRequired, async (req, res) => {
  try {
    const mandatory = await db('subjects')
      .where({ category: 'mandatory' })
      .orderBy('sort_order', 'asc')
      .select('*');

    const picks = await db('user_subjects')
      .join('subjects', 'user_subjects.subject_id', 'subjects.id')
      .where('user_subjects.user_id', req.user.id)
      .orderBy('user_subjects.basket', 'asc')
      .select('subjects.*', 'user_subjects.basket');

    const subjectIds = [...mandatory, ...picks].map((s) => s.id);

    const topics = subjectIds.length
      ? await db('topics').whereIn('subject_id', subjectIds).orderBy('sort_order', 'asc')
      : [];

    const withTopics = [...mandatory, ...picks].map((subject) => ({
      ...subject,
      topics: topics.filter((t) => t.subject_id === subject.id),
    }));

    res.json(withTopics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
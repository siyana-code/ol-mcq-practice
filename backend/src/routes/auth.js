const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const {
  validate,
  register: registerSchema,
  login: loginSchema,
} = require('../middleware/validate');

const router = express.Router();

const MOTHER_LANGUAGES = ['sinhala', 'tamil'];
const RELIGIONS = ['buddhism', 'christianity', 'islam', 'shaivism'];

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new student
 *     description: >
 *       Creates an account. `mother_language` and `religion` are optional at
 *       signup and can be completed later via PATCH /api/profile. A user who
 *       has not picked their basket subjects is considered not onboarded.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               password: { type: string, minLength: 6 }
 *               mother_language:
 *                 type: string
 *                 enum: [sinhala, tamil]
 *               religion:
 *                 type: string
 *                 enum: [buddhism, christianity, islam, shaivism]
 *     responses:
 *       201:
 *         description: Account created
 *       409:
 *         description: Email already registered
 *       400:
 *         description: Invalid mother_language or religion
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, name, password, mother_language, religion } = req.body;

    const existing = await db('users').where({ email }).first();
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ email, name, password_hash, mother_language, religion })
      .returning(['id', 'email', 'name', 'mother_language', 'religion']);

    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mother_language: user.mother_language,
        religion: user.religion,
        onboarded_at: user.onboarded_at,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Unauthorized }
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await db('users').where({ id: decoded.id }).first([
      'id',
      'email',
      'name',
      'avatar_url',
      'mother_language',
      'religion',
      'onboarded_at',
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
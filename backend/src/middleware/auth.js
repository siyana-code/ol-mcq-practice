const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

function readToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

function authRequired(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authOptional(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, config.jwt.secret);
    } catch {
      // Invalid token, but continue as anonymous.
    }
  }
  next();
}

/**
 * Gate for content writes (subjects, topics, questions, papers).
 *
 * Requires `role = 'admin'` on the user row, so revoking access is a single
 * UPDATE rather than a code change. Roles are never read from the JWT: the
 * token is up to a week old, so a stale token must not keep admin rights
 * alive after a downgrade.
 */
function requireAdmin(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;

  db('users')
    .where({ id: decoded.id })
    .first('role')
    .then((row) => {
      if (!row) return res.status(401).json({ error: 'Unknown user' });
      if (row.role !== 'admin') {
        return res.status(403).json({ error: 'Administrator access required' });
      }
      next();
    })
    .catch(() => res.status(500).json({ error: 'Authorization check failed' }));
}

module.exports = { authRequired, authOptional, requireAdmin };
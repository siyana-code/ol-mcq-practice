require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { swaggerUi, specs } = require('./swagger');

const app = express();
const PORT = config.port;

// Behind Render and other proxies, so req.ip reflects the real client and
// rate limiting is not applied to the proxy's shared address.
app.set('trust proxy', 1);

// ------------------------------------------------------------
// Security headers
// ------------------------------------------------------------
app.use(
  helmet({
    // Images and PDFs are served from Supabase/another origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Swagger UI needs inline styles/scripts.
    contentSecurityPolicy: false,
  }),
);

// ------------------------------------------------------------
// CORS
// ------------------------------------------------------------
// Native clients ignore CORS; it exists to protect the admin panel and any
// browser-based client. Unlisted origins get no CORS headers.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: native app, curl, or server-to-server.
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: '256kb' }));

// ------------------------------------------------------------
// Rate limiting
// ------------------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
});

// Tight on credential endpoints to blunt password spraying.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

app.use('/api', apiLimiter);

// ------------------------------------------------------------
// Docs
// ------------------------------------------------------------
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OL MCQ Practice API Docs',
}));

app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// ------------------------------------------------------------
// Routes
// ------------------------------------------------------------
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/admin', require('./routes/admin'));

// ------------------------------------------------------------
// Health
// ------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ------------------------------------------------------------
// Errors
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // CORS rejections surface here; keep them opaque to the caller.
  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  console.error('[error]', req.method, req.originalUrl, err);
  res.status(err.status || 500).json({
    error: err.expose ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${config.env})`);
  console.log(`API docs: http://localhost:${PORT}/api/docs`);
  if (ALLOWED_ORIGINS.length === 0) {
    console.warn('[config] CORS_ORIGINS is empty — browser clients will be blocked.');
  }
});
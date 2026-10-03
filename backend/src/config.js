require('dotenv').config();

/**
 * Central runtime configuration.
 *
 * Every value has a safe default so a missing environment variable degrades
 * into a working dev instance instead of a 500 at the first auth call. In
 * production a missing JWT_SECRET is still logged loudly at boot.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    // Supabase / Render supply a single connection string.
    connectionString: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'insecure_dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

if (config.env === 'production' && !process.env.JWT_SECRET) {
  console.warn(
    '[config] JWT_SECRET is not set. Falling back to an insecure default — ' +
      'set it in the environment before going live.',
  );
}

module.exports = config;
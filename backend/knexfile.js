require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const baseConfig = {
  client: 'pg',
  migrations: { directory: './migrations' },
  seeds: { directory: './seeds' },
  pool: { min: 0, max: 5 },
};

module.exports = {
  development: {
    ...baseConfig,
    connection: connectionString || {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'ol_mcq_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
  },

  production: {
    ...baseConfig,
    connection: connectionString ? {
      connectionString,
      ssl: { rejectUnauthorized: false },
    } : undefined,
  },
};

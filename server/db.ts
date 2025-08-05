import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Connection configuration for local PostgreSQL
const pool = new Pool({
  user: 'bashirmuhammadjibrin',
  host: 'localhost',
  database: 'solestore',
  password: '', // Add your PostgreSQL password if required
  port: 5432,
  // Disable SSL for local development
  ssl: false,
});

// Setup drizzle with schema
export const db = drizzle(pool, { schema });
export default db;

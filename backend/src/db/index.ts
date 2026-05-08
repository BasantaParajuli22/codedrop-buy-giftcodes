import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { DATABASE_URL } from '../config/config.config';


export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

// The `schema` object is important for relations to work
export const db = drizzle(pool, { schema });

// Export pool for session store
export { pool as sessionPool }; 
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();


//use this commands to automatically create tables in postgres db
//enter this command on project root not on src/config

// npx drizzle-kit generate --config=src/config/drizzle.config.ts

// npx drizzle-kit push --config=./src/config/drizzle.config.ts 

export default {
  schema: 'src/db/schema.ts',
  out: './drizzle',
 dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'store',
    password: 'store',
    database: 'store',
    ssl: false
  },
} satisfies Config; 
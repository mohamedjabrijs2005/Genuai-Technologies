import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("Adding active_company_id to assessments...");
    await pool.query(`ALTER TABLE assessments ADD COLUMN IF NOT EXISTS active_company_id INTEGER;`);
    
    console.log("Backfilling active_company_id for existing rows...");
    await pool.query(`UPDATE assessments SET active_company_id = company_ids[1] WHERE active_company_id IS NULL AND array_length(company_ids, 1) > 0;`);
    
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();

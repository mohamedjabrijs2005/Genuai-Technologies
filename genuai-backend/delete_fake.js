const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function main() {
  try {
    const res = await pool.query("DELETE FROM users WHERE role = 'company' AND (name ILIKE '%demo%' OR name ILIKE '%mohamed%')");
    console.log('Deleted rows:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();

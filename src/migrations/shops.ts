import { pool } from "../config/db";

async function createShopsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shops (
      shop_id INTEGER PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      ssl BOOLEAN NOT NULL DEFAULT false,
      plan TEXT NOT NULL DEFAULT 'starter',
      status TEXT NOT NULL DEFAULT 'active',
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'shops';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    shop_id: `ALTER TABLE shops ADD COLUMN shop_id INTEGER PRIMARY KEY`,
    uid: `ALTER TABLE shops ADD COLUMN uid TEXT UNIQUE NOT NULL`,
    ssl: `ALTER TABLE shops ADD COLUMN ssl BOOLEAN NOT NULL DEFAULT false`,
    plan: `ALTER TABLE shops ADD COLUMN plan TEXT NOT NULL DEFAULT 'starter'`,
    status: `ALTER TABLE shops ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    timestamp: `ALTER TABLE shops ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createShopsTable;

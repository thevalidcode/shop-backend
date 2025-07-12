import { pool } from "../config/db";

async function createBlogsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      position INTEGER NOT NULL,
      slug TEXT NOT NULL,
      uid TEXT PRIMARY KEY,
      shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'blogs';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE blogs ADD COLUMN id INTEGER NOT NULL`,
    title: `ALTER TABLE blogs ADD COLUMN title TEXT NOT NULL`,
    content: `ALTER TABLE blogs ADD COLUMN content TEXT NOT NULL`,
    description: `ALTER TABLE blogs ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
    slug: `ALTER TABLE categories ADD COLUMN slug TEXT NOT NULL`,
    status: `ALTER TABLE blogs ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    position: `ALTER TABLE blogs ADD COLUMN position INTEGER NOT NULL`,
    uid: `ALTER TABLE blogs ADD COLUMN uid TEXT PRIMARY KEY`,
    shop_id: `ALTER TABLE blogs ADD COLUMN shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE blogs ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createBlogsTable;

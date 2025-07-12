import { pool } from "../config/db";

async function createCategoriesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      banner_url TEXT,
      icon_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      position INTEGER NOT NULL DEFAULT 1,
      parent_uid TEXT,
      shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'categories';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE categories ADD COLUMN id INTEGER NOT NULL`,
    uid: `ALTER TABLE categories ADD COLUMN uid TEXT PRIMARY KEY`,
    name: `ALTER TABLE categories ADD COLUMN name TEXT NOT NULL`,
    slug: `ALTER TABLE categories ADD COLUMN slug TEXT NOT NULL`,
    description: `ALTER TABLE categories ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
    image_url: `ALTER TABLE categories ADD COLUMN image_url TEXT`,
    banner_url: `ALTER TABLE categories ADD COLUMN banner_url TEXT`,
    icon_url: `ALTER TABLE categories ADD COLUMN icon_url TEXT`,
    status: `ALTER TABLE categories ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    position: `ALTER TABLE categories ADD COLUMN position INTEGER NOT NULL DEFAULT 1`,
    parent_uid: `ALTER TABLE categories ADD COLUMN parent_uid TEXT`,
    shop_id: `ALTER TABLE categories ADD COLUMN shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE categories ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createCategoriesTable;

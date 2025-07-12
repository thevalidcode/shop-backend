import { pool } from "../config/db";

async function createProductTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      min INTEGER NOT NULL DEFAULT 1,
      max INTEGER NOT NULL DEFAULT 1,
      position INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      stock INTEGER NOT NULL DEFAULT 0,
      sku TEXT,
      image_url TEXT,
      gallery_urls TEXT[],
      tags TEXT[],
      is_featured BOOLEAN NOT NULL DEFAULT false,
      brand TEXT,
      weight NUMERIC(10, 2),
      dimensions TEXT,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      compare_price NUMERIC(10, 2),
      discount_type TEXT,
      discount_value NUMERIC(10, 2),
      slug TEXT NOT NULL,
      shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'products';
  `);
  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE products ADD COLUMN id INTEGER NOT NULL`,
    uid: `ALTER TABLE products ADD COLUMN uid TEXT PRIMARY KEY`,
    name: `ALTER TABLE products ADD COLUMN name TEXT NOT NULL`,
    description: `ALTER TABLE products ADD COLUMN description TEXT`,
    category: `ALTER TABLE products ADD COLUMN category TEXT NOT NULL`,
    type: `ALTER TABLE products ADD COLUMN type TEXT NOT NULL`,
    min: `ALTER TABLE products ADD COLUMN min INTEGER NOT NULL DEFAULT 1`,
    max: `ALTER TABLE products ADD COLUMN max INTEGER NOT NULL DEFAULT 1`,
    position: `ALTER TABLE products ADD COLUMN position INTEGER NOT NULL DEFAULT 1`,
    status: `ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    stock: `ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0`,
    sku: `ALTER TABLE products ADD COLUMN sku TEXT`,
    image_url: `ALTER TABLE products ADD COLUMN image_url TEXT`,
    gallery_urls: `ALTER TABLE products ADD COLUMN gallery_urls TEXT[]`,
    tags: `ALTER TABLE products ADD COLUMN tags TEXT[]`,
    is_featured: `ALTER TABLE products ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false`,
    brand: `ALTER TABLE products ADD COLUMN brand TEXT`,
    weight: `ALTER TABLE products ADD COLUMN weight NUMERIC(10, 2)`,
    dimensions: `ALTER TABLE products ADD COLUMN dimensions TEXT`,
    price: `ALTER TABLE products ADD COLUMN price NUMERIC(10, 2) NOT NULL DEFAULT 0.00`,
    compare_price: `ALTER TABLE products ADD COLUMN compare_price NUMERIC(10, 2)`,
    discount_type: `ALTER TABLE products ADD COLUMN discount_type TEXT`,
    discount_value: `ALTER TABLE products ADD COLUMN discount_value NUMERIC(10, 2)`,
    slug: `ALTER TABLE categories ADD COLUMN slug TEXT NOT NULL`,
    shop_id: `ALTER TABLE products ADD COLUMN shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE products ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createProductTable;

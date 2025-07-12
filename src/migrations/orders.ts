import { pool } from "../config/db";

async function createOrdersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      user_uid TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Pending',
      shipping_address TEXT NOT NULL,
      billing_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      tracking_number TEXT,
      estimated_delivery TIMESTAMP,
      delivered_at TIMESTAMP,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'orders';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE orders ADD COLUMN id INTEGER NOT NULL`,
    uid: `ALTER TABLE orders ADD COLUMN uid TEXT PRIMARY KEY`,
    user_uid: `ALTER TABLE orders ADD COLUMN user_uid TEXT NOT NULL`,
    product_id: `ALTER TABLE orders ADD COLUMN product_id INTEGER NOT NULL`,
    price: `ALTER TABLE orders ADD COLUMN price NUMERIC(10, 2) NOT NULL DEFAULT 0`,
    quantity: `ALTER TABLE orders ADD COLUMN quantity INTEGER NOT NULL`,
    currency: `ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'`,
    status: `ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'`,
    shipping_address: `ALTER TABLE orders ADD COLUMN shipping_address TEXT NOT NULL`,
    billing_address: `ALTER TABLE orders ADD COLUMN billing_address TEXT NOT NULL`,
    payment_method: `ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL`,
    tracking_number: `ALTER TABLE orders ADD COLUMN tracking_number TEXT`,
    estimated_delivery: `ALTER TABLE orders ADD COLUMN estimated_delivery TIMESTAMP`,
    delivered_at: `ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP`,
    timestamp: `ALTER TABLE orders ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
    shop_id: `ALTER TABLE orders ADD COLUMN shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createOrdersTable;

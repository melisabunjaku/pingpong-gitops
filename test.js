const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'pingpongdb',
  port: 5432,
});

async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS counter (id SERIAL PRIMARY KEY, count INT)`);
  const result = await pool.query('SELECT * FROM counter');
  if (result.rows.length === 0) {
    await pool.query('INSERT INTO counter (id, count) VALUES (1, 0)');
  }
}


initDB();

app.get('/pingpong', async (req, res) => {
  await pool.query('UPDATE counter SET count = count + 1 WHERE id = 1');
  const result = await pool.query('SELECT count FROM counter WHERE id = 1');
  const count = result.rows[0].count;

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ count });
  }

  res.send(`<html><body><div class="count">🏓 Ping / Pongs: ${count}</div></body></html>`);
});

app.listen(port, () => {
  console.log(`Ping-pong app listening on port ${port}`);
});

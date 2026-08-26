require('dotenv').config();

const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testing_nodejs',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/names', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at AS createdAt FROM persons ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(503).json({ error: 'Unable to load names', message: error.message });
  }
});

app.post('/names', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

  if (!name) {
    return res.status(400).json({ error: 'A non-empty name is required' });
  }

  try {
    const [result] = await pool.execute('INSERT INTO persons (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(503).json({ error: 'Unable to save name', message: error.message });
  }
});

app.get('/db-health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS connected');
    res.json({ status: 'ok', database: rows[0].connected === 1 });
  } catch (error) {
    res.status(503).json({ status: 'error', database: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
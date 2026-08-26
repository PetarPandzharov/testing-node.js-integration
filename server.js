const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const databaseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};
const missingDatabaseConfig = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
  .filter((key) => !process.env[key]);

const pool = mysql.createPool({
  ...databaseConfig,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(['/names', '/db-health'], (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/names', async (req, res) => {
  if (missingDatabaseConfig.length) {
    return res.status(503).json({ error: 'Database configuration is missing', missing: missingDatabaseConfig });
  }

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

  if (missingDatabaseConfig.length) {
    return res.status(503).json({ error: 'Database configuration is missing', missing: missingDatabaseConfig });
  }

  try {
    const [result] = await pool.execute('INSERT INTO persons (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(503).json({ error: 'Unable to save name', message: error.message });
  }
});

app.get('/db-health', async (req, res) => {
  if (missingDatabaseConfig.length) {
    return res.status(503).json({ status: 'error', database: false, missing: missingDatabaseConfig });
  }

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
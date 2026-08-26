require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const names = ['Petar', 'Maria', 'Ivan'];

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

app.get('/', (req, res) => {
  res.json({
    name: 'testing-nodejs-integration',
    message: 'Express and MySQL test application'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/names', (req, res) => {
  res.json(names);
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
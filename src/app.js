require('dotenv').config();

const express = require('express');
const pool = require('./db');
const courseRouter = require('./routes/course');

const app = express();
const port = Number(process.env.APP_PORT || 3000);

app.use(express.json());

app.get('/', (req, res) => 
{
  res.json({ message: 'BESD023 Course API', documentation: '/course/list' });
});

app.get('/health', async (req, res) => 
{
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

app.use('/course', courseRouter);

app.use((req, res) => 
{
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => 
{
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) 
{
  app.listen(port, () => {
    console.log(`BESD023 API listening on port ${port}`);
  });
}

module.exports = app;

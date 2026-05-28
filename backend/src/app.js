const express = require('express');
const cors = require('cors');

const scrapRouter = require('./routes/scrap.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/scraps', scrapRouter);

module.exports = app;

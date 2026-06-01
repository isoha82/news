const express = require('express');
const cors = require('cors');

const newsRouter = require('./routes/news.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/news', newsRouter);

module.exports = app;

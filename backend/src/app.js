const express = require('express');
const cors = require('cors');

const metaRouter = require('./routes/meta.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// meta: countries, categories, feed/status 는 공통 prefix 없이 /api/v1 에 직접 마운트
app.use('/api/v1', metaRouter);

module.exports = app;

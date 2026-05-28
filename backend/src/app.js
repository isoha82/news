const express = require('express');
const cors = require('cors');

const sessionsRouter = require('./routes/sessions.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/sessions', sessionsRouter);

module.exports = app;

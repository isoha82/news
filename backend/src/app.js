const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth.router');

const newsRouter = require('./routes/news.router');

const userRouter = require('./routes/user.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/news', newsRouter);

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/users', userRouter);

module.exports = app;

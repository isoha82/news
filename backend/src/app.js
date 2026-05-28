const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/user.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/users', userRouter);

module.exports = app;

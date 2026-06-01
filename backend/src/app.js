const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// ✅ 추가!
const userRouter = require('./routes/user');
app.use('/api/users', userRouter);

module.exports = app;

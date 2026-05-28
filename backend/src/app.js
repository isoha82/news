const express = require('express');
const cors = require('cors');

const notificationRouter = require('./routes/notification.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/notifications', notificationRouter);

module.exports = app;

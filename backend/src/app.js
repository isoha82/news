const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth.router');

const newsRouter = require('./routes/news.router');

const userRouter = require('./routes/user.router');

const sessionsRouter = require('./routes/sessions.router');

const metaRouter = require('./routes/meta.router');

const adminRouter = require('./routes/admin.router');

const scrapRouter = require('./routes/scrap.router');

const notificationRouter = require('./routes/notification.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/news', newsRouter);

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/sessions', sessionsRouter);
// meta: countries, categories, feed/status 는 공통 prefix 없이 /api/v1 에 직접 마운트
app.use('/api/v1', metaRouter);
app.use('/api/v1/admin', adminRouter);

app.use('/api/v1/scraps', scrapRouter);

app.use('/api/v1/notifications', notificationRouter);

const localAuthRouter = require('./routes/auth');
app.use('/api/auth', localAuthRouter);

module.exports = app;
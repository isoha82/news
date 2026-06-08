const express = require('express');
const cors = require('cors');

// social auth / v1 API 라우터
const socialAuthRouter = require('./routes/auth.router');
const newsRouter = require('./routes/news.router');
const v1UserRouter = require('./routes/user.router');
const sessionsRouter = require('./routes/sessions.router');
const metaRouter = require('./routes/meta.router');
const adminRouter = require('./routes/admin.router');
const scrapRouter = require('./routes/scrap.router');
const notificationRouter = require('./routes/notification.router');

// local auth 라우터 (이메일/비번 기반)
const localAuthRouter = require('./routes/auth');
const localUserRouter = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// /api/v1/* — social/OAuth 기반 전체 API
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/auth', socialAuthRouter);
app.use('/api/v1/users', v1UserRouter);
app.use('/api/v1/sessions', sessionsRouter);
app.use('/api/v1', metaRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/scraps', scrapRouter);
app.use('/api/v1/notifications', notificationRouter);

// /api/* — local 이메일/비번 인증 트랙
app.use('/api/auth', localAuthRouter);
app.use('/api/users', localUserRouter);

module.exports = app;

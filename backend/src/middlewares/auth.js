const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // social auth: payload.userId / local auth: payload.id — 둘 다 지원
    req.user = {
      id: payload.id ?? payload.userId,
      email: payload.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
  }
}

function generateTestToken(userId, email = 'test@example.com') {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { requireAuth, generateTestToken };

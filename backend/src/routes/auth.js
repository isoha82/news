const express = require('express');
const router = express.Router();
const pool = require('../db/index');
const bcrypt = require('bcrypt');

// 회원가입만!
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, provider)
       VALUES ($1, $2, $3, 'local')
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: '회원가입 성공!',
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});
// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });
    }

    const user = result.rows[0];

    if (user.provider !== 'local') {
      return res.status(400).json({ message: `${user.provider}로 가입된 계정입니다.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });
    }

    res.status(200).json({
      message: '로그인 성공!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;


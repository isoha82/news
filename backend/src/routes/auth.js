const express = require('express');
const router = express.Router();
const pool = require('../db/index');
const bcrypt = require('bcrypt');

// POST /api/auth/signup  ← 회원가입 API
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  // 1. 입력값 검증
  if (!email || !password || !username) {
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  }

  try {
    // 2. 이미 가입된 이메일인지 확인
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    // 3. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. DB에 저장
    const newUser = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, hashedPassword, username]
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

module.exports = router;
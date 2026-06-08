const express = require('express');
const router = express.Router();
const pool = require('../db/index');
const { requireAuth } = require('../middlewares/auth');

// 회원정보 수정 (JWT 인증 필요, 본인만 가능)
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, avatar_url } = req.body;

  if (req.user.id !== parseInt(id, 10)) {
    return res.status(403).json({ message: '본인의 정보만 수정할 수 있습니다.' });
  }

  if (!name) {
    return res.status(400).json({ message: '이름을 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3
       RETURNING id, name, email, avatar_url`,
      [name, avatar_url ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      message: '회원정보 수정 성공!',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원탈퇴 (JWT 인증 필요, 본인만 가능)
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== parseInt(id, 10)) {
    return res.status(403).json({ message: '본인 계정만 탈퇴할 수 있습니다.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '회원탈퇴 성공!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

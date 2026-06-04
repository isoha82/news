# 통합 브랜치 — test/integration-all (2026-06-01)

> main을 제외한 전 브랜치를 통합한 검증용 브랜치. 백엔드 13개 + 이메일/비번 인증 트랙 + 프론트엔드 전체.

## 한 줄 요약

`develop`을 base로 신규 분기 → `back/feat/login`·`back/feat/logout` + 프론트엔드 5개 브랜치를 추가 머지. **53개 jest + 15개 pytest 그린**, 로컬 실연(PostgreSQL + mock 시드) 검증 완료.

---

## 통합된 브랜치

### 백엔드 (develop에 이미 머지된 13개)

| PR | 브랜치 | 비고 |
|----|--------|------|
| #7 | back/feat/JWT미들웨어 | Bearer 토큰 검증 |
| #8 | back/feat/뉴스API | GET /news, /:id, /:id/comments |
| #9 | back/feat/세션API | GET /sessions/* |
| #10 | back/feat/메타API | GET /countries, /categories, /feed/status |
| #11 | back/feat/adminAPI | Admin CRUD |
| #12 | back/feat/크롤러DB연동 | psycopg2 + 세션 순환 |
| #13 | back/feat/인증API | 소셜 OAuth (Google/Apple/Kakao) |
| #1 | back/feat/스크랩API | 스크랩 + 폴더 CRUD |
| #2 | back/feat/알림API | 알림 목록·읽음 |
| #3 | back/feat/사용자설정API | GET/DELETE /me, PUT settings/* |
| #4 | back/feat/LLM요약 | gpt-4o-mini, 3줄 요약 |
| #5 | back/feat/트렌드스코어 | comment_count*50 + (6-rank)*100 |
| #6 | back/feat/FCM알림 | Firebase Admin SDK |

### 추가 통합 (test/integration-all에서)

| 브랜치 | 충돌 해결 |
|--------|----------|
| back/feat/login | signup 커밋 포함 (정확히 같은 부모 chain) |
| back/feat/logout | `auth.js`=theirs(슈퍼셋), `app.js`의 `authRouter` 중복 → `localAuthRouter`로 리네임 |
| front/feat/article-detail | App.css/jsx 추가 |
| front/feat/main-home | App.jsx 충돌 → theirs |
| front/feat/my-page | App.css/jsx 추가 |
| front/feat/notification | App.css/jsx 추가 |
| front/feat/scrap-book | App.jsx 충돌 → theirs |
| (이미 흡수) | front/feat/article-comments, main-dashboard, onboarding, user-settings |

---

## 핵심 결정 — 이중 auth 경로

소셜 OAuth 트랙(#13)과 이메일/비번 트랙(login·logout)이 별도로 진행됐기에 **두 라우터를 다른 경로에 마운트**해 병존시켰다.

| 경로 | 라우터 파일 | 인증 방식 | 출처 |
|------|-------------|-----------|------|
| `/api/v1/auth/*` | `backend/src/routes/auth.router.js` | 소셜 OAuth (Google/Apple/Kakao), JWT 발급/갱신, 로그아웃 | PR #13 |
| `/api/auth/*` | `backend/src/routes/auth.js` | 이메일·비번 회원가입/로그인 + JWT 발급, 로그아웃 | back/feat/login·logout |

`backend/src/app.js`의 이중 import 충돌 해결 (`c0045b9`):

```js
// before — 동일 변수명 → SyntaxError
const authRouter = require('./routes/auth.router');
// ... 32 라인 후 ...
const authRouter = require('./routes/auth');  // ❌ 재선언

// after
const authRouter = require('./routes/auth.router');
app.use('/api/v1/auth', authRouter);
// ...
const localAuthRouter = require('./routes/auth');
app.use('/api/auth', localAuthRouter);
```

---

## 통합 검증

```
backend  jest    → Test Suites: 5 passed | Tests: 53 passed ✅
crawler  pytest  → 15 passed (FCM 5 + LLM 4 + trend 6) ✅
frontend vite    → dist/assets: 171KB JS + 17KB CSS ✅
app 부팅          → node -e "require('./src/app')" OK ✅
충돌 마커 잔존     → 0건
```

---

## 로컬 실행 가이드

### 1. PostgreSQL 셋업

```bash
brew install postgresql@16
brew services start postgresql@16
createdb news_db
psql -d news_db -f schema.sql
```

### 2. 환경변수

`backend/.env`:

```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_db
DB_USER=<현재 macOS 사용자>
DB_PASSWORD=
JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
```

### 3. 부팅

```bash
# 백엔드
cd backend && npm install && node server.js     # → http://localhost:4000

# 프론트엔드
cd frontend && npm install && npm run dev       # → http://localhost:5173
```

### 4. 동작 확인 (mock 시드 후)

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/categories
curl http://localhost:4000/api/v1/countries
curl 'http://localhost:4000/api/v1/sessions?country=kr'
curl 'http://localhost:4000/api/v1/news?country=kr'
curl 'http://localhost:4000/api/v1/sessions/latest/articles?country=kr'
```

---

## 후속 작업

- `test/integration-all` PR 생성 → develop으로 머지 검토
- 또는 트랙별 분리 머지: back/feat/login·logout은 별도 인증 정책 결정 후 develop으로
- main은 별도 정책 — 사용자 명시 지시 시에만 변경

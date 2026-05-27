## 프로젝트 개요

뉴스 세션 크롤러는 한국(Naver News), 미국(CNN), 일본(야후재팬)에서 5시간마다 자동으로 뉴스를 수집하여 분야별·국가별 세션으로 보관하는 서비스입니다. 각 세션당 상위 5개 기사를 저장하고, 분야×국가 조합별로 최대 6세션(최대 보관 기간 30시간)을 유지하여 최신성 높은 뉴스 요약·검색·알림 기능을 제공하는 것을 목표로 합니다.

## 핵심 요구사항

- 수집 주기: 5시간마다 자동 크롤링
- 수집 대상국: 한국 (Naver News), 미국 (CNN), 일본 (야후재팬)
- 분야(6개): 정치, 경제, 사회, 기술/IT, 스포츠, 연예/문화
- 세션 보관: 분야×국가 조합당 최대 6세션 유지(오래된 세션 자동 삭제)
- 보관 기간: 최대 30시간(6세션 × 5시간)
- 기사 수: 세션당 상위 5개 기사 저장

## 데이터 모델(요약)

- Country
	- id: int (PK)
	- code: string (KR / US / JP)
	- name: string (한국 / 미국 / 일본)
	- source_name: string (네이버 / CNN / 야후재팬)
	- source_base_url: string

- Category
	- id: int (PK)
	- name_ko: string (정치 / 경제 / 사회 / 기술IT / 스포츠 / 연예)
	- name_en: string (politics / economy / society / tech / sports / entertainment)
	- slug: string

- Session
	- id: int (PK)
	- country_id: int (FK → Country)
	- category_id: int (FK → Category)
	- period_start: datetime (수집 기간 시작)
	- period_end: datetime (수집 기간 종료, start + 5h)
	- collected_at: datetime (크롤링 완료 시각)
	- status: string (pending / completed / failed)
	- session_order: int (1–6, 초과 시 가장 오래된 세션 삭제)

- Article (세션에 포함되는 메타)
	- id: int (PK)
	- session_id: int (FK → Session)
	- title: string (기사 제목)
	- original_url: string (원문 URL; 원문은 저장하지 않음)
	- summary: text (AI 요약 결과)
	- rank: int (세션 내 순위, 1–5)
	- thumbnail_url: string (선택)
	- trend_score: int (조회수·공유수 기반 점수)
	- published_at: datetime (기사 원문 발행 시각)
	- created_at: datetime

- CrawlLog (크롤링 이력)
	- id: int (PK)
	- country_id: int (FK → Country)
	- category_id: int (FK → Category)
	- started_at: datetime
	- finished_at: datetime
	- status: string (success / failed / partial)
	- error_message: text (선택)
	- articles_collected: int

## 세션/보관 규칙

- 세션 식별: `country_id` + `category_id` 조합으로 관리, `session_order`(1–6)로 순서 추적
- 각 분야×국가 조합은 최대 6세션 유지. 새 세션 생성 시 `session_order`가 6을 초과하면 가장 오래된 세션(및 연결된 Article) 삭제
- 세션당 상위 5개 기사만 저장(중복 검사 및 정렬 기준: 최신성, 노출량 등 확장 가능)
- 원문은 저장하지 않고 `original_url`로 참조. 기사 본문은 요약(및 선택적 번역)만 저장

## 추가/확장 기능 (우선순위 제안)

1. 댓글 수집: 원문 페이지의 댓글을 하위 엔티티로 수집(수집 범위 및 개인정보 검토 필요)
2. 업데이트 알림: 관심 키워드 또는 특정 세션 생성 시 푸시/메일 알림 발송
3. 스크랩(즐겨찾기): 사용자가 기사 스크랩/저장 가능
4. 테마: UI 라이트/다크 모드
5. 요약·번역: 수집 후 자동 요약 → 필요시 번역(한국어↔영어↔일본어)

## 아키텍처 개요

- Scheduler: 5시간 주기 트리거 (cron, 또는 분산 작업 스케줄러)
- Crawler/Parser: 사이트별 파서 모듈(Naver, CNN, Yahoo Japan) — RSS 우선, HTML 파싱 백업
- Worker Pipeline: 수집 → 요약 → 번역(선택) → 저장
- Storage: PostgreSQL (세션/기사 메타 관계형 저장, 오래된 세션 자동 삭제 트리거)
- API: Node.js 기반 REST API (세션 및 기사 조회, 스크랩, 알림 관리)
- Frontend: React 기반 대시보드(관리자) 및 사용자 뷰(테마·스크랩·알림)
- Monitoring: 크롤링 실패·스키마 변경 감지·작업 지연 모니터링

## 개발 및 운영 고려사항

- 사이트별 요청 한도 및 robots 규정 준수
- 중복 기사 처리(해시 또는 유사도 검사)
- 국제화: 인코딩, 날짜/시간 로케일 처리
- 법적·윤리적 검토: 댓글 등 민감 정보 수집 시 준수사항 확인
- 로그 및 실패 재시도 정책

## 빠른 시작(개발자 안내)

1. 레포 클론

```bash
git clone <repo-url>
cd news
```

2. 환경 설정 및 의존성 설치

```bash
# Python 크롤러
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Node.js 백엔드
cd backend && npm install

# React 프론트엔드
cd frontend && npm install
```

3. PostgreSQL 데이터베이스 설정

```bash
createdb news_db
psql news_db < schema.sql
```

4. 초기 크롤러 실행(로컬 테스트용)

```bash
python scripts/run_crawler.py --target KR --category politics --limit 5
```

## 사용 사례 및 다음 단계

- 정기 수집으로 최신 이슈 요약·검색 제공
- 관심 키워드 기반 알림 서비스 연계
- 사용자 맞춤형 피드(스크랩·선호 분야) 제공

다음 단계 제안: PostgreSQL 스키마 작성, Node.js API 스펙 상세화, 사이트별 파서 템플릿 작성, 요약·번역 파이프라인 PoC 구현

## 기여

- 기여 방법: 풀 리퀘스트, 이슈 등록
- 코드 스타일과 테스트 요구사항은 CONTRIBUTING.md에 따름(추후 추가)

---

프로젝트 관련 제안이나 추가할 항목이 있으면 알려주세요. 원하시면 이 README를 더 자세한 설치/운영 가이드로 확장하겠습니다.
# news
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. API로 받아올 데이터를 저장할 상태(State) 선언
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. 사용자가 선택할 필터 상태
  const [selectedCountry, setSelectedCountry] = useState('KR'); // KR, US, JP
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 3. 백엔드 세션 최신 기사 API 호출 함수
  const fetchLatestArticles = async () => {
    try {
      setLoading(true);
      
      // 노션에 기재된 [앱 하단 탭 네비게이션 - 홈] 연결 API 엔드포인트
      const response = await fetch('/api/v1/sessions/latest/articles');
      
      if (!response.ok) {
        throw new Error('최신 뉴스 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setArticles(data); // 백엔드가 준 JSON 배열을 상태에 주입
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. 컴포넌트가 처음 켜질 때 자동으로 API 호출 실행
  useEffect(() => {
    fetchLatestArticles();
  }, []);

  return (
    <div className="mobile-container">
      {/* 상단 헤더 바 */}
      <header className="header">
        <button className="menu-btn">☰</button>
        <h1 className="logo">뉴스브리프</h1>
        <button className="alert-btn">🔔<span className="badge">3</span></button>
      </header>

      {/* 국가 선택 탭 (피그마 상단 UI 디자인 적용) */}
      <div className="country-tabs">
        <button className={selectedCountry === 'KR' ? 'active' : ''} onClick={() => setSelectedCountry('KR')}>🇰🇷 한국</button>
        <button className={selectedCountry === 'US' ? 'active' : ''} onClick={() => setSelectedCountry('US')}>🇺🇸 미국</button>
        <button className={selectedCountry === 'JP' ? 'active' : ''} onClick={() => setSelectedCountry('JP')}>🇯🇵 일본</button>
      </div>

      {/* 크롤링 상태 표시 바 */}
      <div className="status-bar">
        🟢 크롤 완료 · 다음 세션까지 <span>대기 중</span>
      </div>

      {/* 메인 브리핑 영역 */}
      <main className="content">
        <h2 className="section-title">오늘의 브리핑</h2>
        
        {/* 카테고리 가로 스크롤 메뉴 */}
        <div className="category-scroll">
          {['전체', '정치', '경제', '사회', '기술·IT', '스포츠'].map((cat) => (
            <button 
              key={cat} 
              className={selectedCategory === cat ? 'cat-active' : ''}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 세션 타임라인 영역 */}
        <div className="session-timeline">
          <div className="timeline-title">최신 세션 타임라인 <span>스와이프 →</span></div>
          <div className="time-chips">
            <button className="time-chip">이전 세션</button>
            <button className="time-chip active-time">최신 세션</button>
          </div>
        </div>

        {/* 5. API 데이터 렌더링 및 예외 처리 조건문 */}
        {loading && <div className="loading-view">🔄 최신 브리핑을 생성하고 있습니다...</div>}
        {error && <div className="error-view">⚠️ {error} (백엔드 서버 연동 전입니다)</div>}
        
        {!loading && !error && (
          <div className="news-list">
            {articles.length === 0 ? (
              <div className="empty-view">조회된 뉴스 기사가 없습니다.</div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="news-card">
                  <div className="card-meta">
                    <span className="badge-tag">{article.category || '기술·IT'}</span>
                    <span className="media-name">{article.media || '언론사'} · {article.rank || 1}위</span>
                  </div>
                  <h3 className="news-title">{article.title || '기사 제목이 표시되는 영역입니다.'}</h3>
                  
                  {/* 백엔드 gpt-4o-mini가 요약해 준 3줄 요약 배열 출력단 */}
                  <ul className="news-bullets">
                    {article.bullets && article.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                    {!article.bullets && <li>AI 요약 핵심 내용을 불러오는 중입니다.</li>}
                  </ul>
                  
                  <div className="card-footer">
                    <button className="action-btn">📄 원문</button>
                    <button className="action-btn">💬 {article.comment_count || 0}</button>
                    <button className="bookmark-btn">🔖</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button className="more-btn">기사 더보기 ↓</button>
      </main>

      {/* 앱 하단 고정 네비게이션 바 (피그마 최하단 매핑) */}
      <nav className="bottom-nav">
        <button className="nav-item active-nav">🏠<br/>홈</button>
        <button className="nav-item">🗂️<br/>스크랩</button>
        <button className="nav-item">🔔<br/>알림</button>
        <button className="nav-item">⚙️<br/>설정</button>
      </nav>
    </div>
  );
}

export default App;
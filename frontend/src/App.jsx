import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달창 열림/닫힘 및 선택된 기사 관리 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // 모달 내부 외신 원문 아코디언 접고 펴는 상태
  const [showOriginal, setShowOriginal] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('KR');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const fetchLatestArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/sessions/latest/articles');
      if (!response.ok) throw new Error('데이터 로드 실패');
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      // 서버 연동 전 화면 확인을 위한 더미 데이터 주입
      setArticles([
        {
          id: 1,
          category: '기술·IT',
          media: 'TechCrunch',
          rank: 1,
          title: '오픈AI, 차세대 추론 모델 gpt-5 대규모 업데이트 발표',
          bullets: [
            '기존 모델 대비 복잡한 수학 및 코딩 추론 능력이 45% 향상되었습니다.',
            '아시아권 언어 최적화를 통해 한국어 텍스트 처리 속도가 2배 빨라졌습니다.',
            '내달 초 개발자 API를 시작으로 글로벌 전역에 순차 배포될 예정입니다.'
          ],
          content_translated: '오픈AI가 오늘 인공지능 역사에 새로운 획을 그을 차세대 거대언어모델(LLM)인 gpt-5의 세부 명세를 전격 공개했습니다. 이번 모델은 단순 문장 생성을 넘어 인간 수준의 복잡한 추론 로직을 수행할 수 있도록 설계된 것이 가장 큰 특징입니다...',
          content_original: 'OpenAI today officially unveiled the detailed specifications of its next-generation large language model, gpt-5, marking a significant milestone in AI history. The defining characteristic of this model is its capability to execute complex reasoning logics...',
          comment_count: 14
        }
      ]);
      setError(null); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const openArticleDetail = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    setShowOriginal(false); // 모달 열릴 때 아코디언은 항상 닫힌 상태로 시작
  };

  return (
    <div className="mobile-container">
      <header className="header">
        <button className="menu-btn">☰</button>
        <h1 className="logo">뉴스브리프</h1>
        <button className="alert-btn">🔔<span className="badge">3</span></button>
      </header>

      <div className="country-tabs">
        <button className={selectedCountry === 'KR' ? 'active' : ''} onClick={() => setSelectedCountry('KR')}>🇰🇷 한국</button>
        <button className={selectedCountry === 'US' ? 'active' : ''} onClick={() => setSelectedCountry('US')}>🇺🇸 미국</button>
        <button className={selectedCountry === 'JP' ? 'active' : ''} onClick={() => setSelectedCountry('JP')}>🇯🇵 일본</button>
      </div>

      <div className="status-bar">
        🟢 크롤 완료 · 다음 세션까지 <span>대기 중</span>
      </div>

      <main className="content">
        <h2 className="section-title">오늘의 브리핑</h2>
        
        <div className="category-scroll">
          {['전체', '정치', '경제', '사회', '기술·IT', '스포츠'].map((cat) => (
            <button key={cat} className={selectedCategory === cat ? 'cat-active' : ''} onClick={() => setSelectedCategory(cat)}>{cat}</button>
          ))}
        </div>

        <div className="news-list">
          {articles.map((article) => (
            <div key={article.id} className="news-card click-effect" onClick={() => openArticleDetail(article)}>
              <div className="card-meta">
                <span className="badge-tag">{article.category}</span>
                <span className="media-name">{article.media} · {article.rank}위</span>
              </div>
              <h3 className="news-title">{article.title}</h3>
              <ul className="news-bullets">
                {article.bullets.map((bullet, idx) => <li key={idx}>{bullet}</li>)}
              </ul>
              <div className="card-footer">
                <button className="action-btn">📄 원문 보기</button>
                <button className="action-btn">💬 {article.comment_count}</button>
                <button className="bookmark-btn" onClick={(e) => e.stopPropagation()}>🔖</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 기사 상세 보기 모달 창 UI */}
      {isModalOpen && selectedArticle && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <span className="modal-meta">{selectedArticle.media} · {selectedArticle.category}</span>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </header>

            <div className="modal-scroll-area">
              <h2 className="modal-title">{selectedArticle.title}</h2>

              {/* AI 핵심 3줄 요약 하이라이트 박스 */}
              <div className="ai-summary-box">
                <div className="ai-badge">✨ AI 핵심 3줄 요약</div>
                <ul className="ai-bullets">
                  {selectedArticle.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>

              {/* 번역된 한국어 본문 */}
              <div className="article-body">
                <h4 className="body-sub-title">🇰🇷 한국어 번역 본문</h4>
                <p className="body-text">{selectedArticle.content_translated}</p>
              </div>

              {/* 외신 원문 아코디언 */}
              <div className="accordion-section">
                <button className="accordion-trigger" onClick={() => setShowOriginal(!showOriginal)}>
                  {showOriginal ? '🔼 외신 원문 접기' : '🔽 외신 원문 보기 (English / 日本語)'}
                </button>
                {showOriginal && (
                  <div className="accordion-content">
                    <p className="body-text original-text">{selectedArticle.content_original}</p>
                  </div>
                )}
              </div>
            </div>

            <footer className="modal-footer">
              <button className="modal-action-btn">💬 댓글 {selectedArticle.comment_count}개 전체보기</button>
              <button className="modal-bookmark-btn">🔖 스크랩하기</button>
            </footer>
          </div>
        </div>
      )}

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
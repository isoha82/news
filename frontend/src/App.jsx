import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ----------------------------------------------------
  // [신규 추가] 현재 어떤 탭(화면)을 보여줄지 결정하는 스위치
  // 'home' = 메인 뉴스 브리핑, 'scrap' = 내 스크랩북
  // ----------------------------------------------------
  const [currentTab, setCurrentTab] = useState('home');

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

  // ----------------------------------------------------
  // [신규 추가] 스크랩북 전용 가짜 데이터 및 함수들
  // ----------------------------------------------------
  const [folders, setFolders] = useState([
    { id: 1, name: '미국 증시 이슈' },
    { id: 2, name: 'AI 기술 뉴스' },
    { id: 3, name: '반도체 트렌드' }
  ]);

  const [scraps, setScraps] = useState([
    { id: 101, title: '엔비디아 신형 칩 발표, 주가 시간외 5% 상승', source: '로이터', date: '2026-05-30', category: '기술·IT', comment_count: 5 },
    { id: 102, title: 'OpenAI, 차세대 대규모 언어모델 학습 시작', source: '테크크런치', date: '2026-05-29', category: '기술·IT', comment_count: 2 }
  ]);

  const addFolder = () => {
    const folderName = prompt('새 폴더 이름을 입력하세요:');
    if (folderName) {
      setFolders([...folders, { id: Date.now(), name: folderName }]);
    }
  };
  // ----------------------------------------------------

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
      {/* 상단 헤더 영역 */}
      <header className="header">
        <button className="menu-btn">☰</button>
        <h1 className="logo">{currentTab === 'home' ? '뉴스브리프' : '내 스크랩북'}</h1>
        <button className="alert-btn">🔔<span className="badge">3</span></button>
      </header>

      {/* ---------------------------------------------------- */}
      // [1번 화면] 홈(뉴스 브리핑) 탭일 때 보여줄 내용 (어제 코드 전체)
      {/* ---------------------------------------------------- */}
      {currentTab === 'home' && (
        <>
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
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* [2번 화면] 스크랩 탭일 때 보여줄 내용 (피그마 디자인 반영) */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'scrap' && (
        <main className="content" style={{ paddingBottom: '80px', paddingTop: '10px' }}>
          
          {/* 타이틀 및 저장 개수 */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>내 스크랩</h2>
            <span style={{ fontSize: '13px', color: '#888' }}>{scraps.length + 40}개 저장됨</span>
          </div>

          {/* 폴더 섹션 */}
          <div style={{ marginBottom: '30px' }}>
            <span style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px' }}>폴더</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {/* 기존 폴더들 (피그마 스타일로 세로 정렬 및 큰 숫자 반영) */}
              {folders.map((folder, idx) => {
                // 피그마에 있는 숫자 비슷하게 매칭 (18, 12, 8...)
                const counts = [18, 12, 8];
                const count = counts[idx] || 0;
                const icons = ['🔮', '🏦', '🎨'];
                const icon = icons[idx] || '📁';

                return (
                  <div key={folder.id} className="click-effect" style={{ background: '#1e1e1e', padding: '16px', borderRadius: '16px', border: '1px solid #2d2d2d', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '90px', position: 'relative' }}>
                    <div style={{ fontSize: '18px' }}>{icon}</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#eee', marginTop: '12px' }}>{folder.name}</span>
                    <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{count}</span>
                  </div>
                );
              })}

              {/* [피그ma 반영] 격자 안에 예쁘게 들어간 '+ 새 폴더' 버튼 */}
              <div onClick={addFolder} className="click-effect" style={{ background: '#1a1a1a', padding: '16px', borderRadius: '16px', border: '1px dashed #444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', cursor: 'pointer' }}>
                <span style={{ fontSize: '20px', color: '#888', marginBottom: '4px' }}>+</span>
                <span style={{ fontSize: '13px', color: '#888' }}>새 폴더</span>
              </div>
            </div>
          </div>

          {/* 스크랩된 기사 리스트 세션 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>AI-반도체 <span style={{ color: '#888', fontWeight: 'normal', fontSize: '13px' }}>18개</span></span>
              <span style={{ fontSize: '12px', color: '#888', cursor: 'pointer' }}>최신순 ▼</span>
            </div>

            <div className="news-list">
              {scraps.map((scrap) => (
                <div key={scrap.id} className="news-card click-effect">
                  <div className="card-meta">
                    <span className="badge-tag">{scrap.category}</span>
                    <span className="media-name">{scrap.source} · {scrap.date}</span>
                  </div>
                  <h3 className="news-title" style={{ marginBottom: '0px' }}>{scrap.title}</h3>
                  <div className="card-footer" style={{ marginTop: '10px' }}>
                    <button className="action-btn">💬 {scrap.comment_count}</button>
                    <button className="bookmark-btn" style={{ color: '#4caf50' }}>🔖</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* 하단 네비게이션 바 (버튼 클릭 시 화면 스위칭 기능 추가) */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentTab === 'home' ? 'active-nav' : ''}`} 
          onClick={() => setCurrentTab('home')}
        >
          🏠<br/>홈
        </button>
        <button 
          className={`nav-item ${currentTab === 'scrap' ? 'active-nav' : ''}`} 
          onClick={() => setCurrentTab('scrap')}
        >
          🗂️<br/>스크랩
        </button>
        <button className="nav-item">🔔<br/>알림</button>
        <button className="nav-item">⚙️<br/>설정</button>
      </nav>
    </div>
  );
}

export default App;
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [view, setView] = useState('onboarding'); 
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [selectedArticle, setSelectedArticle] = useState(null); 

  // --- [온보딩 상태 관리] ---
  const [selectedCountries, setSelectedCountries] = useState({ kr: true, us: true, jp: false });
  const [selectedCategories, setSelectedCategories] = useState({ it: true, economy: true, politics: false, society: false, sports: false, entertainment: false });
  const toggleCountry = (key) => setSelectedCountries(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCategory = (key) => setSelectedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  const isAnyCountrySelected = Object.values(selectedCountries).some(val => val === true);
  const isAnyCategorySelected = Object.values(selectedCategories).some(val => val === true);

  // 스마트폰 화면 밖(body)까지 다크모드 배경색 연동
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-body');
    } else {
      document.body.classList.remove('dark-body');
    }
  }, [isDarkMode]);

  return (
    <div className={`app-global-layout ${isDarkMode ? 'dark-mode-app' : ''}`}>
      
      {/* STEP 1: 소셜 로그인 */}
      {view === 'onboarding' && (
        <div className="onboarding-center-box">
          <div className="step-indicator">STEP 1 / 4</div>
          <div className="app-brand-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#1C1C1E"/>
              <path d="M7 8h10M7 12h10M7 16h7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="brand-heading">뉴스브리프</h1>
          <p className="brand-description">AI가 5시간마다 자동으로 요약해주는<br />3개국 주요 뉴스</p>
          
          <div className="auth-button-group">
            <button className="social-login-btn google-btn" onClick={() => setView('step2')}>
              <span className="icon">G</span> Google로 계속하기
            </button>
            <button className="social-login-btn apple-btn" onClick={() => setView('step2')}>
              <span className="icon"></span> Apple로 계속하기
            </button>
            <button className="social-login-btn kakao-btn" onClick={() => setView('step2')}>
              <span className="icon">💬</span> 카카오로 시작하기
            </button>
          </div>
          <p className="terms-notice">계속하면 <span className="underline">이용약관</span>과 <span className="underline">개인정보처리방침</span>에<br />동의하는 것으로 간주됩니다</p>
        </div>
      )}

      {/* STEP 2: 국가 선택 */}
      {view === 'step2' && (
        <div className="onboarding-center-box">
          <div className="step-progress-bar"><div className="progress-fill" style={{ width: '25%' }}></div></div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 2 / 4</div>
          <h2 className="step-main-title">어떤 나라 뉴스를 볼까요?</h2>
          <p className="step-sub-title">최소 1개 이상 선택해주세요</p>
          <div className="selection-list">
            <div className={`selection-card ${selectedCountries.kr ? 'is-selected' : 'is-unselected'}`} onClick={() => toggleCountry('kr')}>
              <div className="card-left"><span>🇰🇷</span> <strong>한국</strong> <small>네이버 뉴스</small></div>
              <input type="checkbox" checked={selectedCountries.kr} readOnly />
            </div>
            <div className={`selection-card ${selectedCountries.us ? 'is-selected' : 'is-unselected'}`} onClick={() => toggleCountry('us')}>
              <div className="card-left"><span>🇺🇸</span> <strong>미국</strong> <small>CNN</small></div>
              <input type="checkbox" checked={selectedCountries.us} readOnly />
            </div>
            <div className={`selection-card ${selectedCountries.jp ? 'is-selected' : 'is-unselected'}`} onClick={() => toggleCountry('jp')}>
              <div className="card-left"><span>🇯🇵</span> <strong>일본</strong> <small>야후재팬</small></div>
              <input type="checkbox" checked={selectedCountries.jp} readOnly />
            </div>
          </div>
          <div className="navigation-actions">
            <button className="back-nav-btn" onClick={() => setView('onboarding')}>이전</button>
            <button className={`forward-nav-btn ${!isAnyCountrySelected ? 'is-disabled' : ''}`} onClick={() => isAnyCountrySelected && setView('step3')}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 3: 관심 카테고리 */}
      {view === 'step3' && (
        <div className="onboarding-center-box">
          <div className="step-progress-bar"><div className="progress-fill" style={{ width: '50%' }}></div></div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 3 / 4</div>
          <h2 className="step-main-title">관심 카테고리</h2>
          <p className="step-sub-title">선택한 분야 위주로 보여드려요</p>
          <div className="category-matrix-grid">
            {[['it', '💻 기술·IT'], ['economy', '💰 경제'], ['politics', '🏛️ 정치'], ['society', '👥 사회'], ['sports', '⚽ 스포츠'], ['entertainment', '🎬 연예·문화']].map(([key, text]) => (
              <div key={key} className={`matrix-item ${selectedCategories[key] ? 'is-selected' : 'is-unselected'}`} onClick={() => toggleCategory(key)}>
                {text.split(' ')[0]}<br /><span>{text.split(' ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="navigation-actions">
            <button className="back-nav-btn" onClick={() => setView('step2')}>이전</button>
            <button className={`forward-nav-btn ${!isAnyCategorySelected ? 'is-disabled' : ''}`} onClick={() => isAnyCategorySelected && setView('step4')}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 4: 알림 설정 */}
      {view === 'step4' && (
        <div className="onboarding-center-box">
          <div className="step-progress-bar"><div className="progress-fill" style={{ width: '100%' }}></div></div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 4 / 4</div>
          <h2 className="step-main-title">알림 받을게요?</h2>
          <p className="step-sub-title">언제든 설정에서 변경할 수 있어요</p>
          
          <div className="toggle-option-list">
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>새 세션 도착</strong><br /><small>5시간마다 알림</small></div>
              <label className="switch-input-label">
                <input type="checkbox" defaultChecked />
                <span className="slider-round"></span>
              </label>
            </div>
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>관심 핫이슈</strong><br /><small>반복 등장 키워드</small></div>
              <label className="switch-input-label">
                <input type="checkbox" defaultChecked />
                <span className="slider-round"></span>
              </label>
            </div>
          </div>

          <div className="navigation-actions">
            <button className="back-nav-btn" onClick={() => setView('step3')}>이전</button>
            <button className="onboarding-finish-btn" onClick={() => setView('home')}>시작하기</button>
          </div>
        </div>
      )}

      {/* 🏠 오늘의 브리핑 홈 화면 */}
      {view === 'home' && (
        <HomeTimelineView 
          onArticleClick={(article) => setSelectedArticle(article)} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
        />
      )}

      {/* 💬 기사 요약 상세 팝업 모달 */}
      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  );
}

// 🏠 홈 타임라인 컴포넌트
function HomeTimelineView({ onArticleClick, isDarkMode, setIsDarkMode }) {
  const [currentCountry, setCurrentCountry] = useState('kr');
  const [currentCat, setCurrentCat] = useState('all');

  const articles = [
    { id: 1, rank: 1, category: '기술·IT', source: '네이버 뉴스', title: '반도체 수출 3개월 연속 증가, AI 수요가 견인', bullets: ['5월 반도체 수출액 전년 대비 18% 증가', 'HBM 등 AI용 메모리가 성장 주도'], replies: 142 },
    { id: 2, rank: 2, category: '경제', source: '네이버 뉴스', title: '한은 기준금리 동결, 시장 예상 부합', bullets: ['금통위 만장일치로 2.75% 유지 결정', '물가 안정세 지속이라고 판단'], replies: 87 },
    { id: 3, rank: 3, category: '정치', source: '네이버 뉴스', title: '국회 본회의서 민생법안 7건 통과', bullets: ['소상공인 지원법 개정안 등 여야 합의 처리', '주거안정 관련 법안도 함께 의결'], replies: 312 },
  ];

  return (
    <div className="home-container">
      {/* 피그마 규격 맞춤 콤팩트 헤더 */}
      <div className="home-header">
        <div className="logo-section">📑 <span>뉴스브리프</span></div>
        
        <div className="country-tabs">
          <button className={currentCountry === 'kr' ? 'active' : ''} onClick={() => setCurrentCountry('kr')}>🇰🇷 한국</button>
          <button className={currentCountry === 'us' ? 'active' : ''} onClick={() => setCurrentCountry('us')}>🇺🇸 미국</button>
          <button className={currentCountry === 'jp' ? 'active' : ''} onClick={() => setCurrentCountry('jp')}>🇯🇵 일본</button>
        </div>
        
        <div className="header-right-icons">
          <button className="theme-toggle-icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div className="noti-icon-badge">🔔<span>3</span></div>
          <div className="user-avatar">민</div>
        </div>
      </div>

      <div className="update-status-bar">
        <span>🟢 마지막 크롤링 <strong>14:00</strong> · 다음 업데이트까지 <strong>2시간 14분</strong></span>
        <button className="refresh-btn">🔄 새로고침</button>
      </div>

      <div className="date-heading">2026년 5월 25일 · 월요일</div>
      <h1 className="main-page-title">오늘의 브리핑</h1>

      <div className="category-chips">
        {[['all', '전체'], ['politics', '정치'], ['economy', '경제'], ['society', '사회'], ['it', '기술·IT'], ['sports', '스포츠']].map(([key, label]) => (
          <button key={key} className={currentCat === key ? 'active' : ''} onClick={() => setCurrentCat(key)}>{label}</button>
        ))}
      </div>

      <div className="session-timeline-box">
        <div className="timeline-header">
          <span>🕒 세션 타임라인 <small>한국 × 전체</small></span>
          <span className="timeline-meta">최대 6세션 · 30시간 보관</span>
        </div>
        <div className="timeline-hours-grid">
          {['어제 14:00', '어제 19:00', '오늘 00:00', '오늘 05:00', '오늘 09:00'].map((time) => (
            <div key={time} className="hour-pill">{time.split(' ')[1]}<br/><small>{time.split(' ')[0]}</small></div>
          ))}
          <div className="hour-pill current-now">14:00<br/><small>지금</small></div>
        </div>
      </div>

      <div className="session-sub-title">14:00 세션 · 상위 5개 기사 <span className="right-label">세션당 5개 저장</span></div>

      <div className="articles-list">
        {articles.map((art) => (
          <div key={art.id} className="article-main-card" onClick={() => onArticleClick(art)}>
            <div className="card-rank-num">{art.rank}</div>
            <div className="card-body-content">
              <div className="card-meta-info">
                <span className="cat-badge">{art.category}</span>
                <span className="src-text">{art.source}</span>
              </div>
              <h2 className="article-card-title">{art.title}</h2>
              <ul className="article-bullet-summary">
                {art.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
              </ul>
              <div className="card-bottom-actions">
                <span className="action-link">🔗 원문</span>
                <span className="action-link">💬 {art.replies}</span>
                <button className="card-scrap-btn" onClick={(e) => { e.stopPropagation(); alert('스크랩 완료!'); }}>📥 스크랩</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="more-articles-btn">+ 4번, 5번 기사 더보기</div>
    </div>
  );
}

// 💬 AI 요약 상세 모달 팝업 컴포넌트
function ArticleDetailModal({ article, onClose, isDarkMode }) {
  return (
    <div className="modal-screen-overlay" onClick={onClose}>
      <div className={`modal-main-window ${isDarkMode ? 'dark-mode-app' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <button className="modal-back-arrow" onClick={onClose}>← 14:00 세션으로</button>
          <div className="modal-top-right-btns">
            <button className="icon-action-btn">🔖</button>
            <button className="icon-action-btn">🔗</button>
          </div>
        </div>

        <div className="modal-scroll-area">
          <div className="modal-meta-row">
            <span className="modal-cat-tag">{article.category}</span>
            <span className="modal-source-meta">🇰🇷 한국 · {article.source} · 14:00 세션 · 1위</span>
          </div>

          <h1 className="modal-article-title">{article.title}</h1>

          <button className="original-link-banner">
            <span className="naver-icon">N</span> <strong>원문 기사 보기</strong><br/>
            <small>news.naver.com</small>
            <span className="arrow-out">↗</span>
          </button>

          <div className="ai-summary-container-box">
            <div className="ai-box-title">✨ AI 요약 <span className="ai-speed-tag">5초만에 핵심 파악</span></div>
            <ul className="ai-bullet-points">
              <li>5월 반도체 수출액이 전년 대비 <strong>18% 증가</strong>해 3개월 연속 상승세를 이어갔다.</li>
              <li>HBM 등 AI용 고부가 가치 메모리가 성장을 주도했으며, 평균 단가도 상승했다.</li>
              <li>업계는 하반기에도 출하량이 늘어날 것으로 보고 있으며, 정부는 추가 지원책을 검토 중이다.</li>
            </ul>
          </div>

          <div className="comments-section-title">💬 원문 댓글 <span className="comment-count-text">{article.replies}개</span></div>
          
          <div className="comment-row-item">
            <div className="comment-user-meta"><strong>user****</strong> <small>2시간 전</small></div>
            <p className="comment-text-body">HBM 단가가 계속 올라가서 수출액만 늘어난 거 아닌가요? 물량 기준으로도 봐야 할 듯</p>
            <div className="comment-like-dislike">👍 248  👎 12</div>
          </div>

          <div className="comment-row-item">
            <div className="comment-user-meta"><strong>tech****</strong> <small>3시간 전</small></div>
            <p className="comment-text-body">하반기에는 더 좋아질 거라는 전망이 많네요. 관련주 다시 봐야겠어요</p>
            <div className="comment-like-dislike">👍 187  👎 5</div>
          </div>
        </div>

        <div className="modal-bottom-notice-bar">
          <span>댓글은 원문 출처에서 가져온 내용입니다.</span>
          <span>19:00 세션에서 갱신 예정</span>
        </div>
      </div>
    </div>
  );
}

export default App;
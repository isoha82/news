/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [view, setView] = useState('onboarding'); 
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [selectedArticle, setSelectedArticle] = useState(null); 

  // --- [상태 관리] 국가 및 카테고리 ---
  const [selectedCountries, setSelectedCountries] = useState({ kr: true, us: true, jp: false });
  const [selectedCategories, setSelectedCategories] = useState({ it: true, economy: true, politics: false, society: false, sports: false, entertainment: false });
  
  // --- [상태 관리] 피그마 이미지 기준 알림 3종 셋팅 (초기값 이미지 동기화) ---
  const [pushSettings, setPushSettings] = useState({ 
    session: true,   // 새 세션 도착 (On)
    hotissue: true,  // 관심 핫이슈 (On)
    comment: false   // 스크랩 댓글 알림 (Off)
  });

  const toggleCountry = (key) => setSelectedCountries(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCategory = (key) => setSelectedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  const isAnyCountrySelected = Object.values(selectedCountries).some(val => val === true);
  const isAnyCategorySelected = Object.values(selectedCategories).some(val => val === true);

  // 화면 외곽(body) 다크모드 클래스 제어
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-body');
    } else {
      document.body.classList.remove('dark-body');
    }
  }, [isDarkMode]);

  return (
    <div className={`app-global-layout ${isDarkMode ? 'dark-mode-app' : ''}`}>
      
      {/* STEP 1: 소셜 로그인 (외곽 검은 배경 완전 해제 상태) */}
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
          {/* 4분할 세그먼트 프로그레스 바 (1칸 채움) */}
          <div className="segment-progress-bar">
            <div className="segment-bar fill"></div>
            <div className="segment-bar"></div>
            <div className="segment-bar"></div>
            <div className="segment-bar"></div>
          </div>
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
          {/* 4분할 세그먼트 프로그레스 바 (2칸 채움) */}
          <div className="segment-progress-bar">
            <div className="segment-bar fill"></div>
            <div className="segment-bar fill"></div>
            <div className="segment-bar"></div>
            <div className="segment-bar"></div>
          </div>
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

      {/* 🟢 STEP 4: 알림 설정 (피그마 이미지_3dd5fd.png 기준 완벽 동기화) */}
      {view === 'step4' && (
        <div className="onboarding-center-box">
          {/* 4분할 세그먼트 프로그레스 바 (4칸 전부 채움) */}
          <div className="segment-progress-bar">
            <div className="segment-bar fill"></div>
            <div className="segment-bar fill"></div>
            <div className="segment-bar fill"></div>
            <div className="segment-bar fill"></div>
          </div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 4 / 4</div>
          <h2 className="step-main-title">알림 받을게요?</h2>
          <p className="step-sub-title">언제든 설정에서 변경할 수 있어요</p>
          
          <div className="toggle-option-list">
            {/* 1. 새 세션 도착 */}
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>새 세션 도착</strong><br /><small>5시간마다 알림</small></div>
              <label className="switch-input-label">
                <input type="checkbox" checked={pushSettings.session} onChange={() => setPushSettings(p => ({ ...p, session: !p.session }))} />
                <span className="slider-round"></span>
              </label>
            </div>
            
            {/* 2. 관심 핫이슈 */}
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>관심 핫이슈</strong><br /><small>반복 등장 키워드</small></div>
              <label className="switch-input-label">
                <input type="checkbox" checked={pushSettings.hotissue} onChange={() => setPushSettings(p => ({ ...p, hotissue: !p.hotissue }))} />
                <span className="slider-round"></span>
              </label>
            </div>

            {/* 3. 스크랩 댓글 알림 (피그마 가이드 반영 추가) */}
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>스크랩 댓글 알림</strong><br /><small>댓글 새로 달릴 때</small></div>
              <label className="switch-input-label">
                <input type="checkbox" checked={pushSettings.comment} onChange={() => setPushSettings(p => ({ ...p, comment: !p.comment }))} />
                <span className="slider-round"></span>
              </label>
            </div>
          </div>

          <div className="navigation-actions single-action">
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
          onProfileClick={() => setView('mypage')} 
        />
      )}

      {/* 👤 마이페이지 설정 화면 */}
      {view === 'mypage' && (
        <MyPageView 
          onBackToHome={() => setView('home')}
          selectedCountries={selectedCountries}
          toggleCountry={toggleCountry}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          pushSettings={pushSettings}
          setPushSettings={setPushSettings}
          onLogout={() => setView('onboarding')}
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
function HomeTimelineView({ onArticleClick, isDarkMode, setIsDarkMode, onProfileClick }) {
  const [currentCountry, setCurrentCountry] = useState('kr');
  const [currentCat, setCurrentCat] = useState('all');

  const articles = [
    { id: 1, rank: 1, category: '기술·IT', source: '네이버 뉴스', title: '반도체 수출 3개월 연속 증가, AI 수요가 견인', bullets: ['5월 반도체 수출액 전년 대비 18% 증가', 'HBM 등 AI용 메모리가 성장 주도'], replies: 142 },
    { id: 2, rank: 2, category: '경제', source: '네이버 뉴스', title: '한은 기준금리 동결, 시장 예상 부합', bullets: ['금통위 만장일치로 2.75% 유지 결정', '물가 안정세 지속이라고 판단'], replies: 87 },
    { id: 3, rank: 3, category: '정치', source: '네이버 뉴스', title: '국회 본회의서 민생법안 7건 통과', bullets: ['소상공인 지원법 개정안 등 여야 합의 처리', '주거안정 관련 법안도 함께 의결'], replies: 312 },
  ];

  return (
    <div className="home-container">
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
          <div className="user-avatar" onClick={onProfileClick}>민</div>
        </div>
      </div>

      <div className="update-status-bar">
        <span>🟢 마지막 크롤링 <strong>14:00</strong> · 다음 업데이트까지 <strong>2시간 14분</strong></span>
        <button className="refresh-btn">🔄 새로고침</button>
      </div>

      <div className="date-heading">2026년 5월 30일 · 토요일</div>
      <h1 className="main-page-title">오늘의 브리핑</h1>

      <div className="category-chips">
        {[['all', '전체'], ['politics', '정치'], ['economy', '경제'], ['society', '사회'], ['it', '기술·IT'], ['sports', '스포츠']].map(([key, label]) => (
          <button key={key} className={currentCat === key ? 'active' : ''} onClick={() => setCurrentCat(key)}>{label}</button>
        ))}
      </div>

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
                <span>🔗 원문</span>
                <span>💬 {art.replies}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 👤 마이페이지 컴포넌트
function MyPageView({ onBackToHome, selectedCountries, toggleCountry, selectedCategories, toggleCategory, pushSettings, setPushSettings, onLogout }) {
  return (
    <div className="mypage-container">
      <div className="mypage-top-nav">
        <button className="back-to-home-btn" onClick={onBackToHome}>← 홈 브리핑으로</button>
        <span className="page-center-title">설정</span>
        <div style={{ width: '80px' }}></div>
      </div>

      <div className="user-profile-card">
        <div className="profile-large-avatar">민</div>
        <div className="profile-user-info">
          <h3>김민우 <span className="user-email-tag">kakao</span></h3>
          <p>minwoo****@kakao.com</p>
        </div>
      </div>

      <div className="mypage-scroll-area">
        <div className="setting-section-box">
          <h4 className="section-group-title">🌍 브리핑 국가 변경</h4>
          <div className="setting-inline-list">
            {[['kr', '🇰🇷 한국'], ['us', '🇺🇸 미국'], ['jp', '🇯🇵 일본']].map(([key, label]) => (
              <div key={key} className={`setting-toggle-item ${selectedCountries[key] ? 'active' : ''}`} onClick={() => toggleCountry(key)}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="setting-section-box">
          <h4 className="section-group-title">💡 관심 카테고리 설정</h4>
          <div className="setting-grid-matrix">
            {[['it', '💻 IT·기술'], ['economy', '💰 경제'], ['politics', '🏛️ 정치'], ['society', '👥 사회'], ['sports', '⚽ 스포츠'], ['entertainment', '🎬 연예']].map(([key, label]) => (
              <div key={key} className={`setting-grid-chip ${selectedCategories[key] ? 'active' : ''}`} onClick={() => toggleCategory(key)}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="setting-section-box">
          <h4 className="section-group-title">🔔 푸시 알림 제어</h4>
          <div className="mypage-toggle-list">
            <div className="mypage-toggle-row">
              <div className="toggle-info"><strong>새 세션 요약 알림</strong><p>5시간마다 맞춤 뉴스브리프 도착 시 알림</p></div>
              <label className="switch-input-label">
                <input type="checkbox" checked={pushSettings.session} onChange={() => setPushSettings(p => ({ ...p, session: !p.session }))} />
                <span className="slider-round"></span>
              </label>
            </div>
            <div className="mypage-toggle-row">
              <div className="toggle-info"><strong>종합 핫이슈 키워드 알림</strong><p>선택 분야 핫이슈 발생 시 알림</p></div>
              <label className="switch-input-label">
                <input type="checkbox" checked={pushSettings.hotissue} onChange={() => setPushSettings(p => ({ ...p, hotissue: !p.hotissue }))} />
                <span className="slider-round"></span>
              </label>
            </div>
            <div className="mypage-toggle-row">
              <div className="toggle-info"><strong>스크랩 댓글 알림</strong><p>댓글 새로 달릴 때 알림</p></div>
              <label className="switch-input-label">
                <input type="checkbox" checked={pushSettings.comment} onChange={() => setPushSettings(p => ({ ...p, comment: !p.comment }))} />
                <span className="slider-round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 💬 AI 요약 상세 모달 컴포넌트
function ArticleDetailModal({ article, onClose, isDarkMode }) {
  return (
    <div className="modal-screen-overlay" onClick={onClose}>
      <div className={`modal-main-window ${isDarkMode ? 'dark-mode-app' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <button className="modal-back-arrow" onClick={onClose}>← 14:00 세션으로</button>
        </div>
        <div className="modal-scroll-area">
          <h1 className="modal-article-title">{article.title}</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
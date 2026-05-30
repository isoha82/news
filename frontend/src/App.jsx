import React, { useState } from 'react';
import './App.css';

function App() {
  // 'onboarding' (STEP 1), 'step2', 'step3', 'step4', 'home' 등으로 화면 제어
  const [view, setView] = useState('onboarding'); 

  // --- [상태 관리] 국가 선택 ---
  const [selectedCountries, setSelectedCountries] = useState({
    kr: true,
    us: true,
    jp: false,
  });

  // --- [상태 관리] 카테고리 선택 ---
  const [selectedCategories, setSelectedCategories] = useState({
    it: true,
    economy: true,
    politics: false,
    society: false,
    sports: false,
    entertainment: false,
  });

  // 국가 선택 토글 함수
  const toggleCountry = (key) => {
    setSelectedCountries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 카테고리 선택 토글 함수
  const toggleCategory = (key) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 1. 국가가 최소 1개 이상 선택되었는지 확인
  const isAnyCountrySelected = Object.values(selectedCountries).some((val) => val === true);

  // 2. 분야(카테고리)가 최소 1개 이상 선택되었는지 확인
  const isAnyCategorySelected = Object.values(selectedCategories).some((val) => val === true);

  // 2단계(국가) -> 3단계(분야) 이동 핸들러
  const handleCountryNext = () => {
    if (isAnyCountrySelected) {
      setView('step3');
    } else {
      alert('국가를 최소 1개 이상 선택해주세요!');
    }
  };

  // 3단계(분야) -> 4단계(알림) 이동 핸들러
  const handleCategoryNext = () => {
    if (isAnyCategorySelected) {
      setView('step4');
    } else {
      alert('관심 카테고리를 최소 1개 이상 선택해주세요!');
    }
  };

  return (
    <div className="app-global-layout">
      
      {/* 1. 온보딩 STEP 1 / 4: 소셜 로그인 */}
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
          <p className="brand-description">
            AI가 5시간마다 자동으로 요약해주는<br />3개국 주요 뉴스
          </p>
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
          <p className="terms-notice">
            계속하면 <span className="underline">이용약관</span>과 <span className="underline">개인정보처리방침</span>에<br />동의하는 것으로 간주됩니다
          </p>
        </div>
      )}

      {/* 2. 온보딩 STEP 2 / 4: 국가 선택 */}
      {view === 'step2' && (
        <div className="onboarding-center-box">
          <div className="step-progress-bar">
            <div className="progress-fill" style={{ width: '25%' }}></div>
          </div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 2 / 4</div>
          <h2 className="step-main-title">어떤 나라 뉴스를 볼까요?</h2>
          <p className="step-sub-title">최소 1개 이상 선택해주세요</p>
          
          <div className="selection-list">
            <div className={`selection-card ${selectedCountries.kr ? 'checked' : ''}`} onClick={() => toggleCountry('kr')}>
              <div className="card-left"><span>🇰🇷</span> <strong>한국</strong> <small>네이버 뉴스</small></div>
              <input type="checkbox" checked={selectedCountries.kr} readOnly />
            </div>

            <div className={`selection-card ${selectedCountries.us ? 'checked' : ''}`} onClick={() => toggleCountry('us')}>
              <div className="card-left"><span>🇺🇸</span> <strong>미국</strong> <small>CNN</small></div>
              <input type="checkbox" checked={selectedCountries.us} readOnly />
            </div>

            <div className={`selection-card ${selectedCountries.jp ? 'checked' : ''}`} onClick={() => toggleCountry('jp')}>
              <div className="card-left"><span>🇯🇵</span> <strong>일본</strong> <small>야후재팬</small></div>
              <input type="checkbox" checked={selectedCountries.jp} readOnly />
            </div>
          </div>

          <div className="navigation-actions">
            <button className="back-nav-btn" onClick={() => setView('onboarding')}>이전</button>
            <button className={`forward-nav-btn ${!isAnyCountrySelected ? 'disabled' : ''}`} onClick={handleCountryNext}>
              다음 →
            </button>
          </div>
        </div>
      )}

      {/* 3. 온보딩 STEP 3 / 4: 관심 카테고리 */}
      {view === 'step3' && (
        <div className="onboarding-center-box">
          <div className="step-progress-bar">
            <div className="progress-fill" style={{ width: '50%' }}></div>
          </div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 3 / 4</div>
          <h2 className="step-main-title">관심 카테고리</h2>
          <p className="step-sub-title">선택한 분야 위주로 보여드려요</p>

          <div className="category-matrix-grid">
            <div className={`matrix-item ${selectedCategories.it ? 'selected' : ''}`} onClick={() => toggleCategory('it')}>
              💻<br /><span>기술·IT</span>
            </div>
            <div className={`matrix-item ${selectedCategories.economy ? 'selected' : ''}`} onClick={() => toggleCategory('economy')}>
              💰<br /><span>경제</span>
            </div>
            <div className={`matrix-item ${selectedCategories.politics ? 'selected' : ''}`} onClick={() => toggleCategory('politics')}>
              🏛️<br /><span>정치</span>
            </div>
            <div className={`matrix-item ${selectedCategories.society ? 'selected' : ''}`} onClick={() => toggleCategory('society')}>
              👥<br /><span>사회</span>
            </div>
            <div className={`matrix-item ${selectedCategories.sports ? 'selected' : ''}`} onClick={() => toggleCategory('sports')}>
              ⚽<br /><span>스포츠</span>
            </div>
            <div className={`matrix-item ${selectedCategories.entertainment ? 'selected' : ''}`} onClick={() => toggleCategory('entertainment')}>
              🎬<br /><span>연예·문화</span>
            </div>
          </div>

          <div className="navigation-actions">
            <button className="back-nav-btn" onClick={() => setView('step2')}>이전</button>
            {/* 분야가 하나도 선택되지 않으면 비활성화 스타일(disabled) 적용 */}
            <button className={`forward-nav-btn ${!isAnyCategorySelected ? 'disabled' : ''}`} onClick={handleCategoryNext}>
              다음 →
            </button>
          </div>
        </div>
      )}

      {/* 4. 온보딩 STEP 4 / 4: 알림 수신 동의 */}
      {view === 'step4' && (
        <div className="onboarding-center-box">
          <div className="step-progress-bar">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 4 / 4</div>
          <h2 className="step-main-title">알림 받을게요?</h2>
          <p className="step-sub-title">언제든 설정에서 변경할 수 있어요</p>

          <div className="toggle-option-list">
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>새 세션 도착</strong><br /><small>5시간마다 알림</small></div>
              <label className="switch-input-label"><input type="checkbox" defaultChecked /><span className="slider-round"></span></label>
            </div>
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>관심 핫이슈</strong><br /><small>반복 등장 키워드</small></div>
              <label className="switch-input-label"><input type="checkbox" defaultChecked /><span className="slider-round"></span></label>
            </div>
            <div className="toggle-row-item">
              <div className="toggle-text-info"><strong>스크랩 댓글 알림</strong><br /><small>댓글 새로 달릴 때</small></div>
              <label className="switch-input-label"><input type="checkbox" /><span className="slider-round"></span></label>
            </div>
          </div>

          <button className="onboarding-finish-btn" onClick={() => setView('home')}>시작하기</button>
        </div>
      )}

      {/* 5. 메인 홈 화면 진입 상태 */}
      {view === 'home' && (
        <div className="main-app-content-view">
          <h2 style={{ textAlign: 'center', marginTop: '100px' }}>🎉 홈 브리핑 화면 진입 완료!</h2>
          <button className="social-login-btn google-btn" style={{ maxWidth: '200px', margin: '20px auto' }} onClick={() => setView('onboarding')}>
            처음으로 돌아가기
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
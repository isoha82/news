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

  // 🌟 [기능 6] 실제 API 연동을 대비한 로딩 및 에러 상태 관리
  const [isScrapLoading, setIsScrapLoading] = useState(false);

  // 🌟 [기능 4] 하드코딩 데이터를 걷어내고 서버 스펙과 동기화할 폴더 상태 리스트
  const [folders, setFolders] = useState([
    { id: 1, name: 'AI·반도체', icon: '🔮', count: 3 }, // 더미 기사 수와 일치시킴
    { id: 2, name: '금융·부동산', icon: '🏦', count: 0 },
    { id: 3, name: '국제 정세', icon: '🧭', count: 0 }
  ]);

  // 🌟 [기능 2] 현재 선택해서 조회 중인 폴더 고유 ID 상태 (기본값: 1번 AI·반도체)
  const [activeFolderId, setActiveFolderId] = useState(1);

  // --- 🔔 [실시간 알림 및 스크랩 데이터 바구니 통합] ---
  const [notifications, setNotifications] = useState([
    { id: 1, section: 'today', type: 'session', icon: '🔄', iconClass: 'noti-blue-circle', title: '14:00 세션 업데이트', desc: '한국·기술·IT 카테고리에 새 기사 5건 도착', time: '방금', unread: true },
    { id: 2, section: 'today', type: 'hotissue', icon: '🔥', iconClass: 'noti-pink-circle', title: '핫이슈 알림', desc: '"반도체 수출" 관련 기사가 3개 세션 연속 1위', time: '2시간 전', unread: true },
    { id: 3, section: 'today', type: 'comment', icon: '💬', iconClass: 'noti-brown-circle', title: '스크랩 기사 댓글', desc: '"한은 기준금리 동결" 기사에 댓글 47개 추가됨', time: '4시간 전', unread: true },
    // 시안(image_b1fda6.png) 속 기본 담겨있는 반도체 관련 정식 기사 데이터셋 규격 매핑
    { id: 901, type: 'scrap_data', folderId: 1, category: '기술·IT', source: '🇰🇷 한국 · 오늘 14:00 세션', title: '반도체 수출 3개월 연속 증가, AI 수요가 견인', bullets: ['HBM 등 AI용 메모리가 성장을 주도하며 평균 단가도 상승'], replies: 142, dateText: '10분 전 스크랩' },
    { id: 902, type: 'scrap_data', folderId: 1, category: '기술·IT', source: '🇺🇸 미국 · 어제 19:00 세션', title: 'Nvidia, 차세대 GPU 출하 일정 공개', bullets: ['B200 아키텍처 기반 GPU가 4분기부터 본격 공급될 예정'], replies: 95, dateText: '어제 스크랩' },
    { id: 903, type: 'scrap_data', folderId: 1, category: '기술·IT', source: '🇯🇵 일본 · 2일 전 09:00 세션', title: '日 정부, 반도체 산업에 1조엔 추가 지원', bullets: ['TSMC 쿠마모토 2공장 건설을 비롯한 국내 생산 거점 강화'], replies: 64, dateText: '2일 전 스크랩' }
  ]);

  // 🌟 [기능 5] 스크랩북 페이지네이션 (한 번에 보여줄 기사 개수 제한)
  const [visibleScrapCount, setVisibleScrapCount] = useState(3);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // 🌟 스크랩 토글 연동 함수 (특정 폴더 바인딩 연동 스펙 업그레이드)
  const handleScrapToggle = (article) => {
    const isAlreadyScrapped = notifications.some(item => item.id === article.id && item.type === 'scrap_data');
    
    if (isAlreadyScrapped) {
      // 스크랩 취소 시 해당 폴더의 카운트 마이너스 처리
      const targetScrap = notifications.find(item => item.id === article.id && item.type === 'scrap_data');
      if (targetScrap) {
        setFolders(prev => prev.map(f => f.id === targetScrap.folderId ? { ...f, count: Math.max(0, f.count - 1) } : f));
      }
      setNotifications(prev => prev.filter(item => !(item.id === article.id && item.type === 'scrap_data')));
    } else {
      // 홈에서 스크랩할 시 현재 활성화된 폴더(activeFolderId)로 자동 할당 및 카운트 플러스
      setFolders(prev => prev.map(f => f.id === activeFolderId ? { ...f, count: f.count + 1 } : f));
      const newScrap = {
        id: article.id,
        type: 'scrap_data',
        folderId: activeFolderId, // 활성화된 폴더 자동 매핑
        title: article.title,
        category: article.category,
        source: article.source,
        bullets: article.bullets || [],
        replies: article.replies || 0,
        dateText: '방금 전 스크랩'
      };
      setNotifications(prev => [newScrap, ...prev]);
    }
  };

  // 🌟 [기능 1] 새 폴더 추가 시 중복 이름 및 빈 값 예외 검사 (Validation)
  const handleAddFolder = () => {
    const folderName = prompt('새 폴더 이름을 입력하세요:');
    if (!folderName || folderName.trim() === '') {
      alert('폴더 이름을 올바르게 입력해주세요.');
      return;
    }
    
    // 중복 검사
    const isDuplicate = folders.some(f => f.name === folderName.trim());
    if (isDuplicate) {
      alert('이미 존재하는 폴더 이름입니다.');
      return;
    }

    const icons = ['🔮', '🏦', '🧭', '📁', '📊', '🔥'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    setFolders(prev => [...prev, {
      id: Date.now(),
      name: folderName.trim(),
      icon: randomIcon,
      count: 0
    }]);
  };

  // 🌟 [기능 2] 폴더 삭제 처리 함수
  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 차단
    if (folders.length <= 1) {
      alert('최소 하나의 폴더는 존재해야 합니다.');
      return;
    }
    if (window.confirm('이 폴더를 삭제하시겠습니까? 내부 스크랩 기사도 함께 정리됩니다.')) {
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setNotifications(prev => prev.filter(item => !(item.type === 'scrap_data' && item.folderId === folderId)));
      // 삭제된 폴더를 보고 있었다면 존재하는 첫 번째 폴더로 시점 강제 이동
      const remainingFolders = folders.filter(f => f.id !== folderId);
      if (activeFolderId === folderId && remainingFolders.length > 0) {
        setActiveFolderId(remainingFolders[0].id);
      }
    }
  };

  // 🌟 [기능 3] 기사의 폴더 이동 액션 함수
  const handleMoveArticleFolder = (scrapId) => {
    const targetFolderNames = folders.map(f => f.name).join(', ');
    const destinationName = prompt(`이동할 폴더명을 정확히 입력하세요:\n[ ${targetFolderNames} ]`);
    
    if (!destinationName) return;
    
    const destFolder = folders.find(f => f.name === destinationName.trim());
    if (!destFolder) {
      alert('존재하지 않는 폴더명입니다.');
      return;
    }

    // 소속 변경 및 상호 폴더 카운트 동기화 리밸런싱
    setNotifications(prev => prev.map(item => {
      if (item.id === scrapId && item.type === 'scrap_data') {
        const oldFolderId = item.folderId;
        // 카운트 증감 연산 처리
        setFolders(fPrev => fPrev.map(f => {
          if (f.id === oldFolderId) return { ...f, count: Math.max(0, f.count - 1) };
          if (f.id === destFolder.id) return { ...f, count: f.count + 1 };
          return f;
        }));
        return { ...item, folderId: destFolder.id };
      }
      return item;
    }));
    alert(`선택하신 기사가 [${destFolder.name}] 폴더로 이동되었습니다.`);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-body');
    } else {
      document.body.classList.remove('dark-body');
    }
  }, [isDarkMode]);

  const isOnboarding = view === 'onboarding' || view === 'step2' || view === 'step3' || view === 'step4';

  // 현재 활성화된 폴더에 귀속된 실제 스크랩 목록 필터링 스펙
  const currentFolderScraps = notifications.filter(item => item.type === 'scrap_data' && item.folderId === activeFolderId);
  const activeFolderName = folders.find(f => f.id === activeFolderId)?.name || '미지정';

  return (
    <div className={`app-global-layout ${isDarkMode ? 'dark-mode-app' : ''}`}>
      
      <div className="app-main-content-area">
        
        {/* STEP 1: 소셜 로그인 */}
        {view === 'onboarding' && (
          <div className="home-container">
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
              <button className="social-login-btn google-btn" onClick={() => setView('step2')}><span className="icon">G</span> Google로 계속하기</button>
              <button className="social-login-btn apple-btn" onClick={() => setView('step2')}><span className="icon"></span> Apple로 계속하기</button>
              <button className="social-login-btn kakao-btn" onClick={() => setView('step2')}><span className="icon">💬</span> 카카오로 시작하기</button>
            </div>
            <p className="terms-notice">계속하면 <span className="underline">이용약관</span>과 <span className="underline">개인정보처리방침</span>에<br />동의하는 것으로 간주됩니다</p>
          </div>
        )}

        {/* STEP 2: 국가 선택 */}
        {view === 'step2' && (
          <div className="home-container">
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
          <div className="home-container">
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
          <div className="home-container">
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

        {/* 🏠 [탭 1] 오늘의 브리핑 홈 화면 */}
        {view === 'home' && (
          <HomeTimelineView 
            onArticleClick={(article) => setSelectedArticle(article)} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode}
            unreadCount={unreadCount}
            onNotiIconClick={() => setView('notification')}
            handleScrapToggle={handleScrapToggle}
            scraps={notifications.filter(item => item.type === 'scrap_data')}
          />
        )}

        {/* 🔖 [탭 2] 내 스크랩북 화면 - 데스크탑 정밀 시안 기반 + 6대 연동 최적화 완료 구역 */}
        {view === 'scrap' && (
          <div className="home-container" style={{ padding: '16px', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>
            
            {/* 상단 툴바 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('home')}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>← 내 스크랩</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ background: isDarkMode ? '#2C2C2E' : '#F2F2F7', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: isDarkMode ? '#AAA' : '#636366', cursor: 'pointer' }} onClick={() => {
                  const keyword = prompt('검색할 기사 제목을 입력하세요:');
                  if (keyword && keyword.trim() !== '') alert(`'${keyword}' 검색 결과가 백엔드로 전송됩니다.`);
                }}>🔍 검색</button>
                <button 
                  style={{ background: isDarkMode ? '#FFF' : '#1C1C1E', color: isDarkMode ? '#1C1C1E' : '#FFF', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }} 
                  onClick={handleAddFolder}
                >
                  + 새 폴더
                </button>
              </div>
            </div>

            {/* 총 개수 집계 연동 (하드코딩 제거) */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '26px', fontStyle: 'normal', fontWeight: '800', margin: '0 0 4px 0' }}>
                {notifications.filter(item => item.type === 'scrap_data').length}개 저장됨
              </h1>
              <span style={{ fontSize: '12px', color: '#8E8E93' }}>최근 업데이트: 오늘 14:20</span>
            </div>

            {/* 📁 폴더 세션 가로 스크롤 (클릭 이벤트 및 폴더 삭제X 오버레이 배치 완료) */}
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#8E8E93', display: 'block', marginBottom: '10px' }}>📁 폴더</span>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                
                {(folders || []).map((folder) => {
                  const isCurrentActive = activeFolderId === folder.id;
                  return (
                    <div 
                      key={folder.id} 
                      onClick={() => {
                        setIsScrapLoading(true); // 로딩 에뮬레이션 활성화
                        setActiveFolderId(folder.id);
                        setVisibleScrapCount(3); // 탭 이동 시 노출 페이지 카운트 초기화
                        setTimeout(() => setIsScrapLoading(false), 200);
                      }}
                      style={{ 
                        minWidth: '150px', 
                        background: isCurrentActive ? (isDarkMode ? '#3A3A3C' : '#EEF0FF') : (isDarkMode ? '#2C2C2E' : '#FFFFFF'), 
                        border: isCurrentActive ? '2px solid #5856D6' : (isDarkMode ? '1px solid #3A3A3C' : '1px solid #E5E5EA'), 
                        padding: '14px', borderRadius: '14px', position: 'relative', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', flexShrink: 0, cursor: 'pointer' 
                      }}
                    >
                      <div style={{ width: '24px', height: '24px', background: isDarkMode ? '#48484A' : '#FAFAFA', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginBottom: '12px' }}>
                        {folder.icon}
                      </div>
                      <strong style={{ fontSize: '13px', display: 'block', color: isDarkMode ? '#FFF' : '#1C1C1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '20px' }}>{folder.name}</strong>
                      
                      {/* 미니 쓰레기통 버튼을 통한 폴더 단독 삭제 제어 연동 */}
                      <span 
                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                        style={{ position: 'absolute', bottom: '14px', right: '14px', fontSize: '12px', color: '#FF3B30', cursor: 'pointer', opacity: 0.6 }}
                        title="폴더 삭제"
                      >
                        🗑️
                      </span>
                      
                      <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '18px', fontWeight: '700', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>
                        {folder.count}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* 현재 조회 중인 폴더 정보 타이틀 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>📌 {activeFolderName} 폴더</span>
              <span style={{ fontSize: '11px', color: '#8E8E93' }}>최신순 · 스크랩순</span>
            </div>

            {/* 기사 피드 리스트 구역 */}
            <div className="articles-list">
              
              {/* 🌟 [기능 6] 로딩 상태 처리 스피너 프레임 */}
              {isScrapLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#8E8E93', fontSize: '13px' }}>
                  <span>🔄 데이터를 불러오는 중입니다...</span>
                </div>
              ) : currentFolderScraps.length === 0 ? (
                /* 🌟 [기능 6] 빈 화면 예외 가이드 처리 (Empty State) */
                <div style={{ padding: '60px 16px', background: isDarkMode ? '#2C2C2E' : '#FAFAFA', borderRadius: '16px', border: '1px dashed #C7C7CC', textAlign: 'center', color: '#8E8E93' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📂</span>
                  <span style={{ fontSize: '13px' }}>이 폴더에 보관된 기사가 없습니다.<br/>홈 화면에서 기사를 추가해 보세요!</span>
                </div>
              ) : (
                /* 🌟 [기능 5] 전체 매핑 대신 visibleScrapCount 변수 기준 슬라이싱 처리 완료 */
                currentFolderScraps
                  .slice(0, visibleScrapCount)
                  .map((scrap) => (
                    <div key={scrap.id} className="article-main-card" onClick={() => setSelectedArticle(scrap)} style={{ textBreak: 'keep-all', textAlign: 'left', background: isDarkMode ? '#2C2C2E' : '#FFF', border: isDarkMode ? '1px solid #3A3A3C' : '1px solid #E5E5EA' }}>
                      <div className="card-body-content">
                        <div className="card-meta-info">
                          <span className="cat-badge" style={{ background: '#EEF0FF', color: '#5856D6' }}>{scrap.category}</span>
                          <span className="src-text">{scrap.source}</span>
                        </div>
                        <h2 className="article-card-title" style={{ fontSize: '15px', margin: '4px 0 6px 0', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>{scrap.title}</h2>
                        <ul className="article-bullet-summary" style={{ margin: '0 0 10px 0', fontSize: '12px', color: isDarkMode ? '#AAA' : '#636366' }}>
                          {scrap.bullets && scrap.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                        </ul>
                        <div className="card-bottom-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{ fontSize: '11px', color: '#AEAEB2' }}>{scrap.dateText || '보관됨'}</span>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', alignItems: 'center' }}>
                            <span style={{ cursor: 'pointer' }} title="공유하기" onClick={(e) => { e.stopPropagation(); alert('원문 공유 링크가 성공적으로 복사되었습니다.'); }}>📤</span>
                            {/* 🌟 [기능 3] 폴더 이동 연동 링크 바인딩 */}
                            <span style={{ cursor: 'pointer' }} title="폴더 이동" onClick={(e) => { e.stopPropagation(); handleMoveArticleFolder(scrap.id); }}>📁</span>
                            <span style={{ cursor: 'pointer', color: '#FF3B30' }} title="스크랩 해제" onClick={(e) => { e.stopPropagation(); handleScrapToggle(scrap); }}>🗑️</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* 🌟 [기능 5] 페이지네이션 버튼 가시성 다이내믹 바인딩 제어 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', background: isDarkMode ? '#2C2C2E' : '#F4F4F0', padding: '10px 12px', borderRadius: '10px', marginTop: '16px', fontSize: '11px', color: '#8E8E93' }}>
              <span>💡 스크랩한 기사는 세션이 삭제돼도 영구 보관</span>
              {currentFolderScraps.length > visibleScrapCount ? (
                <span 
                  style={{ fontWeight: 'bold', color: '#5856D6', cursor: 'pointer' }} 
                  onClick={() => setVisibleScrapCount(prev => prev + 3)}
                >
                  {currentFolderScraps.length - visibleScrapCount}개 더보기 ↓
                </span>
              ) : (
                <span style={{ color: '#AEAEB2' }}>마지막 기사입니다</span>
              )}
            </div>

          </div>
        )}

        {/* 🔔 [탭 3] 알림 센터 화면 */}
        {view === 'notification' && (
          <NotificationCenterView 
            notifications={notifications}
            setNotifications={setNotifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllAsRead}
            setSelectedArticle={setSelectedArticle}
          />
        )}

        {/* 👤 [탭 4] 마이페이지 화면 */}
        {view === 'setting' && (
          <div className="home-container">
            <h1 className="main-page-title" style={{ marginTop: '10px' }}>마이페이지</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: isDarkMode ? '#2C2C2E' : '#F4F4F0', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ width: '54px', height: '54px', background: '#E8EAF6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#3F51B5' }}>민</div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ fontSize: '16px', display: 'block', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>김민우 님</strong>
                <span style={{ fontSize: '12px', color: '#8E8E93' }}>일반 회원 · munu@khu.ac.kr</span>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>🌍 구독 중인 국가</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedCountries.kr && <span style={{ background: '#5856D6', color: '#FFF', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>🇰🇷 한국</span>}
                {selectedCountries.us && <span style={{ background: '#5856D6', color: '#FFF', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>🇺🇸 미국</span>}
                {selectedCountries.jp && <span style={{ background: '#5856D6', color: '#FFF', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>🇯🇵 일본</span>}
                {!selectedCountries.kr && !selectedCountries.us && !selectedCountries.jp && <span style={{ color: '#8E8E93', fontSize: '12px' }}>선택된 국가가 없습니다.</span>}
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>💻 관심 카테고리</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(selectedCategories).filter(([_, val]) => val).length === 0 ? (
                  <span style={{ color: '#8E8E93', fontSize: '12px' }}>선택된 카테고리가 없습니다.</span>
                ) : (
                  Object.entries(selectedCategories)
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      const labelMap = { it: '💻 기술·IT', economy: '💰 경제', politics: '🏛️ 정치', society: '👥 사회', sports: '⚽ 스포츠', entertainment: '🎬 연예·문화' };
                      return (
                        <span key={key} style={{ background: isDarkMode ? '#3A3A3C' : '#E5E5EA', color: isDarkMode ? '#FFF' : '#1C1C1E', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                          {labelMap[key] || key}
                        </span>
                      );
                    })
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: isDarkMode ? '#2C2C2E' : '#E5E5EA', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', background: isDarkMode ? '#1C1C1E' : '#FFF', display: 'flex', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }} onClick={() => setView('step2')}>
                <span>구독 조건 다시 설정하기</span>
                <span style={{ color: '#AEAEB2' }}>➔</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 하단 고정 탭 바 */}
      {!isOnboarding && (
        <div className="app-bottom-nav-bar">
          <div className={`nav-tab-item ${view === 'home' ? 'is-active' : ''}`} onClick={() => setView('home')}>
            <span className="nav-tab-icon">🏠</span>
            <span className="nav-tab-label">홈</span>
          </div>
          <div className={`nav-tab-item ${view === 'scrap' ? 'is-active' : ''}`} onClick={() => setView('scrap')}>
            <span className="nav-tab-icon">🔖</span>
            <span className="nav-tab-label">스크랩</span>
          </div>
          <div className={`nav-tab-item ${view === 'notification' ? 'is-active' : ''}`} onClick={() => setView('notification')}>
            <span className="nav-tab-icon" style={{ position: 'relative' }}>
              🔔
              {unreadCount > 0 && <span className="nav-mini-badge-dot"></span>}
            </span>
            <span className="nav-tab-label">알림</span>
          </div>
          <div className={`nav-tab-item ${view === 'setting' ? 'is-active' : ''}`} onClick={() => setView('setting')}>
            <span className="nav-tab-icon">👤</span>
            <span className="nav-tab-label">마이페이지</span>
          </div>
        </div>
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
function HomeTimelineView({ onArticleClick, isDarkMode, setIsDarkMode, unreadCount, onNotiIconClick, handleScrapToggle, scraps }) {
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
          <div className="noti-icon-badge" style={{ cursor: 'pointer' }} onClick={onNotiIconClick}>
            🔔{unreadCount > 0 && <span>{unreadCount}</span>}
          </div>
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
        {articles.map((art) => {
          const isScrapped = scraps.some(item => item.id === art.id);
          return (
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
                  <button 
                    className="card-scrap-btn" 
                    onClick={(e) => { e.stopPropagation(); handleScrapToggle(art); }}
                    style={isScrapped ? { color: '#5856D6', fontWeight: 'bold' } : {}}
                  >
                    {isScrapped ? '🔖 스크랩됨' : '📥 스크랩'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="more-articles-btn">+ 4번, 5번 기사 더보기</div>
    </div>
  );
}

// 🔔 알림 센터 컴포넌트
function NotificationCenterView({ notifications, setNotifications, unreadCount, onMarkAllRead, setSelectedArticle }) {
  const todayNotis = notifications.filter(n => n.section === 'today');
  const yesterdayNotis = notifications.filter(n => n.section === 'yesterday');

  const handleNotiClick = (noti) => {
    setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, unread: false } : n));
    if (noti.type === 'session' || noti.type === 'hotissue') {
      setSelectedArticle({
        id: 1, rank: 1, category: '기술·IT', source: '네이버 뉴스',
        title: '반도체 수출 3개월 연속 증가, AI 수요가 견인',
        bullets: ['5월 반도체 수출액 전년 대비 18% 증가', 'HBM 등 AI용 메모리가 성장 주도'],
        replies: 142
      });
    }
  };

  return (
    <div className="home-container">
      <div className="noti-page-header-row">
        <div className="noti-title-left-side">
          <span className="noti-main-text-title">알림</span>
          {unreadCount > 0 && <span className="noti-count-badge-pink">새 {unreadCount}개</span>}
        </div>
        <button className="noti-clear-all-btn" onClick={onMarkAllRead}>모두 읽음</button>
      </div>

      <div className="noti-list-scroll-box">
        {todayNotis.length > 0 && (
          <>
            <div className="noti-date-divider-title">오늘</div>
            {todayNotis.map(noti => (
              <div key={noti.id} className={`noti-list-card-item ${noti.unread ? 'is-unread-bg' : ''}`} onClick={() => handleNotiClick(noti)} style={{ cursor: 'pointer' }}>
                <div className={`noti-avatar-circle-icon ${noti.iconClass}`}>{noti.icon}</div>
                <div className="noti-body-content-info">
                  <div className="noti-body-headline-title">{noti.title}</div>
                  <div className="noti-body-subtext-description">{noti.desc}</div>
                </div>
                <div className="noti-right-time-text">{noti.time}</div>
              </div>
            ))}
          </>
        )}

        {yesterdayNotis.length > 0 && (
          <>
            <div className="noti-date-divider-title" style={{ marginTop: '24px' }}>어제</div>
            {yesterdayNotis.map(noti => (
              <div key={noti.id} className="noti-list-card-item" onClick={() => handleNotiClick(noti)} style={{ cursor: 'pointer' }}>
                <div className={`noti-avatar-circle-icon ${noti.iconClass}`}>{noti.icon}</div>
                <div className="noti-body-content-info">
                  <div className="noti-body-headline-title">{noti.title}</div>
                  <div className="noti-body-subtext-description">{noti.desc}</div>
                </div>
                <div className="noti-right-time-text">{noti.time}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// 💬 AI 요약 상세 모달 팝업 컴포넌트 
function ArticleDetailModal({ article, onClose, isDarkMode }) {
  if (!article) return null;

  return (
    <div className="modal-screen-overlay" onClick={onClose}>
      <div className={`modal-main-window ${isDarkMode ? 'dark-mode-app' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-top-bar">
          <button className="modal-back-arrow" onClick={onClose}>← 14:00 세션으로</button>
          <div className="modal-top-right-btns">
            <button className="icon-action-btn" style={{ fontSize: '15px' }}>🔖</button>
            <button className="icon-action-btn" style={{ fontSize: '15px' }}>📤</button>
          </div>
        </div>

        <div className="modal-scroll-area">
          <div className="modal-meta-row">
            <span className="modal-cat-tag">{article.category || '기술·IT'}</span>
            <span className="modal-source-meta">🇰🇷 한국 · {article.source || '네이버 뉴스'} · 14:00 세션 · 1위</span>
          </div>

          <h1 className="modal-article-title">{article.title}</h1>

          <button className="original-link-banner" onClick={() => alert('언론사 원문 페이지로 이동합니다.')}>
            <span className="naver-icon">N</span> <strong>원문 기사 보기</strong><br/>
            <small>news.naver.com</small>
            <span className="arrow-out">↗</span>
          </button>

          <div className="ai-summary-container-box">
            <div className="ai-box-title">✨ AI 요약 <span className="ai-speed-tag">5초만에 핵심 파악</span></div>
            <ul className="ai-bullet-points">
              <li>5월 반도체 수출액이 전년 대비 <strong>18% 증가</strong>해 3개월 연속 상승세를 이어갔다</li>
              <li>HBM 등 AI용 고부가가치 메모리가 성장을 주도했으며, 평균 단가도 상승했다</li>
              <li>업계는 하반기에도 출하량이 늘어날 것으로 보고 있으며, 정부는 추가 지원책을 검토 중이다</li>
            </ul>
          </div>

          <div className="comments-section-title-row">
            <div className="comments-title-left">💬 원문 댓글 <span className="comment-count-text">{article.replies || 142}개</span></div>
            <div className="comments-filter-toggle-buttons">
              <span className="filter-chip-active">인기순</span>
              <span className="filter-chip-inactive">최신순</span>
            </div>
          </div>
          
          <div className="comment-row-item">
            <div className="comment-user-meta-row">
              <strong>user****</strong> <span className="like-badge-right">👍 248  👎 12</span>
            </div>
            <p className="comment-text-body">HBM 단가가 계속 올라가서 수출액만 늘어난 거 아닌가요? 물량 기준으로도 봐야 할 듯</p>
            <div className="comment-time-left-sub">2시간 전</div>
          </div>

          <div className="comment-row-item">
            <div className="comment-user-meta-row">
              <strong>tech****</strong> <span className="like-badge-right">👍 187  👎 5</span>
            </div>
            <p className="comment-text-body">하반기에는 더 좋아질 거라는 전망이 많네요. 관련주 다시 봐야겠어요</p>
            <div className="comment-time-left-sub">3시간 전</div>
          </div>

          <div className="comment-row-item">
            <div className="comment-user-meta-row">
              <strong>반도체****</strong> <span className="like-badge-right">👍 156  👎 23</span>
            </div>
            <p className="comment-text-body">정부 지원책 구체적으로 어떤 게 나올지가 관건일 듯합니다</p>
            <div className="comment-time-left-sub">4시간 전</div>
          </div>

          <div className="more-comments-dashed-btn">
            댓글 139개 더보기 ↓
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
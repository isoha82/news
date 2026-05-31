/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [view, setView] = useState('onboarding'); 
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [selectedArticle, setSelectedArticle] = useState(null); 

  // --- [온보딩 및 구독 상태 관리] ---
  const [selectedCountries, setSelectedCountries] = useState({ kr: true, us: true, jp: false });
  const [selectedCategories, setSelectedCategories] = useState({ it: true, economy: true, politics: false, society: false, sports: false, entertainment: false });
  
  // 마이페이지 뉴스 구독 조건 인라인 편집용 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCountries, setEditCountries] = useState({ ...selectedCountries });
  const [editCategories, setEditCategories] = useState({ ...selectedCategories });

  // 투자 성향 및 Ticker 관리 상태
  const [tickerInput, setTickerInput] = useState('');
  const [investmentTickers, setInvestmentTickers] = useState(['VOO', 'NVDA', 'GOOGL']);

  const toggleCountry = (key) => setSelectedCountries(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCategory = (key) => setSelectedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  const isAnyCountrySelected = Object.values(selectedCountries).some(val => val === true);
  const isAnyCategorySelected = Object.values(selectedCategories).some(val => val === true);

  // --- 🔔 [실시간 알림 및 스크랩 데이터 바구니 통합] ---
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [folders, setFolders] = useState([
    { id: 1, name: 'AI·반도체', icon: '🔮', count: 3 }, 
    { id: 2, name: '금융·부동산', icon: '🏦', count: 0 },
    { id: 3, name: '국제 정세', icon: '🧭', count: 0 }
  ]);
  const [activeFolderId, setActiveFolderId] = useState(1);

  const [notifications, setNotifications] = useState([
    { id: 1, section: 'today', type: 'session', icon: '🔄', iconClass: 'noti-blue-circle', title: '14:00 세션 업데이트', desc: '한국·기술·IT 카테고리에 새 기사 5건 도착', time: '방금', unread: true },
    { id: 2, section: 'today', type: 'hotissue', icon: '🔥', iconClass: 'noti-pink-circle', title: '핫이슈 알림', desc: '"반도체 수출" 관련 기사가 3개 세션 연속 1위', time: '2시간 전', unread: true },
    { id: 3, section: 'today', type: 'comment', icon: '💬', iconClass: 'noti-brown-circle', title: '스크랩 기사 댓글', desc: '"한은 기준금리 동결" 기사에 댓글 47개 추가됨', time: '4시간 전', unread: true },
    { id: 901, type: 'scrap_data', folderId: 1, category: '기술·IT', source: '🇰🇷 한국 · 오늘 14:00 세션', title: '반도체 수출 3개월 연속 증가, AI 수요가 견인', bullets: ['HBM 등 AI용 메모리가 성장 주도하며 평균 단가도 상승'], replies: 142, dateText: '10분 전 스크랩' },
    { id: 902, type: 'scrap_data', folderId: 1, category: '기술·IT', source: '🇺🇸 미국 · 어제 19:00 세션', title: 'Nvidia, 차세대 GPU 출하 일정 공개', bullets: ['B200 아키텍처 기반 GPU가 4분기부터 본격 공급될 예정'], replies: 95, dateText: '어제 스크랩' },
    { id: 903, type: 'scrap_data', folderId: 1, category: '기술·IT', source: '🇯🇵 일본 · 2일 전 09:00 세션', title: '日 정부, 반도체 산업에 1조엔 추가 지원', bullets: ['TSMC 쿠마모토 2공장 건설을 비롯한 국내 생산 거점 강화'], replies: 64, dateText: '2일 전 스크랩' }
  ]);

  const [visibleScrapCount, setVisibleScrapCount] = useState(3);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleScrapToggle = (article) => {
    const isAlreadyScrapped = notifications.some(item => item.id === article.id && item.type === 'scrap_data');
    if (isAlreadyScrapped) {
      const targetScrap = notifications.find(item => item.id === article.id && item.type === 'scrap_data');
      if (targetScrap) {
        setFolders(prev => prev.map(f => f.id === targetScrap.folderId ? { ...f, count: Math.max(0, f.count - 1) } : f));
      }
      setNotifications(prev => prev.filter(item => !(item.id === article.id && item.type === 'scrap_data')));
    } else {
      setFolders(prev => prev.map(f => f.id === activeFolderId ? { ...f, count: f.count + 1 } : f));
      const newScrap = {
        id: article.id,
        type: 'scrap_data',
        folderId: activeFolderId,
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

  const handleAddFolder = () => {
    const folderName = prompt('새 폴더 이름을 입력하세요:');
    if (!folderName || folderName.trim() === '') { alert('폴더 이름을 올바르게 입력해주세요.'); return; }
    if (folders.some(f => f.name === folderName.trim())) { alert('이미 존재하는 폴더 이름입니다.'); return; }
    const icons = ['🔮', '🏦', '🧭', '📁', '📊', '🔥'];
    setFolders(prev => [...prev, { id: Date.now(), name: folderName.trim(), icon: icons[Math.floor(Math.random() * icons.length)], count: 0 }]);
  };

  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    if (folders.length <= 1) { alert('최소 하나의 폴더는 존재해야 합니다.'); return; }
    if (window.confirm('이 폴더를 삭제하시겠습니까? 내부 스크랩 기사도 함께 정리됩니다.')) {
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setNotifications(prev => prev.filter(item => !(item.type === 'scrap_data' && item.folderId === folderId)));
      if (activeFolderId === folderId && folders.filter(f => f.id !== folderId).length > 0) {
        setActiveFolderId(folders.filter(f => f.id !== folderId)[0].id);
      }
    }
  };

  const handleMoveArticleFolder = (scrapId) => {
    const targetFolderNames = folders.map(f => f.name).join(', ');
    const destinationName = prompt(`이동할 폴더명을 정확히 입력하세요:\n[ ${targetFolderNames} ]`);
    if (!destinationName) return;
    const destFolder = folders.find(f => f.name === destinationName.trim());
    if (!destFolder) { alert('존재하지 않는 폴더명입니다.'); return; }

    setNotifications(prev => prev.map(item => {
      if (item.id === scrapId && item.type === 'scrap_data') {
        const oldFolderId = item.folderId;
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

  const handleAddTicker = (e) => {
    e.preventDefault();
    if (!tickerInput || tickerInput.trim() === '') return;
    const upperTicker = tickerInput.trim().toUpperCase();
    if (investmentTickers.includes(upperTicker)) { alert('이미 등록된 키워드입니다.'); return; }
    setInvestmentTickers(prev => [...prev, upperTicker]);
    setTickerInput('');
  };

  const handleRemoveTicker = (ticker) => {
    setInvestmentTickers(prev => prev.filter(t => t !== ticker));
  };

  const handleAccountDelete = () => {
    if (window.confirm('⚠️ 정말로 회원 탈퇴를 진행하시겠습니까?\n탈퇴 시 저장된 모든 데이터가 영구 삭제됩니다.')) {
      alert('회원 탈퇴 및 캐시 데이터 파기가 완료되었습니다. 초기 화면으로 이동합니다.');
      setFolders([
        { id: 1, name: 'AI·반도체', icon: '🔮', count: 0 },
        { id: 2, name: '금융·부동산', icon: '🏦', count: 0 },
        { id: 3, name: '국제 정세', icon: '🧭', count: 0 }
      ]);
      setNotifications([]);
      setSelectedCountries({ kr: true, us: false, jp: false });
      setSelectedCategories({ it: true, economy: false, politics: false, society: false, sports: false, entertainment: false });
      setInvestmentTickers(['VOO', 'NVDA', 'GOOGL']);
      setView('onboarding');
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setView('onboarding');
      setIsEditMode(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) { document.body.classList.add('dark-body'); } 
    else { document.body.classList.remove('dark-body'); }
  }, [isDarkMode]);

  const isOnboarding = view === 'onboarding' || view === 'step2' || view === 'step3' || view === 'step4';
  const currentFolderScraps = notifications.filter(item => item.type === 'scrap_data' && item.folderId === activeFolderId);
  const activeFolderName = folders.find(f => f.id === activeFolderId)?.name || '미지정';

  return (
    <div className={`app-global-layout ${isDarkMode ? 'dark-mode-app' : ''}`}>
      <div className="app-main-content-area">
        
        {/* STEP 1: 소셜 로그인 */}
        {view === 'onboarding' && (
          <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="step-indicator">STEP 1 / 4</div>
            <div className="app-brand-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#1C1C1E"/>
                <path d="M7 8h10M7 12h10M7 16h7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="brand-heading">뉴스브리프</h1>
            <p className="brand-description">AI가 5시간마다 자동으로 요약해주는<br />3개국 주요 뉴스</p>
            
            <div className="auth-button-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '10px' }}>
              <button className="social-login-btn google-btn" onClick={() => setView('step2')} style={{ width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}>
                <span className="icon">G</span> Google로 계속하기
              </button>
              <button className="social-login-btn apple-btn" onClick={() => setView('step2')} style={{ width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}>
                <span className="icon"></span> Apple로 계속하기
              </button>
              <button className="social-login-btn kakao-btn" onClick={() => setView('step2')} style={{ width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}>
                <span className="icon">💬</span> 카카오로 시작하기
              </button>
            </div>
            <p className="terms-notice" style={{ marginTop: '20px' }}>계속하면 <span className="underline">이용약관</span>과 <span className="underline">개인정보처리방침</span>에<br />동의하는 것으로 간주됩니다</p>
          </div>
        )}

        {view === 'step2' && (
          <div className="home-container">
            <div className="step-progress-bar"><div className="progress-fill" style={{ width: '25%' }}></div></div>
            <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 2 / 4</div>
            <h2 className="step-main-title">어떤 나라 뉴스를 볼까요?</h2>
            <p className="step-sub-title">최소 1개 이상 선택해주세요</p>
            <div className="selection-list">
              {[['kr', '🇰🇷 한국', '네이버 뉴스'], ['us', '🇺🇸 미국', 'CNN'], ['jp', '🇯🇵 일본', '야후재팬']].map(([key, countryText, srcText]) => (
                <div key={key} className={`selection-card ${selectedCountries[key] ? 'is-selected' : 'is-unselected'}`} onClick={() => toggleCountry('kr')}>
                  <div className="card-left"><span>{countryText.split(' ')[0]}</span> <strong>{countryText.split(' ')[1]}</strong> <small>{srcText}</small></div>
                  <input type="checkbox" checked={selectedCountries[key]} readOnly />
                </div>
              ))}
            </div>
            <div className="navigation-actions">
              <button className="back-nav-btn" onClick={() => setView('onboarding')}>이전</button>
              <button className={`forward-nav-btn ${!isAnyCountrySelected ? 'is-disabled' : ''}`} onClick={() => isAnyCountrySelected && setView('step3')}>다음 →</button>
            </div>
          </div>
        )}

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

        {view === 'step4' && (
  <div className="home-container" style={{ display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box' }}>
    {/* 상단 프로그레스 및 타이틀 */}
    <div className="step-progress-bar"><div className="progress-fill" style={{ width: '100%' }}></div></div>
    <div className="step-indicator" style={{ marginTop: '20px' }}>STEP 4 / 4</div>
    <h2 className="step-main-title" style={{ marginBottom: '4px', textAlign: 'left' }}>알림 받을게요?</h2>
    <p className="step-sub-title" style={{ marginBottom: '24px', textAlign: 'left' }}>언제든 설정에서 변경할 수 있어요</p>
    
    {/* 설정 옵션 카드 리스트 */}
    <div className="toggle-option-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      <div className="toggle-row-item">
        <div className="toggle-text-info" style={{ textAlign: 'left' }}><strong>새 세션 도착</strong><br /><small>5시간마다 알림</small></div>
        <label className="switch-input-label"><input type="checkbox" defaultChecked /><span className="slider-round"></span></label>
      </div>
      <div className="toggle-row-item">
        <div className="toggle-text-info" style={{ textAlign: 'left' }}><strong>관심 핫이슈</strong><br /><small>반복 등장 키워드</small></div>
        <label className="switch-input-label"><input type="checkbox" defaultChecked /><span className="slider-round"></span></label>
      </div>
    </div>
    
    {/* 💡 핵심 수정: 버튼들이 아래로 탈출하지 않도록 적절한 상단 마진(marginTop: '40px')으로 화면 내에 고정 */}
    <div className="navigation-actions" style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '40px', boxSizing: 'border-box' }}>
      <button 
        className="back-nav-btn" 
        onClick={() => setView('step3')} 
        style={{ flex: '0 0 70px', padding: '14px 0', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px', border: '1px solid #E5E5EA', background: isDarkMode ? '#2C2C2E' : '#FFF', color: isDarkMode ? '#FFF' : '#1C1C1E', cursor: 'pointer' }}
      >
        이전
      </button>
      <button 
        className="onboarding-finish-btn" 
        onClick={() => setView('home')} 
        style={{ flex: 1, padding: '14px 0', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: '#1C1C1E', color: '#FFF', cursor: 'pointer' }}
      >
        시작하기
      </button>
    </div>
  </div>
)}

        {/* 🏠 [탭 1] 홈 타임라인 */}
        {view === 'home' && (
          <HomeTimelineView 
            onArticleClick={(article) => setSelectedArticle(article)} 
            isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
            unreadCount={unreadCount} onNotiIconClick={() => setView('notification')}
            handleScrapToggle={handleScrapToggle} scraps={notifications.filter(item => item.type === 'scrap_data')}
            onProfileClick={() => setView('setting')} 
          />
        )}

        {/* 🔖 [탭 2] 내 스크랩북 */}
        {view === 'scrap' && (
          <div className="home-container" style={{ padding: '16px', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('home')}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>← 내 스크랩</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ background: isDarkMode ? '#2C2C2E' : '#F2F2F7', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: isDarkMode ? '#AAA' : '#636366', cursor: 'pointer' }} onClick={() => {
                  const keyword = prompt('검색할 기사 제목을 입력하세요:');
                  if (keyword && keyword.trim() !== '') alert(`'${keyword}' 검색 결과를 호출합니다.`);
                }}>🔍 검색</button>
                <button style={{ background: isDarkMode ? '#FFF' : '#1C1C1E', color: isDarkMode ? '#1C1C1E' : '#FFF', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleAddFolder}>+ 새 폴더</button>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' }}>{notifications.filter(item => item.type === 'scrap_data').length}개 저장됨</h1>
              <span style={{ fontSize: '12px', color: '#8E8E93' }}>최근 업데이트: 오늘 14:20</span>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#8E8E93', display: 'block', marginBottom: '10px' }}>📁 폴더</span>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                {(folders || []).map((folder) => {
                  const isCurrentActive = activeFolderId === folder.id;
                  return (
                    <div key={folder.id} onClick={() => { setIsScrapLoading(true); setActiveFolderId(folder.id); setVisibleScrapCount(3); setTimeout(() => setIsScrapLoading(false), 150); }}
                      style={{ minWidth: '150px', background: isCurrentActive ? (isDarkMode ? '#3A3A3C' : '#EEF0FF') : (isDarkMode ? '#2C2C2E' : '#FFFFFF'), border: isCurrentActive ? '2px solid #5856D6' : (isDarkMode ? '1px solid #3A3A3C' : '1px solid #E5E5EA'), padding: '14px', borderRadius: '14px', position: 'relative', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', flexShrink: 0, cursor: 'pointer' }}>
                      <div style={{ width: '24px', height: '24px', background: isDarkMode ? '#48484A' : '#FAFAFA', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginBottom: '12px' }}>{folder.icon}</div>
                      <strong style={{ fontSize: '13px', display: 'block', color: isDarkMode ? '#FFF' : '#1C1C1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '20px' }}>{folder.name}</strong>
                      <span onClick={(e) => handleDeleteFolder(folder.id, e)} style={{ position: 'absolute', bottom: '14px', right: '14px', fontSize: '12px', color: '#FF3B30', opacity: 0.6 }}>🗑️</span>
                      <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '18px', fontWeight: '700', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>{folder.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>📌 {activeFolderName} 폴더</span>
              <span style={{ fontSize: '11px', color: '#8E8E93' }}>최신순 · 스크랩순</span>
            </div>

            <div className="articles-list">
              {isScrapLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#8E8E93' }}>🔄 로딩 중...</div>
              ) : currentFolderScraps.length === 0 ? (
                <div style={{ padding: '50px 16px', background: isDarkMode ? '#2C2C2E' : '#FAFAFA', borderRadius: '16px', border: '1px dashed #C7C7CC', textAlign: 'center', color: '#8E8E93', fontSize: '13px' }}>📂 이 폴더에 보관된 기사가 없습니다.</div>
              ) : (
                currentFolderScraps.slice(0, visibleScrapCount).map((scrap) => (
                  <div key={scrap.id} className="article-main-card" onClick={() => setSelectedArticle(scrap)} style={{ textAlign: 'left', background: isDarkMode ? '#2C2C2E' : '#FFF', border: isDarkMode ? '1px solid #3A3A3C' : '1px solid #E5E5EA' }}>
                    <div className="card-body-content">
                      <div className="card-meta-info">
                        <span className="cat-badge" style={{ background: '#EEF0FF', color: '#5856D6' }}>{scrap.category}</span>
                        <span className="src-text">{scrap.source}</span>
                      </div>
                      <h2 className="article-card-title" style={{ fontSize: '15px', margin: '4px 0 6px 0', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>{scrap.title}</h2>
                      <ul className="article-bullet-summary" style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#8E8E93' }}>
                        {scrap.bullets && scrap.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                      </ul>
                      <div className="card-bottom-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '11px', color: '#AEAEB2' }}>{scrap.dateText || '보관됨'}</span>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                          <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); alert('공유 링크가 복사되었습니다.'); }}>📤</span>
                          <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleMoveArticleFolder(scrap.id); }}>📁</span>
                          <span style={{ cursor: 'pointer', color: '#FF3B30' }} onClick={(e) => { e.stopPropagation(); handleScrapToggle(scrap); }}>🗑️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: isDarkMode ? '#2C2C2E' : '#F4F4F0', padding: '10px 12px', borderRadius: '10px', marginTop: '16px', fontSize: '11px', color: '#8E8E93' }}>
              <span>💡 스크랩한 기사는 영구 보관됩니다.</span>
              {currentFolderScraps.length > visibleScrapCount ? (
                <span style={{ fontWeight: 'bold', color: '#5856D6', cursor: 'pointer' }} onClick={() => setVisibleScrapCount(prev => prev + 3)}>더보기 ↓</span>
              ) : <span style={{ color: '#AEAEB2' }}>마지막 기사</span>}
            </div>
          </div>
        )}

        {/* 🔔 [탭 3] 알림 센터 */}
        {view === 'notification' && (
          <NotificationCenterView notifications={notifications} setNotifications={setNotifications} unreadCount={unreadCount} onMarkAllRead={markAllAsRead} setSelectedArticle={setSelectedArticle} />
        )}

        {/* 👤 [탭 4] 마이페이지 */}
        {view === 'setting' && (
          <div className="home-container" style={{ padding: '16px', color: isDarkMode ? '#FFF' : '#1C1C1E', overflowY: 'auto', maxHeight: '100%' }}>
            <h1 className="main-page-title" style={{ marginTop: '10px', textAlign: 'left' }}>마이페이지</h1>
            
            {/* 상단 회원 정보 프로필 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: isDarkMode ? '#2C2C2E' : '#F4F4F0', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ width: '54px', height: '54px', background: '#E8EAF6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#5856D6' }}>민</div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ fontSize: '16px', display: 'block', color: isDarkMode ? '#FFF' : '#1C1C1E' }}>김민우 님</strong>
                <span style={{ fontSize: '12px', color: '#8E8E93' }}>일반 회원 · munu@khu.ac.kr</span>
              </div>
            </div>

            {/* 뉴스 구독 조건 설정 */}
            <div style={{ background: isDarkMode ? '#2C2C2E' : '#FAFAFA', padding: '14px', borderRadius: '16px', border: '1px solid #E5E5EA', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>🌍 뉴스 구독 조건 설정</h3>
                <button 
                  onClick={() => {
                    if (isEditMode) {
                      const anyCountry = Object.values(editCountries).some(v => v);
                      const anyCategory = Object.values(editCategories).some(v => v);
                      if (!anyCountry || !anyCategory) { alert('최소 1개 이상의 국가와 카테고리를 골라야 합니다.'); return; }
                      setSelectedCountries({ ...editCountries });
                      setSelectedCategories({ ...editCategories });
                    } else {
                      setEditCountries({ ...selectedCountries });
                      setEditCategories({ ...selectedCategories });
                    }
                    setIsEditMode(!isEditMode);
                  }}
                  style={{ background: '#5856D6', color: '#FFF', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isEditMode ? '저장하기' : '조건 편집'}
                </button>
              </div>

              {isEditMode && <p style={{ fontSize: '11px', color: '#5856D6', margin: '-4px 0 10px 0' }}>💡 변경할 항목 칩을 직접 클릭한 후 상단 저장하기를 누르세요.</p>}

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#8E8E93', display: 'block', marginBottom: '6px' }}>구독 국가</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[['kr', '🇰🇷 한국'], ['us', '🇺🇸 미국'], ['jp', '🇯🇵 일본']].map(([key, label]) => {
                    const isTargetActive = isEditMode ? editCountries[key] : selectedCountries[key];
                    return (
                      <span 
                        key={key}
                        onClick={() => isEditMode && setEditCountries(p => ({ ...p, [key]: !p[key] }))}
                        style={{ background: isTargetActive ? '#5856D6' : (isDarkMode ? '#3A3A3C' : '#E5E5EA'), color: isTargetActive ? '#FFF' : (isDarkMode ? '#8E8E93' : '#1C1C1E'), padding: '5px 11px', borderRadius: '14px', fontSize: '12px', fontWeight: '500', cursor: isEditMode ? 'pointer' : 'default' }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#8E8E93', display: 'block', marginBottom: '6px' }}>관심 카테고리</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.entries({ it: '💻 기술·IT', economy: '💰 경제', politics: '🏛️ 정치', society: '👥 사회', sports: '⚽ 스포츠', entertainment: '🎬 연예·문화' }).map(([key, label]) => {
                    const isTargetActive = isEditMode ? editCategories[key] : selectedCategories[key];
                    return (
                      <span 
                        key={key}
                        onClick={() => isEditMode && setEditCategories(p => ({ ...p, [key]: !p[key] }))}
                        style={{ background: isTargetActive ? '#5856D6' : (isDarkMode ? '#3A3A3C' : '#E5E5EA'), color: isTargetActive ? '#FFF' : (isDarkMode ? '#8E8E93' : '#1C1C1E'), padding: '5px 11px', borderRadius: '14px', fontSize: '12px', fontWeight: '500', cursor: isEditMode ? 'pointer' : 'default' }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: isDarkMode ? '#2C2C2E' : '#FAFAFA', padding: '14px', borderRadius: '16px', border: '1px solid #E5E5EA', marginBottom: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>📊 나의 롱텀 투자 모니터링 키워드</h3>
              <p style={{ fontSize: '11px', color: '#8E8E93', margin: '0 0 10px 0' }}>해당 종목 코드가 언급된 AI 요약 기사가 생성되면 우선 배정 타겟팅이 연결됩니다.</p>
              
              <form onSubmit={handleAddTicker} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <input 
                  type="text" value={tickerInput} onChange={(e) => setTickerInput(e.target.value)} placeholder="예: AAPL, TSMC, DCA"
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #C7C7CC', background: isDarkMode ? '#1C1C1E' : '#FFF', color: isDarkMode ? '#FFF' : '#000', fontSize: '13px' }}
                />
                <button type="submit" style={{ background: '#1C1C1E', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0 12px', fontSize: '12px', fontWeight: 'bold' }}>추가</button>
              </form>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {investmentTickers.map(ticker => (
                  <span key={ticker} style={{ background: '#E4F6ED', color: '#107C41', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {ticker} <small onClick={() => handleRemoveTicker(ticker)} style={{ cursor: 'pointer', color: '#FF3B30', marginLeft: '2px' }}>✕</small>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: isDarkMode ? '#2C2C2E' : '#E5E5EA', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
              <div onClick={handleLogout} style={{ padding: '14px 16px', background: isDarkMode ? '#1C1C1E' : '#FFF', display: 'flex', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
                <span>로그아웃</span> <span style={{ color: '#AEAEB2' }}>➔</span>
              </div>
              <div onClick={handleAccountDelete} style={{ padding: '14px 16px', background: isDarkMode ? '#1C1C1E' : '#FFF', display: 'flex', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
                <span style={{ color: '#FF3B30', fontWeight: '600' }}>회원 탈퇴</span> <span style={{ color: '#FF3B30' }}>➔</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 하단 탭 바 */}
      {!isOnboarding && (
        <div className="app-bottom-nav-bar">
          <div className={`nav-tab-item ${view === 'home' ? 'is-active' : ''}`} onClick={() => { setView('home'); setIsEditMode(false); }}>
            <span className="nav-tab-icon">🏠</span><span className="nav-tab-label">홈</span>
          </div>
          <div className={`nav-tab-item ${view === 'scrap' ? 'is-active' : ''}`} onClick={() => { setView('scrap'); setIsEditMode(false); }}>
            <span className="nav-tab-icon">🔖</span><span className="nav-tab-label">스크랩</span>
          </div>
          <div className={`nav-tab-item ${view === 'notification' ? 'is-active' : ''}`} onClick={() => { setView('notification'); setIsEditMode(false); }}>
            <span className="nav-tab-icon" style={{ position: 'relative' }}>🔔{unreadCount > 0 && <span className="nav-mini-badge-dot"></span>}</span>
            <span className="nav-tab-label">알림</span>
          </div>
          <div className={`nav-tab-item ${view === 'setting' ? 'is-active' : ''}`} onClick={() => setView('setting')}>
            <span className="nav-tab-icon">👤</span><span className="nav-tab-label">마이페이지</span>
          </div>
        </div>
      )}

      {selectedArticle && <ArticleDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} isDarkMode={isDarkMode} />}
    </div>
  );
}

// 🏠 홈 타임라인 컴포넌체 (🌟 분야 6개 매핑 및 동적 데이터 카테고리 필터 확장 완료)
function HomeTimelineView({ onArticleClick, isDarkMode, setIsDarkMode, unreadCount, onNotiIconClick, handleScrapToggle, scraps, onProfileClick }) {
  const [currentCountry, setCurrentCountry] = useState('kr'); 
  const [currentCat, setCurrentCat] = useState('all'); // all, politics, economy, society, it, sports, entertainment

  // 🌟 [시안 image_979ca0.png 완벽 동기화] 3개국 × 6개 카테고리 기사 매스터셋 데이터베이스 설계
  const countryArticles = {
    kr: [
      { id: 1, rank: 1, category: '기술·IT', source: '네이버 뉴스', title: '반도체 수출 3개월 연속 증가, AI 수요가 견인', bullets: ['5월 반도체 수출액 전년 대비 18% 증가', 'HBM 등 AI용 메모리가 성장 주도'], replies: 142 },
      { id: 2, rank: 2, category: '경제', source: '네이버 뉴스', title: '한은 기준금리 동결, 시장 예상 부합', bullets: ['금통위 만장일치로 2.75% 유지 결정', '물가 안정세 지속이라고 판단'], replies: 87 },
      { id: 3, rank: 3, category: '정치', source: '네이버 뉴스', title: '국회 본회의서 민생법안 7건 통과', bullets: ['소상공인 지원법 개정안 등 여야 합의 처리', '주거안정 관련 법안도 함께 의결'], replies: 312 },
      { id: 4, rank: 4, category: '사회', source: '연합뉴스', title: '수도권 출퇴근 30분 단축, 광역버스 노선 대폭 확대', bullets: ['정부, 교통 사각지대 해소를 위한 대책 발표', '다음 달부터 순차적 운행 개시'], replies: 215 },
      { id: 5, rank: 5, category: '스포츠', source: '일간스포츠', title: '손흥민, 시즌 마지막 경기서 극적 결승골 작렬', bullets: ['팀 내 최다 득점 기록 갱신하며 시즌 마무리', '평점 9.2로 경기 MVP 선정'], replies: 642 },
      { id: 6, rank: 6, category: '연예·문화', source: 'OSEN', title: 'K-콘텐츠 글로벌 서밋 개막, 전 세계 바이어 집결', bullets: ['국내 주요 제작사 총출동하여 신작 라인업 공개', 'OTT 플랫폼 최적화 계약 성과 속출'], replies: 104 }
    ],
    us: [
      { id: 10, rank: 1, category: '기술·IT', source: 'CNN Business', title: 'Nvidia Market Cap Surpasses Apple Amid AI Boom', bullets: ['Nvidia becomes the second most valuable US company', 'Stock surges 5% following quarterly earnings blockbusters'], replies: 521 },
      { id: 11, rank: 2, category: '경제', source: 'The Wall Street Journal', title: 'Fed Hints at Rate Cuts Later This Year as Inflation Cools', bullets: ['Consumer price index rose less than expected in April', 'Chairman Powell emphasizes data-dependent approach'], replies: 419 },
      { id: 12, rank: 3, category: '사회', source: 'New York Times', title: 'New Green Space Initiative Launches Across Major US Cities', bullets: ['Federal funding allocated to restore urban parks and reduce heat islands', 'Community-led planting programs start next month'], replies: 135 },
      { id: 13, rank: 4, category: '정치', source: 'Washington Post', title: 'Congress Debates New Border Security Bill Details', bullets: ['Bipartisan committee works through holiday weekend to reach compromise', 'Funding for technological surveillance remains key sticking point'], replies: 894 },
      { id: 14, rank: 5, category: '스포츠', source: 'ESPN', title: 'Lakers Clinch Thrilling Overtime Victory in Game 7', bullets: ['Star forward scores 45 points to lead epic second-half comeback', 'Conference finals schedule set to begin this Thursday'], replies: 732 },
      { id: 15, rank: 6, category: '연예·문화', source: 'Hollywood Reporter', title: 'Summer Box Office Surges with Record Opening Weekend', bullets: ['Highly anticipated sci-fi sequel beats all industry tracking projections', 'Audience metrics show strong return of family demographic'], replies: 243 }
    ],
    jp: [
      { id: 20, rank: 1, category: '경제', source: '야후재팬 뉴스', title: '日経平均株価、半導体関連株牽引で再び3万9千円突破', bullets: ['東京エレクトロンなど主要装備メーカー株が一斉に急騰', '円安持続も輸出企業の業績好調に寄与'], replies: 93 },
      { id: 21, rank: 2, category: '기술·IT', source: '日経新聞', title: 'ラピダス、2ナノ次世代半導体試作工程を年内稼働と宣言', bullets: ['北海道千歳工場建設が順調に進行中', '米国IBMおよびベルギー研究機関との技術協力強化'], replies: 74 },
      { id: 22, rank: 3, category: '사회', source: '朝日新聞', title: '日本主要大企業、今春の賃上げ率平均5.28%で30년 만에 최고', bullets: ['人材確保のための破格の条件提示が拡散', '中小企業への波及が景気回復の分岐点'], replies: 156 },
      { id: 23, rank: 4, category: '정치', source: '読売新聞', title: '政府、クリーンエネルギー普及のための新法案を閣議決定', bullets: ['電気自動車購入補助金の延長措置を含む', '2030年までの脱炭素目標達成に向け加速'], replies: 112 },
      { id: 24, rank: 5, category: '스포츠', source: '日刊スポーツ', title: '大谷翔平、2打席連続本塁打で今季15号到達', bullets: ['打撃三冠王の視野に入る驚異的なペースを維持', '監督も「歴史的な瞬間を目の当たりにしている」と絶찬'], replies: 894 },
      { id: 25, rank: 6, category: '연예·문화', source: 'オリコン', title: '話題の新作アニメ映画、公開10日で興行収入50億円突破', bullets: ['SNSでの口コミが爆発的に広がりリピーターが続出', '世界120ヶ国での順次配給も決定'], replies: 311 }
    ]
  };

  // 1단계: 선택된 국가의 기본 피드 추출
  const rawArticles = countryArticles[currentCountry] || [];

  // 🌟 2단계: image_979ca0.png의 6개 칩 필터링 명칭 분기 시스템 결합
  const filteredArticles = rawArticles.filter(art => {
    if (currentCat === 'all') return true;
    if (currentCat === 'politics') return art.category === '정치';
    if (currentCat === 'economy') return art.category === '경제';
    if (currentCat === 'society') return art.category === '사회';
    if (currentCat === 'it') return art.category === '기술·IT';
    if (currentCat === 'sports') return art.category === '스포츠';
    if (currentCat === 'entertainment') return art.category === '연예·문화';
    return true;
  });

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="logo-section">📑 <span>뉴스브리프</span></div>
        <div className="country-tabs">
          <button className={currentCountry === 'kr' ? 'active' : ''} onClick={() => { setCurrentCountry('kr'); setCurrentCat('all'); }}>🇰🇷 한국</button>
          <button className={currentCountry === 'us' ? 'active' : ''} onClick={() => { setCurrentCountry('us'); setCurrentCat('all'); }}>🇺🇸 미국</button>
          <button className={currentCountry === 'jp' ? 'active' : ''} onClick={() => { setCurrentCountry('jp'); setCurrentCat('all'); }}>🇯🇵 일본</button>
        </div>
        <div className="header-right-icons">
          <button className="theme-toggle-icon" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '☀️' : '🌙'}</button>
          <div className="noti-icon-badge" style={{ cursor: 'pointer' }} onClick={onNotiIconClick}>🔔{unreadCount > 0 && <span className="noti-badge-num">{unreadCount}</span>}</div>
          <div className="user-avatar" style={{ cursor: 'pointer' }} onClick={onProfileClick}>민</div>
        </div>
      </div>
      <div className="update-status-bar"><span>🟢 마지막 크롤링 <strong>14:00</strong> · 다음 업데이트까지 <strong>2시간 14분</strong></span><button className="refresh-btn">🔄 새로고침</button></div>
      <div className="date-heading">2026년 5월 25일 · 월요일</div>
      
      <h1 className="main-page-title">오늘의 브리핑</h1>

      {/* 🌟 [시안 image_979ca0.png 매핑 완료] 전체 + 6개 카테고리 필터 인터페이스 조형 */}
      <div className="category-chips">
        {[
          ['all', '전체'], 
          ['politics', '정치'], 
          ['economy', '경제'], 
          ['society', '사회'], 
          ['it', '기술·IT'], 
          ['sports', '스포츠'], 
          ['entertainment', '연예·문화']
        ].map(([key, label]) => (
          <button key={key} className={currentCat === key ? 'active' : ''} onClick={() => setCurrentCat(key)}>{label}</button>
        ))}
      </div>

      <div className="session-timeline-box">
        <div className="timeline-header"><span>🕒 세션 타임라인 <small>{currentCountry.toUpperCase()} × {currentCat.toUpperCase()}</small></span><span className="timeline-meta">최대 6세션 · 30시간 보관</span></div>
        <div className="timeline-hours-grid">
          {['어제 14:00', '어제 19:00', '오늘 00:00', '오늘 05:00', '오늘 09:00'].map((time) => (
            <div key={time} className="hour-pill">{time.split(' ')[1]}<br/><small>{time.split(' ')[0]}</small></div>
          ))}
          <div className="hour-pill current-now">14:00<br/><small>지금</small></div>
        </div>
      </div>

      <div className="session-sub-title">14:00 세션 · 검색 결과 기사 <span className="right-label">세션당 최대 6개 로드</span></div>
      
      <div className="articles-list">
        {filteredArticles.length === 0 ? (
          <div style={{ padding: '30px 16px', background: isDarkMode ? '#2C2C2E' : '#FAFAFA', borderRadius: '12px', border: '1px dashed #C7C7CC', textAlign: 'center', color: '#8E8E93', fontSize: '13px' }}>
            📭 선택하신 분야의 실시간 업데이트 뉴스가 없습니다.
          </div>
        ) : (
          filteredArticles.map((art, index) => {
            const isScrapped = scraps.some(item => item.id === art.id);
            return (
              <div key={art.id} className="article-main-card" onClick={() => onArticleClick(art)}>
                <div className="card-rank-num">{index + 1}</div>
                <div className="card-body-content">
                  <div className="card-meta-info"><span className="cat-badge">{art.category}</span><span className="src-text">{art.source}</span></div>
                  <h2 className="article-card-title">{art.title}</h2>
                  <ul className="article-bullet-summary">{art.bullets.map((b, idx) => <li key={idx}>{b}</li>)}</ul>
                  <div className="card-bottom-actions">
                    <span className="action-link">🔗 원문</span><span className="action-link">💬 {art.replies}</span>
                    <button className="card-scrap-btn" onClick={(e) => { e.stopPropagation(); handleScrapToggle(art); }} style={isScrapped ? { color: '#5856D6', fontWeight: 'bold' } : {}}>{isScrapped ? '🔖 스크랩됨' : '📥 스크랩'}</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 알림 센터 컴포넌트
function NotificationCenterView({ notifications, setNotifications, unreadCount, onMarkAllRead, setSelectedArticle }) {
  const todayNotis = notifications.filter(n => n.section === 'today');
  const yesterdayNotis = notifications.filter(n => n.section === 'yesterday');
  const handleNotiClick = (noti) => {
    setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, unread: false } : n));
    if (noti.type === 'session' || noti.type === 'hotissue') {
      setSelectedArticle({ id: 1, rank: 1, category: '기술·IT', source: '네이버 뉴스', title: '반도체 수출 3개월 연속 증가, AI 수요가 견인', bullets: ['5월 반도체 수출액 전년 대비 18% 증가', 'HBM 등 AI용 메모리가 성장 주도'], replies: 142 });
    }
  };
  return (
    <div className="home-container">
      <div className="noti-page-header-row">
        <div className="noti-title-left-side"><span className="noti-main-text-title">알림</span>{unreadCount > 0 && <span className="noti-count-badge-pink">새 {unreadCount}개</span>}</div>
        <button className="noti-clear-all-btn" onClick={onMarkAllRead}>모두 읽음</button>
      </div>
      <div className="noti-list-scroll-box">
        {todayNotis.length > 0 && (
          <>
            <div className="noti-date-divider-title">오늘</div>
            {todayNotis.map(noti => (
              <div key={noti.id} className={`noti-list-card-item ${noti.unread ? 'is-unread-bg' : ''}`} onClick={() => handleNotiClick(noti)} style={{ cursor: 'pointer' }}>
                <div className={`noti-avatar-circle-icon ${noti.iconClass}`}>{noti.icon}</div>
                <div className="noti-body-content-info"><div className="noti-body-headline-title">{noti.title}</div><div className="noti-body-subtext-description">{noti.desc}</div></div>
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
                <div className="noti-body-content-info"><div className="noti-body-headline-title">{noti.title}</div><div className="noti-body-subtext-description">{noti.desc}</div></div>
                <div className="noti-right-time-text">{noti.time}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// AI 요약 상세 모달 팝업 컴포넌트
function ArticleDetailModal({ article, onClose, isDarkMode }) {
  if (!article) return null;
  return (
    <div className="modal-screen-overlay" onClick={onClose}>
      <div className={`modal-main-window ${isDarkMode ? 'dark-mode-app' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar"><button className="modal-back-arrow" onClick={onClose}>← 14:00 세션으로</button></div>
        <div className="modal-scroll-area">
          <div className="modal-meta-row"><span className="modal-cat-tag">{article.category}</span><span className="modal-source-meta">{article.source} · 브리핑</span></div>
          <h1 className="modal-article-title">{article.title}</h1>
          <button className="original-link-banner" onClick={() => alert('원문으로 이동합니다.')}><span className="naver-icon">N</span> <strong>원문 기사 보기</strong><br/><small>{article.source}</small></button>
          <div className="ai-summary-container-box">
            <div className="ai-box-title">✨ AI 요약</div>
            <ul className="ai-bullet-points">
              {article.bullets && article.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
              <li>해당 분야의 14:00 세션 최신 핵심 브리핑입니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
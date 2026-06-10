import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  FileCode, 
  Mail, 
  ThumbsUp, 
  MessageSquare, 
  ExternalLink, 
  Star, 
  X, 
  Copy, 
  Check, 
  LogOut, 
  LogIn, 
  Play, 
  Sparkles, 
  Laptop,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { 
  loginWithGoogle, 
  logout, 
  subscribeAuth, 
  subscribeComments, 
  addComment, 
  subscribeLikes, 
  toggleLike, 
  isMock 
} from './firebase';
import './App.css';

// Project static metadata
const PROJECTS = [
  {
    id: 'website',
    title: '網站架設',
    description: '成功架設個人網站與部署，用於展示個人資訊與學術學習歷程。',
    image: '/images/study-js/1.png',
    link: null, // No direct play link, just introduction card
    badge: '網頁開發'
  },
  {
    id: 'water-puzzle',
    title: 'Water Puzzle 小遊戲',
    description: '一個基於 JavaScript 撰寫的接水拼圖小遊戲，訓練邏輯思維與物件導向程式設計。',
    image: '/images/study-js/2.png',
    link: '/water-puzzle/index.html',
    badge: 'JS 遊戲'
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper 踩地雷',
    description: '經典踩地雷遊戲的 JavaScript 重製版，包含動態棋盤生成與鄰近地雷演算法。',
    image: '/images/study-js/3.png',
    link: '/Minesweeper/index.html',
    badge: 'JS 遊戲'
  },
  {
    id: 'final-project',
    title: '期末專題預留項目',
    description: '這是我這學期的期末專題預留展示區。我會將此卡片連結部署在您另一個獨立的網站上！',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    link: 'https://github.com/lililikunlin/kunlinweb', // Customizable final project link placeholder
    badge: '期末專題'
  }
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeProject, setActiveProject] = useState(null); // Project for comment drawer
  const [comments, setComments] = useState([]);
  const [likesData, setLikesData] = useState({}); // format: { [projId]: { count, hasLiked } }
  
  // Review form state
  const [userRating, setUserRating] = useState(5);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  // Typewriter effect states
  const typewriterTexts = ['南臺科技大學 資訊工程系學生', 'JavaScript 學習與網頁開發者', '中文閱讀與表達 輔助教學助理', '經濟部認證 資訊安全工程師'];
  const [typewriterText, setTypewriterText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth State listener
  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Likes Listener for all projects
  useEffect(() => {
    const unsubs = PROJECTS.map((proj) => {
      return subscribeLikes(proj.id, currentUser?.uid, (data) => {
        setLikesData((prev) => ({
          ...prev,
          [proj.id]: {
            count: data.totalLikes,
            hasLiked: data.userHasLiked
          }
        }));
      });
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  // Comments Listener when drawer opens
  useEffect(() => {
    if (!activeProject) {
      setComments([]);
      return;
    }

    const unsub = subscribeComments(activeProject.id, (commentsList) => {
      setComments(commentsList);
    });

    return unsub;
  }, [activeProject]);

  // Typewriter effect loop
  useEffect(() => {
    const activeText = typewriterTexts[textIndex];
    let timer;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypewriterText(activeText.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 50);
    } else {
      timer = setTimeout(() => {
        setTypewriterText(activeText.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 100);
    }

    if (!isDeleting && charIndex === activeText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000); // Wait 2s before delete
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex]);

  // Handle User Google Login
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
      alert('登入失敗，請確認 Firebase 設定。');
    }
  };

  // Handle User Logout
  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      await logout();
    }
  };

  // Handle Like Toggle
  const handleLike = async (projId) => {
    if (!currentUser) {
      alert('請先登入 Google 帳號才能按讚喔！');
      return;
    }
    try {
      await toggleLike(projId, currentUser.uid);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Submit Comment / Rating
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!commentContent.trim()) {
      alert('請輸入您的評論內容！');
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment(activeProject.id, currentUser, userRating, commentContent.trim());
      setCommentContent('');
      setUserRating(5); // Reset rating to 5
    } catch (error) {
      console.error(error);
      alert('發表評論失敗，請重試！');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Helper: Get Average Stars and Count
  const getProjectStats = (projId) => {
    // If we have comments fetched, we can calculate live average
    // But since comments state is only for activeProject, we also fallback to mock comments
    // Or we fetch comments for all projects.
    // For simplicity, we can query mock database if comments is empty, or just calculate on activeProject.
    // To make it look real-time for all cards, we can calculate from activeProject if matches.
    // Otherwise, we calculate from stored list in localStorage or return defaults.
    let list = [];
    if (activeProject && activeProject.id === projId) {
      list = comments;
    } else {
      // Fetch from mock localStorage comments
      try {
        const stored = localStorage.getItem('portfolio_mock_comments');
        if (stored) {
          list = JSON.parse(stored).filter(c => c.itemId === projId);
        }
      } catch (e) {
        list = [];
      }
    }

    if (list.length === 0) return { avg: 0, count: 0 };
    const sum = list.reduce((acc, c) => acc + c.rating, 0);
    return {
      avg: (sum / list.length).toFixed(1),
      count: list.length
    };
  };

  const handleCopyEmail = () => {
    const email = '4b2g0076@stust.edu.tw';
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="app-wrapper">
      {/* Navigation bar */}
      <header className="app-header">
        <div className="container nav-container">
          <div className="logo">
            KunLinWeb <span style={{fontSize: '0.8rem', opacity: 0.7, fontWeight: 400}}>● 個人學習歷程評論</span>
          </div>
          
          <div className="user-menu">
            {currentUser ? (
              <>
                <img className="user-avatar" src={currentUser.photoURL} alt={currentUser.displayName} />
                <span className="user-name">{currentUser.displayName}</span>
                <button className="btn btn-secondary btn-danger" onClick={handleLogout} style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                  <LogOut size={14} /> 登出
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleLogin}>
                <LogIn size={16} /> Google 登入
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="hero-section">
        <div className="container hero-content">
          {/* Avatar with glow border */}
          <div className="avatar-wrapper">
            <img className="avatar-img" src="/images/avatar.jpg" alt="李昆霖" onError={(e) => {
              // Fallback default avatar if not found
              e.target.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=kunlin";
            }} />
          </div>

          <div className="hero-title">
            <h1>李昆霖</h1>
            <div className="hero-subtitle">南臺科技大學資訊工程系</div>
            <div className="typewriter-box">
              <span className="typewriter">{typewriterText}</span>
            </div>
          </div>

          <p className="hero-desc">
            你好！我是來自南臺科技大學資訊工程系的昆霖。這裡是我本學期 JavaScript 的學習歷程作品集，整合了接水拼圖、踩地雷等小遊戲。歡迎登入您的 Google 帳號，為我的作品評分與留言評論！
          </p>

          {isMock && (
            <div style={{
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              maxWidth: '800px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '10px'
            }}>
              <Sparkles size={16} style={{flexShrink: 0}} />
              <span>
                <strong>本機測試模式運行中：</strong> 目前資料庫保存在 LocalStorage。如需上線，請將您的 Firebase API 金鑰填寫至專案目錄下的 <code>.env</code> 檔案中。
              </span>
            </div>
          )}
        </div>
      </section>

      {/* About Me Section */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">關於我與個人成就</h2>
            <p className="section-desc">我的技能證照、校園助理與學術獲獎紀錄</p>
          </div>

          <div className="about-grid">
            {/* Left Card: Skills & Certificates */}
            <div className="glass-card">
              <h3 className="card-title-with-icon">
                <Award size={20} className="text-cyan" style={{color: 'var(--accent-cyan)'}} />
                專業技能與證照
              </h3>
              
              <div className="skills-list">
                <div className="skill-card-item">
                  <div className="skill-category">程式語言證照</div>
                  <div className="skill-name">TQC+ 基礎程式語言 C++ (第 2 版)</div>
                </div>
                <div className="skill-card-item">
                  <div className="skill-category">國家政府機關能力鑑定</div>
                  <div className="skill-name">經濟部產業人才能力鑑定 (iPAS) - 資訊安全工程師 (初級)</div>
                </div>
              </div>
            </div>

            {/* Right Card: Campus TA & Awards */}
            <div className="glass-card">
              <h3 className="card-title-with-icon">
                <BookOpen size={20} className="text-purple" style={{color: 'var(--accent-purple)'}} />
                校園經歷與學業獲獎
              </h3>

              <div className="experience-list">
                {/* Teaching Assistant */}
                <div className="experience-item">
                  <div className="exp-year">113學年度 第一學期 & 第二學期</div>
                  <div className="exp-title">課程輔助教學助理 (TA)</div>
                  <div className="exp-desc">
                    輔導教師：陳金英 老師<br />
                    輔導課程：中文閱讀與表達(一)-四技財金一丙 / 電機控晶一甲、舌尖味蕾的生命美感(A)
                  </div>
                </div>

                {/* Awards */}
                <div className="experience-item">
                  <div className="exp-year">學業菁英榮譽</div>
                  <div className="exp-title">學業菁英獎</div>
                  <div className="exp-desc">
                    113學年度第1學期與第2學期，連續榮獲「學業菁英獎」學術榮譽肯定。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio / Project Review Grid */}
      <section className="portfolio-section" id="portfolio">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">個人學習歷程評論</h2>
            <p className="section-desc">點選小遊戲開始遊玩，或是點擊「評論區」發表您的看法與五星級評分</p>
          </div>

          <div className="portfolio-grid">
            {PROJECTS.map((proj) => {
              const likes = likesData[proj.id] || { count: 0, hasLiked: false };
              const stats = getProjectStats(proj.id);

              return (
                <div className="glass-card portfolio-card" key={proj.id}>
                  {/* Image banner with overlay badge */}
                  <div className="card-img-wrapper">
                    <img className="card-img" src={proj.image} alt={proj.title} />
                    <div className="card-overlay">
                      <span className="badge badge-cyan">{proj.badge}</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="card-proj-title">{proj.title}</h3>
                    <p className="card-proj-desc">{proj.description}</p>
                    
                    {/* Display likes count & stars average */}
                    <div className="card-stats">
                      <div className="stat-item rating">
                        <Star size={14} fill={stats.count > 0 ? "var(--accent-gold)" : "transparent"} />
                        <span>{stats.count > 0 ? `${stats.avg} (${stats.count} 次評分)` : '暫無評分'}</span>
                      </div>
                      <div className="stat-item">
                        <ThumbsUp size={14} fill={likes.hasLiked ? "var(--accent-cyan)" : "transparent"} />
                        <span>{likes.count} 人按讚</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Play, Like, Comment */}
                  <div className="card-actions">
                    <button 
                      className={`btn btn-secondary ${likes.hasLiked ? 'active' : ''}`}
                      onClick={() => handleLike(proj.id)}
                      style={{
                        borderColor: likes.hasLiked ? 'var(--accent-cyan)' : 'var(--border-color)',
                        color: likes.hasLiked ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        background: likes.hasLiked ? 'rgba(6, 182, 212, 0.05)' : 'transparent'
                      }}
                    >
                      <ThumbsUp size={16} fill={likes.hasLiked ? "var(--accent-cyan)" : "transparent"} /> 
                      {likes.hasLiked ? '已按讚' : '按讚'}
                    </button>

                    <div className="card-links">
                      {proj.link && (
                        <a 
                          href={proj.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary"
                          style={{ color: '#000' }}
                        >
                          <Play size={14} fill="#000" /> 開始遊玩
                        </a>
                      )}
                      
                      <button className="btn btn-secondary" onClick={() => setActiveProject(proj)}>
                        <MessageSquare size={16} /> 評論區
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Slide-out Drawer for Comments & Reviews */}
      {activeProject && (
        <div className="drawer-overlay" onClick={() => setActiveProject(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="drawer-header">
              <h3 className="drawer-title">{activeProject.title} 評論區</h3>
              <button className="close-btn" onClick={() => setActiveProject(null)}>
                <X size={24} />
              </button>
            </div>

            {/* Average Rating Display */}
            {(() => {
              const stats = getProjectStats(activeProject.id);
              return (
                <div className="drawer-stats">
                  <div className="drawer-stat-item">
                    <div className="drawer-stat-val">⭐ {stats.count > 0 ? stats.avg : 'N/A'}</div>
                    <div className="drawer-stat-lbl">平均星等</div>
                  </div>
                  <div className="drawer-stat-item">
                    <div className="drawer-stat-val">{stats.count}</div>
                    <div className="drawer-stat-lbl">評論總數</div>
                  </div>
                  <div className="drawer-stat-item">
                    <div className="drawer-stat-val">{(likesData[activeProject.id] || {count: 0}).count}</div>
                    <div className="drawer-stat-lbl">點讚數</div>
                  </div>
                </div>
              );
            })()}

            {/* Review Form Area */}
            <div className="review-form-section">
              {currentUser ? (
                <form onSubmit={handleSubmitComment}>
                  <div className="form-title">撰寫您的評論</div>
                  
                  {/* Interactive Star Picker */}
                  <div className="form-group">
                    <label className="form-label">選擇星等評分</label>
                    <div className="stars-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`star-icon ${star <= userRating ? 'active' : 'inactive'}`}
                          onClick={() => setUserRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Text Area */}
                  <div className="form-group">
                    <label className="form-label">輸入評論留言</label>
                    <textarea 
                      className="comment-input"
                      rows="3"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="分享您遊玩後的意見或心得給作者..."
                      maxLength="300"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submittingComment}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {submittingComment ? '正在送出...' : '送出五星評論'}
                  </button>
                </form>
              ) : (
                <div className="login-prompt-card">
                  <UserCheck size={24} style={{color: 'var(--accent-purple)'}} />
                  <div className="login-prompt-text">
                    想要給予五星好評與留言嗎？請先登入 Google 帳號。
                  </div>
                  <button className="btn btn-primary" onClick={handleLogin}>
                    <LogIn size={16} /> Google 快速登入
                  </button>
                </div>
              )}
            </div>

            {/* Comments List */}
            <h4 style={{fontSize: '1rem', marginBottom: '16px', color: '#fff'}}>所有留言與評分 ({comments.length})</h4>
            <div className="reviews-container">
              {comments.length === 0 ? (
                <div className="no-reviews">
                  目前還沒有留言，快來搶沙發！
                </div>
              ) : (
                comments.map((comment) => (
                  <div className="review-item" key={comment.id}>
                    <div className="review-user-info">
                      <img className="review-avatar" src={comment.photoURL} alt={comment.displayName} />
                      <span className="review-name">{comment.displayName}</span>
                      <span className="review-date">
                        {(() => {
                          const d = new Date(comment.createdAt);
                          return isNaN(d.getTime()) ? '剛剛' : `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>

                    {/* Star Display */}
                    <div className="review-meta">
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`review-star-small ${star > comment.rating ? 'empty' : ''}`}
                            size={12}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="review-text">{comment.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer & Contact Section */}
      <footer className="footer-section">
        <div className="container footer-content">
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center'}}>
            <h4 style={{color: '#fff', fontSize: '1.2rem'}}>聯絡我</h4>
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>歡迎透過電子郵件對我的作品提出其他建議！</p>
          </div>

          <div className="contact-email-box" onClick={handleCopyEmail}>
            <Mail size={16} style={{color: 'var(--accent-cyan)'}} />
            <span className="email-text">4b2g0076@stust.edu.tw</span>
            {copied ? (
              <Check size={14} style={{color: '#22c55e'}} />
            ) : (
              <Copy size={14} style={{color: 'var(--text-muted)'}} />
            )}
          </div>

          <div className="copyright-text">
            &copy; {new Date().getFullYear()} KunLinWeb. All rights reserved. Created with React & Firebase.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

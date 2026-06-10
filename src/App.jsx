import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Code, Shield, Award, Terminal, 
  Briefcase, Gamepad2, Star, Heart, MessageSquare, Rocket, ExternalLink, LogOut
} from 'lucide-react';
// 匯入 Firebase 驗證所需的模組
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // 確保路徑正確指向你的 firebase.js
import './index.css'; 

function App() {
  // 建立 React 狀態來儲存使用者資料
  const [user, setUser] = useState(null);

  // 網頁載入時，監聽使用者的登入狀態 (這樣重整網頁才不會被登出)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // 元件卸載時清除監聽
  }, []);

  // 處理 Google 登入的非同步函式
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("登入失敗：", error);
      alert("登入失敗，請檢查終端機或控制台的錯誤訊息。");
    }
  };

  // 處理登出的非同步函式
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("登出失敗：", error);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* --- 英雄導覽區 (Hero Section) --- */}
      <header style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: 'var(--text-main)', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
          昆霖 (Kun-Lin)
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Terminal size={20} />
          南臺科技大學資訊工程系 | 網頁開發者 | 技術助理
        </p>
        
        {/* 動態登入區塊：根據 user 狀態決定顯示什麼 */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          {user ? (
            // 已登入狀態：顯示頭像、歡迎詞與登出按鈕
            <div className="glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '10px 20px' }}>
              <img 
                src={user.photoURL} 
                alt="User Avatar" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--neon-cyan)' }} 
              />
              <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                歡迎，{user.displayName}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', 
                  color: '#ff5555', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <LogOut size={16} /> 登出
              </button>
            </div>
          ) : (
            // 未登入狀態：顯示 Google 登入按鈕
            <button 
              onClick={handleGoogleLogin}
              className="glass-card" 
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}
            >
              <UserCircle size={24} color="var(--neon-purple)" />
              Google 帳號登入
            </button>
          )}
        </div>
      </header>

      {/* --- 關於我 (About Me) --- */}
      <section className="glass-card" style={{ marginBottom: '50px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '15px' }}>
          <Code size={28} color="var(--neon-purple)" /> 
          關於我 (About Me)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          具備資訊工程背景，熱衷於網頁前端開發與系統架設。目前正在建置結合 React 與 Google Firebase 生態系的個人作品集網站。
        </p>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Shield size={20} color="var(--neon-cyan)"/> 
              專業證照與技能
            </h3>
            <ul style={{ color: 'var(--text-muted)' }}>
              <li>TQC+ C++ 程式設計</li>
              <li>資訊安全工程師初級能力鑑定</li>
              <li>React (Vite) 前端開發</li>
              <li>Google Firebase 後端整合</li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Award size={20} color="var(--neon-cyan)"/> 
              獲獎與經歷
            </h3>
            <ul style={{ color: 'var(--text-muted)' }}>
              <li>教學助理 (TA) 經歷</li>
              <li>互動式網頁應用程式開發</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- JavaScript 作品集 (JS Learning Records) --- */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '15px', marginBottom: '25px' }}>
          <Briefcase size={28} color="var(--neon-cyan)" /> 
          JavaScript 學習紀錄
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--text-main)', marginTop: 0 }}>個人專案網站</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>使用 React + Vite 打造，並結合 Firebase 實作留言板與評分系統的個人技術展示平台。</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', gap: '5px', color: '#ffb703', alignItems: 'center' }}>
                <Star size={18} fill="#ffb703" /> <span>0.0</span>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}><Heart size={18} /> 0</span>
                <span style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}><MessageSquare size={18} /> 0</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gamepad2 size={20} color="var(--neon-purple)"/> Water Puzzle
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>經典的水桶倒水解謎遊戲，考驗邏輯與演算法實作能力。</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', gap: '5px', color: '#ffb703', alignItems: 'center' }}>
                <Star size={18} fill="#ffb703" /> <span>0.0</span>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}><Heart size={18} /> 0</span>
                <span style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}><MessageSquare size={18} /> 0</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gamepad2 size={20} color="var(--neon-purple)"/> Minesweeper
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>復刻經典踩地雷遊戲，包含遞迴展開空白區域與插旗功能。</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', gap: '5px', color: '#ffb703', alignItems: 'center' }}>
                <Star size={18} fill="#ffb703" /> <span>0.0</span>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}><Heart size={18} /> 0</span>
                <span style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}><MessageSquare size={18} /> 0</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- 期末專題預留區 (Final Project Link) --- */}
      <section className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--neon-purple)', boxShadow: '0 0 20px rgba(138, 43, 226, 0.1)' }}>
        <Rocket size={48} color="var(--neon-purple)" style={{ marginBottom: '15px' }} />
        <h2 style={{ color: 'var(--text-main)', margin: '0 0 15px 0' }}>期末專題展示</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '25px', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
          這裡預留了期末專題的展示空間。未來您可以點擊下方按鈕，直接跳轉至獨立的專題網站。
        </p>
        <button style={{ 
            background: 'transparent', 
            border: '1px solid var(--neon-cyan)', 
            color: 'var(--neon-cyan)', 
            padding: '12px 24px', 
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          前往專題網站 <ExternalLink size={18} />
        </button>
      </section>

    </div>
  );
}

export default App;
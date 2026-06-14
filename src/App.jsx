import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Code, Shield, Award, Terminal, 
  Briefcase, Gamepad2, Rocket, ExternalLink, LogOut, Sun, Moon, Activity, Database
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; 
import './index.css'; 
import ProjectCard from './ProjectCard';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("登入失敗：", error);
      alert("登入失敗，請檢查主控台錯誤訊息。");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("登出失敗：", error);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 15px' }}>
            <img src={user.photoURL} alt="User Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--neon-cyan)' }} />
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem', display: 'none' }} className="user-name-display">{user.displayName}</span>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="登出">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={handleGoogleLogin} className="glass-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', padding: '8px 15px', fontSize: '0.9rem' }}>
            <UserCircle size={20} color="var(--neon-purple)" /> <span className="login-text">登入</span>
          </button>
        )}
        <button onClick={toggleTheme} className="glass-card" style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', width: '40px', height: '40px' }} title="切換深淺色模式">
          {theme === 'dark' ? <Sun size={20} color="#ffb703" /> : <Moon size={20} color="var(--neon-purple)" />}
        </button>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '60px', marginTop: '60px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: 'var(--text-main)', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
          昆霖 (Kun-Lin)
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Terminal size={20} />
          南臺科技大學資訊工程系 | 網頁開發者
        </p>
      </header>

      <section className="glass-card" style={{ marginBottom: '50px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '15px' }}>
          <Code size={28} color="var(--neon-purple)" /> 關於我 (About Me)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          具備資訊工程背景，嘗試於網頁前端開發與系統架設。目前正在建置結合 React 與 Google Firebase 生態系的個人作品集網站。
        </p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}><Shield size={20} color="var(--neon-cyan)"/> 專業證照與技能</h3>
            <ul style={{ color: 'var(--text-muted)' }}>
              <li>TQC+ C++ 程式設計</li>
              <li>資訊安全工程師初級能力鑑定</li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}><Award size={20} color="var(--neon-cyan)"/> 獲獎與經歷</h3>
            <ul style={{ color: 'var(--text-muted)' }}>
              <li>113學年度 1學期 獎別：學業菁英獎</li>
              <li>113學年度 2學期 獎別：學業菁英奬</li>
              <li>教學助理 (TA) 經歷</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '15px', marginBottom: '25px' }}>
          <Briefcase size={28} color="var(--neon-cyan)" /> JavaScript 學習紀錄
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          {[
            { id: 'portfolio', title: '個人專案網站', desc: '初次網站架設。', icon: <Rocket size={20} color="var(--neon-purple)"/>, link: 'https://lililikunlin.github.io/kunlinweb/index.html', thumb: 'https://lililikunlin.github.io/kunlinweb/images/study-js/1.png', btnText: '瀏覽' },
            { id: 'water-puzzle', title: 'Water Puzzle', desc: '經典的水桶倒水解謎遊戲，考驗邏輯與演算法實作能力。', icon: <Gamepad2 size={20} color="var(--neon-purple)"/>, link: 'https://lililikunlin.github.io/kunlinweb/water-puzzle/index.html', thumb: 'https://lililikunlin.github.io/kunlinweb/images/study-js/2.png', btnText: '遊玩' },
            { id: 'minesweeper', title: 'Minesweeper', desc: '復刻經典踩地雷遊戲，包含遞迴展開空白區域與插旗功能。', icon: <Gamepad2 size={20} color="var(--neon-purple)"/>, link: 'https://lililikunlin.github.io/kunlinweb/Minesweeper/', thumb: 'https://lililikunlin.github.io/kunlinweb/images/study-js/3.png', btnText: '遊玩' }
          ].map((item) => (
            <ProjectCard key={item.id} item={item} user={user} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '15px', marginBottom: '25px' }}>
          <Database size={28} color="var(--neon-purple)" /> 期末專題展示
        </h2>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ProjectCard 
            key="orthanc-flask-telemed" 
            user={user} 
            item={{
              id: 'orthanc-flask-telemed',
              title: 'Orthanc × Flask 後端串接系統',
              desc: '結合 Orthanc 醫療影像伺服器與 Flask 後端框架，並導入 FIDO2 生物辨識技術以確保醫療數據安全。系統包含完善的醫師身分驗證與系統帳號權限（Admin, Doctor, Patient）管理。',
              icon: <Activity size={24} color="var(--neon-purple)"/>,
              link: 'https://telemed-sec.duckdns.org:5000/',
              thumb: '/telemed-preview.png',
              objectFit: 'contain',
              imageHeight: 'auto',
              btnText: '前往系統'
            }} 
          />
        </div>
      </section>
    </div>
  );
}

export default App;
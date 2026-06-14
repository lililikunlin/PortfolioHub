import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Code, Shield, Award, Terminal, 
  Briefcase, Gamepad2, Rocket, ExternalLink, LogOut, Sun, Moon
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
      
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        <button onClick={toggleTheme} className="glass-card" style={{ padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', width: '45px', height: '45px' }} title="切換深淺色模式">
          {theme === 'dark' ? <Sun size={22} color="#ffb703" /> : <Moon size={22} color="var(--neon-purple)" />}
        </button>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: 'var(--text-main)', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
          昆霖 (Kun-Lin)
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Terminal size={20} />
          南臺科技大學資訊工程系 | 網頁開發者
        </p>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {user ? (
            <div className="glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '10px 20px' }}>
              <img src={user.photoURL} alt="User Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--neon-cyan)' }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>歡迎，{user.displayName}</span>
              <button onClick={handleLogout} style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', color: '#ff5555', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <LogOut size={16} /> 登出
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} className="glass-card" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <UserCircle size={24} color="var(--neon-purple)" /> Google 帳號登入
            </button>
          )}
        </div>
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

      <section className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--neon-purple)', boxShadow: '0 0 20px rgba(138, 43, 226, 0.1)' }}>
        <Rocket size={48} color="var(--neon-purple)" style={{ marginBottom: '15px' }} />
        <h2 style={{ color: 'var(--text-main)', margin: '0 0 15px 0' }}>期末專題展示</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '25px', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
          這裡預留了期末專題的展示空間。未來您可以點擊下方按鈕，直接跳轉至獨立的專題網站。
        </p>
        <button style={{ background: 'transparent', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
          前往專題網站 <ExternalLink size={18} />
        </button>
      </section>
    </div>
  );
}

export default App;
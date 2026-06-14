# KunLin's Portfolio (昆霖的個人作品集)

這是一個使用 React + Vite 打造的個人專案與技術展示網站。本網站結合了 Google Firebase 的多項雲端服務，不僅具備現代化的前端 UI 設計，更實作了完整的全端即時互動功能（留言、評分與按讚）。

## ✨ 核心功能特色 (Features)

*   **現代化 UI/UX 設計**：採用帶有科技感的玻璃擬物化 (Glassmorphism) 卡片設計，並包含流暢的微動畫與 Hover 效果。
*   **深淺色模式切換 (Dark/Light Mode)**：支援一鍵切換深色與淺色主題，並會將使用者的偏好自動儲存於瀏覽器 (`localStorage`) 中。
*   **Google 帳號登入 (Firebase Auth)**：整合 Firebase Authentication，提供安全且快速的 Google 第三方登入功能。
*   **即時留言板與星級評分 (Firestore)**：登入的使用者可以對各個專案作品留下 1-5 顆星的評價與留言。透過 Firestore 的即時監聽 (`onSnapshot`)，所有留言資料無須重新整理即可在畫面上即時同步更新。
*   **即時按讚系統 (Firestore)**：使用者可對喜歡的作品點擊愛心按讚，總按讚數即時計算並同步。
*   **響應式設計 (RWD)**：版面與導覽列會自動適應手機、平板與電腦等不同螢幕尺寸。

## 🛠️ 技術棧 (Tech Stack)

*   **前端框架**：[React](https://react.dev/) 18 (搭配 React Hooks)
*   **建置工具**：[Vite](https://vitejs.dev/) (提供極速的冷啟動與 HMR 熱重載)
*   **後端服務 (BaaS)**：[Google Firebase](https://firebase.google.com/)
    *   **Authentication**：處理 Google OAuth 2.0 登入。
    *   **Cloud Firestore**：NoSQL 即時資料庫，儲存 `likes` 與 `comments` 集合。
    *   **Hosting**：雲端網頁代管，提供全球 CDN 與 SSL 憑證。
*   **圖示庫**：[Lucide React](https://lucide.dev/) (開源的精美 SVG 圖標集)
*   **樣式與排版**：純 Vanilla CSS (搭配 CSS Variables 管理主題色彩)

## 🚀 本機執行方式 (Run Locally)

如果您想要將此專案 clone 到本機執行，請確保您的電腦已安裝 [Node.js](https://nodejs.org/)。

1. **安裝依賴套件**
   ```bash
   npm install
   ```

2. **設定環境變數**
   在專案根目錄下建立一個 `.env` 檔案，並填入您的 Firebase 設定檔資訊（請勿加上引號或大括號）：
   ```env
   VITE_FIREBASE_API_KEY=您的_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=您的_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID=您的_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=您的_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=您的_SENDER_ID
   VITE_FIREBASE_APP_ID=您的_APP_ID
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   *執行後，在瀏覽器開啟 `http://localhost:5173` 即可預覽網站。*

## 📦 打包與部署 (Build & Deploy)

本專案使用 Firebase Hosting 進行部署。

1. **編譯打包前端靜態檔案**
   ```bash
   npm run build
   ```
   *這會在專案目錄下產生一個最佳化過後的 `dist` 資料夾。*

2. **部署至 Firebase Hosting**
   *(請確保您已使用 `firebase login` 登入 CLI 工具)*
   ```bash
   .\node_modules\.bin\firebase.cmd deploy --only hosting
   ```

---
*Developed by 昆霖 (Kun-Lin)*

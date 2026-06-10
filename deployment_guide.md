# PortfolioHub：部署與 Firebase 設定指南

本指南將引導您完成 **Google Firebase Console** 的設定，並將您的個人網頁部署至 **Firebase Hosting**，讓網站實際上線並獲取網址！

---

## 🛠️ 第一階段：Google Firebase Console 雲端設定

請依照下列步驟在網頁瀏覽器中啟用 Google 提供的雲端服務：

### 1. 建立 Firebase 專案
1. 開啟瀏覽器並前往 [Firebase 控制台 (Firebase Console)](https://console.firebase.google.com/)。
2. 點擊 **「新增專案」 (Add Project)**。
3. 輸入專案名稱（例如：`kunlin-portfolio`），然後點擊繼續。
4. （選用）Google Analytics 視您的需求決定是否啟用，接著點擊 **「建立專案」**。

### 2. 獲取 API 金鑰並填入 `.env`
1. 在專案首頁的中心，點擊網頁圖示 **`</>` (Web)** 註冊應用程式。
2. 輸入應用程式暱稱（例如：`portfolio-web`），點擊「註冊應用程式」。
3. 註冊後，會顯示包含 `firebaseConfig` 的 JavaScript 程式碼。複製對應的數值並貼入專案資料夾下的 [`.env`](file:///C:/Users/STUST/Music/PortfolioHub/.env) 檔案中：
   ```env
   VITE_FIREBASE_API_KEY=您的 apiKey
   VITE_FIREBASE_AUTH_DOMAIN=您的 authDomain
   VITE_FIREBASE_PROJECT_ID=您的 projectId
   VITE_FIREBASE_STORAGE_BUCKET=您的 storageBucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=您的 messagingSenderId
   VITE_FIREBASE_APP_ID=您的 appId
   ```
4. 存檔 `.env` 檔案。

### 3. 啟用 Google 帳號登入 (Authentication)
1. 在 Firebase 控制台左側選單中，點擊 **「建置」 (Build)** -> **「Authentication」**。
2. 點擊 **「開始使用」 (Get Started)**。
3. 在「登入方法」 (Sign-in method) 頁籤中，點擊 **「Google」**。
4. 將狀態切換為 **「啟用」 (Enable)**。
5. 填寫「專案支援電子郵件」，然後點擊 **「儲存」 (Save)**。

### 4. 建立 Firestore 資料庫 (Database)
1. 在左側選單點擊 **「建置」 (Build)** -> **「Firestore Database」**。
2. 點擊 **「建立資料庫」 (Create Database)**。
3. 位置選取預設或離台灣最近的地區（例如 `asia-east1` 或 `us-central`），點擊下一步。
4. 規則選取 **「以測試模式啟動」 (Start in test mode)**（此模式允許我們開發階段直接進行讀寫），點擊 **「建立」**。

### 5. 啟用 Firebase Hosting
1. 在左側選單點擊 **「建置」 (Build)** -> **「Hosting」**。
2. 點擊 **「開始使用」 (Get Started)**，並一直點擊下一步完成設定。

---

## 🚀 第二階段：本機打包與實際上線部署

當您在控制台與 `.env` 中設定完畢後，請在終端機中執行以下指令將網站推上線：

### 1. 進行專案編譯打包
每次修改代碼後，都必須重新編譯：
```bash
npm run build
```
此指令會產生包含已編譯 HTML/CSS/JS 的 `dist` 資料夾。

### 2. 登入您的 Google Firebase 帳戶
```bash
npx firebase login
```
*這會在瀏覽器打開視窗，請登入您剛才建立 Firebase 專案的 Google 帳號。*

### 3. 部署網站上線
請執行以下指令進行部署（將 `<your-project-id>` 替換為您的 Firebase 專案 ID，例如 `kunlin-portfolio`）：
```bash
npx firebase deploy --project <your-project-id>
```

部署完成後，終端機會顯示您的專屬網址，如：
👉 **`https://<your-project-id>.web.app`** 或 **`https://<your-project-id>.firebaseapp.com`**

這就是您要繳交的網站位址！

---

## 🔒 補充：正式上線安全規則設定 (Firestore Security Rules)
為防止惡意寫入，當專案正式繳交上線後，建議至 Firebase 控制台的 **Firestore Database** -> **Rules (規則)** 頁籤，將內容修改為以下唯讀與驗證寫入規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許任何人讀取評論與按讚，但寫入與刪除必須為已驗證的 Google 登入用戶
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /likes/{likeId} {
      allow read: if true;
      allow create, delete: if request.auth != null && request.auth.uid == split(likeId, '_')[0];
    }
  }
}
```
修改完點擊「發布」即可保護您的資料庫安全！

# AuraGo 🌍 智能旅遊路線規劃

以 AI 驅動的台灣旅遊路線規劃工具，支援單日遊、多日遊、跨縣市路線，並根據即時天氣自動調整行程。

## 功能特色

- 🗺️ 單日遊 / 多日遊路線規劃
- 🌦️ 即時天氣整合，下雨自動避開戶外景點
- 🎯 依興趣標籤篩選景點（古蹟、生態、藝術、購物等）
- 🏨 多日遊自動安排住宿
- 📍 起終點路線模式 / 區域探索模式

## 安裝與啟動

### 1. 安裝依賴套件

```bash
npm install
```

### 2. 設定環境變數

建立 `.env` 檔案於專案根目錄：

```env
TDX_CLIENT_ID=你的TDX_CLIENT_ID
TDX_CLIENT_SECRET=你的TDX_CLIENT_SECRET
CWA_API_KEY=你的CWA_API_KEY
```

- **TDX**：至 [TDX 運輸資料流通服務平臺](https://tdx.transportdata.tw/) 註冊取得
- **CWA**：至 [中央氣象署開放資料平臺](https://opendata.cwa.gov.tw/) 註冊取得

### 3. 啟動伺服器

```bash
node server.js
```

伺服器啟動後，開啟瀏覽器前往 `http://localhost:3000` 即可使用。

## 技術架構

- **後端**：Node.js + Express
- **前端**：HTML / CSS / JavaScript
- **資料來源**：TDX 觀光 API、CWA 氣象 API、Nominatim 地理編碼

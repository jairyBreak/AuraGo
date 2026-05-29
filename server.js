require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 提供 public 資料夾內的前端網頁給手機或瀏覽器
app.use(express.static(path.join(__dirname, 'public')));

let tdxAccessToken = '';
let tdxTokenExpiry = 0;

async function getTdxToken() {
    if (tdxAccessToken && Date.now() < tdxTokenExpiry - 60000) return tdxAccessToken;
    try {
        const response = await axios.post(
            'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.TDX_CLIENT_ID,
                client_secret: process.env.TDX_CLIENT_SECRET
            }).toString(),
            { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        );
        tdxAccessToken = response.data.access_token;
        tdxTokenExpiry = Date.now() + (response.data.expires_in * 1000);
        console.log("✅ 成功取得 TDX Token");
        return tdxAccessToken;
    } catch (error) {
        console.error("❌ TDX 驗證失敗, 請檢查 .env 金鑰");
        throw new Error('TDX Authentication Failed');
    }
}

// --- API 路由：智慧取得景點與美食 ---
app.get('/api/tour/:city', async (req, res) => {
    const cityMap = {
        '基隆市': 'Keelung', '臺北市': 'Taipei', '新北市': 'NewTaipei',
        '桃園市': 'Taoyuan', '新竹市': 'Hsinchu', '新竹縣': 'HsinchuCounty',
        '苗栗縣': 'MiaoliCounty', '臺中市': 'Taichung', '彰化縣': 'ChanghuaCounty',
        '南投縣': 'NantouCounty', '雲林縣': 'YunlinCounty', '嘉義市': 'Chiayi',
        '嘉義縣': 'ChiayiCounty', '臺南市': 'Tainan', '高雄市': 'Kaohsiung',
        '屏東縣': 'PingtungCounty', '宜蘭縣': 'YilanCounty', '花蓮縣': 'HualienCounty',
        '臺東縣': 'TaitungCounty', '澎湖縣': 'PenghuCounty'
    };
    
    let searchCity = req.params.city.replace('台', '臺');
    const tdxCity = cityMap[searchCity] || 'Tainan'; 

    const style = req.query.style || 'sightseeing';
    const interests = req.query.interests ? req.query.interests.split(',') : [];

    try {
        const token = await getTdxToken();
        
        // 1. 抓取景點
        const spotUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot/${tdxCity}?$top=100&$select=ScenicSpotID,ScenicSpotName,DescriptionDetail,Position,Class1,Class2,Keyword&$filter=Position/PositionLat ne null&$format=JSON`;
        const spotRes = await axios.get(spotUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        
        let spots = spotRes.data.map(spot => ({
            name: spot.ScenicSpotName,
            lat: spot.Position.PositionLat,
            lon: spot.Position.PositionLon,
            type: "景點",
            icon: "📍",
            desc: spot.DescriptionDetail ? spot.DescriptionDetail.substring(0, 45) + "..." : "熱門推薦景點",
            features: `${spot.Class1||''} ${spot.Class2||''} ${spot.Keyword||''}`
        }));

        if (interests.length > 0 && !interests.includes("全包")) {
            spots = spots.filter(spot => interests.some(interest => spot.features.includes(interest)));
        }

        // 2. 抓取美食餐廳
        let restaurants = [];
        if (style === 'food' || interests.includes('美食')) {
            const foodUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/Restaurant/${tdxCity}?$top=50&$select=RestaurantName,DescriptionDetail,Position,Class&$filter=Position/PositionLat ne null&$format=JSON`;
            try {
                const foodRes = await axios.get(foodUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                restaurants = foodRes.data.map(food => ({
                    name: food.RestaurantName,
                    lat: food.Position.PositionLat,
                    lon: food.Position.PositionLon,
                    type: "美食",
                    icon: "🍽️",
                    desc: food.DescriptionDetail ? food.DescriptionDetail.substring(0, 45) + "..." : "在地特色餐廳"
                }));
            } catch(e) { console.log("美食 API 抓取失敗"); }
        }

        res.json({ spots, restaurants });
    } catch (error) {
        res.status(500).json({ error: "無法取得 TDX 資料" });
    }
});

// --- API 路由：取得天氣 (CWA) ---
app.get('/api/weather/:city', async (req, res) => {
    try {
        let searchCity = req.params.city.replace('台', '臺');
        const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.CWA_API_KEY}&format=JSON&locationName=${encodeURIComponent(searchCity)}`;
        const response = await axios.get(url);
        const locations = response.data.records.location;
        if (locations.length === 0) throw new Error('找不到天氣');

        const weatherElements = locations[0].weatherElement;
        const wx = weatherElements.find(e => e.elementName === 'Wx').time[0].parameter.parameterName;
        const maxT = weatherElements.find(e => e.elementName === 'MaxT').time[0].parameter.parameterName;

        let icon = "☁️";
        if (wx.includes("晴")) icon = "☀️";
        if (wx.includes("雨")) icon = "🌧️";

        res.json({ condition: `${icon} ${wx}`, temp: parseInt(maxT) });
    } catch (error) {
        res.status(500).json({ error: "無法取得天氣", default: { condition: "⛅ 多雲", temp: 28 } });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AuraGo 伺服器已啟動！請開啟瀏覽器測試！`);
});
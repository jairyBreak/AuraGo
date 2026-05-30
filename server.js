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

// --- 具備自動重試功能的 HTTP 請求輔助函數 ---
async function axiosRequestWithRetry(method, url, dataOrParams = null, options = {}, retries = 3, delay = 500) {
    try {
        if (method.toLowerCase() === 'post') {
            return await axios.post(url, dataOrParams, options);
        } else {
            const getOptions = { ...options };
            if (dataOrParams) {
                getOptions.params = dataOrParams;
            }
            return await axios.get(url, getOptions);
        }
    } catch (error) {
        const status = error.response ? error.response.status : null;
        const isRateLimitOrServerError = status === 429 || (status >= 500 && status < 600);
        if (retries > 0 && (isRateLimitOrServerError || error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
            console.warn(`[HTTP API] 請求失敗 (狀態碼: ${status || '未知'}), 將於 ${delay} 毫秒後進行第 ${4 - retries} 次重試...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return axiosRequestWithRetry(method, url, dataOrParams, options, retries - 1, delay * 2);
        }
        throw error;
    }
}

// --- 城市名稱標準化輔助函數 ---
function normalizeCity(cityStr) {
    if (!cityStr) return '臺南市';
    
    // 統一將簡體「台」轉成繁體「臺」
    let clean = cityStr.replace(/台/g, '臺').trim();
    
    const standardCities = [
        '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣',
        '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市',
        '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣',
        '臺東縣', '澎湖縣', '金門縣', '連江縣'
    ];
    
    // 1. 如果完全符合標準名稱
    if (standardCities.includes(clean)) return clean;
    
    // 2. 如果包含前兩個字（例如 "臺北" 匹配 "臺北市"）
    for (const city of standardCities) {
        if (clean.includes(city.substring(0, 2)) || city.includes(clean)) {
            return city;
        }
    }
    
    // 3. 英文對應 (不分大小寫)
    const englishMap = {
        'keelung': '基隆市', 'taipei': '臺北市', 'newtaipei': '新北市',
        'taoyuan': '桃園市', 'hsinchu': '新竹市', 'hsinchucounty': '新竹縣',
        'miaoli': '苗栗縣', 'miaolicounty': '苗栗縣',
        'taichung': '臺中市', 'changhua': '彰化縣', 'changhuacounty': '彰化縣',
        'nantou': '南投縣', 'nantoucounty': '南投縣',
        'yunlin': '雲林縣', 'yunlincounty': '雲林縣',
        'chiayi': '嘉義市', 'chiayicounty': '嘉義縣',
        'tainan': '臺南市', 'kaohsiung': '高雄市',
        'pingtung': '屏東縣', 'pingtungcounty': '屏東縣',
        'yilan': '宜蘭縣', 'yilancounty': '宜蘭縣',
        'hualien': '花蓮縣', 'hualian': '花蓮縣', 'hualiencounty': '花蓮縣',
        'taitung': '臺東縣', 'taitungcounty': '臺東縣',
        'penghu': '澎湖縣', 'penghucounty': '澎湖縣',
        'kinmen': '金門縣', 'matsu': '連江縣', 'lienchiang': '連江縣'
    };
    
    const lower = clean.toLowerCase();
    for (const [eng, chi] of Object.entries(englishMap)) {
        if (lower.includes(eng) || eng.includes(lower)) {
            return chi;
        }
    }
    
    return '臺南市'; // 預設
}

const weatherCache = {};

async function getWeatherForCity(city) {
    const searchCity = normalizeCity(city);
    const now = Date.now();
    
    // 快取 15 分鐘
    if (weatherCache[searchCity] && (now - weatherCache[searchCity].timestamp < 15 * 60 * 1000)) {
        return weatherCache[searchCity].data;
    }
    
    try {
        const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-089?Authorization=${process.env.CWA_API_KEY}&format=JSON&locationName=${encodeURIComponent(searchCity)}`;
        const response = await axiosRequestWithRetry('get', url);
        const records = response.data.records;
        
        if (!records.Locations || !records.Locations[0] || !records.Locations[0].Location) {
            throw new Error('找不到氣象資料');
        }

        const locations = records.Locations[0].Location;
        const targetLoc = locations.find(l => l.LocationName === searchCity);
        if (!targetLoc) throw new Error(`找不到 ${searchCity} 的天氣`);

        const wxElement = targetLoc.WeatherElement.find(e => e.ElementName === '天氣現象');
        const tElement = targetLoc.WeatherElement.find(e => e.ElementName === '溫度');
        
        if (!wxElement || !tElement) throw new Error('天氣要素不足');

        const forecastList = [];
        
        // 溫度 (T) 是 1 小時一筆，以此為基礎建立 1 小時切分的預報資料
        tElement.Time.forEach(tTime => {
            const dataTime = tTime.DataTime;
            if (!dataTime) return;
            
            const tempVal = tTime.ElementValue[0].Temperature || tTime.ElementValue[0].value;
            const targetDate = new Date(dataTime);
            
            // 找出此小時所屬的 Wx (3 小時一筆) 區間
            const matchWx = wxElement.Time.find(wxTime => {
                const wxStart = new Date(wxTime.StartTime);
                const wxEnd = new Date(wxTime.EndTime);
                return targetDate >= wxStart && targetDate < wxEnd;
            }) || wxElement.Time[0];

            const wxVal = matchWx ? (matchWx.ElementValue[0].Weather || matchWx.ElementValue[0].value) : "多雲";

            let icon = "☁️";
            if (wxVal.includes("晴")) icon = "☀️";
            if (wxVal.includes("雨")) icon = "🌧️";
            if (wxVal.includes("陰")) icon = "☁️";
            if (wxVal.includes("雲")) icon = "⛅";

            const endDate = new Date(targetDate.getTime() + 60 * 60 * 1000);

            forecastList.push({
                start: dataTime,
                end: endDate.toISOString(),
                condition: `${icon} ${wxVal}`,
                temp: parseInt(tempVal)
            });
        });

        // 找出包含當前時間的區段作為 current
        const nowObj = new Date();
        const currentForecast = forecastList.find(f => {
            const start = new Date(f.start);
            const end = new Date(f.end);
            return nowObj >= start && nowObj <= end;
        }) || forecastList[0] || { condition: "⛅ 多雲", temp: 28 };

        const result = {
            current: { condition: currentForecast.condition, temp: currentForecast.temp },
            forecast: forecastList
        };

        weatherCache[searchCity] = { timestamp: now, data: result };
        return result;
    } catch (error) {
        console.error(`[Weather Cache] 取得 ${searchCity} 天氣失敗:`, error.message);
        if (weatherCache[searchCity]) return weatherCache[searchCity].data;
        
        // 預設 fallback
        const defaultVal = {
            current: { condition: "⛅ 多雲", temp: 28 },
            forecast: [
                { start: new Date().toISOString(), end: new Date(Date.now() + 3*3600*1000).toISOString(), condition: "⛅ 多雲", temp: 28 }
            ]
        };
        return defaultVal;
    }
}

let tdxAccessToken = '';
let tdxTokenExpiry = 0;

async function getTdxToken() {
    if (tdxAccessToken && Date.now() < tdxTokenExpiry - 60000) return tdxAccessToken;
    try {
        const response = await axiosRequestWithRetry(
            'post',
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

function getDist(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半徑 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function isOutdoor(spot) {
    const outdoorKeywords = /公園|森林|步道|海灘|海岸|風景區|吊橋|瀑布|溪流|古道|露營|山峰|野溪|生態|農場|牧場|遊樂區|遊憩區/;
    const indoorKeywords = /館|博物館|美術館|展覽|工廠|商場|百貨|故事館|室內|地下|影城|劇院|古蹟|寺廟|廟宇|教堂/;
    
    const text = ((spot.name || "") + " " + (spot.desc || "") + " " + (spot.features || "")).toLowerCase();
    
    if (indoorKeywords.test(text)) return false;
    if (outdoorKeywords.test(text)) return true;
    
    return true; // 預設大部分景點算戶外
}

// --- 郵遞區號對應行政區對照表 ---
const zipToTown = {
    // 基隆市
    "200": "仁愛區", "201": "信義區", "202": "中正區", "203": "中山區", "204": "安樂區", "205": "暖暖區", "206": "七堵區",
    // 臺北市
    "100": "中正區", "103": "大同區", "104": "中山區", "105": "松山區", "106": "大安區", "108": "萬華區", "110": "信義區", "111": "士林區", "112": "北投區", "114": "內湖區", "115": "南港區", "116": "文山區",
    // 新北市
    "207": "萬里區", "208": "金山區", "220": "板橋區", "221": "汐止區", "222": "深坑區", "223": "石碇區", "224": "瑞芳區", "226": "平溪區", "227": "雙溪區", "228": "貢寮區", "231": "新店區", "232": "坪林區", "233": "烏來區", "234": "永和區", "235": "中和區", "236": "土城區", "237": "三峽區", "238": "樹林區", "239": "鶯歌區", "241": "三重區", "242": "新莊區", "243": "泰山區", "244": "林口區", "247": "蘆洲區", "248": "五股區", "249": "八里區", "251": "淡水區", "252": "三芝區", "253": "石門區",
    // 桃園市
    "320": "中壢區", "324": "平鎮區", "325": "龍潭區", "326": "楊梅區", "327": "新屋區", "328": "觀音區", "330": "桃園區", "333": "龜山區", "334": "八德區", "335": "大溪區", "336": "復興區", "337": "大園區", "338": "蘆竹區",
    // 新竹縣
    "302": "竹北市", "303": "湖口鄉", "304": "新豐鄉", "305": "新埔鎮", "306": "關西鎮", "307": "芎林鄉", "308": "橫山鄉", "310": "竹東鎮", "311": "五峰鄉", "312": "橫山鄉", "313": "尖石鄉", "314": "北埔鄉", "315": "寶山鄉", "316": "峨眉鄉",
    // 苗栗縣
    "350": "竹南鎮", "351": "頭份市", "352": "三灣鄉", "353": "南庄鄉", "354": "獅潭鄉", "356": "後龍鎮", "357": "通霄鎮", "358": "苑裡鎮", "360": "苗栗市", "361": "造橋鄉", "362": "頭屋鄉", "363": "公館鄉", "364": "大湖鄉", "365": "泰安鄉", "366": "銅鑼鄉", "367": "三義鄉", "368": "西湖鄉", "369": "卓蘭鎮",
    // 臺中市
    "400": "中區", "401": "東區", "402": "南區", "403": "西區", "404": "北區", "406": "北屯區", "407": "西屯區", "408": "南屯區", "411": "太平區", "412": "大里區", "413": "霧峰區", "414": "烏日區", "420": "豐原區", "421": "后里區", "422": "石岡區", "423": "東勢區", "424": "和平區", "426": "新社區", "427": "神岡區", "428": "大雅區", "429": "潭子區", "432": "大肚區", "433": "沙鹿區", "434": "龍井區", "435": "梧棲區", "436": "清水區", "437": "大甲區", "438": "外埔區", "439": "大安區",
    // 彰化縣
    "500": "彰化市", "502": "芬園鄉", "503": "花壇鄉", "504": "秀水鄉", "505": "鹿港鎮", "506": "福興鄉", "507": "線西鄉", "508": "和美鎮", "509": "伸港鄉", "510": "員林市", "511": "大村鄉", "512": "埔心鄉", "513": "埔鹽鄉", "514": "永靖鄉", "515": "社頭鄉", "516": "二水鄉", "520": "田中鎮", "521": "北斗鎮", "522": "田尾鄉", "523": "埤頭鄉", "524": "溪州鄉", "525": "竹塘鄉", "526": "二林鎮", "527": "大城鄉", "528": "芳苑鄉", "530": "溪湖鎮",
    // 南投縣
    "540": "南投市", "541": "中寮鄉", "542": "草屯鎮", "544": "國姓鄉", "545": "埔里鎮", "546": "仁愛鄉", "551": "名間鄉", "552": "集集鎮", "553": "水里鄉", "555": "魚池鄉", "556": "信義鄉", "557": "竹山鎮", "558": "鹿谷鄉",
    // 雲林縣
    "630": "斗六市", "631": "大埤鄉", "632": "虎尾鎮", "633": "土庫鎮", "634": "褒忠鄉", "635": "東勢鄉", "636": "臺西鄉", "637": "崙背鄉", "638": "麥寮鄉", "640": "斗南鎮", "643": "古坑鄉", "646": "莿桐鄉", "647": "林內鄉", "648": "二崙鄉", "649": "西螺鎮", "651": "口湖鄉", "652": "水林鄉", "653": "北港鎮", "654": "元長鄉", "655": "四湖鄉",
    // 嘉義縣
    "602": "番路鄉", "603": "梅山鄉", "604": "竹崎鄉", "605": "阿里山鄉", "606": "民雄鄉", "607": "溪口鄉", "608": "新港鄉", "611": "六腳鄉", "612": "東石鄉", "613": "朴子市", "614": "太保市", "615": "布袋鎮", "616": "義竹鄉", "621": "民雄鄉", "622": "溪口鄉", "623": "新港鄉", "624": "六腳鄉", "625": "東石鄉",
    // 臺南市
    "700": "中西區", "701": "東區", "702": "南區", "704": "北區", "708": "安平區", "709": "安南區", "710": "永康區", "711": "歸仁區", "712": "新化區", "713": "左鎮區", "714": "玉井區", "715": "楠西區", "716": "南化區", "717": "仁德區", "718": "關廟區", "719": "龍崎區", "720": "官田區", "721": "麻豆區", "722": "佳里區", "723": "西港區", "724": "七股區", "725": "將軍區", "726": "學甲區", "727": "北門區", "730": "新營區", "731": "後壁區", "732": "白河區", "733": "東山區", "734": "六甲區", "735": "下營區", "736": "柳營區", "737": "鹽水區", "741": "善化區", "742": "大內區", "743": "山上區", "744": "新市區", "745": "安定區",
    // 高雄市
    "800": "新興區", "801": "前金區", "802": "苓雅區", "803": "鹽埕區", "804": "鼓山區", "805": "旗津區", "806": "前鎮區", "807": "三民區", "811": "楠梓區", "812": "小港區", "813": "左營區", "814": "仁武區", "815": "大社區", "820": "岡山區", "821": "路竹區", "822": "阿蓮區", "823": "田寮區", "824": "燕巢區", "825": "橋頭區", "826": "梓官區", "827": "彌陀區", "828": "永安區", "829": "湖內區", "830": "鳳山區", "831": "大寮區", "832": "林園區", "833": "鳥松區", "840": "大樹區", "842": "旗山區", "843": "美濃區", "844": "六龜區", "845": "內門區", "846": "杉林區", "847": "甲仙區", "848": "桃源區", "849": "那瑪夏區", "851": "茂林區", "852": "茄萣區",
    // 屏東縣
    "900": "屏東市", "901": "三地門鄉", "902": "霧臺鄉", "903": "瑪家鄉", "904": "九如鄉", "905": "里港鄉", "906": "高樹鄉", "907": "鹽埔鄉", "908": "長治鄉", "909": "麟洛鄉", "911": "竹田鄉", "912": "內埔鄉", "913": "萬丹鄉", "920": "潮州鎮", "921": "萬巒鄉", "922": "崁頂鄉", "923": "新埤鄉", "924": "南州鄉", "925": "林邊鄉", "926": "東港鎮", "927": "琉球鄉", "928": "佳冬鄉", "929": "新園鄉", "931": "枋寮鄉", "932": "枋山鄉", "940": "春日鄉", "941": "獅子鄉", "942": "車城鄉", "943": "牡丹鄉", "944": "恆春鎮", "945": "滿州鄉",
    // 宜蘭縣
    "260": "宜蘭市", "261": "頭城鎮", "262": "礁溪鄉", "263": "壯圍鄉", "264": "員山鄉", "265": "羅東鎮", "266": "三星鄉", "267": "大同鄉", "268": "五結鄉", "269": "冬山鄉", "270": "蘇澳鎮", "272": "南澳鄉",
    // 花蓮縣
    "970": "花蓮市", "971": "新城鄉", "972": "秀林鄉", "973": "吉安鄉", "974": "壽豐鄉", "975": "光復鄉", "976": "豐濱鄉", "977": "瑞穗鄉", "978": "萬榮鄉", "979": "玉里鎮", "981": "卓溪鄉", "982": "富里鄉",
    // 臺東縣
    "950": "臺東市", "951": "綠島鄉", "952": "蘭嶼鄉", "953": "延平鄉", "954": "卑南鄉", "955": "鹿野鄉", "956": "關山鎮", "957": "海端鄉", "958": "池上鄉", "959": "東河鄉", "961": "成功鎮", "962": "長濱鄉", "963": "太麻里鄉", "964": "金峰鄉", "965": "大武鄉", "966": "達仁鄉",
    // 澎湖縣
    "880": "馬公市", "881": "西嶼鄉", "882": "望安鄉", "883": "七美鄉", "884": "白沙鄉", "885": "湖西鄉",
    // 金門縣
    "890": "金沙鎮", "891": "金湖鎮", "892": "金寧鄉", "893": "金城鎮", "894": "烈嶼鄉", "896": "烏坵鄉"
};

// --- 輔助函數：從地址中提取行政區 ---
function extractTownFromAddress(address, city) {
    if (!address) return "";
    let cleanAddress = address;
    if (city) {
        const cleanCity = city.replace(/台/g, '臺');
        cleanAddress = cleanAddress.replace(cleanCity, "")
                                   .replace(cleanCity.replace(/臺/g, '台'), "");
    }
    const match = cleanAddress.match(/([\u4e00-\u9fa5]{1,4}(區|鄉|鎮|市))/);
    if (match) {
        return match[1].trim();
    }
    return "";
}

// 根據景點資料與 ZipCode 綜合解析行政區
function getTown(spot, searchCity) {
    let town = extractTownFromAddress(spot.Address, spot.City || searchCity);
    if (town) return town;
    if (spot.ZipCode && zipToTown[spot.ZipCode]) {
        return zipToTown[spot.ZipCode];
    }
    return "";
}

const interestExpansion = {
    "古蹟": ["古蹟", "歷史", "文物", "文化", "遺址", "書院", "老街", "傳統", "廟", "寺", "宮", "堂", "壇", "殿", "祠", "宗祠", "國定古蹟", "市定古蹟"],
    "文化": ["古蹟", "歷史", "文物", "文化", "遺址", "書院", "老街", "傳統", "廟", "寺", "宮", "堂", "壇", "殿", "祠", "宗祠", "展演", "藝文", "傳統藝術"],
    "廟宇": ["廟", "寺", "宮", "堂", "壇", "殿", "祠", "宗祠", "廟宇", "天主堂", "教堂"],
    "生態": ["生態", "自然", "風景", "公園", "綠地", "河濱", "步道", "森林", "農場", "溫泉", "地質", "溼地", "濕地", "溪", "谷", "瀑布", "湖", "潭", "海", "島", "山", "林", "野外", "都會公園"],
    "自然風景": ["生態", "自然", "風景", "公園", "綠地", "河濱", "步道", "森林", "農場", "溫泉", "地質", "溼地", "濕地", "溪", "谷", "瀑布", "湖", "潭", "海", "島", "山", "林", "野外", "都會公園"],
    "戶外活動": ["戶外", "運動", "自行車", "鐵馬", "健身", "登山", "健行", "遊憩"],
    "藝術": ["藝術", "展覽", "博物館", "美術館", "文創", "工藝", "文藝", "劇院", "演藝", "展演", "畫廊", "音樂廳", "劇團", "動漫", "創作"],
    "展覽": ["藝術", "展覽", "博物館", "美術館", "文創", "工藝", "文藝", "劇院", "演藝", "展演", "畫廊", "音樂廳", "劇團", "動漫", "創作"],
    "遊憩": ["遊憩", "商業", "購物", "夜市", "商圈", "百貨", "市集", "觀光工廠", "商場", "超市", "娛樂"],
    "商業": ["遊憩", "商業", "購物", "夜市", "商圈", "百貨", "市集", "觀光工廠", "商場", "超市", "娛樂"]
};

function matchInterest(spot, interests) {
    if (interests.length === 0 || interests.includes("全包")) return true;
    if (interests.includes("戶外活動") && isOutdoor(spot)) return true;
    
    const expandedKeywords = [];
    interests.forEach(interest => {
        if (interestExpansion[interest]) {
            expandedKeywords.push(...interestExpansion[interest]);
        } else {
            expandedKeywords.push(interest);
        }
    });
    
    return expandedKeywords.some(keyword => {
        const feat = spot.features ? spot.features.toLowerCase() : "";
        const name = spot.name ? spot.name.toLowerCase() : "";
        return feat.includes(keyword) || name.includes(keyword);
    });
}

// --- API 路由：區域探索 (支援多縣市、多行政區與興趣過濾) ---
app.get('/api/tour/area', async (req, res) => {
    const cities = req.query.cities ? req.query.cities.split(',').filter(Boolean) : [];
    const districts = req.query.districts ? req.query.districts.split(',').filter(Boolean) : [];
    const style = req.query.style || 'sightseeing';
    const interests = req.query.interests ? req.query.interests.split(',').filter(Boolean) : [];

    console.log(`[Area API] Request cities: ${JSON.stringify(cities)}, districts: ${JSON.stringify(districts)}, interests: ${JSON.stringify(interests)}`);
    if (cities.length === 0) {
        return res.json({ spots: [], restaurants: [] });
    }

    try {
        const token = await getTdxToken();
        
        let allSpots = [];
        let allRestaurants = [];
        let allHotels = [];

        // 對於每個選取的城市，分別抓取並合併景點與美食
        await Promise.all(cities.map(async (city) => {
            const searchCity = normalizeCity(city);
            console.log(`[Area API] Processing city: "${city}" -> normalized: "${searchCity}"`);
            
            // 1. 抓取景點 (從 $select 中移除 Town，並加入 ZipCode，避免 OData 400 錯誤)
            let spotUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$top=2000&$select=ScenicSpotID,ScenicSpotName,DescriptionDetail,Position,Class1,Class2,Keyword,City,OpenTime,Address,Phone,Picture,ZipCode&$filter=City eq '${searchCity}' and Position/PositionLat ne null&$format=JSON`;
            console.log(`[Area API] Fetching spotUrl: ${spotUrl}`);
            
            try {
                const spotRes = await axiosRequestWithRetry('get', spotUrl, null, { headers: { 'Authorization': `Bearer ${token}` } });
                const spotData = spotRes.data || [];
                console.log(`[Area API] Succeeded fetching ${spotData.length} spots for ${searchCity}`);
                
                // 氣象快取
                const weather = await getWeatherForCity(searchCity);
                const weatherCurrent = weather ? weather.current : { condition: "⛅ 多雲", temp: 28 };

                const spots = spotData.filter(s => s.Position && s.Position.PositionLat).map(spot => {
                    const spotCity = spot.City || searchCity;
                    const town = getTown(spot, spotCity);
                    return {
                        name: spot.ScenicSpotName,
                        lat: spot.Position.PositionLat,
                        lon: spot.Position.PositionLon,
                        type: "景點",
                        icon: "📍",
                        desc: spot.DescriptionDetail ? spot.DescriptionDetail.substring(0, 45) + "..." : "熱門推薦景點",
                        fullDesc: spot.DescriptionDetail || "暫無詳細介紹，歡迎現場探索！",
                        features: `${spot.Class1||''} ${spot.Class2||''} ${spot.Keyword||''} ${spot.ScenicSpotName||''}`,
                        cond: weatherCurrent.condition,
                        temp: weatherCurrent.temp,
                        openTime: spot.OpenTime || "詳見官方公告",
                        address: spot.Address || "詳見官方公告",
                        phone: spot.Phone || "暫無聯絡電話",
                        image: (spot.Picture && spot.Picture.PictureUrl1) ? spot.Picture.PictureUrl1 : "",
                        town: town,
                        city: spotCity
                    };
                });
                allSpots.push(...spots);
            } catch (err) {
                console.error(`[Area API] 抓取 ${searchCity} 景點失敗:`, err.message);
                if (err.response) {
                    console.error(`[Area API] 錯誤詳情:`, JSON.stringify(err.response.data));
                }
            }

                        // 2. 抓取餐廳 (從 $select 中移除 Town，並加入 ZipCode，避免 OData 400 錯誤)
            if (style === 'food' || interests.includes('美食')) {
                let foodUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/Restaurant?$top=1000&$select=RestaurantName,Description,Position,City,OpenTime,Address,Phone,Picture,ZipCode&$filter=City eq '${searchCity}' and Position/PositionLat ne null&$format=JSON`;
                try {
                    const foodRes = await axiosRequestWithRetry('get', foodUrl, null, { headers: { 'Authorization': `Bearer ${token}` } });
                    const foodData = foodRes.data || [];
                    
                    const weather = await getWeatherForCity(searchCity);
                    const weatherCurrent = weather ? weather.current : { condition: "⛅ 多雲", temp: 28 };

                    const restaurants = foodData.filter(f => f.Position && f.Position.PositionLat).map(food => {
                        const foodCity = food.City || searchCity;
                        const town = getTown(food, foodCity);
                        return {
                            name: food.RestaurantName,
                            lat: food.Position.PositionLat,
                            lon: food.Position.PositionLon,
                            type: "美食",
                            icon: "🍽️",
                            desc: food.Description ? food.Description.substring(0, 45) + "..." : "在地特色餐廳",
                            fullDesc: food.Description || "暫無詳細介紹，歡迎現場探索！",
                            cond: weatherCurrent.condition,
                            temp: weatherCurrent.temp,
                            openTime: food.OpenTime || "詳見官方公告",
                            address: food.Address || "詳見官方公告",
                            phone: food.Phone || "暫無聯絡電話",
                            image: (food.Picture && food.Picture.PictureUrl1) ? food.Picture.PictureUrl1 : "",
                            town: town,
                            city: foodCity
                        };
                    });
                    allRestaurants.push(...restaurants);
                } catch (err) {
                    console.error(`[Area API] 抓取 ${searchCity} 美食餐廳失敗:`, err.message);
                }
            }

            // 3. 抓取旅宿 (Hotel)
            let hotelUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/Hotel?$top=1000&$select=HotelName,Description,Position,City,Address,Phone,Picture,ZipCode&$filter=City eq '${searchCity}' and Position/PositionLat ne null&$format=JSON`;
            try {
                const hotelRes = await axiosRequestWithRetry('get', hotelUrl, null, { headers: { 'Authorization': `Bearer ${token}` } });
                const hotelData = hotelRes.data || [];
                
                const weather = await getWeatherForCity(searchCity);
                const weatherCurrent = weather ? weather.current : { condition: "⛅ 多雲", temp: 28 };
                
                const hotels = hotelData.filter(h => h.Position && h.Position.PositionLat).map(h => {
                    const hotelCity = h.City || searchCity;
                    const town = getTown(h, hotelCity);
                    return {
                        name: h.HotelName,
                        lat: h.Position.PositionLat,
                        lon: h.Position.PositionLon,
                        type: "住宿",
                        icon: "🏨",
                        desc: h.Description ? h.Description.substring(0, 45) + "..." : "熱門特色旅宿",
                        fullDesc: h.Description || "暫無詳細介紹，歡迎現場探索！",
                        cond: weatherCurrent.condition,
                        temp: weatherCurrent.temp,
                        address: h.Address || "詳見官方公告",
                        phone: h.Phone || "暫無聯絡電話",
                        image: (h.Picture && h.Picture.PictureUrl1) ? h.Picture.PictureUrl1 : "",
                        town: town,
                        city: hotelCity
                    };
                });
                allHotels.push(...hotels);
            } catch (err) {
                console.error(`[Area API] 抓取 ${searchCity} 旅宿失敗:`, err.message);
            }
        }));

        // 3. 過濾與自動擴展所選行政區 (格式如 "臺南市-安平區")
        if (districts.length > 0) {
            // A. 處理景點
            let primarySpots = allSpots.filter(spot => {
                const key = `${spot.city}-${spot.town}`;
                return districts.includes(key);
            });
            let secondarySpots = allSpots.filter(spot => {
                const key = `${spot.city}-${spot.town}`;
                return !districts.includes(key);
            });

            if (primarySpots.length === 0) {
                // 若所選行政區完全無景點，則採用選取城市之所有景點
                primarySpots = allSpots;
            } else if (primarySpots.length < 30 && secondarySpots.length > 0) {
                // 若主要行政區景點太少（不足 30 個），則計算其他區域景點與主要景點的最短距離，依距離排序並補足
                secondarySpots.forEach(secSpot => {
                    let minDist = Infinity;
                    primarySpots.forEach(priSpot => {
                        const dist = getDist(secSpot.lat, secSpot.lon, priSpot.lat, priSpot.lon);
                        if (dist < minDist) minDist = dist;
                    });
                    secSpot.tempDist = minDist;
                });
                secondarySpots.sort((a, b) => a.tempDist - b.tempDist);
                const needed = 30 - primarySpots.length;
                primarySpots.push(...secondarySpots.slice(0, needed));
            }
            allSpots = primarySpots;

            // B. 處理美食餐廳
            let primaryRestaurants = allRestaurants.filter(food => {
                const key = `${food.city}-${food.town}`;
                return districts.includes(key);
            });
            let secondaryRestaurants = allRestaurants.filter(food => {
                const key = `${food.city}-${food.town}`;
                return !districts.includes(key);
            });

            if (primaryRestaurants.length === 0) {
                primaryRestaurants = allRestaurants;
            } else if (primaryRestaurants.length < 20 && secondaryRestaurants.length > 0) {
                secondaryRestaurants.forEach(secFood => {
                    let minDist = Infinity;
                    primaryRestaurants.forEach(priFood => {
                        const dist = getDist(secFood.lat, secFood.lon, priFood.lat, priFood.lon);
                        if (dist < minDist) minDist = dist;
                    });
                    secFood.tempDist = minDist;
                });
                secondaryRestaurants.sort((a, b) => a.tempDist - b.tempDist);
                const needed = 20 - primaryRestaurants.length;
                primaryRestaurants.push(...secondaryRestaurants.slice(0, needed));
            }
            allRestaurants = primaryRestaurants;

            // C. 處理旅宿
            let primaryHotels = allHotels.filter(hotel => {
                const key = `${hotel.city}-${hotel.town}`;
                return districts.includes(key);
            });
            let secondaryHotels = allHotels.filter(hotel => {
                const key = `${hotel.city}-${hotel.town}`;
                return !districts.includes(key);
            });

            if (primaryHotels.length === 0) {
                primaryHotels = allHotels;
            } else if (primaryHotels.length < 15 && secondaryHotels.length > 0) {
                secondaryHotels.forEach(secHotel => {
                    let minDist = Infinity;
                    primaryHotels.forEach(priHotel => {
                        const dist = getDist(secHotel.lat, secHotel.lon, priHotel.lat, priHotel.lon);
                        if (dist < minDist) minDist = dist;
                    });
                    secHotel.tempDist = minDist;
                });
                secondaryHotels.sort((a, b) => a.tempDist - b.tempDist);
                const needed = 15 - primaryHotels.length;
                primaryHotels.push(...secondaryHotels.slice(0, needed));
            }
            allHotels = primaryHotels;
        }

        // 4. 興趣過濾
        if (interests.length > 0 && !interests.includes("全包")) {
            allSpots = allSpots.filter(spot => matchInterest(spot, interests));
        }

        res.json({ spots: allSpots, restaurants: allRestaurants, hotels: allHotels });
    } catch (error) {
        console.error("Area API 規劃失敗:", error.message);
        res.status(500).json({ error: "無法取得 TDX 區域探索資料" });
    }
});

// --- API 路由：智慧取得景點與美食 ---
app.get('/api/tour/:city', async (req, res) => {
    const cityMap = {
        '基隆市': 'Keelung', '臺北市': 'Taipei', '新北市': 'NewTaipei',
        '桃園市': 'Taoyuan', '新竹市': 'Hsinchu', '新竹縣': 'HsinchuCounty',
        '苗栗縣': 'MiaoliCounty', '臺中市': 'Taichung', '彰化縣': 'ChanghuaCounty',
        '南投縣': 'NantouCounty', '雲林縣': 'YunlinCounty', '嘉義市': 'Chiayi',
        '嘉義縣': 'ChiayiCounty', '臺南市': 'Tainan', '高雄市': 'Kaohsiung',
        '屏東縣': 'PingtungCounty', '宜蘭縣': 'YilanCounty', '花蓮縣': 'HualienCounty',
        '臺東縣': 'TaitungCounty', '澎湖縣': 'PenghuCounty',
        '金門縣': 'KinmenCounty', '連江縣': 'LienchiangCounty'
    };
    
    const searchCity = normalizeCity(req.params.city);
    const tdxCity = cityMap[searchCity] || 'Tainan'; 

    const style = req.query.style || 'sightseeing';
    const interests = req.query.interests ? req.query.interests.split(',').filter(Boolean) : [];

    try {
        const token = await getTdxToken();
        
        const lat = req.query.lat;
        const lon = req.query.lon;
        const radius = req.query.radius || 40000; // 讀取自訂半徑，預設 40 公里

        // 1. 抓取景點 (全台端點 + 座標搜尋，增加 City 欄位)
        let spotUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$top=3000&$select=ScenicSpotID,ScenicSpotName,DescriptionDetail,Position,Class1,Class2,Keyword,City,OpenTime,Address,Phone,Picture&$format=JSON`;
        if (lat && lon) {
            spotUrl += `&$spatialFilter=nearby(Position,${lat},${lon},${radius})`; // 座標點加半徑搜尋，涵蓋跨縣市
        } else {
            spotUrl += `&$filter=City eq '${searchCity}' and Position/PositionLat ne null`;
        }
        let spotData = [];
        try {
            const spotRes = await axiosRequestWithRetry('get', spotUrl, null, { headers: { 'Authorization': `Bearer ${token}` } });
            spotData = spotRes.data || [];
        } catch (err) {
            console.error(`[City API] 抓取 ${searchCity} 景點與美食失敗:`, err.message);
        }
        
        // 收集所有不重複的城市，預先抓取天氣
        const citiesInSpots = [...new Set(spotData.filter(s => s.City).map(s => s.City))];
        if (!citiesInSpots.includes(searchCity)) {
            citiesInSpots.push(searchCity);
        }
        
        const weatherMap = {};
        await Promise.all(citiesInSpots.map(async (c) => {
            weatherMap[c] = await getWeatherForCity(c);
        }));

        let spots = spotData.filter(s => s.Position && s.Position.PositionLat).map(spot => {
            const spotCity = spot.City || searchCity;
            const weather = weatherMap[spotCity] || weatherMap[searchCity];
            const weatherCurrent = weather ? weather.current : { condition: "⛅ 多雲", temp: 28 };
            return {
                name: spot.ScenicSpotName,
                lat: spot.Position.PositionLat,
                lon: spot.Position.PositionLon,
                type: "景點",
                icon: "📍",
                desc: spot.DescriptionDetail ? spot.DescriptionDetail.substring(0, 45) + "..." : "熱門推薦景點",
                fullDesc: spot.DescriptionDetail || "暫無詳細介紹，歡迎現場探索！",
                features: `${spot.Class1||''} ${spot.Class2||''} ${spot.Keyword||''} ${spot.ScenicSpotName||''}`,
                cond: weatherCurrent.condition,
                temp: weatherCurrent.temp,
                openTime: spot.OpenTime || "詳見官方公告",
                address: spot.Address || "詳見官方公告",
                phone: spot.Phone || "暫無聯絡電話",
                image: (spot.Picture && spot.Picture.PictureUrl1) ? spot.Picture.PictureUrl1 : ""
            };
        });

        if (interests.length > 0 && !interests.includes("全包")) {
            spots = spots.filter(spot => matchInterest(spot, interests));
        }

        // 2. 抓取美食餐廳
        let restaurants = [];
        if (style === 'food' || interests.includes('美食')) {
            let foodUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/Restaurant?$top=1000&$select=RestaurantName,Description,Position,City,OpenTime,Address,Phone,Picture&$format=JSON`;
            if (lat && lon) {
                foodUrl += `&$spatialFilter=nearby(Position,${lat},${lon},${radius})`; // 座標點加半徑搜尋
            } else {
                foodUrl += `&$filter=City eq '${searchCity}' and Position/PositionLat ne null`;
            }
            try {
                const foodRes = await axiosRequestWithRetry('get', foodUrl, null, { headers: { 'Authorization': `Bearer ${token}` } });
                const foodData = foodRes.data || [];
                
                const citiesInFood = [...new Set(foodData.filter(f => f.City).map(f => f.City))];
                await Promise.all(citiesInFood.map(async (c) => {
                    if (!weatherMap[c]) {
                        weatherMap[c] = await getWeatherForCity(c);
                    }
                }));

                restaurants = foodData.filter(f => f.Position && f.Position.PositionLat).map(food => {
                    const foodCity = food.City || searchCity;
                    const weather = weatherMap[foodCity] || weatherMap[searchCity];
                    const weatherCurrent = weather ? weather.current : { condition: "⛅ 多雲", temp: 28 };
                    return {
                        name: food.RestaurantName,
                        lat: food.Position.PositionLat,
                        lon: food.Position.PositionLon,
                        type: "美食",
                        icon: "🍽️",
                        desc: food.Description ? food.Description.substring(0, 45) + "..." : "在地特色餐廳",
                        fullDesc: food.Description || "暫無詳細介紹，歡迎現場探索！",
                        cond: weatherCurrent.condition,
                        temp: weatherCurrent.temp,
                        openTime: food.OpenTime || "詳見官方公告",
                        address: food.Address || "詳見官方公告",
                        phone: food.Phone || "暫無聯絡電話",
                        image: (food.Picture && food.Picture.PictureUrl1) ? food.Picture.PictureUrl1 : ""
                    };
                });
            } catch(e) { console.log("美食 API 抓取失敗"); }
        }

        // 3. 抓取旅宿 (Hotel)
        let hotels = [];
        let hotelUrl = `https://tdx.transportdata.tw/api/basic/v2/Tourism/Hotel?$top=1000&$select=HotelName,Description,Position,City,Address,Phone,Picture,ZipCode&$format=JSON`;
        if (lat && lon) {
            hotelUrl += `&$spatialFilter=nearby(Position,${lat},${lon},${radius})`; // 空間半徑搜尋，支援跨縣市
        } else {
            hotelUrl += `&$filter=City eq '${searchCity}' and Position/PositionLat ne null`;
        }
        try {
            const hotelRes = await axiosRequestWithRetry('get', hotelUrl, null, { headers: { 'Authorization': `Bearer ${token}` } });
            const hotelData = hotelRes.data || [];
            
            const weather = weatherMap[searchCity];
            const weatherCurrent = weather ? weather.current : { condition: "⛅ 多雲", temp: 28 };

            hotels = hotelData.filter(h => h.Position && h.Position.PositionLat).map(h => {
                const hotelCity = h.City || searchCity;
                const town = getTown(h, hotelCity);
                return {
                    name: h.HotelName,
                    lat: h.Position.PositionLat,
                    lon: h.Position.PositionLon,
                    type: "住宿",
                    icon: "🏨",
                    desc: h.Description ? h.Description.substring(0, 45) + "..." : "熱門特色旅宿",
                    fullDesc: h.Description || "暫無詳細介紹，歡迎現場探索！",
                    cond: weatherCurrent.condition,
                    temp: weatherCurrent.temp,
                    address: h.Address || "詳見官方公告",
                    phone: h.Phone || "暫無聯絡電話",
                    image: (h.Picture && h.Picture.PictureUrl1) ? h.Picture.PictureUrl1 : "",
                    town: town,
                    city: hotelCity
                };
            });
        } catch (err) {
            console.error(`[City API] 抓取 ${searchCity} 旅宿失敗:`, err.message);
        }

        res.json({ spots, restaurants, hotels });
    } catch (error) {
        res.status(500).json({ error: "無法取得 TDX 資料" });
    }
});



// --- API 路由：地址自動補全 (OSM Nominatim Proxy) ---
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    try {
        const response = await axiosRequestWithRetry(
            'get',
            `https://nominatim.openstreetmap.org/search`,
            {
                format: 'json',
                q: query,
                limit: 5,
                countrycodes: 'tw'
            },
            {
                headers: {
                    'User-Agent': 'AuraGo/1.0 (contact: admin@aurago.local)'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ Nominatim 搜尋失敗:", error.message);
        res.status(500).json({ error: "搜尋服務暫時無法使用" });
    }
});


// --- API 路由：取得天氣 (CWA) ---
app.get('/api/weather/:city', async (req, res) => {
    try {
        const rawCity = req.params.city;
        const searchCity = normalizeCity(rawCity);
        console.log(`[Weather API] 原始請求縣市: "${rawCity}", 標準化後: "${searchCity}"`);
        const data = await getWeatherForCity(searchCity);
        console.log(`[Weather API] 回傳天氣: ${JSON.stringify(data)}`);
        res.json(data);
    } catch (error) {
        console.error("[Weather API] 錯誤:", error.message);
        res.status(500).json({ error: "無法取得天氣", default: { condition: "⛅ 多雲", temp: 28 } });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AuraGo 伺服器已啟動！請開啟瀏覽器測試！`);
});
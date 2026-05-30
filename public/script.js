document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 全台行政區資料庫 ---
    const taiwanData = {
        "基隆市": ["仁愛區", "信義區", "中正區", "中山區", "安樂區", "暖暖區", "七堵區"],
        "臺北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
        "新北市": ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "樹林區", "鶯歌區", "三峽區", "淡水區", "汐止區", "瑞芳區", "土城區", "蘆洲區", "五股區", "泰山區", "林口區", "深坑區", "石碇區", "坪林區", "三芝區", "石門區", "八里區", "平溪區", "雙溪區", "貢寮區", "金山區", "萬里區", "烏來區"],
        "桃園市": ["桃園區", "中壢區", "大溪區", "楊梅區", "蘆竹區", "大園區", "龜山區", "八德區", "龍潭區", "平鎮區", "新屋區", "觀音區", "復興區"],
        "新竹市": ["東區", "北區", "香山區"],
        "新竹縣": ["竹北市", "竹東鎮", "新埔鎮", "關西鎮", "湖口鄉", "新豐鄉", "芎林鄉", "橫山鄉", "北埔鄉", "寶山鄉", "峨眉鄉", "尖石鄉", "五峰鄉"],
        "苗栗縣": ["苗栗市", "頭份市", "竹南鎮", "後龍鎮", "通霄鎮", "苑裡鎮", "卓蘭鎮", "造橋鄉", "西湖鄉", "頭屋鄉", "公館鄉", "銅鑼鄉", "三義鄉", "大湖鄉", "獅潭鄉", "三灣鄉", "南庄鄉", "泰安鄉"],
        "臺中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區", "豐原區", "後里區", "石岡區", "東勢區", "和平區", "新社區", "潭子區", "大雅區", "神岡區", "大肚區", "沙鹿區", "龍井區", "梧棲區", "清水區", "大甲區", "外埔區", "大安區"],
        "彰化縣": ["彰化市", "鹿港鎮", "和美鎮", "線西鄉", "伸港鄉", "福興鄉", "秀水鄉", "花壇鄉", "芬園鄉", "員林市", "溪湖鎮", "田中鎮", "大村鄉", "埔鹽鄉", "埔心鄉", "永靖鄉", "社頭鄉", "二水鄉", "北斗鎮", "二林鎮", "田尾鄉", "埤頭鄉", "芳苑鄉", "大城鄉", "竹塘鄉", "溪州鄉"],
        "南投縣": ["南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉", "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"],
        "雲林縣": ["斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "古坑鄉", "大埤鄉", "莿桐鄉", "林內鄉", "二崙鄉", "崙背鄉", "麥寮鄉", "東勢鄉", "褒忠鄉", "臺西鄉", "元長鄉", "四湖鄉", "口湖鄉", "水林鄉"],
        "嘉義市": ["東區", "西區"],
        "嘉義縣": ["太保市", "朴子市", "布袋鎮", "大林鎮", "民雄鄉", "溪口鄉", "新港鄉", "六腳鄉", "東石鄉", "義竹鄉", "鹿草鄉", "水上鄉", "中埔鄉", "竹崎鄉", "梅山鄉", "番路鄉", "大埔鄉", "阿里山鄉"],
        "臺南市": ["中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", "將軍區", "學甲區", "北門區", "新營區", "後壁區", "白河區", "東山區", "六甲區", "下營區", "柳營區", "聯水區", "善化區", "大內區", "山上區", "新市區", "安定區"],
        "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區", "仁武區", "大社區", "岡山區", "路竹區", "阿蓮區", "田寮區", "燕巢區", "橋頭區", "梓官區", "彌陀區", "永安區", "湖內區", "鳳山區", "大寮區", "林園區", "鳥松區", "大樹區", "旗山區", "美濃區", "六龜區", "內門區", "杉林區", "甲仙區", "桃源區", "那瑪夏區", "茂林區", "茄萣區"],
        "屏東縣": ["屏東市", "三地門鄉", "霧臺鄉", "瑪家鄉", "九如鄉", "里港鄉", "高樹鄉", "鹽埔鄉", "長治鄉", "麟洛鄉", "竹田鄉", "內埔鄉", "萬丹鄉", "泰武鄉", "來義鄉", "潮州鎮", "萬巒鄉", "崁頂鄉", "新埤鄉", "南州鄉", "林邊鄉", "東港鎮", "琉球鄉", "佳冬鄉", "新園鄉", "枋寮鄉", "橫山鄉", "春日鄉", "獅子鄉", "車城鄉", "牡丹鄉", "恆春鎮", "滿州鄉"],
        "宜蘭縣": ["宜蘭市", "羅東鎮", "蘇澳鎮", "頭城鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉", "五結鄉", "三星鄉", "大同鄉", "南澳鄉"],
        "花蓮縣": ["花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉", "瑞穗鄉", "富里鄉", "秀林鄉", "萬榮鄉", "卓溪鄉"],
        "臺東縣": ["臺東市", "成功鎮", "關山鎮", "卑南鄉", "鹿野鄉", "池上鄉", "東河鄉", "長濱鄉", "太麻里鄉", "大武鄉", "綠島鄉", "海端鄉", "延平鄉", "金峰鄉", "達仁鄉", "蘭嶼鄉"],
        "澎湖縣": ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],
        "金門縣": ["金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"],
        "連江縣": ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"]
    };

    const citySelect = document.getElementById('city-select');
    const districtSelect = document.getElementById('district-select');
    Object.keys(taiwanData).forEach(city => {
        const opt = document.createElement('option');
        opt.value = city; opt.textContent = city;
        citySelect.appendChild(opt);
    });

    citySelect.addEventListener('change', function() {
        const selectedCities = Array.from(this.selectedOptions).map(opt => opt.value);
        districtSelect.innerHTML = '';
        if (selectedCities.length > 0) {
            districtSelect.disabled = false;
            selectedCities.forEach(city => {
                taiwanData[city].forEach(dist => {
                    const opt = document.createElement('option');
                    opt.value = `${city}-${dist}`; opt.textContent = `[${city.substring(0,2)}] ${dist}`;
                    districtSelect.appendChild(opt);
                });
            });
        } else {
            districtSelect.disabled = true;
            districtSelect.innerHTML = '<option disabled>請先選擇縣市</option>';
        }
    });

    // --- 2. 模式切換 ---
    const modeBtns = document.querySelectorAll('.mode-tabs .tab-btn');
    let currentMode = 'route';
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');
            document.getElementById('mode-route').style.display = currentMode === 'route' ? 'block' : 'none';
            document.getElementById('mode-area').style.display = currentMode === 'area' ? 'block' : 'none';
            document.getElementById('transport-mode-group').style.display = currentMode === 'route' ? 'block' : 'none';
        });
    });

    const typeBtns = document.querySelectorAll('.type-tabs .tab-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.trip-form').forEach(f => f.classList.remove('active'));
            document.getElementById(`form-${btn.getAttribute('data-type')}`).classList.add('active');
        });
    });

    // --- 初始化預設日期 ---
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const singleDateInput = document.getElementById('single-date');
    if (singleDateInput) singleDateInput.value = todayStr;
    const multiStartDateInput = document.getElementById('multi-start-date');
    if (multiStartDateInput) multiStartDateInput.value = todayStr;
    const multiEndDateInput = document.getElementById('multi-end-date');
    if (multiEndDateInput) multiEndDateInput.value = tomorrowStr;

    // --- 3. 搜尋與定位 ---
    const startInput = document.getElementById('start-point');
    const endInput = document.getElementById('end-point');
    const startSuggestions = document.getElementById('start-suggestions');
    const endSuggestions = document.getElementById('end-suggestions');
    
    let selectedStart = { name: "國立成功大學", lat: 22.9971, lon: 120.2168 }; 
    let selectedEnd = null;

    document.getElementById('btn-get-location').addEventListener('click', () => {
        startInput.value = "國立成功大學 (台南市東區)";
        selectedStart = { name: "國立成功大學", lat: 22.9971, lon: 120.2168 };
    });

    function setupAutocomplete(inputElement, listElement, onSelect) {
        let timeout = null;
        inputElement.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            if (query.length < 2) { listElement.style.display = 'none'; return; }
            timeout = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const results = await res.json();
                    listElement.innerHTML = '';
                    if (results.length > 0) {
                        results.forEach(item => {
                            const li = document.createElement('li');
                            const shortName = item.display_name.split(',').slice(0, 2).join(', ');
                            li.textContent = `📍 ${shortName}`;
                            li.addEventListener('click', () => {
                                inputElement.value = item.display_name.split(',')[0];
                                listElement.style.display = 'none';
                                onSelect(item); 
                            });
                            listElement.appendChild(li);
                        });
                        listElement.style.display = 'block';
                    } else { listElement.style.display = 'none'; }
                } catch (err) { }
            }, 500);
        });
        document.addEventListener('click', (e) => { if (e.target !== inputElement) listElement.style.display = 'none'; });
    }

    function extractCity(displayName) {
        if (!displayName) return null;
        const clean = displayName.replace(/台/g, '臺');
        const cities = ["基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣"];
        for (let c of cities) {
            if (clean.includes(c) || clean.includes(c.substring(0, 2))) {
                return c;
            }
        }
        return null;
    }

    function getDist(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function getWeatherForTime(forecast, timeStr, fallbackWeather) {
        if (!forecast || forecast.length === 0) return fallbackWeather;
        
        const singleDateInput = document.getElementById('single-date');
        let dateStr = singleDateInput?.value;
        if (!dateStr) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateStr = `${yyyy}-${mm}-${dd}`;
        }
        
        const targetDate = new Date(`${dateStr}T${timeStr}:00+08:00`);
        
        const match = forecast.find(f => {
            const start = new Date(f.start);
            const end = new Date(f.end);
            return targetDate >= start && targetDate < end;
        });
        
        return match ? { condition: match.condition, temp: match.temp } : fallbackWeather;
    }

    function isOutdoor(spot) {
        const outdoorKeywords = /公園|森林|步道|海灘|海岸|風景區|吊橋|瀑布|溪流|古道|露營|山峰|野溪|生態|農場|牧場|遊樂區|遊憩區/;
        const indoorKeywords = /館|博物館|美術館|展覽|工廠|商場|百貨|故事館|室內|地下|影城|劇院|古蹟|寺廟|廟宇|教堂/;
        
        const text = ((spot.name || "") + " " + (spot.desc || "") + " " + (spot.features || "")).toLowerCase();
        
        if (indoorKeywords.test(text)) return false;
        if (outdoorKeywords.test(text)) return true;
        
        return true; // 預設大部分景點算戶外
    }

    // 解析餐廳營業時間字串，判斷在指定小時是否營業
    function isOpenAtHour(openTimeStr, targetHour) {
        if (!openTimeStr || openTimeStr === "詳見官方公告") return true; // 無法判斷時預設營業中
        
        // 抽取所有時間區間 (格式: HH:MM–HH:MM 或 HH:MM~HH:MM)
        const timeRangePattern = /(\d{1,2}):(\d{2})\s*[–~\-]\s*(\d{1,2}):(\d{2})/g;
        let match;
        const ranges = [];
        while ((match = timeRangePattern.exec(openTimeStr)) !== null) {
            const openH = parseInt(match[1]);
            const closeH = parseInt(match[3]);
            const closeM = parseInt(match[4]);
            // 00:00 代表午夜，視為 24:00
            const effectiveClose = (closeH === 0 && closeM === 0) ? 24 : closeH;
            ranges.push({ openH, closeH: effectiveClose });
        }
        
        if (ranges.length === 0) return true; // 無法解析時預設營業中
        
        // 檢查 targetHour 是否落在任一營業區間內
        return ranges.some(r => targetHour >= r.openH && targetHour < r.closeH);
    }

    function findClosestHotel(node, hotels) {
        if (!node || !hotels || hotels.length === 0) return null;
        let minD = Infinity;
        let closest = null;
        hotels.forEach(h => {
            const d = getDist(node.lat, node.lon, h.lat, h.lon);
            if (d < minD) {
                minD = d;
                closest = h;
            }
        });
        return closest;
    }

    setupAutocomplete(startInput, startSuggestions, (data) => {
        selectedStart = { 
            name: data.display_name.split(',')[0], 
            lat: parseFloat(data.lat), 
            lon: parseFloat(data.lon),
            city: extractCity(data.display_name)
        };
    });
    setupAutocomplete(endInput, endSuggestions, (data) => {
        selectedEnd = { 
            name: data.display_name.split(',')[0], 
            lat: parseFloat(data.lat), 
            lon: parseFloat(data.lon),
            city: extractCity(data.display_name)
        };
    });

    // --- 4. 核心：呼叫後端並生成【三條】風格路線 ---
    let currentRoutes = [];
    let selectedRouteIndex = 0;
    const btnSearch = document.getElementById('btn-search');
    
    btnSearch.addEventListener('click', async () => {
        btnSearch.textContent = "🌍 雲端多路線規劃中...";
        btnSearch.disabled = true;

        try {
            if (currentMode === 'area' && citySelect.selectedOptions.length === 0) {
                alert("請至少選擇一個欲探索的縣市！");
                btnSearch.textContent = "🌍 雲端智能規劃";
                btnSearch.disabled = false;
                return;
            }

            let targetCity = "臺南市";
            if (currentMode === 'area' && citySelect.selectedOptions.length > 0) {
                targetCity = citySelect.selectedOptions[0].value;
            } else if (currentMode === 'route') {
                if (selectedStart && selectedStart.city) {
                    targetCity = selectedStart.city;
                } else {
                    const searchString = startInput.value.replace(/台/g, '臺');
                    const allCities = Object.keys(taiwanData);
                    for (let c of allCities) {
                        if (searchString.includes(c) || searchString.includes(c.substring(0, 2))) {
                            targetCity = c; break;
                        }
                    }
                }
            }
            targetCity = targetCity.replace(/台/g, '臺').trim();

            const style = document.getElementById('travel-style').value;
            const checkedInterests = Array.from(document.querySelectorAll('#interest-tags input:checked')).map(cb => cb.value).join(',');

            // 讀取旅行節奏配置
            const paceConfigs = {
                compact: { spots: 4, minStay: 30, maxStay: 60, defaultStay: 45 },
                standard: { spots: 3, minStay: 60, maxStay: 120, defaultStay: 90 },
                leisurely: { spots: 2, minStay: 90, maxStay: 150, defaultStay: 120 },
                indepth: { spots: 1, minStay: 120, maxStay: 240, defaultStay: 180 }
            };
            const travelPace = document.getElementById('travel-pace').value || 'standard';
            const paceConfig = paceConfigs[travelPace] || paceConfigs.standard;

            let weatherData = { current: { condition: "⛅ 多雲", temp: 28 }, forecast: [] };
            try {
                const weatherRes = await fetch(`/api/weather/${targetCity}`);
                if (weatherRes.ok) weatherData = await weatherRes.json();
            } catch(e) {}
            const weatherInfo = weatherData.current;

            let realSpots = [], realRestaurants = [], realHotels = [];
            try {
                let url;
                if (currentMode === 'area') {
                    const selectedCities = Array.from(citySelect.selectedOptions).map(opt => opt.value).join(',');
                    const selectedDistricts = Array.from(districtSelect.selectedOptions).map(opt => opt.value).join(',');
                    url = `/api/tour/area?cities=${encodeURIComponent(selectedCities)}&districts=${encodeURIComponent(selectedDistricts)}&style=${style}&interests=${checkedInterests}`;
                } else {
                    let fetchLat = selectedStart.lat;
                    let fetchLon = selectedStart.lon;
                    let radius = 30000; // 預設 30 公里
                    if (selectedEnd) {
                        fetchLat = (selectedStart.lat + selectedEnd.lat) / 2;
                        fetchLon = (selectedStart.lon + selectedEnd.lon) / 2;
                        // 計算起點與終點的直線距離（公里）
                        const distKm = getDist(selectedStart.lat, selectedStart.lon, selectedEnd.lat, selectedEnd.lon);
                        // 動態半徑：(起終點距離的一半) + 15 公里緩衝，限制在 20公里 到 50公里 之間
                        radius = Math.max(20000, Math.min(50000, (distKm * 1000) / 2 + 15000));
                    }
                    url = `/api/tour/${targetCity}?style=${style}&interests=${checkedInterests}&lat=${fetchLat}&lon=${fetchLon}&radius=${Math.round(radius)}`;
                }
                const tourRes = await fetch(url);
                if (tourRes.ok) {
                    const data = await tourRes.json();
                    realSpots = data.spots || [];
                    realRestaurants = data.restaurants || [];
                    realHotels = data.hotels || [];
                }
            } catch(e) {}

            if (realSpots.length === 0) {
                realSpots = [
                    { name: `${targetCity}文化園區`, lat: selectedStart.lat + 0.01, lon: selectedStart.lon + 0.01, type: "景點", icon: "🏛️", desc: "在地文化", features: "文化 古蹟" },
                    { name: `${targetCity}森林公園`, lat: selectedStart.lat - 0.01, lon: selectedStart.lon - 0.01, type: "景點", icon: "🌳", desc: "自然風光", features: "生態 自然風景" }
                ];
                realRestaurants = [{ name: `${targetCity}美食名店`, lat: selectedStart.lat - 0.01, lon: selectedStart.lon + 0.01, type: "美食", icon: "🍲", desc: "必吃美食" }];
            }
            if (realHotels.length === 0) {
                const cityHotelFallback = {
                    "基隆市": [
                        { name: "長榮桂冠酒店-基隆", lat: 25.1322, lon: 121.7482, type: "住宿", icon: "🏨", desc: "基隆港畔頂級五星級大飯店", address: "基隆市中正區中正路62之1號", phone: "02-2427-9988" }
                    ],
                    "臺北市": [
                        { name: "台北喜來登大飯店", lat: 25.0442, lon: 121.5228, type: "住宿", icon: "🏨", desc: "頂級奢華的五星級大飯店", address: "臺北市中正區忠孝東路一段12號", phone: "02-2321-5511" },
                        { name: "台北晶華酒店", lat: 25.0535, lon: 121.5242, type: "住宿", icon: "🏨", desc: "位於中山區的指標性奢華酒店", address: "臺北市中山區中山北路二段39巷3號", phone: "02-2523-8000" }
                    ],
                    "新北市": [
                        { name: "板橋凱撒大飯店", lat: 25.0128, lon: 121.4641, type: "住宿", icon: "🏨", desc: "新板特區地標型國際觀光大飯店", address: "新北市板橋區縣民大道二段8號", phone: "02-8953-8999" },
                        { name: "淡水將捷金鬱金香酒店", lat: 25.1764, lon: 121.4312, type: "住宿", icon: "🏨", desc: "緊鄰淡水河畔的浪漫渡假酒店", address: "新北市淡水區中正路一段2-1號", phone: "02-2621-0333" }
                    ],
                    "桃園市": [
                        { name: "桃園大溪笠復威斯汀度假酒店", lat: 24.8697, lon: 121.2869, type: "住宿", icon: "🏨", desc: "享譽盛名的奢華高爾夫渡假村", address: "桃園市大溪區日新路166號", phone: "03-272-5000" },
                        { name: "和逸飯店 桃園館 (COZZI)", lat: 25.0191, lon: 121.2155, type: "住宿", icon: "🏨", desc: "鄰近水族館 Xpark 的海洋風主題飯店", address: "桃園市中壢區春德路101號", phone: "03-273-7699" }
                    ],
                    "新竹市": [
                        { name: "新竹老爺酒店", lat: 24.7797, lon: 121.0145, type: "住宿", icon: "🏨", desc: "新竹竹科旁五星級商務設計酒店", address: "新竹市東區光復路一段305號", phone: "03-563-1122" },
                        { name: "新竹國賓大飯店", lat: 24.8073, lon: 120.9754, type: "住宿", icon: "🏨", desc: "新竹市區精華地段的高空景觀大飯店", address: "新竹市東區中華路二段188號", phone: "03-515-1111" }
                    ],
                    "新竹縣": [
                        { name: "新竹豐邑喜來登大飯店", lat: 24.8219, lon: 121.0315, type: "住宿", icon: "🏨", desc: "竹北高鐵特區五星級奢華地標飯店", address: "新竹縣竹北市光明六路東一段265號", phone: "03-620-6000" }
                    ],
                    "苗栗縣": [
                        { name: "泰安觀止溫泉會館", lat: 24.4716, lon: 120.9788, type: "住宿", icon: "🏨", desc: "隱身山林溪谷間的頂級溫泉渡假會館", address: "苗栗縣泰安鄉圓墩58號", phone: "037-941-777" }
                    ],
                    "臺中市": [
                        { name: "台中長榮桂冠酒店", lat: 24.1560, lon: 120.6559, type: "住宿", icon: "住宿", icon: "🏨", desc: "台中老牌經典五星級大飯店", address: "臺中市西屯區台灣大道二段666號", phone: "04-2313-9988" },
                        { name: "台中日月千禧酒店", lat: 24.1568, lon: 120.6409, type: "住宿", icon: "🏨", desc: "七期市政特區的頂級奢華酒店", address: "臺中市西屯區市政路77號", phone: "04-3705-6000" }
                    ],
                    "彰化縣": [
                        { name: "彰化福泰商務飯店", lat: 24.0682, lon: 120.5484, type: "住宿", icon: "🏨", desc: "彰化市區交通便利的現代化商務飯店", address: "彰化縣彰化市建寶街20號", phone: "04-712-5228" }
                    ],
                    "南投縣": [
                        { name: "涵碧樓大飯店", lat: 23.8619, lon: 120.9038, type: "住宿", icon: "🏨", desc: "日月潭畔最知名的頂級奢華設計渡假酒店", address: "南投縣魚池鄉中興路142號", phone: "049-285-5311" },
                        { name: "雲品溫泉酒店", lat: 23.8824, lon: 120.9161, type: "住宿", icon: "🏨", desc: "日月潭畔擁天然溫泉的五星級渡假酒店", address: "南投縣魚池鄉中正路23號", phone: "049-285-6788" }
                    ],
                    "雲林縣": [
                        { name: "劍湖山渡假大飯店", lat: 23.6145, lon: 120.5786, type: "住宿", icon: "🏨", desc: "緊鄰主題樂園的親子渡假休閒大飯店", address: "雲林縣古坑鄉大湖口67之8號", phone: "05-582-8111" }
                    ],
                    "嘉義市": [
                        { name: "耐斯王子大飯店", lat: 23.4938, lon: 120.4502, type: "住宿", icon: "🏨", desc: "嘉義市區唯一五星級大飯店，結合百貨商場", address: "嘉義市東區忠孝路600號", phone: "05-277-1999" }
                    ],
                    "嘉義縣": [
                        { name: "阿里山賓館", lat: 23.5133, lon: 120.8066, type: "住宿", icon: "🏨", desc: "阿里山國家森林遊樂區內的五星級賓館", address: "嘉義縣阿里山鄉香林村16號", phone: "05-267-9811" }
                    ],
                    "臺南市": [
                        { name: "台南晶英酒店", lat: 22.9892, lon: 120.1983, type: "住宿", icon: "🏨", desc: "結合在地儒學文化設計的五星級旗艦酒店", address: "臺南市中西區和意路1號", phone: "06-213-6290" },
                        { name: "香格里拉台南遠東國際大飯店", lat: 22.9972, lon: 120.2163, type: "住宿", icon: "🏨", desc: "台南火車站後站旁地標高空五星級大飯店", address: "臺南市東區大學路西段89號", phone: "06-702-8888" }
                    ],
                    "高雄市": [
                        { name: "高雄萬豪酒店", lat: 22.6565, lon: 120.3045, type: "住宿", icon: "🏨", desc: "北高雄頂級五星級大飯店，緊鄰義享天地", address: "高雄市鼓山區大順一路115號", phone: "07-559-9111" },
                        { name: "高雄洲際酒店", lat: 22.6128, lon: 120.3039, type: "住宿", icon: "🏨", desc: "亞洲新灣區奢華設計酒店，法式浪漫餐飲", address: "高雄市前鎮區新光路33號", phone: "07-339-1888" }
                    ],
                    "屏東縣": [
                        { name: "墾丁凱撒大飯店", lat: 21.9392, lon: 120.8055, type: "住宿", icon: "🏨", desc: "墾丁最具代表性的椰林沙灘渡假大飯店", address: "屏東縣恆春鎮墾丁路6號", phone: "08-886-1888" }
                    ],
                    "宜蘭縣": [
                        { name: "礁溪老爺酒店", lat: 24.8398, lon: 121.7675, type: "住宿", icon: "🏨", desc: "蘭陽平原頂級溫泉渡假會館，享天然美人湯", address: "宜蘭縣礁溪鄉五峰路20號", phone: "03-988-6288" },
                        { name: "蘭城晶英酒店", lat: 24.7573, lon: 121.7533, type: "住宿", icon: "🏨", desc: "以櫻桃烤鴨與全台最強親子芬朵奇堡樂園聞名", address: "宜蘭縣宜蘭市民權路二段36號", phone: "03-935-1000" }
                    ],
                    "花蓮縣": [
                        { name: "太魯閣晶英酒店", lat: 24.1856, lon: 121.6186, type: "住宿", icon: "🏨", desc: "隱身太魯閣國家公園峽谷間的頂級山林避暑勝地", address: "花蓮縣秀林鄉天祥路18號", phone: "03-869-1155" }
                    ],
                    "臺東縣": [
                        { name: "知本老爺酒店", lat: 22.6968, lon: 121.0189, type: "住宿", icon: "🏨", desc: "卑南山林間的頂級溫泉渡假酒店，結合原住民風情", address: "臺東縣卑南鄉龍泉路113巷23號", phone: "089-510-666" }
                    ],
                    "澎湖縣": [
                        { name: "澎湖福朋喜來登酒店", lat: 23.5658, lon: 119.5794, type: "住宿", icon: "🏨", desc: "澎湖唯一五星級國際品牌酒店", address: "澎湖縣馬公市新店路197號", phone: "06-926-6288" }
                    ],
                    "金門縣": [
                        { name: "金湖飯店", lat: 24.4422, lon: 118.4239, type: "住宿", icon: "🏨", desc: "金門首座五星級渡假商務大飯店", address: "金門縣金湖鎮太湖路二段218號", phone: "082-338-688" }
                    ],
                    "連江縣": [
                        { name: "馬祖日光春和", lat: 26.1432, lon: 119.9234, type: "住宿", icon: "🏨", desc: "享絕美海景與清水模極簡設計的精緻旅宿", address: "連江縣南竿鄉仁愛村1-1號", phone: "0836-26666" }
                    ]
                };

                let combinedFallback = [];
                Object.keys(cityHotelFallback).forEach(city => {
                    combinedFallback.push(...cityHotelFallback[city]);
                });

                realHotels = JSON.parse(JSON.stringify(combinedFallback));
            }

            // 景點分類
            const cultureSpots = realSpots.filter(s => s.features.match(/古蹟|歷史|文物|文化|遺址|書院|老街|傳統|廟|寺|宮|堂|壇|殿|祠|宗祠/));
            const natureSpots = realSpots.filter(s => s.features.match(/生態|自然|風景|公園|綠地|河濱|步道|森林|農場|溫泉|地質|溼地|濕地|溪|谷|瀑布|湖|潭|海|島|山|林|野外|都會公園/));
            const artSpots = realSpots.filter(s => s.features.match(/藝術|展覽|博物館|美術館|文創|工藝|文藝|劇院|演藝|展演|畫廊|音樂廳|劇團|動漫|創作/));
            const shoppingSpots = realSpots.filter(s => s.features.match(/商業|購物|夜市|商圈|百貨|市集|觀光工廠|商場|超市/));
            const outdoorSpots = realSpots.filter(s => isOutdoor(s));
            const fallbackSpots = realSpots.filter(s => !cultureSpots.includes(s) && !natureSpots.includes(s) && !artSpots.includes(s) && !shoppingSpots.includes(s));

             function buildRouteData(pool, hasFood, excludeSpots = [], customDateStr = null, customStartHour = null, customEndHour = null, customStartNode = null, customEndNode = null) {
                let routeData = [];
                
                // 1. 讀取通勤配置
                const transportConfigs = {
                    driving: { speed: 40, factor: 1.2, googleMode: 'driving', name: '行車通勤', icon: '🚗' },
                    bicycling: { speed: 15, factor: 1.1, googleMode: 'bicycling', name: '騎自行車', icon: '🚴' },
                    walking: { speed: 5, factor: 1.05, googleMode: 'walking', name: '步行', icon: '🚶' }
                };
                
                const transportMode = document.getElementById('transport-mode').value || 'driving';
                const config = transportConfigs[transportMode] || transportConfigs.driving;

                // 2. 讀取開始與結束時間
                let currentHour = 9, currentMin = 0;
                let endHour = 18, endMin = 0;
                
                if (customStartHour !== null) {
                    currentHour = customStartHour;
                } else {
                    const startTimeInput = document.getElementById('single-start-time');
                    if (startTimeInput) {
                        const parts = startTimeInput.value.split(':');
                        currentHour = parseInt(parts[0]) || 9;
                        currentMin = parseInt(parts[1]) || 0;
                    }
                }
                
                if (customEndHour !== null) {
                    endHour = customEndHour;
                } else {
                    const endTimeInput = document.getElementById('single-end-time');
                    if (endTimeInput) {
                        const parts = endTimeInput.value.split(':');
                        endHour = parseInt(parts[0]) || 18;
                        endMin = parseInt(parts[1]) || 0;
                    }
                }

                let dateStr = customDateStr;
                if (!dateStr) {
                    const singleDateInput = document.getElementById('single-date');
                    dateStr = singleDateInput?.value;
                }
                if (!dateStr) {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    dateStr = `${yyyy}-${mm}-${dd}`;
                }

                let currentTime = new Date(`${dateStr}T${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}:00+08:00`);
                let endTimeLimit = new Date(`${dateStr}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00+08:00`);
                const totalAvailableMinutes = Math.max(0, Math.round((endTimeLimit - currentTime) / 60000));

                // 3. 準備候選景點
                let currentPool = pool.length > 0 ? pool : (fallbackSpots.length > 0 ? fallbackSpots : realSpots);
                let currentFoodPool = realRestaurants;

                // 檢查旅行期間的天氣狀況 (是否有雨)
                let hasRain = false;
                // 1. 先檢查當前天氣狀況是否有雨
                if (weatherInfo && weatherInfo.condition && weatherInfo.condition.includes("雨")) {
                    hasRain = true;
                }
                // 2. 再檢查預報時段內是否有雨
                const forecastList = weatherData.forecast || [];
                const tripForecasts = forecastList.filter(f => {
                    const fTime = new Date(f.start);
                    return fTime >= currentTime && fTime <= endTimeLimit;
                });
                
                tripForecasts.forEach(f => {
                    if (f.condition.includes("雨")) hasRain = true;
                });

                // 如果下雨，避開室外景點（只保留室內景點）
                if (hasRain) {
                    const indoorSpots = currentPool.filter(s => !isOutdoor(s));
                    // 防呆：如果篩選後還有室內景點，則採用室內景點；否則（完全沒有室內景點）維持原樣
                    if (indoorSpots.length > 0) {
                        currentPool = indoorSpots;
                    }
                }

                let poolCopy = [...currentPool];
                let foodPoolCopy = [...currentFoodPool];

                const actualStart = customStartNode || selectedStart;
                const actualEnd = customEndNode || selectedEnd;

                // 順路過濾邏輯
                if (currentMode === 'route' && actualEnd) {
                    const directDist = getDist(actualStart.lat, actualStart.lon, actualEnd.lat, actualEnd.lon);
                    const calcDetour = s => (getDist(actualStart.lat, actualStart.lon, s.lat, s.lon) + getDist(s.lat, s.lon, actualEnd.lat, actualEnd.lon)) - directDist;
                    poolCopy.sort((a, b) => calcDetour(a) - calcDetour(b));
                    foodPoolCopy.sort((a, b) => calcDetour(a) - calcDetour(b));
                    poolCopy = poolCopy.slice(0, 10);
                    foodPoolCopy = foodPoolCopy.slice(0, 10);
                }

                // 根據行程時間計算需要安排幾餐（依據經過的用餐時段）
                const mealSlots = [];
                if (hasFood) {
                    const mealPeriods = [
                        { name: "早餐", targetHour: 8, startH: 7, endH: 9, stayMin: 40, icon: "🍳" },
                        { name: "午餐", targetHour: 12, startH: 11, endH: 13, stayMin: 60, icon: "🍱" },
                        { name: "下午茶", targetHour: 15, startH: 14, endH: 16, stayMin: 40, icon: "🍰" },
                        { name: "晚餐", targetHour: 18, startH: 17, endH: 19, stayMin: 60, icon: "🍽️" }
                    ];
                    mealPeriods.forEach(meal => {
                        // 用餐時段的開始時間必須在行程範圍內
                        if (meal.startH >= currentHour && meal.startH < endHour) {
                            mealSlots.push(meal);
                        }
                    });
                }
                const totalFoodStayMinutes = mealSlots.reduce((sum, m) => sum + m.stayMin, 0);
                const foodStayMinutes = totalFoodStayMinutes;
                let avgCommute = 15;
                if (currentMode === 'route') {
                    const avgCommutes = { driving: 15, bicycling: 25, walking: 30 };
                    avgCommute = avgCommutes[transportMode] || 15;
                } else {
                    // 區域探索模式：估計平均每段通勤為 15 分鐘
                    avgCommute = 15;
                }
                let calculatedSpots = Math.floor((totalAvailableMinutes - foodStayMinutes) / (paceConfig.defaultStay + avgCommute));
                let spotCount = Math.max(1, Math.min(10, calculatedSpots));

                // 優先過濾掉已被其他路線選取過的景點名稱，除非過濾後會導致景點數過少
                if (excludeSpots.length > 0) {
                    const filtered = poolCopy.filter(s => !excludeSpots.includes(s.name));
                    if (filtered.length >= Math.min(spotCount, 3)) {
                        poolCopy = filtered;
                    }
                }

                // 檢查旅行期間的天氣狀況 (是否氣溫過高)
                let isRainingOrHot = false;
                let maxTemp = 0;
                
                tripForecasts.forEach(f => {
                    if (f.temp > maxTemp) maxTemp = f.temp;
                });
                
                if (hasRain || maxTemp >= 32) {
                    isRainingOrHot = true;
                }

                // 優先挑選室內景點，避免天氣惡劣時前往戶外景點；若正常天氣且勾選戶外活動，則優先挑選戶外景點
                const wantsOutdoor = checkedInterests.includes('戶外活動');
                let sortedPool = [...poolCopy];
                if (isRainingOrHot) {
                    const indoorSpots = sortedPool.filter(s => !isOutdoor(s)).sort(() => 0.5 - Math.random());
                    const outdoorSpots = sortedPool.filter(s => isOutdoor(s)).sort(() => 0.5 - Math.random());
                    sortedPool = [...indoorSpots, ...outdoorSpots];
                } else if (wantsOutdoor) {
                    const outdoorSpots = sortedPool.filter(s => isOutdoor(s)).sort(() => 0.5 - Math.random());
                    const indoorSpots = sortedPool.filter(s => !isOutdoor(s)).sort(() => 0.5 - Math.random());
                    sortedPool = [...outdoorSpots, ...indoorSpots];
                } else {
                    sortedPool = sortedPool.sort(() => 0.5 - Math.random());
                }

                // 找出各個已選取且在 pool 中有景點的分類
                const activeCats = [];
                if (wantsCulture && cultureSpots.length > 0) activeCats.push(cultureSpots.filter(s => pool.includes(s) && !excludeSpots.includes(s.name)));
                if (wantsNature && natureSpots.length > 0) activeCats.push(natureSpots.filter(s => pool.includes(s) && !excludeSpots.includes(s.name)));
                if (wantsOutdoor && outdoorSpots.length > 0) activeCats.push(outdoorSpots.filter(s => pool.includes(s) && !excludeSpots.includes(s.name)));
                if (wantsArt && artSpots.length > 0) activeCats.push(artSpots.filter(s => pool.includes(s) && !excludeSpots.includes(s.name)));
                if (wantsShopping && shoppingSpots.length > 0) activeCats.push(shoppingSpots.filter(s => pool.includes(s) && !excludeSpots.includes(s.name)));

                const filteredCats = activeCats.filter(catList => catList.length > 0);

                // 挑選景點
                let pickedSpots = [];
                if (currentMode === 'route') {
                    if (filteredCats.length > 1) {
                        // 多興趣混合：在各分類中依順路/近排序，並輪流挑選
                        filteredCats.forEach(catList => {
                            if (actualEnd) {
                                const directDist = getDist(actualStart.lat, actualStart.lon, actualEnd.lat, actualEnd.lon);
                                const calcDetour = s => (getDist(actualStart.lat, actualStart.lon, s.lat, s.lon) + getDist(s.lat, s.lon, actualEnd.lat, actualEnd.lon)) - directDist;
                                catList.sort((a, b) => calcDetour(a) - calcDetour(b));
                            } else {
                                catList.sort((a, b) => getDist(actualStart.lat, actualStart.lon, a.lat, a.lon) - getDist(actualStart.lat, actualStart.lon, b.lat, b.lon));
                            }
                        });

                        let pools = filteredCats.map(list => {
                            const top = list.slice(0, 5);
                            top.sort(() => 0.5 - Math.random());
                            return [...top, ...list.slice(5)];
                        });

                        let catIdx = 0;
                        while (pickedSpots.length < spotCount) {
                            if (pools[catIdx].length > 0) {
                                const selected = pools[catIdx].shift();
                                pickedSpots.push(selected);
                                // 自所有分類池中過濾掉該景點，避免重複選取
                                for (let pIdx = 0; pIdx < pools.length; pIdx++) {
                                    pools[pIdx] = pools[pIdx].filter(s => s.name !== selected.name);
                                }
                            }
                            catIdx = (catIdx + 1) % pools.length;
                            if (pools.every(p => p.length === 0)) break;
                        }
                    } else {
                        // 單一興趣或無興趣：標準順路/近挑選
                        // 如果有單一興趣，則僅挑選該興趣分類下的景點，否則使用全部候選景點
                        let sortedByProximity = (filteredCats.length === 1) ? [...filteredCats[0]] : [...sortedPool];
                        if (actualEnd) {
                            const directDist = getDist(actualStart.lat, actualStart.lon, actualEnd.lat, actualEnd.lon);
                            const calcDetour = s => (getDist(actualStart.lat, actualStart.lon, s.lat, s.lon) + getDist(s.lat, s.lon, actualEnd.lat, actualEnd.lon)) - directDist;
                            sortedByProximity.sort((a, b) => calcDetour(a) - calcDetour(b));
                        } else {
                            sortedByProximity.sort((a, b) => getDist(actualStart.lat, actualStart.lon, a.lat, a.lon) - getDist(actualStart.lat, actualStart.lon, b.lat, b.lon));
                        }
                        const topCandidates = sortedByProximity.slice(0, Math.max(spotCount, 10));
                        topCandidates.sort(() => 0.5 - Math.random());
                        pickedSpots = topCandidates.slice(0, spotCount);
                    }
                    
                    // 依據與起點的距離排序
                    pickedSpots.sort((a, b) => getDist(actualStart.lat, actualStart.lon, a.lat, a.lon) - getDist(actualStart.lat, actualStart.lon, b.lat, b.lon));
                } else {
                    if (filteredCats.length > 1) {
                        // 多興趣混合：循環從不同興趣分類中挑選離上一個景點最近的景點
                        let catIndex = Math.floor(Math.random() * filteredCats.length);
                        let pools = filteredCats.map(list => [...list]); // 複製一份
                        
                        // 挑選第一個核心景點
                        const firstCatList = pools[catIndex];
                        const centerIndex = Math.floor(Math.random() * firstCatList.length);
                        let current = firstCatList.splice(centerIndex, 1)[0];
                        pickedSpots.push(current);
                        
                        // 自所有分類池中過濾掉已選取的起點景點
                        for (let pIdx = 0; pIdx < pools.length; pIdx++) {
                            pools[pIdx] = pools[pIdx].filter(s => s.name !== current.name);
                        }
                        
                        // 輪流挑選最近的景點
                        while (pickedSpots.length < spotCount) {
                            catIndex = (catIndex + 1) % pools.length;
                            
                            // 檢查當前分類是否已空，若空則尋找下一個非空的分類
                            if (pools[catIndex].length === 0) {
                                let found = false;
                                for (let offset = 1; offset < pools.length; offset++) {
                                    const nextIdx = (catIndex + offset) % pools.length;
                                    if (pools[nextIdx].length > 0) {
                                        catIndex = nextIdx;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) break; // 所有分類皆已選完
                            }
                            
                            const catPool = pools[catIndex];
                            catPool.sort((a, b) => getDist(current.lat, current.lon, a.lat, a.lon) - getDist(current.lat, current.lon, b.lat, b.lon));
                            current = catPool.shift();
                            pickedSpots.push(current);
                            
                            // 自所有分類池中過濾掉已選取的景點，避免重複選取
                            for (let pIdx = 0; pIdx < pools.length; pIdx++) {
                                pools[pIdx] = pools[pIdx].filter(s => s.name !== current.name);
                            }
                        }
                    } else {
                        // 單一興趣或無興趣：正常區域最近鄰挑選
                        // 如果有單一興趣，則僅挑選該興趣分類下的景點，否則使用全部候選景點
                        const candidates = (filteredCats.length === 1) ? [...filteredCats[0]] : [...sortedPool];
                        if (candidates.length > 0) {
                            const centerIndex = Math.floor(Math.random() * candidates.length);
                            const centerSpot = candidates.splice(centerIndex, 1)[0];
                            pickedSpots.push(centerSpot);
                            
                            candidates.sort((a, b) => getDist(centerSpot.lat, centerSpot.lon, a.lat, a.lon) - getDist(centerSpot.lat, centerSpot.lon, b.lat, b.lon));
                            pickedSpots.push(...candidates.slice(0, spotCount - 1));
                        }
                    }
                    
                    // 採用最近鄰法 (Nearest Neighbor) 計算順路鏈
                    const ordered = [];
                    if (pickedSpots.length > 0) {
                        let current = pickedSpots.shift();
                        ordered.push(current);
                        while (pickedSpots.length > 0) {
                            pickedSpots.sort((a, b) => getDist(current.lat, current.lon, a.lat, a.lon) - getDist(current.lat, current.lon, b.lat, b.lon));
                            current = pickedSpots.shift();
                            ordered.push(current);
                        }
                    }
                    pickedSpots = ordered;
                }

                // 營業時間防呆：將夜市排在行程的最後一個景點
                pickedSpots.sort((a, b) => {
                    const aIsNight = a.name.includes("夜市") || (a.features && a.features.includes("夜市"));
                    const bIsNight = b.name.includes("夜市") || (b.features && b.features.includes("夜市"));
                    if (aIsNight && !bIsNight) return 1;
                    if (!aIsNight && bIsNight) return -1;
                    return 0;
                });

                // 挑選美食餐廳（依用餐時段數量，各自挑選該時段有營業的餐廳）
                let pickedFoods = [];
                if (mealSlots.length > 0 && foodPoolCopy.length > 0) {
                    const usedFoodNames = new Set();
                    for (let mi = 0; mi < mealSlots.length; mi++) {
                        const meal = mealSlots[mi];
                        // 篩選該時段有營業且尚未被選過的餐廳
                        const openRestaurants = foodPoolCopy.filter(f => 
                            !usedFoodNames.has(f.name) && isOpenAtHour(f.openTime, meal.targetHour)
                        );
                        if (openRestaurants.length > 0) {
                            const pick = openRestaurants[Math.floor(Math.random() * openRestaurants.length)];
                            pickedFoods.push({ ...pick, mealInfo: meal });
                            usedFoodNames.add(pick.name);
                        }
                    }
                }
                // 向後相容：保留 pickedFood 供通勤計算使用
                const pickedFood = pickedFoods.length > 0 ? pickedFoods[0] : null;

                 // 4. 計算整個路線的通勤時間（不含美食，美食將在時間線中動態插入）
                let routeNodesForCommute = [];
                const finalStartNode = customStartNode || (currentMode === 'route' ? selectedStart : null);
                const finalEndNode = customEndNode || (currentMode === 'route' ? selectedEnd : null);
                
                if (finalStartNode) {
                    routeNodesForCommute.push(finalStartNode);
                }
                pickedSpots.forEach(s => routeNodesForCommute.push(s));
                if (finalEndNode) {
                    routeNodesForCommute.push(finalEndNode);
                }

                let totalCommuteMinutes = 0;
                let commuteTimes = [];
                let segmentConfigs = []; // 儲存每一段推薦的交通工具配置
                
                function getSegmentConfig(dist) {
                    if (currentMode === 'area') {
                        if (dist < 1.2) {
                            return transportConfigs.walking;
                        } else if (dist <= 5) {
                            return transportConfigs.bicycling;
                        } else {
                            return transportConfigs.driving;
                        }
                    }
                    return config;
                }

                for (let i = 0; i < routeNodesForCommute.length - 1; i++) {
                    const fromNode = routeNodesForCommute[i];
                    const toNode = routeNodesForCommute[i + 1];
                    const dist = getDist(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
                    
                    const segConfig = getSegmentConfig(dist);
                    segmentConfigs.push(segConfig);
                    
                    const travelMin = Math.max(5, Math.round((dist / segConfig.speed) * 60 * segConfig.factor));
                    commuteTimes.push(travelMin);
                    totalCommuteMinutes += travelMin;
                }

                // 5. 分配景點停留時間
                const actualFoodStay = totalFoodStayMinutes;
                const remainingTimeForSpots = totalAvailableMinutes - totalCommuteMinutes - actualFoodStay;
                
                let spotStayMinutes = paceConfig.defaultStay;
                if (pickedSpots.length > 0) {
                    spotStayMinutes = Math.floor(remainingTimeForSpots / pickedSpots.length);
                    // 限制停留時間在該節奏的合理區間內
                    spotStayMinutes = Math.max(paceConfig.minStay, Math.min(paceConfig.maxStay, spotStayMinutes));
                }

                 // 6. 依據分配的停留時間，建構完整的行程時間線（景點與美食交錯插入）
                const startWeather = getWeatherForTime(weatherData.forecast, `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`, weatherInfo);
                if (finalStartNode) {
                    const startNode = { 
                        ...finalStartNode, 
                        type: finalStartNode.type === "住宿" ? "住宿" : "出發", 
                        icon: finalStartNode.type === "住宿" ? "🏨" : "🟢", 
                        desc: finalStartNode.type === "住宿" ? `住宿出發 (${finalStartNode.name})` : (finalStartNode.desc || "行程起點"),
                        timeStr: `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`,
                        travelAlertStr: "",
                        cond: startWeather.condition,
                        temp: startWeather.temp
                    };
                    routeData.push(startNode);
                }

                let tempTime = new Date(currentTime.getTime());
                let commuteIndex = 0;
                let remainingMeals = [...pickedFoods]; // 尚未安排的餐點

                // 輔助函式：插入一餐
                function insertMealNode(food, prevNode) {
                    const foodDist = prevNode ? getDist(prevNode.lat, prevNode.lon, food.lat, food.lon) : 0;
                    const foodSegConfig = getSegmentConfig(foodDist);
                    const foodTravelMin = prevNode ? Math.max(5, Math.round((foodDist / foodSegConfig.speed) * 60 * foodSegConfig.factor)) : 0;
                    const foodArrival = new Date(tempTime.getTime() + foodTravelMin * 60 * 1000);
                    const fh = String(foodArrival.getHours()).padStart(2, '0');
                    const fm = String(foodArrival.getMinutes()).padStart(2, '0');
                    const foodWeather = getWeatherForTime(weatherData.forecast, `${fh}:${fm}`, { condition: food.cond || weatherInfo.condition, temp: food.temp || weatherInfo.temp });
                    const mealStay = food.mealInfo ? food.mealInfo.stayMin : 60;
                    const mealLabel = food.mealInfo ? `${food.mealInfo.icon} ${food.mealInfo.name}` : "🍽️ 用餐";
                    
                    const node = {
                        ...food,
                        timeStr: `${fh}:${fm}`,
                        travelAlertStr: prevNode ? `${foodSegConfig.icon} ${foodSegConfig.name}約 ${foodTravelMin} 分鐘` : "",
                        cond: foodWeather.condition,
                        temp: foodWeather.temp,
                        safetyHint: "",
                        timeWarning: "",
                        stayMin: mealStay,
                        desc: `${mealLabel} — ${food.desc || "在地特色餐廳"}`
                    };
                    routeData.push(node);
                    tempTime = new Date(foodArrival.getTime() + mealStay * 60 * 1000);
                }

                // 加入景點（在適當時機插入餐點）
                for (let i = 0; i < pickedSpots.length; i++) {
                    const spot = pickedSpots[i];
                    
                    let arrivalTime;
                    let travelMinutes = 0;
                    let travelAlertStr = "";

                     if (finalStartNode === null && i === 0) {
                        // 區域探索模式且無起點節點：不計通勤時間，直接於開始時間抵達
                        arrivalTime = new Date(tempTime.getTime());
                    } else {
                        const segConfig = segmentConfigs[commuteIndex];
                        travelMinutes = commuteTimes[commuteIndex++];
                        arrivalTime = new Date(tempTime.getTime() + travelMinutes * 60 * 1000);
                        travelAlertStr = `${segConfig.icon} ${segConfig.name}約 ${travelMinutes} 分鐘`;
                    }

                    // 在加入此景點之前，檢查是否該先插入餐點
                    // 如果目前時間已經進入某個用餐時段，先安排該餐
                    const curHourBeforeSpot = arrivalTime.getHours();
                    const mealsToInsert = [];
                    remainingMeals = remainingMeals.filter(food => {
                        if (food.mealInfo && curHourBeforeSpot >= food.mealInfo.startH && curHourBeforeSpot <= food.mealInfo.endH) {
                            mealsToInsert.push(food);
                            return false;
                        }
                        return true;
                    });
                    
                    if (mealsToInsert.length > 0) {
                        // 先回退 tempTime 到景點抵達前（未加入景點停留），插入餐點
                        const prevNode = routeData.length > 0 ? routeData[routeData.length - 1] : null;
                        mealsToInsert.forEach(food => insertMealNode(food, prevNode));
                        
                        // 插入餐點後重新計算到此景點的通勤
                        const lastNode = routeData[routeData.length - 1];
                        const newDist = getDist(lastNode.lat, lastNode.lon, spot.lat, spot.lon);
                        const newSegConfig = getSegmentConfig(newDist);
                        travelMinutes = Math.max(5, Math.round((newDist / newSegConfig.speed) * 60 * newSegConfig.factor));
                        arrivalTime = new Date(tempTime.getTime() + travelMinutes * 60 * 1000);
                        travelAlertStr = `${newSegConfig.icon} ${newSegConfig.name}約 ${travelMinutes} 分鐘`;
                    }

                    const h = String(arrivalTime.getHours()).padStart(2, '0');
                    const m = String(arrivalTime.getMinutes()).padStart(2, '0');
                    
                    const spotWeather = getWeatherForTime(weatherData.forecast, `${h}:${m}`, { condition: spot.cond || weatherInfo.condition, temp: spot.temp || weatherInfo.temp });
                    
                    // 以抵達時段的天氣為準判斷是否需要雨具（不用 spot.cond，那是搜尋當下的快照）
                    const spotHasRain = hasRain || (spotWeather.condition && spotWeather.condition.includes("雨"));
                    const spotIsHot = spotWeather.temp >= 32;
                    const spotIsRainingOrHot = spotHasRain || spotIsHot || isRainingOrHot;
                    
                    let safetyHint = "";
                    const spotIsOutdoor = isOutdoor(spot);
                    if (spotIsRainingOrHot) {
                        if (spotIsOutdoor) {
                            safetyHint = spotHasRain ? " (⚠️ 戶外景點，建議攜帶雨具)" : " (⚠️ 戶外景點，高溫注意防曬)";
                        } else {
                            safetyHint = spotHasRain ? " (🏠 室內推薦，免淋雨)" : " (🏠 室內推薦)";
                        }
                    } else {
                        safetyHint = spotIsOutdoor ? " (🌳 戶外景點)" : " (🏠 室內景點)";
                    }

                    // 檢查夜市營業時間
                    const arrivalHour = arrivalTime.getHours();
                    const isNightMarket = spot.name.includes("夜市") || (spot.features && spot.features.includes("夜市"));
                    let timeWarning = "";
                    if (isNightMarket && arrivalHour < 16) {
                        timeWarning = " (⚠️ 注意：夜市通常於 16:00 後才營業)";
                    }

                    const node = {
                        ...spot,
                        timeStr: `${h}:${m}`,
                        travelAlertStr: travelAlertStr,
                        cond: spotWeather.condition,
                        temp: spotWeather.temp,
                        safetyHint: safetyHint,
                        timeWarning: timeWarning,
                        stayMin: spotStayMinutes,
                        desc: spot.desc || "熱門推薦景點"
                    };
                    routeData.push(node);

                    tempTime = new Date(arrivalTime.getTime() + spotStayMinutes * 60 * 1000);
                }

                // 所有景點結束後，插入尚未安排的餐點（例如晚餐在所有景點之後）
                if (remainingMeals.length > 0) {
                    remainingMeals.forEach(food => {
                        const prevNode = routeData.length > 0 ? routeData[routeData.length - 1] : null;
                        insertMealNode(food, prevNode);
                    });
                }

                 // 加入終點
                if (finalEndNode) {
                    const lastNode = routeData.length > 0 ? routeData[routeData.length - 1] : null;
                    const endDist = lastNode ? getDist(lastNode.lat, lastNode.lon, finalEndNode.lat, finalEndNode.lon) : 0;
                    const endSegConfig = getSegmentConfig(endDist);
                    const travelMinutes = lastNode ? Math.max(5, Math.round((endDist / endSegConfig.speed) * 60 * endSegConfig.factor)) : 0;
                    const arrivalTime = new Date(tempTime.getTime() + travelMinutes * 60 * 1000);
                    const h = String(arrivalTime.getHours()).padStart(2, '0');
                    const m = String(arrivalTime.getMinutes()).padStart(2, '0');
                    
                    const endWeather = getWeatherForTime(weatherData.forecast, `${h}:${m}`, weatherInfo);
                    
                    let desc = "";
                    if (finalEndNode.type === "住宿") {
                        desc = `安排入住旅宿 (${finalEndNode.name})`;
                    } else {
                        if (arrivalTime > endTimeLimit) {
                            desc = `旅途終點 (⚠️ 預計延遲抵達，超時約 ${Math.round((arrivalTime - endTimeLimit)/60/1000)} 分鐘)`;
                        } else {
                            desc = `旅途終點 (準時於結束時間前抵達)`;
                        }
                    }

                    const node = {
                        ...finalEndNode,
                        type: finalEndNode.type === "住宿" ? "住宿" : "目的",
                        icon: finalEndNode.type === "住宿" ? "🏨" : "🔴",
                        desc: desc,
                        timeStr: `${h}:${m}`,
                        travelAlertStr: lastNode ? `${endSegConfig.icon} ${endSegConfig.name}約 ${travelMinutes} 分鐘` : "",
                        cond: endWeather.condition,
                        temp: endWeather.temp
                    };
                    routeData.push(node);
                }

                return routeData;
            }

            // 判斷使用者勾選了哪些喜好
            const wantsCulture = checkedInterests.includes('古蹟');
            const wantsNature = checkedInterests.includes('生態');
            const wantsOutdoor = checkedInterests.includes('戶外活動');
            const wantsArt = checkedInterests.includes('藝術');
            const wantsShopping = checkedInterests.includes('遊憩');

            const tripType = document.querySelector('.type-tabs .tab-btn.active').getAttribute('data-type') || 'single';
            const isAllDay = document.getElementById('allday').checked;

            currentRoutes = [];

            if (tripType === 'multi') {
                let startDateVal = document.getElementById('multi-start-date').value;
                let endDateVal = document.getElementById('multi-end-date').value;
                
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const tomorrow = new Date(Date.now() + 86400000);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                
                if (!startDateVal) startDateVal = todayStr;
                if (!endDateVal) endDateVal = tomorrowStr;
                
                let startD = new Date(startDateVal);
                let endD = new Date(endDateVal);
                let numDays = Math.max(1, Math.min(7, Math.round((endD - startD) / (86400000)) + 1));
                
                // 定義生成單一多日行程的輔助函式
                function buildMultiDayRoute(pool, hasFood, initialExcludeSpots = []) {
                    const usedSpotNames = [...initialExcludeSpots];
                    let activeHotel = null;
                    let fullRouteData = [];

                    for (let d = 0; d < numDays; d++) {
                        const dDate = new Date(startD.getTime() + d * 86400000);
                        const yyyy = dDate.getFullYear();
                        const mm = String(dDate.getMonth() + 1).padStart(2, '0');
                        const dd = String(dDate.getDate()).padStart(2, '0');
                        const dayDateStr = `${yyyy}-${mm}-${dd}`;
                        
                        let dayStartHour = 9;
                        let dayEndHour = 18;
                        
                        if (isAllDay) {
                            let bestStart = 9;
                            let maxScore = -Infinity;
                            const candidateStarts = [7, 8, 9, 10, 11, 12];
                            const targetForecasts = weatherData.forecast.filter(f => f.start.includes(dayDateStr));
                            
                            if (targetForecasts.length > 0) {
                                candidateStarts.forEach(start => {
                                    let score = 100;
                                    for (let h = start; h < start + 9; h++) {
                                        const timeString = `${String(h).padStart(2, '0')}:00`;
                                        const f = targetForecasts.find(slot => slot.start.includes(`T${String(h).padStart(2, '0')}:`)) || 
                                                  getWeatherForTime(weatherData.forecast, timeString, weatherInfo);
                                        if (f.condition.includes("雨")) score -= 30;
                                        if (f.temp >= 32) score -= (f.temp - 31) * 2;
                                        if ((f.condition.includes("晴") || f.condition.includes("多雲")) && f.temp >= 22 && f.temp <= 28) score += 5;
                                    }
                                    if (score > maxScore) {
                                        maxScore = score;
                                        bestStart = start;
                                    }
                                });
                            }
                            dayStartHour = bestStart;
                            dayEndHour = bestStart + 9;
                        }

                        let customStartNode = null;
                        if (d > 0 && activeHotel) {
                            customStartNode = { ...activeHotel, type: "住宿" };
                        }

                        let dayRouteData = buildRouteData(pool, hasFood, usedSpotNames, dayDateStr, dayStartHour, dayEndHour, customStartNode, null);
                        
                        if (d < numDays - 1) {
                            let lastRealNode = null;
                            for (let i = dayRouteData.length - 1; i >= 0; i--) {
                                const node = dayRouteData[i];
                                if (node.type === "景點" || node.type === "美食") {
                                    lastRealNode = node;
                                    break;
                                }
                            }
                            
                            let targetHotel = null;
                            if (lastRealNode) {
                                // 篩選距離當天最後一個真實景點 25 公里內的旅宿
                                let candidates = realHotels.map(h => {
                                    const distToLast = getDist(h.lat, h.lon, lastRealNode.lat, lastRealNode.lon);
                                    const distToEnd = (currentMode === 'route' && selectedEnd) ? getDist(h.lat, h.lon, selectedEnd.lat, selectedEnd.lon) : 0;
                                    return { hotel: h, distToLast, distToEnd };
                                });

                                let nearHotels = candidates.filter(c => c.distToLast <= 25);
                                
                                // 防呆：若 25 公里內沒有旅宿，則取最近的 5 間
                                if (nearHotels.length === 0) {
                                    candidates.sort((a, b) => a.distToLast - b.distToLast);
                                    nearHotels = candidates.slice(0, 5);
                                }

                                if (currentMode === 'route' && selectedEnd) {
                                    // 路線模式：選擇離終點較近的旅店
                                    nearHotels.sort((a, b) => a.distToEnd - b.distToEnd);
                                } else {
                                    // 區域探索模式：選擇離景點最近的旅店
                                    nearHotels.sort((a, b) => a.distToLast - b.distToLast);
                                }
                                
                                targetHotel = nearHotels[0]?.hotel || null;
                            }
                            
                            if (targetHotel) {
                                activeHotel = { ...targetHotel, type: "住宿" };
                                dayRouteData = buildRouteData(pool, hasFood, usedSpotNames, dayDateStr, dayStartHour, dayEndHour, customStartNode, activeHotel);
                            }
                        } else {
                            activeHotel = null;
                        }
                        
                        dayRouteData.forEach(item => {
                            if (item.type === "景點" || item.type === "美食") {
                                usedSpotNames.push(item.name);
                            }
                            item.dayNum = d + 1;
                            item.dayDateStr = dayDateStr;
                        });

                        fullRouteData.push(...dayRouteData);
                    }
                    return fullRouteData;
                }

                const mainRouteData = buildMultiDayRoute(realSpots, style === 'food', []);
                currentRoutes.push({ name: "綜合推薦多日遊", color: "#4A90E2", data: mainRouteData });

                const usedSpotNames = mainRouteData.filter(item => item.type === "景點" || item.type === "美食").map(item => item.name);

                if (wantsCulture && cultureSpots.length > 0) {
                    currentRoutes.push({ name: "古蹟文化多日遊", color: "#8E44AD", data: buildMultiDayRoute(cultureSpots, true, usedSpotNames) });
                }
                if (wantsNature && natureSpots.length > 0) {
                    currentRoutes.push({ name: "自然生態多日遊", color: "#28a745", data: buildMultiDayRoute(natureSpots, false, usedSpotNames) });
                }
                if (wantsOutdoor && outdoorSpots.length > 0) {
                    currentRoutes.push({ name: "戶外活動多日遊", color: "#16A085", data: buildMultiDayRoute(outdoorSpots, false, usedSpotNames) });
                }
                if (wantsArt && artSpots.length > 0) {
                    currentRoutes.push({ name: "藝文展覽多日遊", color: "#F39C12", data: buildMultiDayRoute(artSpots, true, usedSpotNames) });
                }
                if (wantsShopping && shoppingSpots.length > 0) {
                    currentRoutes.push({ name: "購物娛樂多日遊", color: "#E74C3C", data: buildMultiDayRoute(shoppingSpots, true, usedSpotNames) });
                }

                const hasAnyInterestChecked = Array.from(document.querySelectorAll('#interest-tags input:checked')).length > 0;
                if (hasAnyInterestChecked && currentRoutes.length === 1) {
                     if (natureSpots.length > 0) currentRoutes.push({ name: "自然風景多日遊", color: "#28a745", data: buildMultiDayRoute(natureSpots, false, usedSpotNames) });
                     else if (cultureSpots.length > 0) currentRoutes.push({ name: "人文遊憩多日遊", color: "#8E44AD", data: buildMultiDayRoute(cultureSpots, true, usedSpotNames) });
                }
            } else {
                let currentHour = 9;
                let endHour = 18;
                
                const startTimeInput = document.getElementById('single-start-time');
                if (startTimeInput) {
                    const parts = startTimeInput.value.split(':');
                    currentHour = parseInt(parts[0]) || 9;
                }
                const endTimeInput = document.getElementById('single-end-time');
                if (endTimeInput) {
                    const parts = endTimeInput.value.split(':');
                    endHour = parseInt(parts[0]) || 18;
                }

                const singleDateInput = document.getElementById('single-date');
                let dateStr = singleDateInput?.value;
                if (!dateStr) {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    dateStr = `${yyyy}-${mm}-${dd}`;
                }

                if (isAllDay) {
                    let bestStart = 9;
                    let maxScore = -Infinity;
                    const candidateStarts = [7, 8, 9, 10, 11, 12];
                    const targetForecasts = weatherData.forecast.filter(f => f.start.includes(dateStr));
                    
                    if (targetForecasts.length > 0) {
                        candidateStarts.forEach(start => {
                            let score = 100;
                            for (let h = start; h < start + 9; h++) {
                                const timeString = `${String(h).padStart(2, '0')}:00`;
                                const f = targetForecasts.find(slot => slot.start.includes(`T${String(h).padStart(2, '0')}:`)) || 
                                          getWeatherForTime(weatherData.forecast, timeString, weatherInfo);
                                if (f.condition.includes("雨")) score -= 30;
                                if (f.temp >= 32) score -= (f.temp - 31) * 2;
                                if ((f.condition.includes("晴") || f.condition.includes("多雲")) && f.temp >= 22 && f.temp <= 28) score += 5;
                            }
                            if (score > maxScore) {
                                maxScore = score;
                                bestStart = start;
                            }
                        });
                    }
                    currentHour = bestStart;
                    endHour = bestStart + 9;
                    
                    if (startTimeInput) startTimeInput.value = `${String(currentHour).padStart(2, '0')}:00`;
                    if (endTimeInput) endTimeInput.value = `${String(endHour).padStart(2, '0')}:00`;
                }

                const mainRouteData = buildRouteData(realSpots, style === 'food', [], dateStr, currentHour, endHour);
                currentRoutes.push({ name: "綜合推薦路線", color: "#4A90E2", data: mainRouteData });

                const usedSpotNames = mainRouteData.filter(item => item.type === "景點" || item.type === "美食").map(item => item.name);

                if (wantsCulture && cultureSpots.length > 0) {
                    currentRoutes.push({ name: "古蹟文化備案", color: "#8E44AD", data: buildRouteData(cultureSpots, true, usedSpotNames, dateStr, currentHour, endHour) });
                }
                if (wantsNature && natureSpots.length > 0) {
                    currentRoutes.push({ name: "自然生態備案", color: "#28a745", data: buildRouteData(natureSpots, false, usedSpotNames, dateStr, currentHour, endHour) });
                }
                if (wantsOutdoor && outdoorSpots.length > 0) {
                    currentRoutes.push({ name: "戶外活動備案", color: "#16A085", data: buildRouteData(outdoorSpots, false, usedSpotNames, dateStr, currentHour, endHour) });
                }
                if (wantsArt && artSpots.length > 0) {
                    currentRoutes.push({ name: "藝文展覽備案", color: "#F39C12", data: buildRouteData(artSpots, true, usedSpotNames, dateStr, currentHour, endHour) });
                }
                if (wantsShopping && shoppingSpots.length > 0) {
                    currentRoutes.push({ name: "購物娛樂備案", color: "#E74C3C", data: buildRouteData(shoppingSpots, true, usedSpotNames, dateStr, currentHour, endHour) });
                }

                const hasAnyInterestChecked = Array.from(document.querySelectorAll('#interest-tags input:checked')).length > 0;
                if (hasAnyInterestChecked && currentRoutes.length === 1) {
                     if (natureSpots.length > 0) currentRoutes.push({ name: "自然風景備案", color: "#28a745", data: buildRouteData(natureSpots, false, usedSpotNames, dateStr, currentHour, endHour) });
                     else if (cultureSpots.length > 0) currentRoutes.push({ name: "人文遊憩備案", color: "#8E44AD", data: buildRouteData(cultureSpots, true, usedSpotNames, dateStr, currentHour, endHour) });
                }
            }

            document.getElementById('screen-query').classList.remove('active');
            document.getElementById('screen-result').classList.add('active');
            
            selectedRouteIndex = 0;
            renderLegend();
            renderTimeline(currentRoutes[0].data);
            
            if (map) { map.remove(); map = null; }
            setTimeout(() => initMapMulti(currentRoutes), 200);

        } catch (error) {
            console.error("行程生成失敗:", error);
            alert("規劃發生錯誤，請確認 Server 是否啟動。");
        } finally {
            btnSearch.textContent = "🌍 雲端智能規劃";
            btnSearch.disabled = false;
        }
    });

    // --- 5. 渲染圖例與時間軸 ---
    function renderLegend() {
        const legendDiv = document.getElementById('route-legend');
        legendDiv.innerHTML = currentRoutes.map((r, i) => `
            <div class="legend-item ${i === selectedRouteIndex ? 'active' : ''}" data-index="${i}">
                <div class="legend-color" style="background-color: ${r.color};"></div>
                ${r.name}
            </div>
        `).join('');

        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                selectedRouteIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                renderTimeline(currentRoutes[selectedRouteIndex].data); 
                updateMapRoute();
            });
        });
    }

    function renderTimeline(itinerary) {
        const list = document.getElementById('timeline-list');
        let currentRenderDay = null;
        list.innerHTML = itinerary.map((item, i) => {
            let dayHeaderHtml = "";
            if (item.dayNum && item.dayNum !== currentRenderDay) {
                currentRenderDay = item.dayNum;
                dayHeaderHtml = `
                    <div class="timeline-day-header" style="margin: 20px 0 10px 0; padding: 10px 14px; background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(74, 144, 226, 0.05)); border-left: 4px solid #4A90E2; border-radius: 6px; font-weight: bold; font-size: 14px; color: #4A90E2; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        📅 第 ${item.dayNum} 天 行程 (${item.dayDateStr})
                    </div>
                `;
            }

            let travelAlert = "";
            if (i > 0 && item.travelAlertStr) {
                travelAlert = `
                    <div style="padding-left: 20px; font-size: 11px; color: #888; border-left: 3px dashed #ccc; margin: 4px 0; height: 20px; display: flex; align-items: center;">
                        ${item.travelAlertStr}
                    </div>
                `;
            }
            
            let openTimeHtml = "";
            if (item.openTime && (item.type === "景點" || item.type === "美食")) {
                openTimeHtml = `<div style="font-size: 11px; color: #888; margin-top: 3px; font-style: italic;">🕒 營業時間: ${item.openTime}</div>`;
            }

            const isClickable = item.type !== "出發" && item.type !== "目的";
            const cursorStyle = isClickable ? 'cursor: pointer;' : 'cursor: default;';

            let detailText = "";
            if (item.type === "出發" || item.type === "目的") {
                detailText = item.desc;
            } else if (item.type === "住宿") {
                detailText = item.desc || "精選住宿點";
            } else if (item.type === "美食") {
                const stay = `預計停留 ${item.stayMin || 60} 分鐘`;
                detailText = `${item.desc || "在地特色餐廳"} (${stay})`;
            } else {
                const hint = item.safetyHint || "";
                const warning = item.timeWarning || "";
                const stay = `預計停留 ${item.stayMin || 60} 分鐘`;
                detailText = `${hint}${warning} (${stay})`;
            }

            return `
                ${dayHeaderHtml}
                ${travelAlert}
                <li class="timeline-item" style="${cursorStyle} ${i === itinerary.length - 1 ? 'border-left: 3px solid transparent;' : ''}">
                    <div style="font-size:11px; color:#999">${item.timeStr} | ${item.type}</div>
                    <div style="font-weight:bold; margin: 4px 0;">${item.icon} ${item.name}</div>
                    <div style="font-size:12px; color:#666">${item.cond} ${item.temp}°C | ${detailText}</div>
                    ${openTimeHtml}
                    ${isClickable ? `<button class="btn-detail-more">📄 詳細介紹</button>` : ''}
                </li>
            `;
        }).join('');
    }

    // --- 6. 多路線地圖渲染 ---
    let map = null;
    let mapRouteGroups = [];

    function updateMapRoute() {
        if (!map || !mapRouteGroups || mapRouteGroups.length === 0) return;
        mapRouteGroups.forEach((group, idx) => {
            if (idx === selectedRouteIndex) {
                group.addTo(map);
            } else {
                group.remove();
            }
        });
        
        // 自動聚焦至選取的路線邊界
        const activeRoute = currentRoutes[selectedRouteIndex];
        if (activeRoute && activeRoute.data.length > 0) {
            const lats = activeRoute.data.map(p => p.lat);
            const lons = activeRoute.data.map(p => p.lon);
            if (lats.length === 1) {
                map.setView([lats[0], lons[0]], 14);
            } else {
                map.fitBounds(L.latLngBounds([Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]), { padding: [30, 30] });
            }
        }
    }

    async function initMapMulti(routes) {
        const mainLats = routes[0].data.map(p => p.lat);
        const mainLons = routes[0].data.map(p => p.lon);
        map = L.map('map').setView([(Math.max(...mainLats)+Math.min(...mainLats))/2, (Math.max(...mainLons)+Math.min(...mainLons))/2], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        mapRouteGroups = [];

        const transportMode = document.getElementById('transport-mode').value || 'driving';
        const osrmProfile = (transportMode === 'bicycling') ? 'bike' : (transportMode === 'walking') ? 'foot' : 'driving';

        routes.forEach((route, idx) => {
            const group = L.layerGroup();
            mapRouteGroups[idx] = group;

            route.data.forEach(p => {
                let markerIcon;
                if (p.type === "出發") {
                    markerIcon = L.divIcon({
                        html: `<div style="background-color: #2ecc71; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); font-size: 14px;">起</div>`,
                        className: 'custom-pin-start',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                } else if (p.type === "目的") {
                    markerIcon = L.divIcon({
                        html: `<div style="background-color: #e74c3c; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); font-size: 14px;">終</div>`,
                        className: 'custom-pin-end',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                } else if (p.type === "住宿") {
                    markerIcon = L.divIcon({
                        html: `<div style="background-color: #9b59b6; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); font-size: 14px;">宿</div>`,
                        className: 'custom-pin-hotel',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                } else if (p.type === "美食") {
                    markerIcon = L.divIcon({
                        html: `<div style="background-color: ${route.color}; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25); font-size: 11px;">食</div>`,
                        className: 'custom-pin-food',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    });
                } else {
                    markerIcon = L.divIcon({
                        html: `<div style="background-color: ${route.color}; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25); position: relative;">
                                 <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
                               </div>`,
                        className: 'custom-pin-spot',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11]
                    });
                }
                L.marker([p.lat, p.lon], { icon: markerIcon }).addTo(group).bindPopup(`${route.name}: ${p.name}`);
            });

            // 異步載入 OSRM 路徑並加到群組中
            if (route.data.length >= 2) {
                // 如果是區域探索模式，採用分段查詢以套用不同的通勤工具 (步行/自行車/自駕自駕)
                if (currentMode === 'area') {
                    for (let i = 0; i < route.data.length - 1; i++) {
                        const fromNode = route.data[i];
                        const toNode = route.data[i + 1];
                        const dist = getDist(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
                        
                        let segProfile = 'driving';
                        if (dist < 1.2) segProfile = 'foot';
                        else if (dist <= 5) segProfile = 'bike';
                        else segProfile = 'driving';
                        
                        const url = `https://router.project-osrm.org/route/v1/${segProfile}/${fromNode.lon},${fromNode.lat};${toNode.lon},${toNode.lat}?overview=full&geometries=geojson`;
                        fetch(url)
                            .then(res => res.json())
                            .then(data => {
                                if (data.routes && data.routes.length > 0) {
                                    L.geoJSON(data.routes[0].geometry, { style: { color: route.color, weight: 6, opacity: 0.8 } }).addTo(group);
                                }
                            })
                            .catch(e => {});
                    }
                } else {
                    const uniqueCoords = [];
                    route.data.forEach(p => {
                        if (uniqueCoords.length === 0 || uniqueCoords[uniqueCoords.length - 1].lat !== p.lat || uniqueCoords[uniqueCoords.length - 1].lon !== p.lon) {
                            uniqueCoords.push(p);
                        }
                    });
                    const coordsStr = uniqueCoords.map(p => `${p.lon},${p.lat}`).join(';');
                    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordsStr}?overview=full&geometries=geojson`;
                    fetch(url)
                        .then(res => res.json())
                        .then(data => {
                            if (data.routes && data.routes.length > 0) {
                                    L.geoJSON(data.routes[0].geometry, { style: { color: route.color, weight: 6, opacity: 0.8 } }).addTo(group);
                            }
                        })
                        .catch(e => {});
                }
            }
        });

        // 初始載入時顯示選取的第一條路線並自適應邊界
        updateMapRoute();
    }

    // --- 7. 導航跳轉 ---
    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('screen-result').classList.remove('active');
        document.getElementById('screen-query').classList.add('active');
    });

    document.getElementById('btn-navigate').addEventListener('click', () => {
        const itinerary = currentRoutes[selectedRouteIndex].data;
        const transportMode = document.getElementById('transport-mode').value || 'driving';
        const googleModes = { driving: 'driving', transit: 'transit', bicycling: 'bicycling', walking: 'walking' };
        
        let mode = 'driving';
        if (currentMode === 'area') {
            let maxDist = 0;
            for (let i = 0; i < itinerary.length - 1; i++) {
                const fromNode = itinerary[i];
                const toNode = itinerary[i + 1];
                if (fromNode.lat && fromNode.lon && toNode.lat && toNode.lon) {
                    const dist = getDist(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
                    if (dist > maxDist) maxDist = dist;
                }
            }
            if (maxDist < 1.2) mode = 'walking';
            else if (maxDist <= 5) mode = 'bicycling';
            else mode = 'driving';
        } else {
            mode = googleModes[transportMode] || 'driving';
        }
        
        if (itinerary.length >= 2) {
            const origin = `${itinerary[0].lat},${itinerary[0].lon}`;
            const destIndex = itinerary.length - 1;
            const destination = `${itinerary[destIndex].lat},${itinerary[destIndex].lon}`;
            let waypoints = itinerary.length > 2 ? `&waypoints=${itinerary.slice(1, destIndex).map(p => `${p.lat},${p.lon}`).join('|')}` : '';
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=${mode}`, '_blank');
        }
    });

    // --- 8. 景點詳情頁面邏輯 ---
    const timelineList = document.getElementById('timeline-list');
    timelineList.addEventListener('click', (e) => {
        const detailBtn = e.target.closest('.btn-detail-more');
        const itemElement = e.target.closest('.timeline-item');
        if (!itemElement) return;
        
        // 算出點擊的是第幾個元素
        const timelineItems = Array.from(timelineList.querySelectorAll('.timeline-item'));
        const index = timelineItems.indexOf(itemElement);
        if (index === -1) return;
        
        const itemData = currentRoutes[selectedRouteIndex].data[index];
        if (!itemData || itemData.type === "出發" || itemData.type === "目的") return;
        
        if (detailBtn) {
            // 使用者點選「詳細介紹」小按鈕時才進入詳細介紹頁面
            document.getElementById('detail-icon').textContent = itemData.icon || "📍";
            document.getElementById('detail-name').textContent = itemData.name;
            document.getElementById('detail-address').textContent = itemData.address || "詳見官方公告";
            document.getElementById('detail-phone').textContent = itemData.phone || "暫無聯絡電話";
            document.getElementById('detail-opentime').textContent = itemData.openTime || "詳見官方公告";
            document.getElementById('detail-weather').textContent = `${itemData.cond || '⛅ 多雲'} | ${itemData.temp || 28}°C`;
            document.getElementById('detail-desc').textContent = itemData.fullDesc || "暫無詳細介紹，歡迎現場探索！";
            
            // 載入景點照片 (若 TDX API 無提供照片則顯示產生的預設風景圖)
            const photoEl = document.getElementById('detail-photo');
            if (itemData.image) {
                photoEl.src = itemData.image;
            } else {
                photoEl.src = 'default_scenery.png';
            }
            
            // 切換畫面到詳細介紹頁
            document.getElementById('screen-result').classList.remove('active');
            document.getElementById('screen-detail').classList.add('active');
            return;
        }

        const isActive = itemElement.classList.contains('active');

        // 清除所有行程項目的選取狀態
        timelineItems.forEach(el => el.classList.remove('active'));

        if (isActive) {
            // 如果原本已是選取狀態，再次點選則取消選取，並將地圖平滑縮放回完整路線 overview
            if (map) {
                const activeRoute = currentRoutes[selectedRouteIndex];
                if (activeRoute && activeRoute.data.length > 0) {
                    const lats = activeRoute.data.map(p => p.lat);
                    const lons = activeRoute.data.map(p => p.lon);
                    map.fitBounds(L.latLngBounds([Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]), {
                        padding: [30, 30],
                        animate: true,
                        duration: 1.2
                    });
                }
            }
        } else {
            // 如果原本不是選取狀態，則設為選取，並平滑移動放大至該景點
            itemElement.classList.add('active');

            if (map) {
                map.flyTo([itemData.lat, itemData.lon], 16, {
                    animate: true,
                    duration: 1.5
                });
            }
        }
    });

    document.getElementById('btn-back-to-result').addEventListener('click', () => {
        document.getElementById('screen-detail').classList.remove('active');
        document.getElementById('screen-result').classList.add('active');
    });
});

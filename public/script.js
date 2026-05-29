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
        "臺南市": ["中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", "將軍區", "學甲區", "北門區", "新營區", "後壁區", "白河區", "東山區", "六甲區", "下營區", "柳營區", "鹽水區", "善化區", "大內區", "山上區", "新市區", "安定區"],
        "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區", "仁武區", "大社區", "岡山區", "路竹區", "阿蓮區", "田寮區", "燕巢區", "橋頭區", "梓官區", "彌陀區", "永安區", "湖內區", "鳳山區", "大寮區", "林園區", "鳥松區", "大樹區", "旗山區", "美濃區", "六龜區", "內門區", "杉林區", "甲仙區", "桃源區", "那瑪夏區", "茂林區", "茄萣區"],
        "屏東縣": ["屏東市", "三地門鄉", "霧臺鄉", "瑪家鄉", "九如鄉", "里港鄉", "高樹鄉", "鹽埔鄉", "長治鄉", "麟洛鄉", "竹田鄉", "內埔鄉", "萬丹鄉", "泰武鄉", "來義鄉", "潮州鎮", "萬巒鄉", "崁頂鄉", "新埤鄉", "南州鄉", "林邊鄉", "東港鎮", "琉球鄉", "佳冬鄉", "新園鄉", "枋寮鄉", "枋山鄉", "春日鄉", "獅子鄉", "車城鄉", "牡丹鄉", "恆春鎮", "滿州鄉"],
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
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=tw`);
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
    setupAutocomplete(startInput, startSuggestions, (data) => selectedStart = { name: data.display_name.split(',')[0], lat: parseFloat(data.lat), lon: parseFloat(data.lon) });
    setupAutocomplete(endInput, endSuggestions, (data) => selectedEnd = { name: data.display_name.split(',')[0], lat: parseFloat(data.lat), lon: parseFloat(data.lon) });

    // --- 4. 核心：呼叫後端並生成【三條】風格路線 ---
    let currentRoutes = [];
    let selectedRouteIndex = 0;
    const btnSearch = document.getElementById('btn-search');
    
    btnSearch.addEventListener('click', async () => {
        btnSearch.textContent = "🌍 雲端多路線規劃中...";
        btnSearch.disabled = true;

        try {
            let targetCity = "臺南市";
            if (currentMode === 'area' && citySelect.selectedOptions.length > 0) {
                targetCity = citySelect.selectedOptions[0].value;
            } else if (currentMode === 'route') {
                const searchString = startInput.value;
                const allCities = Object.keys(taiwanData);
                for (let c of allCities) {
                    if (searchString.includes(c) || searchString.includes(c.substring(0, 2))) {
                        targetCity = c; break;
                    }
                }
            }

            const style = document.getElementById('travel-style').value;
            const checkedInterests = Array.from(document.querySelectorAll('#interest-tags input:checked')).map(cb => cb.value).join(',');

            let weatherInfo = { condition: "⛅ 多雲", temp: 28 };
            try {
                const weatherRes = await fetch(`/api/weather/${targetCity}`);
                if (weatherRes.ok) weatherInfo = await weatherRes.json();
            } catch(e) {}

            let realSpots = [], realRestaurants = [];
            try {
                const tourRes = await fetch(`/api/tour/${targetCity}?style=${style}&interests=${checkedInterests}`);
                if (tourRes.ok) {
                    const data = await tourRes.json();
                    realSpots = data.spots || [];
                    realRestaurants = data.restaurants || [];
                }
            } catch(e) {}

            if(realSpots.length === 0) {
                realSpots = [
                    { name: `${targetCity}文化園區`, lat: selectedStart.lat + 0.01, lon: selectedStart.lon + 0.01, type: "景點", icon: "🏛️", desc: "在地文化", features: "文化 古蹟" },
                    { name: `${targetCity}森林公園`, lat: selectedStart.lat - 0.01, lon: selectedStart.lon - 0.01, type: "景點", icon: "🌳", desc: "自然風光", features: "生態 自然風景" }
                ];
                realRestaurants = [{ name: `${targetCity}美食名店`, lat: selectedStart.lat - 0.01, lon: selectedStart.lon + 0.01, type: "美食", icon: "🍲", desc: "必吃美食" }];
            }

            // 應用隊友邏輯：自動將景點分為自然、人文兩類
            const natureSpots = realSpots.filter(s => s.features.match(/觀光工廠|生態|國家公園|自然風景|風景/));
            const cultureSpots = realSpots.filter(s => s.features.match(/古蹟|廟宇|文化|老街|藝術|展覽/));
            const fallbackSpots = realSpots.filter(s => !natureSpots.includes(s) && !cultureSpots.includes(s));

            function buildRouteData(pool, maxSpots, hasFood) {
                let routeData = [];
                routeData.push({ ...selectedStart, type: "出發", icon: "🟢", desc: "行程起點", cond: weatherInfo.condition, temp: weatherInfo.temp });
                
                let currentPool = pool.length > 0 ? pool : (fallbackSpots.length > 0 ? fallbackSpots : realSpots);
                let shuffled = currentPool.sort(() => 0.5 - Math.random()).slice(0, maxSpots);
                shuffled.forEach(s => routeData.push({...s, cond: weatherInfo.condition, temp: weatherInfo.temp}));

                if (hasFood && realRestaurants.length > 0) {
                    const randomFood = realRestaurants[Math.floor(Math.random() * realRestaurants.length)];
                    routeData.push({...randomFood, cond: weatherInfo.condition, temp: weatherInfo.temp});
                }

                if (currentMode === 'route' && selectedEnd) {
                    routeData.push({ ...selectedEnd, type: "目的", icon: "🔴", desc: "旅途終點", cond: weatherInfo.condition, temp: weatherInfo.temp });
                }
                return routeData;
            }

            // 生成 3 條路線
            currentRoutes = [
                { name: "專屬推薦路線", color: "#4A90E2", data: buildRouteData(realSpots, 2, style==='food') },
                { name: "自然風景備案", color: "#28a745", data: buildRouteData(natureSpots, 2, false) },
                { name: "人文遊憩備案", color: "#ff5733", data: buildRouteData(cultureSpots, 2, true) }
            ];

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
            });
        });
    }

    function renderTimeline(itinerary) {
        const list = document.getElementById('timeline-list');
        const times = ['09:30', '12:00', '15:00', '18:30', '20:00'];
        list.innerHTML = itinerary.map((item, i) => `
            <li class="timeline-item" style="${i === itinerary.length - 1 ? 'border-left: 3px solid transparent;' : ''}">
                <div style="font-size:11px; color:#999">${times[i%times.length]} | ${item.type}</div>
                <div style="font-weight:bold; margin: 4px 0;">${item.icon} ${item.name}</div>
                <div style="font-size:12px; color:#666">${item.cond} ${item.temp}°C | ${item.desc}</div>
            </li>
        `).join('');
    }

    // --- 6. 多路線地圖渲染 ---
    let map = null;
    async function initMapMulti(routes) {
        const mainLats = routes[0].data.map(p => p.lat);
        const mainLons = routes[0].data.map(p => p.lon);
        map = L.map('map').setView([(Math.max(...mainLats)+Math.min(...mainLats))/2, (Math.max(...mainLons)+Math.min(...mainLons))/2], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        routes.forEach(route => {
            route.data.forEach(p => L.marker([p.lat, p.lon]).addTo(map).bindPopup(`${route.name}: ${p.name}`));
        });

        for (let route of routes) {
            if (route.data.length < 2) continue;
            const coordsStr = route.data.map(p => `${p.lon},${p.lat}`).join(';');
            const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                    L.geoJSON(data.routes[0].geometry, { style: { color: route.color, weight: 6, opacity: 0.8 } }).addTo(map);
                }
            } catch (e) {}
        }
        
        let allLats = [], allLons = [];
        routes.forEach(r => { allLats.push(...r.data.map(p=>p.lat)); allLons.push(...r.data.map(p=>p.lon)); });
        map.fitBounds(L.latLngBounds([Math.min(...allLats), Math.min(...allLons)], [Math.max(...allLats), Math.max(...allLons)]), { padding: [30, 30] });
    }

    // --- 7. 導航跳轉 ---
    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('screen-result').classList.remove('active');
        document.getElementById('screen-query').classList.add('active');
    });

    document.getElementById('btn-navigate').addEventListener('click', () => {
        const itinerary = currentRoutes[selectedRouteIndex].data;
        if (itinerary.length >= 2) {
            const origin = `${itinerary[0].lat},${itinerary[0].lon}`;
            const destIndex = itinerary.length - 1;
            const destination = `${itinerary[destIndex].lat},${itinerary[destIndex].lon}`;
            let waypoints = itinerary.length > 2 ? `&waypoints=${itinerary.slice(1, destIndex).map(p => `${p.lat},${p.lon}`).join('|')}` : '';
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`, '_blank');
        }
    });
});
import requests
import json

CLIENT_ID = 'E94126208-65f1b7ad-e8f1-41c1'
CLIENT_SECRET = 'ebf67e02-0810-4c2b-8b75-1af4b0e583ce'

def get_tdx_token():
    auth_url = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token"
    data = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    response = requests.post(auth_url, data=data)
    if response.status_code == 200:
        return response.json().get('access_token')
    else:
        print("Token 取得失敗，請檢查憑證。")
        return None

def classify_spot(spot):
    """
    根據景點的 Class, Keyword, Name 以及 Description 進行綜合分類
    """
    name = spot.get('ScenicSpotName', '')
    c1 = spot.get('Class1', '')
    c2 = spot.get('Class2', '')
    keyword = spot.get('Keyword', '')
    desc = spot.get('DescriptionDetail') or spot.get('Description') or ''
    
    features = f"{c1} {c2} {keyword} {name} {desc}"
    
    nature_keywords = ['觀光工廠', '生態', '國家公園', '自然風景', '保護區', '潟湖', '水庫', '風景區', '登山', '步道', '休閒農業', '濕地', '海岸', '森林', '草原', '風景', '海洋', '海底', '潛水', '水下']
    culture_keywords = ['古蹟', '廟宇', '藝術', '文化', '老街', '紀念館', '文物館', '歷史', '天后宮', '宮', '廟', '教堂', '古厝', '故居', '遺址', '洋行', '大宅', '清領', '日治', '三合院', '聚落', '信仰', '塔', '工廠', '鹽田', '建築', '遺跡']
    recreation_keywords = ['展覽', '都會', '商業', '遊憩', '漁港', '鹽山', '溫泉', '休閒', '海產街', '渡假', '遊客中心', '觀光', '雜貨店', '商圈', '夜市', '市集', '體驗', '地標', '廣場', '圓環']
    
    if any(k in features for k in nature_keywords):
        return 'nature'
    elif any(k in features for k in culture_keywords):
        return 'culture'
    elif any(k in features for k in recreation_keywords):
        return 'recreation'
    else:
        return 'unclassified'

def find_route_waypoints(spots_list, start_lat=22.9971, start_lon=120.2168, num_stops=4):
    """
    使用最近鄰法 (Nearest Neighbor) 計算出一個合適的推薦路線順序
    """
    valid_spots = []
    for s in spots_list:
        pos = s.get('Position', {})
        lat = pos.get('PositionLat')
        lon = pos.get('PositionLon')
        if lat and lon:
            valid_spots.append((s, lat, lon))
            
    if not valid_spots:
        return []
        
    route = []
    # 起點設定 (如成功大學)
    route.append({
        "name": "成功大學",
        "lat": start_lat,
        "lon": start_lon,
        "city": "臺南市"
    })
    
    curr_lat, curr_lon = start_lat, start_lon
    unvisited = list(valid_spots)
    
    for _ in range(min(num_stops, len(valid_spots))):
        closest_idx = 0
        min_dist = float('inf')
        for i, (spot, lat, lon) in enumerate(unvisited):
            # 經緯度平方差近似距離 (適合區域性小範圍計算)
            dist = (lat - curr_lat)**2 + (lon - curr_lon)**2
            if dist < min_dist:
                min_dist = dist
                closest_idx = i
                
        spot, lat, lon = unvisited.pop(closest_idx)
        route.append({
            "name": spot.get('ScenicSpotName'),
            "lat": lat,
            "lon": lon,
            "city": spot.get('City')
        })
        curr_lat, curr_lon = lat, lon
        
    return route

def fetch_and_classify_spots(token):
    # 篩選台南、高雄、嘉義市、嘉義縣的景點以擴充資料量
    filter_query = "City eq '臺南市' or City eq '高雄市' or City eq '嘉義縣' or City eq '嘉義市'"
    url = f"https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$filter={filter_query}&$top=1000&$select=ScenicSpotName,City,Class1,Class2,Keyword,DescriptionDetail,Description,Position&$format=JSON"
    headers = {'authorization': f'Bearer {token}'}
    
    response = requests.get(url, headers=headers)
    all_spots = response.json()
    
    # 優先保留台南市景點，其餘由鄰近景點補足至 100 筆
    tainan_spots = [s for s in all_spots if s.get('City') == '臺南市']
    other_spots = [s for s in all_spots if s.get('City') != '臺南市']
    spots = (tainan_spots + other_spots)[:100]
    
    print(f"從台南與鄰近縣市中成功取得並篩選出 {len(spots)} 筆景點...")
    
    nature_spots = []
    culture_spots = []
    recreation_spots = []
    unclassified_spots = []
    
    # 用來輸出到 JS 檔案的格式化資料
    output_spots = []
    
    for spot in spots:
        name = spot.get('ScenicSpotName')
        city = spot.get('City', '')
        category = classify_spot(spot)
        pos = spot.get('Position', {})
        lat = pos.get('PositionLat')
        lon = pos.get('PositionLon')
        desc = spot.get('DescriptionDetail') or spot.get('Description') or '無詳細描述。'
        
        if not lat or not lon:
            continue
            
        spot_data = {
            "name": name,
            "city": city,
            "category": category,
            "lat": lat,
            "lon": lon,
            "desc": desc[:150] + ("..." if len(desc) > 150 else "")
        }
        output_spots.append(spot_data)
        
        if category == 'nature':
            nature_spots.append(spot)
        elif category == 'culture':
            culture_spots.append(spot)
        elif category == 'recreation':
            recreation_spots.append(spot)
        else:
            unclassified_spots.append(spot)
            
    # 計算三個情境的推薦路線 (各自包含成大起點 + 4 個最鄰近景點)
    nature_route = find_route_waypoints(nature_spots)
    culture_route = find_route_waypoints(culture_spots)
    recreation_route = find_route_waypoints(recreation_spots)
    
    # 格式化為 OSRM 經緯度路徑格式 (lon1,lat1;lon2,lat2)
    nature_wps = ";".join([f"{pt['lon']},{pt['lat']}" for pt in nature_route])
    culture_wps = ";".join([f"{pt['lon']},{pt['lat']}" for pt in culture_route])
    recreation_wps = ";".join([f"{pt['lon']},{pt['lat']}" for pt in recreation_route])
    
    # 寫入 spots_data.js 檔案
    spots_data = {
        "spots": output_spots,
        "routes": {
            "nature": {
                "name": "🌿 自然風景探索路線",
                "color": "#2ec4b6",
                "waypoints": nature_wps,
                "stops": [pt['name'] for pt in nature_route]
            },
            "culture": {
                "name": "⛩️ 歷史文化獨旅路線",
                "color": "#e71d36",
                "waypoints": culture_wps,
                "stops": [pt['name'] for pt in culture_route]
            },
            "recreation": {
                "name": "🛍️ 都市人文遊憩路線",
                "color": "#ff9f1c",
                "waypoints": recreation_wps,
                "stops": [pt['name'] for pt in recreation_route]
            }
        }
    }
    
    js_content = f"const spotsData = {json.dumps(spots_data, ensure_ascii=False, indent=2)};"
    with open('/Users/jimshih/app_presentation_2/spots_data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("成功產生地圖資料並寫入 spots_data.js！")
    print(f"- 自然風景: {len(nature_spots)} 筆")
    print(f"- 歷史文化: {len(culture_spots)} 筆")
    print(f"- 人文遊憩: {len(recreation_spots)} 筆")
    print(f"- 未 分 類: {len(unclassified_spots)} 筆")

if __name__ == "__main__":
    token = get_tdx_token()
    if token:
        fetch_and_classify_spots(token)
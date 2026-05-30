import requests

# API_KEY
CWA_API_KEY = "cwa_key"

def get_weather_data():
    # F-D0047-077 台南市的鄉鎮天氣預報
    url = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-077?Authorization={CWA_API_KEY}&format=JSON"
    try:
        res = requests.get(url)
        data = res.json()

        locations = data['records']['Locations'][0]['Location']
        
        for loc in locations:
            if loc['LocationName'] == "安平區" or loc['LocationName'] == "中西區" or loc['LocationName'] == "東區":
                weather_elements = loc['WeatherElement'][0]['Time'][0]
                start_time = weather_elements['DataTime']
                pop_value = weather_elements['ElementValue'][0]['Temperature']
                print(f"地區: {loc['LocationName']} / 預報時間: {start_time} / 溫度: {pop_value}度")
            
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_weather_data()
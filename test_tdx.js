require('dotenv').config();
const axios = require('axios');

async function testTdx() {
    try {
        const authRes = await axios.post(
            'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.TDX_CLIENT_ID,
                client_secret: process.env.TDX_CLIENT_SECRET
            }).toString(),
            { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        );
        const token = authRes.data.access_token;

        const spotRes = await axios.get('https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$top=10000&$format=JSON', { headers: { 'Authorization': `Bearer ${token}` } });
        
        let spots = spotRes.data.map(spot => ({
            features: `${spot.Class1||''} ${spot.Class2||''} ${spot.Keyword||''} ${spot.ScenicSpotName||''}`
        }));

        const cultureSpots = spots.filter(s => s.features.match(/古蹟|廟宇|宗祠|文化|歷史|老街/));
        const natureSpots = spots.filter(s => s.features.match(/生態|自然|風景|國家公園|森林|農場|溫泉|地質/));
        const artSpots = spots.filter(s => s.features.match(/藝術|展覽|博物館|美術館|文創|工藝|文藝/));
        const shoppingSpots = spots.filter(s => s.features.match(/商業|購物|夜市|商圈|百貨|市集|觀光工廠/));
        
        console.log(`總景點數: ${spots.length}`);
        console.log(`古蹟文化: ${cultureSpots.length}`);
        console.log(`自然生態: ${natureSpots.length}`);
        console.log(`藝文展覽: ${artSpots.length}`);
        console.log(`購物娛樂: ${shoppingSpots.length}`);
    } catch (e) {
        console.error(e.message);
    }
}
testTdx();

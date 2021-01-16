
//const { BlobServiceClient, TokenCredential } = require("@azure/storage-blob");
import {getFormattedDate, createItem, getTodayGMT} from './util';
import {getToken} from './auth';
const storageName = 'weathersensestorage';

function createOptions(token) {
    const bearer = `Bearer ${token.accessToken}`;
    return {
        method: "GET",
        headers: {
            "Authorization": bearer,
            "x-ms-version": "2019-02-02",
            "x-ms-date": new Date().toGMTString(),
            "Accept" : "text/plain"
        }
    };
}

async function readBlob(sensor, date, token) {
    const options = createOptions(token);
    const url = `https://${storageName}.blob.core.windows.net/weathersense-data/meas-${sensor}-${date}.txt`;
    try {
        let resp = await fetch(url, options);
        return await resp;
    } catch(err) {
        console.log("failed to fetch "+url);
    }
}


async function getData (accountId, measDate, sensors) {
    console.log("getdate: measdate", measDate);
    if(!measDate) {
      measDate = getFormattedDate(getTodayGMT());
      console.log("getdate: measdate2", measDate);
    }

    const token = await getToken(accountId);

    let results = {};
    for(let i = 0; i<sensors.length; i++) {            
        let sensor = sensors[i].name;
        try {
          const resp = await readBlob(sensor, measDate, token);
          if(resp.ok) {
            const rawData = await resp.text();
            const rows = rawData.split("\n");
            let data = rows.map(createItem).filter( d=> d.ts);
            console.log("got response", rows[rows.length-1]);
            console.log("last: ",data[data.length-1]);
            results[sensor] = data;
          }
        } catch(err) {
            console.log(`error while fetching: ${sensor}, ${measDate}`, err);
        };
    }
    return results;
  };

  async function getWeeklyPressure(accountId, endDate) {
    let results = {};
    let sensors = ['BME280-1', 'ESP32-1']; // TODO find the sensors with pressure
    for(let si = 0; si<sensors.length; si++) {
      let sensor = sensors[si];
      let y = Number(endDate.substr(0, 4));
      let m = Number(endDate.substr(4, 2))-1;
      let d = Number(endDate.substr(6, 2));
      d -= 7;
      const token = await getToken(accountId);
      
      let data = [];
      for(let i = 0; i<7; i++) {
          let measDate = getFormattedDate(new Date(y, m, d+i));
          const resp = readBlob(sensor, measDate, token);
          data.push( resp);
      }
      let arr = (await Promise.all(data));
      let resps = arr.filter( curr => curr.ok);
      let texts = [];
      for(let i = 0; i<resps.length; i++) {
        texts.push(await resps[i].text());
      }
      let rawData = texts.join("");
      const rows = rawData.split("\n");
      let convData = rows.map(createItem).filter( d=> d.ts);
      
      results[sensor] = convData;

    }
    return results;
  }
export {getData, getWeeklyPressure};
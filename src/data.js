import {
    getFormattedDate,
    isOldFormat,
    createItemOld,
    parseDateStr,
    createItemMap,
    removeItemsWithEmptyProp, fillGap
} from './util';
import {watch, reactive} from 'vue';
import * as d3 from "d3";

export function dataInit(authStore, blobStore) {
    //const {authState} = authStore;
    const {readConfig, readBlob} = blobStore;

    let stats = reactive({data: []});
    const chartData = reactive({});
    const chartParams = reactive(
        {
            meas: "temperature",
            measFn: undefined,
            measTitle: undefined,
            sensors: [],
            showSensors: [],
            idMap: {}
        }
    );

    watch(authStore.authState, (newVal) => {
        console.log("isLoggedIn changed", newVal);
        readConfig()
            .then((data) => {
                console.log("configdata:", data);
                chartParams.sensors = createItemMap(data.sensors);
                chartParams.showSensors = chartParams.sensors.map(it => it.name);
                let _idMap = {};
                chartParams.sensors.forEach( it => {
                    _idMap[it.name] = it.id;
                });
                chartParams.idMap = _idMap;
                console.debug("idMap=", _idMap);
                Object.assign(chartParams, _getMeasFn(chartParams.meas));
                console.debug("setting chartParams.sensors:", chartParams.sensors);
                console.debug("setting chartParams.showSensors:", chartParams.showSensors);
            })
            .catch((err) => {
                console.error("failed to read config", err);
            });
    })

    let rawData = undefined;

    function setChartDate(date) {
        return getData(getFormattedDate(date), chartParams.sensors).then(result => {
            console.log("getData successful", result);
            rawData = result;
            chartData.data = processData(rawData);
            stats.data = getStats(chartData.data);
        }).catch( (err) => {
            console.log("getData failed");
            console.log(err);
        });
    }

    function setChartMeas(meas) {
        chartParams.meas = meas;
        chartData.data = processData(rawData);
        Object.assign(chartParams, _getMeasFn(chartParams.meas));
        stats.data = getStats(chartData.data);
    }

    function setChartSensors(sensors) {
        console.log("refresh sensors: ", sensors);
        chartParams.showSensors = sensors;
        chartData.data = processData(rawData);
        stats.data = getStats(chartData.data);
    }

    function processData(data) {
        if(data===undefined) return {};
        let filteredData = removeItemsWithEmptyProp(data.data, chartParams.measFn);
        let processedData = fillGap(filteredData);
        return processedData;
    }

    function _getMeasFn(meas) {
        let measFn = (d) => d.t1;
        let measTitle = "Temperature (°C)";
        let measUnit = "°C";
        if (meas !== undefined) {
            if (meas === 'pressure') {
                measFn = (d) => d.p;
                measTitle = "Pressure (hPa)";
                measUnit = "hPa"
            } else if (meas === 'humidity') {
                measFn = (d) => d.h;
                measTitle = "Humidity (%)";
                measUnit = "%";
            } else if (meas === 'bat') {
                measFn = (d) => d.bat;
                measTitle = "Battery (V)";
                measUnit = "V";
            }
        }
        return {measTitle, measFn, measUnit};
    }

    async function getData(measDate, sensors) {
        console.log("getdata called: ", measDate, sensors);

        let results = {};
        for (let i = 0; i < sensors.length; i++) {
            let sensor = sensors[i].name;
            let prevId = 0
            try {
                console.log("getting: "+sensor, measDate);
                const resp = await readBlob(sensor, measDate);
                console.debug("resp: ", resp);
                if (resp.status===200) {
                    const rawData = resp.data;
                    const rows = rawData.split("\n");

                    let data = [];
                    if (isOldFormat(rows)) {
                        console.log("oldformat");
                        for (let i = 0; i < rows.length; i++) {
                            let d = createItemOld(rows[i]);
                            if (d !== undefined) {
                                data.push(d);
                            }
                        }
                    } else {
                        for (let i = 0; i < rows.length; i++) {
                            let d;
                            try {
                                d = JSON.parse(rows[i]);
                                //console.log("rec"+i, d);
                                if (d.ts) {
                                    if (d.id < prevId) {
                                        // This is to counter https://github.com/bdomokos74/weathersense-device/issues/18
                                        prevId = d.id
                                        continue
                                    }
                                    // Unix timestamp is in seconds since the epoch
                                    d.ts = parseDateStr(d.ts * 1000);

                                    if (d.t1 > 150) {
                                        d.t1 = d.t2;
                                    }
                                    data.push(d);
                                    prevId = d.id

                                }
                            } catch (err) {
                                console.debug("skipping:", rows[i]);
                            }
                        }
                    }
                    results[sensor] = data;
                }
            } catch (err) {
                console.log(`error while fetching: ${sensor}, ${measDate}`, err);
            }
        }
        return {
            data: results,

        };
    }
/*
    async function getWeeklyPressure(user, endDate) {
        let results = {};
        let sensors = ['DOIT2']; // TODO find the sensors with pressure
        for (let si = 0; si < sensors.length; si++) {
            let sensor = sensors[si];
            let y = Number(endDate.substr(0, 4));
            let m = Number(endDate.substr(4, 2)) - 1;
            let d = Number(endDate.substr(6, 2));
            d -= 7;
            const token = await getToken(user);

            let data = [];
            for (let i = 0; i < 7; i++) {
                let measDate = getFormattedDate(new Date(y, m, d + i));
                const resp = readBlob(sensor, measDate, token);
                data.push(resp);
            }
            let arr = (await Promise.all(data));
            let resps = arr.filter(curr => curr.ok);
            let texts = [];
            for (let i = 0; i < resps.length; i++) {
                texts.push(await resps[i].text());
            }
            let rawData = texts.join("");
            const rows = rawData.split("\n");
            results[sensor] = rows.map(createItem).filter(d => d.ts);

        }
        return results;
    }
*/
    function getStats(data) {
        console.log("getStats data:", data);
        let result = {};
        const fmt = d3.timeFormat("%H:%M:%S");
        for (let key in data) {
            let stat = {};
            let sensorDataCurr = data[key];
            let idx = d3.minIndex(sensorDataCurr, chartParams.measFn);
            if (idx >= 0) {
                stat['meas-min'] = chartParams.measFn(sensorDataCurr[idx]);
                stat['meas-min-time'] = fmt(sensorDataCurr[idx].ts);
                idx = d3.maxIndex(sensorDataCurr, chartParams.measFn);
                stat['meas-max'] = chartParams.measFn(sensorDataCurr[idx]);
                stat['meas-max-time'] = fmt(sensorDataCurr[idx].ts);
                idx = sensorDataCurr.length - 1;
                stat['meas-curr'] = chartParams.measFn(sensorDataCurr[idx]);
                stat['meas-curr-time'] = fmt(sensorDataCurr[idx].ts);
                stat['unit'] = chartParams.measUnit;
                stat['sensorName'] = key;
                stat['sensorId'] = chartParams.idMap[key];
                stat['visible'] = chartParams.showSensors.indexOf(key)>=0;
                result[key] = stat;
            }
        }
        return result;
    }

    return {
        setChartDate,
        setChartMeas,
        setChartSensors,
        chartData,
        chartParams,
        stats
    }
}
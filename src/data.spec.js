import {blobInit} from './blob';
import {dataInit} from './data';

import {nextTick, reactive} from 'vue';

import axios from 'axios';
import {flushPromises} from "@vue/test-utils";
jest.mock('axios');

describe('data', () =>
{

    xtest('reads and updates sensor config after isLoggedIn changes to true',  async() => {
        let authStore;
        let blobStore;

        authStore = {
            authState: reactive({isLoggedIn: false})
        };
        blobStore = blobInit(() => Promise.resolve({accessToken: "accestokenvalue"}));

        axios.get.mockResolvedValue({data: {sensors: ["DOIT3"]}});
        let {
            setChartDate,
            setChartMeas,
            setChartSensors,
            chartData,
            chartParams,
            stats
        } = dataInit(authStore, blobStore);

        authStore.authState.isLoggedIn = true;

        await flushPromises();
        expect(JSON.stringify(chartParams.sensors)).toBe('[{\"name\":\"DOIT3\",\"id\":1}]');
    })

    test('updates sensorData when the chart date changes',  async() => {
        let authStore = {
            authState: reactive({isLoggedIn: false})
        };

        /*
        let blobStore;
        blobStore = blobInit(() => Promise.resolve({accessToken: "accestokenvalue"}));
        */

        let blobStore = {
            readConfig: jest.fn(() => Promise.resolve({
                sensors: ["DOIT3"]
            })),
            readBlob: jest.fn((sensor, date) => Promise.resolve( {
                data: `   
{"ts": "1638316458", "t1": 23.4, "id":35366}
{"ts": "1638318458", "t1": 23, "id":35367}
`,
                status: 200
            }))
        };

        let {
            setChartDate,
            setChartMeas,
            setChartSensors,
            chartData,
            chartParams,
            stats
        } = dataInit(authStore, blobStore);

        authStore.authState.isLoggedIn = true;
        await flushPromises();

        let chartDate = new Date(0);
        chartDate.setFullYear(2021);
        chartDate.setMonth(11);
        chartDate.setDate(29);

        await setChartDate(chartDate);
        await nextTick();
        console.log("!!!!!!!!!!!>", chartData);
        expect(chartData.data.DOIT3[0].ts.toJSON()).toBe("2021-11-30T23:54:18.000Z");
        expect(stats.data.DOIT3['meas-min']).toBe(23);
        expect(stats.data.DOIT3['meas-max']).toBe(23.4);
    })

    test('updates sensorData when the chart date changes - old format',  async() => {
        let authStore = {
            authState: reactive({isLoggedIn: false})
        };

        /*
        let blobStore;
        blobStore = blobInit(() => Promise.resolve({accessToken: "accestokenvalue"}));
        */

        let blobStore = {
            readConfig: jest.fn(() => Promise.resolve({
                sensors: ["DOIT3"]
            })),
            readBlob: jest.fn((sensor, date) => Promise.resolve( {
                data: `
2021-12-02T00:01:17.954794,5.93,956.62,89.63,3.9,120000,5.92,5.94,113504
2021-12-02T00:02:17.954794,5.92,956.67,89.86,3.83,180000,5.90,5.94,113505
`,
                status: 200
            }))
        };

        let {
            setChartDate,
            setChartMeas,
            setChartSensors,
            chartData,
            chartParams,
            stats
        } = dataInit(authStore, blobStore);

        authStore.authState.isLoggedIn = true;
        await flushPromises();

        let chartDate = new Date(0);
        chartDate.setFullYear(2021);
        chartDate.setMonth(11);
        chartDate.setDate(29);

        await setChartDate(chartDate);
        await nextTick();

        expect(chartData.data.DOIT3[0].ts.toJSON()).toBe("2021-12-01T23:01:17.954Z");
        expect(stats.data.DOIT3['meas-min']).toBe(5.92);
        expect(stats.data.DOIT3['meas-max']).toBe(5.93);
    })
})
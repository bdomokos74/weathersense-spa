import axios from 'axios';

export function blobInit(getToken) {
    const storageName = process.env.VUE_APP_AZURE_STORAGE_ACCOUNT;
    const CONFIG_CONTAINER = "weathersense-config";
    const CONFIG_FILENAME = "sensors.json";

    function getConfigBlobUrl(storage) {
      return `https://${storage}.blob.core.windows.net/${CONFIG_CONTAINER}/${CONFIG_FILENAME}`;
    }

    function getMeasBlobUrl(storage, sensor, date) {
        return `https://${storage}.blob.core.windows.net/weathersense-data/meas-${sensor}-${date}.txt`
    }

    function createRequest(url, token) {
        const bearer = `Bearer ${token.accessToken}`;
        return {
            method: "GET",
            url: url,
            headers: {
                "Authorization": bearer,
                "x-ms-version": "2019-02-02",
                "x-ms-date": new Date().toGMTString(),
                "Accept": "text/plain"
            }
        };
    }

    async function readConfig() {
        console.log("readConfig called")
        let token = await getToken();
        let url = getConfigBlobUrl(storageName);
        const requestConfig = createRequest(url, token);
        console.log('getting:', requestConfig);
        let resp = await axios.get(url, requestConfig);
        console.log("resp=");
        console.log(resp);
        return resp.data;
    }

    async function readBlob(sensor, date) {
        let token = await getToken();
        const url = getMeasBlobUrl(storageName, sensor, date);
        const requestConfig = createRequest(url, token);
        return await axios.get(url, requestConfig);
    }

    return {
        readConfig,
        readBlob
    };
}

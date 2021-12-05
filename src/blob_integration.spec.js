import axios from 'axios';

// Run this way: yarn test blob_integration.spec.js
// Need to specify env vars: AZURE_STORAGE_ACCOUNT, SAS_QUERY
// Create a sas token, and set it to the env var above
async function readConfig(url) {
    return await axios.get(url);
}

function getConfigBlobUrl(storageAcc, sasQuery) {
    const CONFIG_CONTAINER = "weathersense-config";
    const CONFIG_FILENAME = "sensors.json";
    return `https://${storageAcc}.blob.core.windows.net/${CONFIG_CONTAINER}/${CONFIG_FILENAME}${sasQuery}`;
}

describe.skip('blob integration',  () => {
    test('should return the list of configured sensors',  async () => {
        let sas = process.env.SAS_QUERY;
        expect(sas).toBeDefined();
        let storageAcc = process.env.AZURE_STORAGE_ACCOUNT;
        expect(storageAcc).toBeDefined();
        let url = getConfigBlobUrl(storageAcc, sas);
        let result = await readConfig(url);
        console.log(result);
        expect(result.data.sensors.toString()).toBe("DOIT2,DOIT1");
    })
})

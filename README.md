## SPA app to read and display weather sensor data from Azure Blob

This component reads the data from Azure Blob, and displays it in a vue.js SPA

### Other components
* https://github.com/bdomokos74/weathersense-device - send sensor data from Arduino, RasPi, ... to Azure IoT HUB

* https://github.com/bdomokos74/weathersense-collect - Function app to collect sensor measurements from Azure IoT HUB and save it to Azure Blob. Also generates aggregated data, and sends out notifications.

### TODO
- When hovering over the min/max label, highlight the corresponding point in the chart
- Add different chart types, e.g. weekly temp with parallel lines, daily min/max, ...
- Add favourite list of charts per user
- Add user profile - default sensor, alert settings
- Alert for large drop/increase in pressure, temperature falling below 0, ...
- Show current data of default sensor, add automatic update via subscribing to queues
- Add search for specific data/events or interesting days(days with maximum difference between max and min)

### How to add users
1. Send invite in Azure Active directory
2. Add user to the WeatherSenseReader Azure AD Group

### Dependencies

https://parceljs.org/getting_started.html

```
npm install -g parcel-bundler
```

### How to run locally
```
parcel index.html
```

### How to build/package
```
parcel build index.html -d app
```

### How to deploy the SPA
```
az storage blob upload-batch -s app -d '$web' --account-name $AZURE_STORAGE_ACCOUNT
```

### Notes

https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-overview

https://docs.microsoft.com/en-us/azure/storage/common/storage-auth-aad-app?tabs=dotnet#well-known-values-for-authentication-with-azure-ad

https://docs.microsoft.com/en-us/azure/active-directory/develop/migrate-spa-implicit-to-auth-code

https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

## SPA app to read and display weather sensor data from Azure Blob

This component reads the data from Azure Blob, and displays it in a vue.js SPA

![UI Screenshot](doc/screenshot-ui.png?raw=true "screenshot")

System architecture:

![Weathersense Components](doc/weathersense-components.png?raw=true "Weathersense Components")

### Other components
* https://github.com/bdomokos74/weathersense-device - send sensor data from Arduino, RasPi, ... to Azure IoT HUB

* https://github.com/bdomokos74/weathersense-collect - Function app to collect sensor measurements from Azure IoT HUB and save it to Azure Blob. Also generates aggregated data, and sends out notifications.


### How to add users
1. Send invite in Azure Active directory
2. Add user to the WeatherSenseReader Azure AD Group

### How to run locally

```
yarn serve
```

### How to build/package

Create local .env file with:

```
AUTHORITY=https://login.microsoftonline.com/...
```

and .env.development files with this content:
```
AZURE_STORAGE_ACCOUNT=...
CLIENT_ID=...
REDIRECT_URI=http://localhost:1234
```

Create corresponding .env.test and .env.production files also.

Build for test env or prod env:

```
yarn build --mode test
yarn build --mode production
```

### How to deploy the SPA

```
# for prod:
az storage blob upload-batch -s app -d '$web' --account-name $AZURE_GUI_STORAGE_ACCOUNT

# for test:
az storage blob upload-batch -s dist -d '$web' --account-name $AZURE_GUI_TEST_STORAGE_ACCOUNT
```



### Notes

https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-overview

https://docs.microsoft.com/en-us/azure/storage/common/storage-auth-aad-app?tabs=dotnet#well-known-values-for-authentication-with-azure-ad

https://docs.microsoft.com/en-us/azure/active-directory/develop/migrate-spa-implicit-to-auth-code

https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow


When getting this error while getting a blob from an SPA:

```
OperationName: GetBlobServiceProperties
AuthenticationType: OAuth
StatusCode: 403
StatusText: AuthorizationPermissionMismatch
```

check the "Resource Sharing (CORS)" setting.
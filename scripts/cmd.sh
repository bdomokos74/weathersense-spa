az storage account create \
    --name $AZURE_STORAGE_ACCOUNT \
    --resource-group $AZ_RES_GRP \
    --location $AZ_LOC \
    --sku Standard_LRS \
    --encryption-services blob

az ad signed-in-user show --query objectId -o tsv | az role assignment create \
    --role "Storage Blob Data Contributor" \
    --assignee @- \
    --scope $WSGUI_STORAGE

az storage container create \
    --account-name $AZURE_STORAGE_ACCOUNT \
    --name weatherwenseguiblob \
    --auth-mode login


az storage blob service-properties update \
    --static-website  \
    --404-document app/404.html  \
    --index-document app/index.html

# deploy the SPA page
parcel build index.html -d app
az storage blob upload-batch -s app -d '$web' --account-name $AZURE_STORAGE_ACCOUNT

end=`date -v+30M '+%Y-%m-%dT%H:%MZ'`
sas1=`az storage account generate-sas --permissions cdlruwap --account-name weathersenseblob --services b --resource-types sco --expiry $end -o tsv`
sas2=`az storage account generate-sas --permissions cdlruwap --account-name weathersensestorage --services b --resource-types sco --expiry $end -o tsv`
azcopy copy 'https://weathersenseblob.blob.core.windows.net/weathersense-data?$sas1' 'https://weathersensestorage.blob.core.windows.net/weathersense-data?$sas2' --recursive
azcopy copy "https://weathersenseblob.blob.core.windows.net/weathersense-data/meas-ESP32-1-20210116.txt?$sas1" "https://weathersensestorage.blob.core.windows.net/weathersense-data/meas-ESP32-1-20210116.txt?$sas2"

azcopy copy "https://weathersenseblob.blob.core.windows.net/weathersense-data/meas-BME280-1-20210116.txt?$sas1" "https://weathersensestorage.blob.core.windows.net/weathersense-data/meas-BME280-1-20210116.txt?$sas2"
azcopy copy "https://weathersenseblob.blob.core.windows.net/weathersense-data/meas-DALLAS1-20210116.txt?$sas1" "https://weathersensestorage.blob.core.windows.net/weathersense-data/meas-DALLAS1-20210116.txt?$sas2"

meas-ESP32-1-20210116.txt
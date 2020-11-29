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
az storage blob upload-batch -s app1 -d '$web' --account-name $AZURE_STORAGE_ACCOUNT

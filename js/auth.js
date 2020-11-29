/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

import {LogLevel} from '@azure/msal-browser';
import {PublicClientApplication, InteractionRequiredAuthError} from '@azure/msal-browser'

const msalConfig = {
    auth: {
        clientId: "d38c37e3-87a4-45d7-81b5-69fb388bf73a",
        //authority: "https://login.microsoftonline.com/common",
        authority: "https://login.microsoftonline.com/d1756ea2-2803-4365-8987-9bd9a3829494",
        redirectUri: "https://weathersensegui.z6.web.core.windows.net/",
        //postLogoutRedirectUri: "https://weathersensegui.z6.web.core.windows.net/"
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {	
                if (containsPii) {		
                    return;		
                }		
                switch (level) {		
                    case LogLevel.Error:		
                        console.error(message);		
                        return;		
                    case LogLevel.Info:		
                        console.info(message);		
                        return;		
                    case LogLevel.Verbose:		
                        console.debug(message);		
                        return;		
                    case LogLevel.Warning:		
                        console.warn(message);		
                        return;		
                }	
            }	
        }	
    }
};
  
/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
const loginRequest = {
scopes: ["User.Read"]
};
  
  /**
  * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
  * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
  */
  const tokenRequest = {
    scopes: ["https://storage.azure.com/.default"],
    forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
  };

const msalInstance = new PublicClientApplication(msalConfig);

function authInit(loginHandler) {
      
      const accounts = msalInstance.getAllAccounts();
      if(accounts.length>0) {
        console.log("allaccounts, len="+accounts.length, accounts);
        // TODO - choose from accounts
        loginHandler(accounts[0]);
      } else {
        console.log("not logged in");
        return;
      }
}

async function getTokenPopup(request, account) {
    console.log("getToken called");
    request.account = account;
    return await msalInstance.acquireTokenSilent(request).catch(async (error) => {
        console.log("silent token acquisition fails.");
        if (error instanceof InteractionRequiredAuthError) {
            console.log("acquiring token using popup");
            return msalInstance.acquireTokenPopup(request).catch(error => {
                console.error(error);
            });
        } else {
            console.error(error);
        }
    });
  };
  async function login(loginHandler) {  
    console.log("login called");
      const loginResp = await msalInstance.loginPopup(loginRequest);
      console.log(loginResp);
      if(loginResp !== null) {
        loginHandler(loginResp.account);
      }
  };

  async function logout(accountId) {
    console.log("logout called");
    const logoutRequest = {
      account: msalInstance.getAccountByHomeId(accountId)
    };
    await msalInstance.logout(logoutRequest);
    this.loggedInUser = "";
    this.user = {};
  };

async function getToken(accountId) {
  const currentAcc = msalInstance.getAccountByHomeId(accountId);
        if (!currentAcc) {
          console.log("not logged in");
          return;
        }
    return await getTokenPopup(tokenRequest, accountId);
}

export {authInit, login, logout, getToken};

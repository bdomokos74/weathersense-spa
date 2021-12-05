/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

import {LogLevel} from '@azure/msal-browser';
// Inject this from caller to be able to mock
//import {PublicClientApplication} from '@azure/msal-browser'
import {reactive} from 'vue';

/* In: msal PublicClientApplication
    Out: {authState, login, logout, getToken};
 */
export function authInit(PublicClientApplication) {
    const msalConfig = {
        auth: {
            clientId: process.env.VUE_APP_CLIENT_ID,
            authority: process.env.VUE_APP_AUTHORITY,
            redirectUri: process.env.VUE_APP_REDIRECT_URI
        },
        cache: {
            cacheLocation: "localStorage", // This configures where your cache will be stored
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

    const authState = reactive({user:{}, isLoggedIn: false});

    // const silentRequest = {
    //     scopes: ["openid", "profile", "User.Read", "Mail.Read"]
    // };

    const msalInstance = new PublicClientApplication(msalConfig);
    msalInstance.handleRedirectPromise()
        .then((authResult) => {
            if(authResult!=null) {
                console.debug("handleRedirectPromise: authResult=", authResult);
                //loginHandler(authResult);
            } else {
                console.debug("handleRedirectPromise: returned null");
            }

        })
        .catch(err => {
            console.error(err);
        });

    function loginHandler(loginData) {
        console.debug('handleLogin, ', loginData);

        let account = loginData.account;
        console.log('logged in: ' + account.username);
        let _user = {};
        _user['username'] = account.username;
        _user['accountId'] = account.homeAccountId;
        _user['sid'] = account.idTokenClaims.sid;
        authState.user = _user;
        authState.isLoggedIn = true;
    }

    function _authInit() {


        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            console.debug("allaccounts, len=" + accounts.length, accounts);
            // TODO - choose from accounts
            let account = accounts[0];
            let _user = {};
            _user['username'] = account.username;
            _user['accountId'] = account.homeAccountId;
            authState.user = _user;

            getToken()
                .then((data) => {
                    console.log("_authinit succ: ", data);
                    authState.isLoggedIn = true;
                })
                .catch(() => {
                    console.log("_authinit fail: not logged in");
                    //throw err;
                });

        } else {
            console.log("no accounts found");
            console.log("msalconfig",msalConfig);
        }
    }

    async function login() {
        console.log("login called");
        const loginResp = await msalInstance.loginPopup(loginRequest);
        console.log("LoginResp: ", loginResp);
        if (loginResp !== null) {
            loginHandler(loginResp);
        }
    }

    async function logout() {
        let accountId = authState.user.accountId;
        console.log("logout called");
        const logoutRequest = {
            account: msalInstance.getAccountByHomeId(accountId)
        };
        await msalInstance.logoutPopup(logoutRequest).then(() => authState.user.value=undefined);
    }

    async function getToken() {
        const currentAcc = msalInstance.getAccountByHomeId(authState.user.accountId);
        console.debug("currentAcc:",currentAcc);
        if (!currentAcc) {
            console.log("not logged in");
            throw Error("not logged in");
        }

        console.debug("getToken called");
        tokenRequest.account = authState.user.accountId;
        //silentRequest.account = user.accountId;

        //delete tokenRequest.sid;
        return await msalInstance.acquireTokenSilent(tokenRequest).catch(async () => {
            //tokenRequest.sid = user.sid;
            console.log("silent token acquisition fails.");
            /*
            [Error] some other error:
        asyncFunctionResume
        promiseReactionJob
    [Error] BrowserAuthError: silent_sso_error: Silent SSO could not be completed - insufficient information was provided. Please provide either a loginHint or sid.
             */
            //if (error instanceof InteractionRequiredAuthError) {
                console.log("BrowserAuthError: acquiring token using popup");
                tokenRequest.sid = authState.user.sid;
                return msalInstance.acquireTokenPopup(tokenRequest).catch(error => {
                    console.log("acquiring token using popup failed");
                    console.error(error);
                });
            //} else {
            //     throw(error);
            // }
        });
    }

    _authInit();
    return {authState, login, logout, getToken};
}


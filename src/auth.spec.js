import {authInit} from './auth';

describe('auth interface', () =>
{
    let msalMock;
    beforeEach(() => {
        let handleRedirectMock = jest.fn( () => Promise.resolve({test: true}));
        msalMock = function(config) {
            return {
                getAllAccounts: jest.fn( () => ['test@acc.com']),
                getAccountByHomeId: jest.fn((homeId) => { acc: "123"} ),
                handleRedirectPromise: handleRedirectMock,
                loginPopup: jest.fn( () => Promise.resolve({
                    account: {
                        username: 'loggedinuser',
                        homeAccountId: 'ab@cd.com',
                        idTokenClaims: {sid: 'g34sX32'}
                    }
                }))
            }
        }
    })

    test('by default not logged in', async () => {
        let {authState, login, logout, getToken} = authInit(msalMock);
        getToken()
            .then((tok) => fail("got token while expected to fail"))
            .catch((err) =>{
                console.log("gettokentoken fail");
                // expect(err).toBe("not logged in");
            });
        expect(authState.isLoggedIn).toBe(false);
    })

    test('changes authState.isLoggedin once login succeeds', async () => {
        let {authState, login, logout, getToken} = authInit(msalMock);
        await login();
        console.log(authState);
        expect(authState.isLoggedIn).toBe(true);
        expect(authState.user.username).toBe('loggedinuser');
    })
})
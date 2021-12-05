import {blobInit} from './blob';

import axios from 'axios';
jest.mock('axios');

describe('blob interface', () =>
{
    test('getConfig fails if getToken trows exceptoin', async () => {
        let blob = blobInit(() => Promise.reject("not logged in"));
        blob.readConfig()
            .then((x) => fail("Expected to fail"))
            .catch((err) => {
                expect(err).toBe("not logged in");
            });
    })

    test('getConfig succeeds if getToken returns a token', async () => {
        let blob = blobInit(() => Promise.resolve({accessToken:"accestokenvalue"}));
        axios.get.mockResolvedValue({data: { sensors: ["DOIT3"]}} );
        let result = await blob.readConfig();
        expect(JSON.stringify(result)).toBe('{"sensors":["DOIT3"]}');
    })
})
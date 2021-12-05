import {
    createItem, getFormattedDate, getTodayGMT,
    getExtent, getMin, getMax, parseDateStr,
    isOldFormat, createItemOld,
    createItemMap, removeItemsWithEmptyProp, fillGap
} from "./util"

// Run this way: ./node_modules/mocha/bin/mocha --require esm
describe('util', function () {
    let d = {
        "t1": 12.87,
        "p": 969.79,
        "h": 82.7,
        "bat": 3.92,
        "offset": 0,
        "t2": 13.3,
        "id": "10035"
    };
    describe('parse date ', function () {
        test('should return epock when the ts is a string', function () {
            let ts = "2021-09-17T23:54:03.760122";
            let parsed = parseDateStr(ts);
            expect(parsed.getTime()).toBe(1631915643760);
        });
        test('should return epock when the ts is an epoch string', function () {
            let ts = "1631915643760";
            let parsed = parseDateStr(ts);
            expect(parsed.getTime()).toBe(1631915643760);
        });
        test('should return epock when the ts is an epoch int', function () {
            let ts = 1631915643760;
            let parsed = parseDateStr(ts);
            expect(parsed.getTime()).toBe(1631915643760);
        });

    });
    describe("isOldFormat", () => {
        test('should identify cvs format', () => {
            let arr = ["1", "a", "b"];
            expect(isOldFormat(arr)).toBe(true);
        });
        test('should identify json format', () => {
            let arr = ["{123", "{abc", "{b"];
            expect(isOldFormat(arr)).toBe(false);
        });
        test('should default to new format', () => {
            let arr = [];
            expect(isOldFormat(arr)).toBe(false);
        });
        test('should find first non-empty row', () => {
            let arr = ["", "", "", "123"];
            expect(isOldFormat(arr)).toBe(true);
        });
        test('should find first non-empty row - defaulting to new format', () => {
            let arr = ["", "", "", ""];
            expect(isOldFormat(arr)).toBe(false);
        })
    });

    describe("createItemOld", () => {
        test('should get the proper item', () => {
            let row = "2021-11-13T23:47:11.516502,24.22,967.89,60.54,0.47,60000";
            let item = createItemOld(row);
            // TODO GMT
            expect(item.ts.toJSON()).toBe("2021-11-13T22:47:11.516Z");
            expect(item.t1).toBe(24.22);
            expect(item.h).toBe(60.54);
            expect(item.p).toBe(967.89);
        })
    });

    describe("createItemMap", () => {
        test("should  return sorted (name,id) pairs", () => {
            let arr = ["ca", "bc", "x", "a", "cb"];
            expect(JSON.stringify(createItemMap(arr))).toBe(
                '[{\"name\":\"a\",\"id\":1},{\"name\":\"bc\",\"id\":2},{\"name\":\"ca\",\"id\":3},{\"name\":\"cb\",\"id\":4},{\"name\":\"x\",\"id\":5}]'
            );
        })
    })

    describe("removeKeysWithEmptyItems", () => {
        test("should remove the keys having an empty array value", () => {
            const data = {
                a: [{x1: 1, x2: 3, x3: 5}],
                b: [{z1: 1, z2: 2, z3: 3}],
                c: [], d: 1, e: "stringvalue"
            };
            let actual = removeItemsWithEmptyProp(data, (x) => x['x1']);
            expect(actual['a']).not.toBeUndefined();
            ['b', 'c', 'd', 'e'].forEach((it) => expect(actual[it]).toBeUndefined());
        })
        test("should filter the items of the array", () => {
            const data = {
                a: [{x1: 1, x2: 3, x3: 5}, {z1: 1, z2: 2, z3: 3}],
            };
            let actual = removeItemsWithEmptyProp(data, (x) => x['x1']);
            expect(actual['a']).not.toBeUndefined();
            expect(actual['a'].length).toBe(1);
            expect(actual['a'][0]['x1']).not.toBeUndefined();
            expect(actual['a'][0]['z1']).toBeUndefined();
        })
    })

    describe("fillGap", () => {
        test("should fill missing items with equal span timestamps", () => {
            let startDate = new Date(2021, 11, 1, 9);
            let endDate = new Date(2021, 11, 1, 12);
            let input = {
                'a': [{ts: startDate, x1: 23.5}, {ts:endDate, x1: 24.3}]
            }
            let actual = fillGap(input);
            expect(actual['a']).not.toBeUndefined();
            expect(actual['a'].length).toBe(13);
            expect(actual['a'][0].x1).toBe(23.5);
            expect(actual['a'][1].x1).toBeUndefined();
            expect(actual['a'][12].x1).toBe(24.3);

        })
    })
})

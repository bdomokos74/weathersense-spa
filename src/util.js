import * as d3 from "d3";

function createItem(row) {
    return {
        "ts": row.ts, //parseTime(arr[0].split(".")[0]+" +00"),
        "temperature": row.t2,
        "t2": row.t2,
        "pressure": row.p,
        "humidity": row.h,
        "bat": row.bat
    };
}

function getFormattedDate(date) {
    let formatDate = function(d) {
        return d.getFullYear()+""+("0" + (d.getMonth()+1)).slice(-2)+""+("0" + d.getDate()).slice(-2);
    };
    return formatDate(date);
}

function getTodayGMT() {
    return new Date(new Date().getTime()-1000*60*60);
}


function getExtent(data, showOnly,  fn) {
    let result = undefined;
    for (var key in data) {
        if(result===undefined) {
            result = d3.extent(data[key], fn);
        } else {
            let tmp = d3.extent(data[key], fn);
            result[0] = Math.min(result[0], tmp[0]);
            result[1] = Math.max(result[1], tmp[1]);
        }
    }
    return result;
}

function getMin(data, fn) {
    let result = undefined;
    for (var key in data) {
        if(result===undefined) {
            result = d3.min(data[key], fn);
        } else {
            let tmp = d3.min(data[key], fn);
            result = Math.min(result, tmp);
        }
    }
    return result
}

function getMax(data, showOnly, fn) {
    let result = undefined;
    for (var key in data) {
        if(result===undefined) {
            result = d3.max(data[key], fn);
        } else {
            let tmp = d3.max(data[key], fn);
            result = Math.max(result, tmp);
        }
    }
    return result;
}

function parseDateStr(ts) {
    let result = new Date(0);
    let millisSinceEpoch = ts;
    if((typeof ts === 'string')&&isNaN(ts) )
    {
        millisSinceEpoch = Date.parse(ts);
    }
    result.setTime(millisSinceEpoch);
    return result;
}

function isOldFormat(rows) {
    let result = false;
    if(rows!==undefined && rows.length >0 ) {
        for(let i = 0; i<rows.length; i++) {
            let trimmed = rows[i].trim();
            if (trimmed.length > 0) {
                result = (trimmed[0]!=='{');
                break;
            }
        }
    }
    return result;
}

function createItemOld(row) {
    let arr = row.split(",");
    let result = {
        "ts":parseDateStr(arr[0]),
        "t1":undefined,
        "p":undefined,
        "h":undefined
    };
    if(arr.length>1 && arr[1])
        result['t1'] = Number(arr[1]);
    if(arr.length>2 && arr[2])
        result['p'] = Number(arr[2]);
    if(arr.length>3 && arr[3])
        result['h'] = Number(arr[3]);
    return result;
}

function createItemMap(arr) {
    let sorted = [...arr].sort();
    return sorted.map( (item, idx) => { return { name: item, id: (idx+1)}});
}

function removeItemsWithEmptyProp(data, accessor) {
    let result = {};
    for (let key in data) {
        if(!Array.isArray(data[key])) continue;
        let filtered = data[key].filter(d =>  accessor(d) !== undefined);
        if (filtered.length > 0) { // ?1
            result[key] = filtered; //fillGap(filtered);
        }
    }
    return result;
}

function fillGap(inputMap, delta = 60 * 15 * 1000) {
    const result = {};
    for( let key in inputMap ) {
        let data = inputMap[key];
        let n = data.length;
        let filled = [];
        filled.push(data[0]);
        let curr = data[1].ts;
        let prev = data[0].ts;
        for (let i = 1; i < n; i++) {
            curr = data[i].ts;
            prev = data[i - 1].ts;
            while (curr - prev > delta) {
                prev = new Date(prev.getTime() + delta);
                filled.push({'ts': prev})
            }
            filled.push(data[i]);
        }
        result[key] = filled;
    }
    return result;
}

export {createItem, getFormattedDate, getTodayGMT,
    getExtent, getMin, getMax, parseDateStr,
    isOldFormat, createItemOld,
    createItemMap,
    removeItemsWithEmptyProp,
    fillGap};

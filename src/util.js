const d3 = require("d3");
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S %Z");
function createItem(row) {
    //let arr = row.split(",");
    let result = {
    "ts": row.ts, //parseTime(arr[0].split(".")[0]+" +00"), 
    "temperature":row.t2, 
    "t2": row.t2,
    "pressure":row.p, 
    "humidity":row.h,
    "bat":row.bat
    };
    
    return result;
};

function getFormattedDate(date) {
    let formatDate = function(d) {
        return d.getFullYear()+""+("0" + (d.getMonth()+1)).slice(-2)+""+("0" + d.getDate()).slice(-2);
    };
    return formatDate(date);
};

function getTodayGMT() {
    return new Date(new Date().getTime()-1000*60*60);
}


function getExtent(data, fn) {
    let result;
    for (var key in data) {
        if (data.hasOwnProperty(key)) { 
            if(result===undefined) {
                result = d3.extent(data[key], fn);
            } else {
                let tmp = d3.extent(data[key], fn);
                result[0] = Math.min(result[0], tmp[0]);
                result[1] = Math.max(result[1], tmp[1]);
            } 
        }
    }
    return result;
}

function getMin(data, fn) {
    let result;
    for (var key in data) {
        if (data.hasOwnProperty(key)) { 
            if(result===undefined) {
                result = d3.min(data[key], fn);
            } else {
                let tmp = d3.min(data[key], fn);
                result = Math.min(result, tmp);
            } 
        }
    }
    return result
}
function getMax(data, fn) {
    let result;
    for (var key in data) {
        if (data.hasOwnProperty(key)) { 
            if(result===undefined) {
                result = d3.max(data[key], fn);
            } else {
                let tmp = d3.max(data[key], fn);
                result = Math.max(result, tmp);
            } 
        }
    }
    return result;
}

export {createItem, getFormattedDate, getTodayGMT, getExtent, getMin, getMax};
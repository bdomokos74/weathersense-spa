const d3 = require("d3");
window.d3 = d3;
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S %Z");
function createItem(row) {
    //let arr = row.split(",");
    let result = {
    "ts": row.ts, //parseTime(arr[0].split(".")[0]+" +00"), 
    "temperature":row.t1, 
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

export {createItem, getFormattedDate, getTodayGMT};
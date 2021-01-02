const d3 = require("d3");
window.d3 = d3;
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S %Z");
function createItem(row) {
    let arr = row.split(",");
    let result = {
    "ts":parseTime(arr[0].split(".")[0]+" +00"), 
    "temperature":undefined, 
    "pressure":undefined, 
    "humidity":undefined,
    "bat":undefined
    };
    if(arr.length>1 && arr[1])
        result['temperature'] = Number(arr[1]);
    if(arr.length>2 && arr[2])
        result['pressure'] = Number(arr[2]);
    if(arr.length>3 && arr[3])
        result['humidity'] = Number(arr[3]);
    if(arr.length>4 && arr[4])
        result['bat'] = Number(arr[4]);
    return result;
};

function getFormattedDate(date) {
    let formatDate = function(d) {
        return d.getFullYear()+""+("0" + (d.getMonth()+1)).slice(-2)+""+("0" + d.getDate()).slice(-2);
    };
    // let d = new Date(this.selectedDate);
    console.log("date=",date);
    return formatDate(date);
};

function getTodayGMT() {
    return new Date(new Date().getTime()-1000*60*60);
}

export {createItem, getFormattedDate, getTodayGMT};
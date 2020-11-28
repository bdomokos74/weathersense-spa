const d3 = require("d3");

var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");
function createItem(row) {
    let arr = row.split(",");
    let result = {
    "ts":parseTime(arr[0].split(".")[0]), 
    "temperature":undefined, 
    "pressure":undefined, 
    "humidity":undefined
    };
    if(arr.length>1 && arr[1])
        result['temperature'] = Number(arr[1]);
    if(arr.length>2 && arr[2])
        result['pressure'] = Number(arr[2]);
    if(arr.length>3 && arr[3])
        result['humidity'] = Number(arr[3]);
    return result;
};

function getFormattedDate(date) {
    let formatDate = function(d) {
        return d.getFullYear()+""+(d.getMonth()+1)+""+("0" + d.getDate()).slice(-2);
    };
    // let d = new Date(this.selectedDate);
    console.log("date=",date);
    return formatDate(date);
  };

export {createItem, getFormattedDate};
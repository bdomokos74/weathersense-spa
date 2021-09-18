const d3 = require("d3");
import {getFormattedDate, getTodayGMT} from './util';

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

function fillGap(data, delta=60*15*1000) {
    // TODO make more general
    let n = data.length;
    let filled = [];
    filled.push(data[0]);
    let curr = data[1].ts;
    let prev = data[0].ts;
    for(let i = 1; i<n; i++) {
        curr = data[i].ts;
        prev = data[i-1].ts;
        while(curr-prev > delta ) {
            prev = new Date(prev.getTime()+delta);
            filled.push({'ts': prev})
        } 
        filled.push(data[i]);
    }
    return filled;
}
function filterMissing(data, measFn) {
    let result = {};
    let keys = []
    for (var key in data) {
        if (data.hasOwnProperty(key)) { 
            let filtered = data[key].filter(d => (measFn(d)!=="" && measFn(d)!==undefined && measFn(d)!==null));
            if(filtered.length>1) {
                result[key] = fillGap(filtered);    
                keys.push(key);
            }
        }
    }
    return [result, keys];
}
function _getMeasFn(params) {
    let measFn = (d) => d.t2;
    let title = "Temperature (°C)";
    let measUnit = "°C";
    if(params!==undefined &&params.meas!==undefined) {
        if(params.meas==='pressure') {
            measFn = (d) => d.p;            
            title = "Pressure (hPa)";
            measUnit = "hPa"
        } else if(params.meas==='humidity') { 
            measFn = (d) => d.h;
            title="Humidity (%)";
            measUnit = "%";
        } else if(params.meas==='bat') { 
            measFn = (d) => d.bat;
            title="Battery (V)";
            measUnit = "V";
        }
    }
    return [title, measFn, measUnit];
}

function draw(rawData, params) {
    console.log("drawing: ", params);
    let [title, measFn] = _getMeasFn(params);
    let [data, keys] = filterMissing(rawData, measFn);
    
    console.log("filtered", data);
    let svg = d3.select("svg.chart"),
        margin = {top: 15, bottom: 15, left: 85, right: 0},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    if(keys.length===0) {
        console.log("No data");
        return;
    }

    let timeExtent = getExtent(data, d => d.ts);
    let x = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(timeExtent).nice();

    let scaleY = d3.scaleLinear();
    
    let yDomain;

    if(params.meas==='bat') { 
        yDomain = [2.,4.5];
    } else {
        yDomain = [getMin(data, measFn), getMax(data, measFn)];
        console.log("params.meas=", params.meas);
        if(params.meas==='temperature') {
            yDomain[0] = Math.min(yDomain[0], 10);
        }
    }
    console.log("yDomain=", yDomain);
    let y = scaleY
        .range([height - margin.bottom, margin.top])
        .domain(yDomain);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M:%S")));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Timestamp");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

    svg.append("text")      // text label for the y-axis
        .attr("y", 120 - margin.left)
        .attr("x", 50 - (height / 2))
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .text(title);

    let line = d3.line()
        // .curve(d3.curveCardinal)
        .defined(d => !isNaN(measFn(d))) // to show gap in the places, where no data is available
        .x(d => x(d.ts))
        .y(d => y(measFn(d)));

    
    for (let key in data) {
        if (data.hasOwnProperty(key)) { 
            let sensorNum = params.sensorIdx[key];
            svg.append("path")
                .data([data[key]])
                .attr("class", "line m"+sensorNum)
                .attr("d", line);
        }
    }

    // show current time
    let currTime = new Date();
    let currX = x(currTime);
    // TODO this offset is because the data has GMT timestamp. Fix the data.
    let lastDateStr = getFormattedDate(new Date(timeExtent[1]));
    let currDateStr = getFormattedDate(getTodayGMT());
    console.log(lastDateStr, currDateStr);
    if(lastDateStr === currDateStr) {
        svg
        .append('line')
        .attr('x1', currX)
        .attr('y1', height - margin.top)
        .attr('x2', currX)
        .attr('y2', 0 + margin.top)
        .style("stroke-width", 0.5)
        .style("stroke", "lightgreen")
        .style("fill", "none");

        for (let key in data) {
            if (data.hasOwnProperty(key)) { 
                let sensorNum = params.sensorIdx[key];
                let timeseries = data[key];
                let timePoint = timeseries[timeseries.length-1];
                svg.append('circle')
                    .attr('cx', x(timePoint.ts))
                    .attr('cy', y(measFn(timePoint)))
                    .attr('r', 4)
                    .attr('class', "circle m"+sensorNum);
            }
        }
    }
}
function getStats(data, params) {
    let [title, measFn, measUnit] =  _getMeasFn(params);

    let result = {};
    const fmt = d3.timeFormat("%H:%M:%S");
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            let stat = {};
            let sensorData = data[key];
            let idx = d3.minIndex(sensorData, measFn);
            if(idx>0) {
                stat['meas-min'] = measFn(sensorData[idx]);
                stat['meas-min-time'] = fmt(sensorData[idx].ts);
                idx = d3.maxIndex(sensorData, measFn);
                stat['meas-max'] = measFn(sensorData[idx]);
                stat['meas-max-time'] = fmt(sensorData[idx].ts);
                idx = sensorData.length-1;
                stat['meas-curr'] = measFn(sensorData[idx]);
                stat['meas-curr-time'] = fmt(sensorData[idx].ts);
                stat['unit'] = measUnit;
                result[key] = stat;
            }
        }
    }
    return result;
}

export {draw, getStats};
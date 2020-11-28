const d3 = require("d3");

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
    for (var key in data) {
        if (data.hasOwnProperty(key)) { 
            let filtered = data[key].filter(d => (measFn(d)!=="" && measFn(d)!==undefined && measFn(d)!==null));
            if(filtered.length>1) {
                result[key] = fillGap(filtered);    
            }
        }
    }
    return result;
}

function draw(rawData, params) {
    console.log("drawing: ", params);
    let title = "Temperature (C)";
    let measFn = (d) => d.temperature;

    if(params!==undefined &&params.meas!==undefined) {
        if(params.meas==='pressure') {
            measFn = (d) => d.pressure;            
            title = "Pressure (hPa)"
        } else if(params.meas==='humidity') { 
            measFn = (d) => d.humidity;
            title="Humidity (%)";
        }
    }
    
    let data = filterMissing(rawData, measFn);

    let svg = d3.select("#chart"),
        margin = {top: 15, bottom: 15, left: 85, right: 0},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    if (!data || data.length === 0) return;
    
    let x = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(getExtent(data, d => d.ts));

    let scaleY = d3.scaleLinear();
    
    let yDomain = [getMin(data, measFn), getMax(data, measFn)];
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
        .defined(d => !isNaN(measFn(d)))
        .x(d => x(d.ts))
        .y(d => y(measFn(d)));

    
    let cnt = 1;
    for (let key in data) {
        if (data.hasOwnProperty(key)) { 
            svg.append("path")
                .data([data[key]])
                .attr("class", "line m"+cnt)
                .attr("d", line);
            cnt += 1;
        }
    }
}

export {draw};
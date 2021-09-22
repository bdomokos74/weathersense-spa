<template>
    <svg class="chart" width="1000" height="750"></svg>
</template>

<script>

const d3 = require("d3");
import {getFormattedDate, getTodayGMT, getExtent, getMin, getMax} from '../util';


export default {
    components: {
      
    },
    emits: [
      
    ],
    mounted() {
        this.$watch( 
            () => this.sensorData,
            (newVal, oldVal) => this.draw()
        )
    },
    props: ['sensorData', 'params', 'keys', 'measFn', 'measTitle'],
    data() {
        return {
        }
    },
    methods: {
        draw() {
            console.log("drawing: ", this.params);
            console.log("filtered", this.sensorData);
            let svg = d3.select("svg.chart"),
                margin = {top: 15, bottom: 15, left: 85, right: 0},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom;

            svg.selectAll("*").remove();

            if(this.keys.length===0) {
                console.log("No data");
                return;
            }

            let timeExtent = getExtent(this.sensorData, d => d.ts);
            let x = d3.scaleTime()
                .range([margin.left, width - margin.right])
                .domain(timeExtent).nice();

            let scaleY = d3.scaleLinear();
            
            let yDomain;

            if(this.params.meas==='bat') { 
                yDomain = [2.,4.5];
            } else {
                yDomain = [getMin(this.sensorData, this.measFn), getMax(this.sensorData, this.measFn)];
                console.log("params.meas=", this.params.meas);
                if(this.params.meas==='temperature') {
                    yDomain[0] = Math.min(yDomain[0], 10);
                }
                if(this.params.meas==='pressure') {
                    yDomain[0] = Math.min(yDomain[0], 780);
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
                .text(this.measTitle);

            let line = d3.line()
                // .curve(d3.curveCardinal)
                .defined(d => !isNaN(this.measFn(d))) // to show gap in the places, where no data is available
                .x(d => x(d.ts))
                .y(d => y(this.measFn(d)));

            
            for (let key in this.sensorData) {
                if (this.sensorData.hasOwnProperty(key)) { 
                    let sensorNum = this.params.sensorIdx[key];
                    svg.append("path")
                        .data([this.sensorData[key]])
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

                for (let key in this.sensorData) {
                    if (this.sensorData.hasOwnProperty(key)) { 
                        let sensorNum = this.params.sensorIdx[key];
                        let timeseries = this.sensorData[key];
                        let timePoint = timeseries[timeseries.length-1];
                        svg.append('circle')
                            .attr('cx', x(timePoint.ts))
                            .attr('cy', y(this.measFn(timePoint)))
                            .attr('r', 4)
                            .attr('class', "circle m"+sensorNum);
                    }
                }
            }
        },
        


    }
}

</script>

<style>

</style>
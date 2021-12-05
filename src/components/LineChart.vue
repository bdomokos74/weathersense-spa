<template>
  <svg id="svgid" class="chart" width="1000" height="750" data-test="svg"></svg>
</template>

<script>
import {getFormattedDate, getTodayGMT, getExtent, getMin, getMax} from '../util';
import {watch} from 'vue';

import * as d3 from 'd3';

export default {
  name: "LineChart",
  props: ['chartParams', 'chartData'],
  /*
  chartParams.meas
  chartParams.measFn
  chartParams.measTitle
  chartParams.idMap

  chartData.data
   */
  setup(props) {
    watch( props.chartData,
        (newVal) => {
          console.log("chartData changed:", newVal);
          draw();
        }
    )
    watch( props.chartParams,
        (newVal) => {
          console.log("chartParams change", newVal);
          draw();
        });

    function hasVisibleData(showSensors, data, ) {
      if(showSensors.length === 0
          || data === undefined
          || Object.keys(data).length===0) {
        return false;
      }
      let visibleKeys = Object.keys(data).filter( (k) => showSensors.indexOf(k)>=0);
      if(visibleKeys.length===0) return false;
      let keysWithNonemptyData = visibleKeys.map( (k) => data[k].length).filter( (len) => len>0);
      return keysWithNonemptyData.length>0;
    }

    function draw() {
      console.debug("draw called");
      let {showSensors} = props.chartParams;
      console.debug("drawing: ", props.chartData, props.chartParams);
      let svg = d3.select("svg.chart");
      let margin = {top: 15, bottom: 15, left: 85, right: 0},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      if (!hasVisibleData(showSensors, props.chartData.data)) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 3)
            .style("text-anchor", "middle")
            .text("No Data");
        return;
      }

      let timeExtent = getExtent(props.chartData.data, showSensors,d => d.ts);
      let x = d3.scaleTime()
          .range([margin.left, width - margin.right])
          .domain(timeExtent).nice();

      let scaleY = d3.scaleLinear();

      let yDomain;

      if (props.chartParams.meas === 'bat') {
        yDomain = [2., 4.5];
      } else {
        yDomain = [getMin(props.chartData.data, props.chartParams.measFn), getMax(props.chartData.data, showSensors, props.chartParams.measFn)];

        if (props.chartParams.meas === 'temperature') {
          yDomain[0] = Math.min(yDomain[0], 10);
        }
        if (props.chartParams.meas === 'pressure') {
          yDomain[0] = Math.min(yDomain[0], 780);
        }
      }

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
          .attr("data-test", "y-title")
          .attr("y", 120 - margin.left)
          .attr("x", 50 - (height / 2))
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "end")
          .text(props.chartParams.measTitle);

      let line = d3.line()
          // .curve(d3.curveCardinal)
          .defined(d => !isNaN(props.chartParams.measFn(d))) // to show gap in the places, where no data is available
          .x(d => x(d.ts))
          .y(d => y(props.chartParams.measFn(d)));

      for (let key in props.chartData.data) {
        if ( showSensors.indexOf(key)!==-1) {
          let sensorNum = props.chartParams.idMap[key];
          svg.append("path")
              .data([props.chartData.data[key]])
              .attr("class", "line m" + sensorNum)
              .attr("d", line);
        }
      }

      // show current time
      let currTime = new Date();
      let currX = x(currTime);
      // TODO this offset is because the data has GMT timestamp. Fix the data.
      let lastDateStr = getFormattedDate(new Date(timeExtent[1]));
      let currDateStr = getFormattedDate(getTodayGMT());

      if (lastDateStr === currDateStr) {
        svg
            .append('line')
            .attr('x1', currX)
            .attr('y1', height - margin.top)
            .attr('x2', currX)
            .attr('y2', 0 + margin.top)
            .style("stroke-width", 0.5)
            .style("stroke", "lightgreen")
            .style("fill", "none");


        for (let key in props.chartData.data) {
          if ( showSensors.indexOf(key)!==-1) {
            let sensorNum = props.chartParams.idMap[key];
            let timeseries = props.chartData.data[key];
            let timePoint = timeseries[timeseries.length - 1];
            svg.append('circle')
                .attr('cx', x(timePoint.ts))
                .attr('cy', y(props.chartParams.measFn(timePoint)))
                .attr('r', 4)
                .attr('class', "circle m" + sensorNum);
          }
        }
      }
    }

    return {
      draw
    };
  }
}
</script>

<style>

.line {
  fill: none;
  stroke: rgb(97, 152, 198);
  stroke-width: 2px;
}

.badge-sensor1 {
  background-color: #fbb4ae;
}
.line.m1 {
  fill: none;
  stroke: #fbb4ae;
  stroke-width: 2px;
}
.circle.m1 {
  fill: #fbb4ae;
  /* stroke-width: 2px; */
}

</style>
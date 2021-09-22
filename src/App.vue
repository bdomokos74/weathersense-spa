<template>
    <nav-bar @refresh="refresh"
        v-bind:sensors="sensors">
    </nav-bar>
  
    <div class="container">
        <div class="row">
            <div class="col col-lg-auto">
                <meas-chart 
                :params="params" 
                :sensorData="sensorData"
                :keys="keys"
                :measFn="measFn"
                :measTitle="measTitle"></meas-chart>
            </div>
            <div class="col col-sm ">
                <device-stat v-for="(val, sensor) in stats" :key="sensorIdx[sensor]"
                    :id="sensorIdx[sensor]" 
                    :sensorName="sensor" 
                    :sensorStat="val">
                </device-stat>
            </div>
        </div>
    </div>
</template>

<script >
require('bootstrap');
require("jquery");
require('dotenv').config({ path: "../.env" });
const d3 = require("d3");

import {getFormattedDate} from './util';
import {getData, getWeeklyPressure} from './blob';


import DeviceStat from './components/DeviceStat.vue';
import MeasChart from './components/MeasChart.vue';
import NavBar from './components/NavBar.vue';

export default {
    name: "App",
    components: {
        NavBar,
        DeviceStat,
        MeasChart
    },
    data() {
        return {
            title: "WeatherSense",
            stats: {},
            sensorData: {},
            sensors: [
                {id: "sensor1", name:"DOIT2"},
                {id: "sensor2", name:"CAM1"}
            ],
            sensorIdx: {},
            params: {},
            keys: [],
            measFn: undefined,
            measUnit: undefined,
            measTitle: undefined
        }
    },
    beforeMount: function() {
    },
    mounted: function() {
      let cnt = 1;
      for( let i=0; i<this.sensors.length; i++) {
        this.sensorIdx[this.sensors[i].name] = cnt++;
      }
    },
    methods: {
      
      search() {
        console.log(this);
      },
      
      async refresh(accountId, selectedDate, selectedMeas) {
        this.params = {date:getFormattedDate(selectedDate), meas: selectedMeas, sensorIdx: this.sensorIdx};
        console.log("refresh:", this.user, getFormattedDate(selectedDate));
        let rawData = await getData(accountId, getFormattedDate(selectedDate), this.sensors);
        //if(rawData != undefined && rawData.length>0 && rawData[0]['ts'])
        this.data = rawData;
        console.log(this.data);
        let dispData = this.data;
        if(selectedMeas==="wpressure") {
            dispData = await getWeeklyPressure(accountId, getFormattedDate(selectedDate));
            this.params.meas = 'pressure'
        }

        //window.data = dispData;

        [this.measTitle, this.measFn, this.measUnit] = this._getMeasFn();

        [this.sensorData, this.keys] = this.filterMissing(dispData, this.measFn);
        this.stats = this.getStats(this.data);
      },
      getStats(data) {
            let result = {};
            const fmt = d3.timeFormat("%H:%M:%S");
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    let stat = {};
                    let sensorData = data[key];
                    let idx = d3.minIndex(sensorData, this.measFn);
                    if(idx>0) {
                        stat['meas-min'] = this.measFn(sensorData[idx]);
                        stat['meas-min-time'] = fmt(sensorData[idx].ts);
                        idx = d3.maxIndex(sensorData, this.measFn);
                        stat['meas-max'] = this.measFn(sensorData[idx]);
                        stat['meas-max-time'] = fmt(sensorData[idx].ts);
                        idx = sensorData.length-1;
                        stat['meas-curr'] = this.measFn(sensorData[idx]);
                        stat['meas-curr-time'] = fmt(sensorData[idx].ts);
                        stat['unit'] = this.measUnit;
                        result[key] = stat;
                    }
                }
            }
            return result;
        },
        _getMeasFn() {
            let measFn = (d) => d.t1;
            let title = "Temperature (°C)";
            let measUnit = "°C";
            if(this.params!==undefined &&this.params.meas!==undefined) {
                if(this.params.meas==='pressure') {
                    measFn = (d) => d.p;            
                    title = "Pressure (hPa)";
                    measUnit = "hPa"
                } else if(this.params.meas==='humidity') { 
                    measFn = (d) => d.h;
                    title="Humidity (%)";
                    measUnit = "%";
                } else if(this.params.meas==='bat') { 
                    measFn = (d) => d.bat;
                    title="Battery (V)";
                    measUnit = "V";
                }
            }
            return [title, measFn, measUnit];
        },
        fillGap(data, delta=60*15*1000) {
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
        },
        filterMissing(data) {
            let result = {};
            let keys = []
            for (var key in data) {
                if (data.hasOwnProperty(key)) { 
                    let filtered = data[key].filter(d => 
                        (this.measFn(d)!=="" && 
                            this.measFn(d)!==undefined && 
                            this.measFn(d)!==null)
                    );
                    if(filtered.length>1) {
                        result[key] = this.fillGap(filtered);    
                        keys.push(key);
                    }
                }
            }
            return [result, keys];
        },
    }
}
</script>

<style>

    @import '/node_modules/bootstrap/dist/css/bootstrap.css';
    @import '/node_modules/pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

</style>
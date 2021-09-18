<template>
    <nav-bar @refresh="refresh"
        v-bind:sensors="sensors">
    </nav-bar>
  
    <div class="container">
        <div class="row">
            <div class="col col-lg-auto">
                <svg class="chart" width="1000" height="750"></svg>
            </div>
            <div class="col col-sm ">
            <device-stat v-for="(val, sensor) in stats" :key="sensorIdx[sensor]"
                :id="sensorIdx[sensor]" 
                :sensorName="sensor" 
                :sensorStat="val"></device-stat>
            </div>
        </div>
    </div>
</template>

<script >

require('bootstrap');
require("jquery");
require('dotenv').config({ path: "../.env" });

import 'bootstrap/dist/css/bootstrap.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

import {draw, getStats} from './measchart';
import {getFormattedDate, getTodayGMT} from './util';
import {getData, getWeeklyPressure} from './blob';

import NavBar from './components/NavBar.vue';
import DeviceStat from './components/DeviceStat.vue';

export default {
    name: "App",
    components: {
        NavBar,
        DeviceStat
    },
    data() {
        return {
            title: "WeatherSense",
            stats: {},

            sensors: [
                {id: "sensor1", name:"DOIT2"}
            ],
            sensorIdx: {},
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
          let params = {date:getFormattedDate(selectedDate), meas: selectedMeas, sensorIdx: this.sensorIdx};
          console.log("refresh:", this.user, getFormattedDate(selectedDate));
          this.data = await getData(accountId, getFormattedDate(selectedDate), this.sensors);
          console.log(this.data);
          let dispData = this.data;
          if(selectedMeas==="wpressure") {
            dispData = await getWeeklyPressure(accountId, getFormattedDate(selectedDate));
            params.meas = 'pressure'
          }

          window.data = dispData;
          draw(dispData, params);
          this.stats = getStats(this.data, params);
      },
    }
}
</script>


require('bootstrap');
require("jquery");
require('dotenv').config({ path: "../.env" });

import 'bootstrap/dist/css/bootstrap.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

import {authInit, login, logout} from './auth';
import {draw, getStats} from './measchart';
import {getFormattedDate, getTodayGMT} from './util';
import {getData, getWeeklyPressure} from './blob';

import { createApp } from 'vue';
import { ref } from 'vue'
import Datepicker from 'vue3-datepicker';

const Profile = {
    //el: '#app',
    data() {
      return {
        title: "WeatherSense",
        user: {},
        loggedInUser: "",
        measurements: [
          {id: "temperature",name: "Temperature"},
          {id: "pressure",name: "Pressure"},
          {id: "wpressure",name: "Weekly Pressure"},
          {id: "humidity",name: "Humidity"},
          {id: "bat",name: "Battery Voltage"}
        ],
        sensors: [
          {id: "sensor1", name:"DOIT2"}
        ],
        sensorIdx: {},
        stats: {},
        selectedSensors: [],
        selectedDate: getTodayGMT(),
        selectedMeas: "temperature",
        datepickerOptions: {
          format: 'YYYYMMDD',
          defaultDate: getFormattedDate(getTodayGMT()),
        }
      }
    },
    beforeMount: function() {
    },
    mounted: function() {
      console.log("mounted");
      let cnt = 1;
      for( let i=0; i<this.sensors.length; i++) {
        this.sensorIdx[this.sensors[i].name] = cnt++;
      }
      this.selectedDate = getTodayGMT();//getFormattedDate(getTodayGMT());
      authInit(this._handleLoggedin);
      this.$watch( 
        () => this.selectedDate,
        (newVal, oldVal) => this.dateChanged(newVal)
      )
    },
    methods: {
      async dateChanged(attr) {
        console.log("datechanged", attr, this);
        console.log("seldate=", this.selectedDate);
        this.refresh();
      },
      _handleLoggedin(loginData) {
        console.log("loggedin data: ", loginData);
        this.user['username'] = loginData.username;
        this.user['accountId'] = loginData.homeAccountId;
        this.loggedInUser = this.user['username'];
        //this.user['sid'] = loginData.idTokenClaims.sid;
        this.refresh();
      },
      _handleLogin(loginData) {
        console.log(loginData);
        console.log("logged in: "+loginData.username);
        this.user['username'] = loginData.account.username;
        this.user['accountId'] = loginData.account.homeAccountId;
        this.user['sid'] = loginData.idTokenClaims.sid;
        this.loggedInUser = this.user['username'];
        this.refresh();
      },
      async homeClicked() {
        // TODO - data is GMT
        this.selectedDate = getTodayGMT();
        this.selectedMeas = "temperature";
        this.refresh()
      },
      search() {
        console.log(this);
      },
      async login() {
        await login(this._handleLogin);
      },
      async logout() {
        await logout(this.user.accountId);
      },
      async refresh() {
          let params = {date:getFormattedDate(this.selectedDate), meas: this.selectedMeas, sensorIdx: this.sensorIdx};
          console.log("refresh:", this.user, getFormattedDate(this.selectedDate));
          this.data = await getData(this.user.accountId, getFormattedDate(this.selectedDate), this.sensors);
          console.log(this.data);
          let dispData = this.data;
          if(this.selectedMeas==="wpressure") {
            dispData = await getWeeklyPressure(this.user.accountId, getFormattedDate(this.selectedDate));
            params.meas = 'pressure'
          }
          //this.stats = getStats(dispData, params);
          //window.stats = this.stats;
          window.data = dispData;
          draw(dispData, params);
      },
      async selectMeas() {
        let params = {date:getFormattedDate(this.selectedDate), meas: this.selectedMeas, sensorIdx: this.sensorIdx};
        console.log("selectMeas called:"+this.selectedMeas+" "+getFormattedDate(this.selectedDate));
        let dispData = this.data;
        if(this.selectedMeas==="wpressure") {
          dispData = await getWeeklyPressure(this.user.accountId, getFormattedDate(this.selectedDate));
          params.meas = 'pressure'
        }
        draw(dispData, params);
        this.stats = getStats(this.data, params);
      },
  }
};

const app = createApp(Profile);
app.component("datepicker", Datepicker);
app.mount("#app");
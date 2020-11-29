
require('bootstrap')
require("jquery");

import 'bootstrap/dist/css/bootstrap.css'
import datePicker from 'vue-bootstrap-datetimepicker';

import 'bootstrap/dist/css/bootstrap.css';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

import {authInit, login, logout} from './auth';
import {draw, getStats} from './measchart';
import {getFormattedDate, getTodayGMT} from './util';
import {getData} from './blob';

import Vue from 'vue';
Vue.use(datePicker);

var app = new Vue({
    el: '#app',
    data : {
        title: "WeatherSense",
        user: {},
        loggedInUser: "",
        measurements: [
          {id: "temperature",name: "Temperature"},
          {id: "pressure",name: "Pressure"},
          {id: "humidity",name: "Humidity"},
          {id: "battery",name: "Battery Voltage"}
        ],
        sensors: [
          {id: "sensor1", name:"BME280-1"},
          {id: "sensor2", name:"DALLAS1"}
        ],
        stats: {},
        selectedSensors: [],
        selectedDate: "",
        selectedMeas: "temperature",
        datepickerOptions: {
          format: 'YYYYMMDD',
          defaultDate: getFormattedDate(getTodayGMT()),
        }
    },
    beforeMount: function() {
    },
    mounted: function() {
      console.log("mounted");
      authInit(this._handleLogin);
    },
    methods: {
      async dateChanged(attr) {
        console.log("datechanged", attr, this);
        console.log("seldate=", this.selectedDate);
        this.refresh();
      },
      _handleLogin(loginData) {
        console.log("logged in: "+loginData.username);
        this.user['username'] = loginData.username;
        this.user['accountId'] = loginData.homeAccountId;
        this.loggedInUser = loginData.username;
        this.refresh();
      },
      async homeClicked() {
        // TODO - data is GMT
        this.selectedDate = getFormattedDate(getTodayGMT());
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
          console.log("refresh:", this.user, this.selectedDate);
          this.data = await getData(this.user.accountId, this.selectedDate, this.sensors);
          this.stats = getStats(this.data);
          window.stats = this.stats;
          window.data = this.data;
          draw(this.data, {date:this.selectedDate, meas: this.selectedMeas});
      },
      selectMeas: function() {
        console.log("selectMeas called:"+this.selectedMeas);
        draw(this.data, {date:this.selectedDate, meas: this.selectedMeas});
      },
  }
});
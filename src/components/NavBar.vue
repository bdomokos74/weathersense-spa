<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
  
        <a class="navbar-brand" href="#" id="mainLabel" @click="homeClicked">SensorMeas</a>
        
        <ul class="navbar-nav mr-auto">
          
          <li  class="nav-item" >
              <datepicker v-model="selectedDate"></datepicker>
          </li>
          
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown">Sensors</a>
            <div class="dropdown-menu">
              <form class="form-inline">
                <div class="form-group" v-for="sensor in sensors" :key="sensor.id">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" v-model="selectedSensors" :value="sensor" checked>
                    <label class="form-check-label" for="dropdownCheck">
                      {{sensor.name}}
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </li>
  
          <li class="nav-item dropdown">
            <form class="form-horizontal">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">Meas</span>
                </div>
                <select class="form-control form-control-md" id="meas" name="meas" v-model="selectedMeas" @change="selectMeas">
                  <option v-for="meas in measurements" :value="meas.id" :key="meas.id">
                      {{ meas.name }}
                  </option>
                </select>
              </div>
            </form>
          </li>
        </ul>
  
        <form class="form-inline">
          <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" v-on:click="search">Search</button>
        </form>
  
        <div class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" v-if="loggedInUser" data-toggle="dropdown">{{ loggedInUser }}</a>
          <a class="nav-link" v-on:click="login" v-else href="#">Login</a> 
          <div class="dropdown-menu" v-if="loggedInUser" >
            <a class="dropdown-item" href="#" v-on:click="logout" >Logout</a>
          </div>
        </div>
  
      </nav>
</template>

<script>
import Datepicker from 'vue3-datepicker';
import {getTodayGMT} from '../util';
import {authInit, login, logout} from '../auth';

export default {
    components: {
      Datepicker
    },
    emits: [
      'refresh'
    ],
    props: ['sensors'],
    data() {
        return {
          measurements: [
            {id: "temperature",name: "Temperature"},
            {id: "pressure",name: "Pressure"},
            {id: "wpressure",name: "Weekly Pressure"},
            {id: "humidity",name: "Humidity"},
            {id: "bat",name: "Battery Voltage"}
          ],
          selectedDate: getTodayGMT(),
          selectedMeas: "temperature",
          user: {},
          loggedInUser: "",
          selectedSensors: [],
        }
    },
    methods: {
      homeClicked() {
        // TODO - data is GMT
        this.selectedDate = getTodayGMT();
        this.selectedMeas = "temperature";
        this.$emit('refresh', this.user.accountId, this.selectedDate, this.selectedMeas);
      },
      selectMeas() {
        this.$emit('refresh', this.user.accountId, this.selectedDate, this.selectedMeas);
      },
     _handleLoggedin(loginData) {
        console.log("loggedin data: ", loginData);
        this.user['username'] = loginData.username;
        this.user['accountId'] = loginData.homeAccountId;
        this.loggedInUser = this.user['username'];
        //this.user['sid'] = loginData.idTokenClaims.sid;
        this.$emit('refresh', this.user.accountId, this.selectedDate, this.selectedMeas);
      },
      _handleLogin(loginData) {
        console.log(loginData);
        console.log("logged in: "+loginData.username);
        this.user['username'] = loginData.account.username;
        this.user['accountId'] = loginData.account.homeAccountId;
        this.user['sid'] = loginData.idTokenClaims.sid;
        this.user['email'] = loginData.idTokenClaims.email;
        console.log("email claim: "+ this.user.email);
        this.loggedInUser = this.user['username'];
        this.$emit('refresh', this.user.accountId, this.selectedDate, this.selectedMeas);
      },
      async login() {
        await login(this._handleLogin);
      },
      async logout() {
        await logout(this.user.accountId);
      },
    },
    mounted() {
      console.log("navbar mounted");

      this.selectedDate = getTodayGMT();
      authInit(this._handleLoggedin);
      this.$watch( 
        () => this.selectedDate,
        (newVal, oldVal) => this.$emit('refresh',this.user.accountId, newVal, this.selectedMeas)
      )
    }
}
</script>

<style>

</style>
<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
  
        <a class="navbar-brand" href="#" id="mainLabel" @click="homeClicked">SensorMeas</a>
        
        <ul class="navbar-nav mr-auto">
          
          <li  class="nav-item" >
              <datepicker v-model="measDate"></datepicker>
          </li>
          
          <li class="nav-item dropdown">
            <sensor-selector :sensors="sensors" @selectSensors="toggleSensors" />
          </li>
  
          <li class="nav-item dropdown">
            <form class="form-horizontal">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">Meas</span>
                </div>
                <select class="form-control form-control-md" id="meas" name="meas" v-model="measType">
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
          <a class="nav-link dropdown-toggle" v-if="authState.isLoggedIn" data-toggle="dropdown">{{ authState.user.username }}</a>
          <a class="nav-link" v-on:click="login()" v-else href="#">Login</a>
          <div class="dropdown-menu" v-if="authState.isLoggedIn" >
            <a class="dropdown-item" href="#" v-on:click="logout()" >Logout</a>
          </div>
        </div>
  
      </nav>
</template>

<script>
import {inject, ref, watch, reactive, onMounted} from 'vue';
import Datepicker from 'vue3-datepicker';
import {getTodayGMT} from '../util';
import SensorSelector from "./SensorSelector";

export default {
    components: {
      SensorSelector,
      Datepicker
    },
    emits: [
      'refresh'
    ],
    props: ['sensors', 'authState' ],
    setup(props, {emit}) {
      let doLogin = inject('login');
      let doLogout = inject('logout');

      const measDate = ref(getTodayGMT());
      const measType = ref("temperature");

      let measurements = [
        {id: "temperature",name: "Temperature"},
        {id: "pressure",name: "Pressure"},
        {id: "wpressure",name: "Weekly Pressure"},
        {id: "humidity",name: "Humidity"},
        {id: "bat",name: "Battery Voltage"}
      ];
      const selected = reactive({});

      function homeClicked() {
        console.log("homeclicked")
        measDate.value = getTodayGMT();
        measType.value = "temperature";
      }

      onMounted(() => {
        console.debug("NavBar mounted:", measDate);
        setTimeout(() => {
          emit('refresh', 'measDate', measDate.value);
        }, 1000);
      });

      watch(measDate, (newDate, prevDate) => {
        emit('refresh', 'measDate', newDate, prevDate);
      })
      watch( measType, (newType, prevType) => {
        emit('refresh', 'measType', newType, prevType);
      })

      function login() {
        doLogin().then( result => {
          console.debug("login result=", result);
        }).catch( err =>{
          console.error("login err=", err);
        })
      }
      function logout() {
         doLogout().then( result => {
           console.debug("logout result=", result);
         }).catch( err =>{
           console.error("logout err=", err);
         })
      }

      function toggleSensors(a) {
        console.debug("toggle: ", a);
        emit('refresh', 'sensors', a);
      }
      return {
        login,
        logout,
        measDate,
        measType,
        measurements,
        selected,
        homeClicked,
        toggleSensors
      }
    }
}
</script>

<style>
</style>
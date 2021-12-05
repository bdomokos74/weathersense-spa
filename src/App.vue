<template>

  <nav-bar @refresh="doRefresh"
           :authState="authStore.authState"
           :sensors="dataStore.chartParams.sensors">
  </nav-bar>

  <div class="container">
    <chart-container :chart-params="dataStore.chartParams"
                     :chart-data="dataStore.chartData"
                :stats="dataStore.stats">
    </chart-container>
  </div>
</template>

<script>

require('bootstrap');
require('jquery');
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import {authInit} from "./auth";
import {blobInit} from './blob';
import {dataInit} from './data';
import {PublicClientApplication} from '@azure/msal-browser'
import {provide} from "vue";
import ChartContainer from './components/ChartContainer.vue';
import NavBar from './components/NavBar.vue';

export default {
  name: "App",
  components: {
    NavBar,
    ChartContainer
  },
  setup() {

    // const {authState, login, logout, getToken} =
    const authStore = authInit(PublicClientApplication);
    // const {readConfig, readBlob} =
    const blobStore = blobInit(authStore.getToken);
    const dataStore = dataInit(authStore, blobStore);

    console.debug("env============>>", process.env);

    console.debug("authstore: ", authStore);
    provide('login', authStore.login);
    provide('logout', authStore.logout);


    function doRefresh(evt, value) {
      console.debug("refresh:"+ evt, value);
      if(evt==="measDate") {
        dataStore.setChartDate(value);
      } else if(evt==="measType") {
        dataStore.setChartMeas(value);
      } else if(evt==="sensors") {
        dataStore.setChartSensors(value);
      }
    }

    return {dataStore, authStore, doRefresh};
  }
}
</script>

<style>

@import 'assets/main.css';
@import '../node_modules/bootstrap/dist/css/bootstrap.css';
@import '../node_modules/pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

</style>

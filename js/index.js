const { BlobServiceClient, TokenCredential } = require("@azure/storage-blob");
require('bootstrap')
var jquery = require("jquery");
window.$ = window.jQuery = jquery; 

//require('popper.js');
// https://weathersensegui.z6.web.core.windows.net/
import 'bootstrap/dist/css/bootstrap.css'
import datePicker from 'vue-bootstrap-datetimepicker';

import 'bootstrap/dist/css/bootstrap.css';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

import {PublicClientApplication, InteractionRequiredAuthError} from '@azure/msal-browser'
import {msalConfig, loginRequest, tokenRequest} from './authConfig';
import {draw} from './measchart';

import Vue from 'vue';
Vue.use(datePicker);

var app = new Vue({
    el: '#app',
    data : {
        title: "Realtime socket.io app",
        data: [],
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
        selectedSensors: [],
        selectedDate: "",
        selectedMeas: "temperature",
        datepickerOptions: {
          format: 'YYYYMMDD',
          defaultDate: 'now',
        }
    },
    beforeMount: function() {
      
    },
    mounted: function() {
      console.log("mounted");

      this.msalInstance = new PublicClientApplication(msalConfig);
      
      const accounts = this.msalInstance.getAllAccounts();
      if(accounts.length>0) {
        console.log("allaccounts", accounts);
        // TODO - chose from accounts

        this._handleLogin(accounts[0]).then((value) => {
          console.log("handlelogin:", value);
          this.refresh();
        })
        .catch(err => console.log("err", err)) ;
      } else {
        console.log("not logged in");
        return;
      }
        
      //this.selectedDate = this._getFormattedDate();
      
    },
    methods: {
      async dateChanged(attr) {
        console.log("datechanged", attr, this);
        console.log("seldate=", this.selectedDate);
        //this.selectedDate = this._getFormattedDate();
        this.refresh();
      },
      async _handleLogin(loginData) {
        console.log("logged in: "+loginData.username);
        this.user['username'] = loginData.username;
        this.user['accountId'] = loginData.homeAccountId;
        this.loggedInUser = loginData.username;
      },
      homeClicked() {
        // $('#picker').datepicker(
        //     'setDate', 'now'
        // );
        this.selectedDate = this._getFormattedDate(new Date());
        this.getData();
        console.log("home", this);
      },
      search() {
        console.log(this);
      },
      async getTokenPopup(request, account) {
        console.log("getToken called");
        request.account = account;
        return await this.msalInstance.acquireTokenSilent(request).catch(async (error) => {
            console.log("silent token acquisition fails.");
            if (error instanceof InteractionRequiredAuthError) {
                console.log("acquiring token using popup");
                return this.msalInstance.acquireTokenPopup(request).catch(error => {
                    console.error(error);
                });
            } else {
                console.error(error);
            }
        });
      },
      async login() {  
        console.log("login called");
          const loginResp = await this.msalInstance.loginPopup(loginRequest);
          console.log(loginResp);
          if(loginResp !== null) {
            this._handleLogin(loginResp.account);
          }
      },
      async logout() {
        console.log("logout called");
        const logoutRequest = {
          account: this.msalInstance.getAccountByHomeId(this.user.accountId)
        };
        await this.msalInstance.logout(logoutRequest);
        this.loggedInUser = "";
        this.user = {};
      },

      async refresh() {
          console.log("refresh:", this.user, this.selectedDate);
          await this.getData();
          draw(this.data, {date:this.selectedDate, meas: this.selectedMeas});
      },
      async getData () {
        let measDate = this.selectedDate;
        console.log("getdate: measdate", measDate);
        if(measDate==="") {
          measDate = this._getFormattedDate(new Date());
          console.log("getdate: measdate2", measDate);
        }

        
          
        
        const currentAcc = this.msalInstance.getAccountByHomeId(this.user.accountId);
        if (!currentAcc) {
          console.log("not logged in");
          return;
        }

        const token = await this.getTokenPopup(tokenRequest, this.user.accountId);

        let results = {};
        //const headers = new Headers();
        const bearer = `Bearer ${token.accessToken}`;
        //headers.append("Authorization", bearer);
        //headers.append("abc", "123");
        const options = {
            method: "GET",
            headers: {
              "Authorization": bearer,
              "x-ms-version": "2019-02-02",
              "x-ms-date": new Date().toGMTString(),
              "Accept" : "text/plain"
            }
        };
        console.log("options", options.headers);
        for(let i = 0; i<this.sensors.length; i++) {
            const url = `https://weathersenseblob.blob.core.windows.net/weathersense-data/meas-${this.sensors[i].name}-${measDate}.txt`;
            try {
              let resp = await fetch(url, options);
              console.log(resp);
              const rows = resp.split("\n");
              console.log("got response", rows[rows.length-1]);
              let data = rows.map(createItem);
              results[sensors[i]] = data;
            } catch(err) {
                console.log(`error while fetching: ${url}`, err);
            };
        }
        this.data = results;
      
      },
      selectMeas: function() {
        draw(this.data, {date:this.selectedDate, meas: this.selectedMeas});
      },
      
      _getFormattedDate(date) {
        let formatDate = function(d) {
            return d.getFullYear()+""+(d.getMonth()+1)+""+("0" + d.getDate()).slice(-2);
        };
        // let d = new Date(this.selectedDate);
        console.log("date=",date);
        return formatDate(date);
      },
  }
});
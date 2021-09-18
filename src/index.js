

import { createApp } from "vue";
import App from "./App";

//new Vue({ render: createElement => createElement(App) }).$mount('#app');

const app = createApp(App);
//app.component("datepicker", Datepicker);
app.mount("#app");
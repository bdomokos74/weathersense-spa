import {mount, flushPromises} from '@vue/test-utils'
import LineChart from './DeviceStat.vue'
import {reactive, nextTick} from 'vue';


function initDocument() {
    document.body.innerHTML = `
  <div>
    <style>
    .line {
      fill: none;
      stroke: rgb(97, 152, 198);
      stroke-width: 2px;
    }
    .line.m1 {
      fill: none;
      stroke: #fbb4ae;
      stroke-width: 2px;
    }
    </style>
    <div id="comp"></div>
  </div>
`
}

let statDataInit = {
    sensorStat: {
        sensorName: 'DOITx',
        sensorId: 1,
        unit: '°C',
        'meas-min': 2.3,
        'meas-max': 24.4,
        'meas-curr': 25.1,
        'meas-min-time': '02:30',
        'meas-max-time': '15:41',
        'meas-curr-time': '18:13'
    }
}

let wrapper;
beforeEach(() => {
    initDocument();
    wrapper = mount(LineChart,
        {
            propsData: statDataInit,
            attachTo: document.getElementById('comp')
        });
});

test('renders the device status', async () => {
    wrapper.props().sensorStat.sensorName = "DOIT1";
    await nextTick();

    const element = wrapper.get('[data-test="deviceStat"]');
    //console.log(element.html());
    expect(element.find("span.badge-sensor1").text()).toBe("DOIT1");
});
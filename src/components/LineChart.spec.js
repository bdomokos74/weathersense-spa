import {mount} from '@vue/test-utils'
import LineChart from './LineChart.vue'
import {nextTick} from 'vue';

const yTitle = "Temperature";
let chartParams = {
    meas: "temperature",
    measFn: (x) => x.t1,
    measTitle: yTitle,
    showSensors: ["DOIT4"],
    idMap: {"DOIT4": 1, "DOIT5": 2}
};

let testDataInit = {
};

let testDataEmpty = {
    "DOIT4": []
};
let testData1 = {
    "DOIT4":
        [
            {ts: Date.parse("2021-09-17T23:54:03.760122"), t1: 23.4},
            {ts: Date.parse("2021-09-17T23:57:31.760122"), t1: 23},
            {ts: Date.parse("2021-09-17T23:59:13.760122"), t1: 25}
        ]
};

let propsDataInit = {
    chartParams: {...chartParams},
    chartData: {data: testDataInit}
};

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

let wrapper;
beforeEach(() => {
    initDocument();
    wrapper = mount(LineChart,
        {
            propsData: propsDataInit,
            attachTo: document.getElementById('comp')
        });
});

test('renders an empty chart displaying: No Data', async () => {
    wrapper.props().chartData.data = {...testDataEmpty};
    await nextTick();
    const chart = wrapper.get('[data-test="svg"]');

    expect(wrapper.classes()).toContain("chart");
    let textElements = chart.findAll("svg>text");
    expect(textElements.length).toBe(1);
    expect(textElements[0].text()).toBe("No Data");
})

test('chart is displayed with a line path after setting chartData', async () => {
    wrapper.props().chartData.data = {...testData1};
    await nextTick();
    const chart = wrapper.get('[data-test="svg"]');
    //console.log(chart.html());
    //console.log(document.body.innerHTML);

    let actualLinePath = chart.findAll("svg>path");
    expect(actualLinePath.length).toBe(1);
    let actualClasses = actualLinePath[0].classes();
    expect(actualClasses).toContain("m1");
    expect(actualClasses).toContain("line");

    let actualYTitle = chart.find('[data-test="y-title"]').text();
    expect(actualYTitle).toBe(yTitle);
})

test('chart is empty none of chartData keys are present in showSensors', async () => {
    wrapper.props().chartData.data = {...testData1};
    wrapper.props().chartParams.showSensors = [];
    await nextTick();
    const chart = wrapper.get('[data-test="svg"]');
    //console.log(chart.html());
    //console.log(document.body.innerHTML);

    let actualLinePath = chart.findAll("svg>path");
    expect(actualLinePath.length).toBe(0);

    expect(wrapper.classes()).toContain("chart");
    let textElements = chart.findAll("svg>text");
    expect(textElements.length).toBe(1);
    expect(textElements[0].text()).toBe("No Data");
})


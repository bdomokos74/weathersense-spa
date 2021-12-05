<template>
  <div class="row">
    <div class="col col-lg-auto">
      <line-chart :chart-data="chartData" :chart-params="chartParams" ></line-chart>
    </div>
    <div class="col col-sm " v-if="stats.data" >
      <device-stat v-for="sensorStat in stats.data" :key="sensorStat.id"
                   :sensor-stat="sensorStat">
      </device-stat>
    </div>
  </div>
</template>

<script>
import LineChart from "./LineChart.vue";
import DeviceStat from "./DeviceStat.vue";

export default {
  name: "ChartContainer",
  components: {LineChart, DeviceStat},
  props: ['chartParams', 'chartData', 'stats'],
  setup() {
    return {
    }
  }
}
</script>

<style scoped>

</style>
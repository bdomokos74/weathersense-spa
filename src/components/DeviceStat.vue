<template>
  <div v-show="sensorStat.visible" class="form-group statbox" data-test="deviceStat">
    <span class="badge" :class="sensorClass">{{ sensorStat.sensorName }}</span>
    <span class="badge" :class="sensorClass">{{ curr }}</span>
    <span class="badge badge-low">{{ lo }}</span>
    <span class="badge badge-hi">{{ hi }}</span>
  </div>
</template>

<script>
import {computed} from 'vue';

export default {
  emits: [],
  props: ['sensorStat'],
  setup(props) {
    let lo = computed(() => {
      return `Low ${props.sensorStat['meas-min']}${props.sensorStat['unit']} ${props.sensorStat['meas-min-time']}`;
    });
    let hi = computed(() => {
      return `High ${props.sensorStat['meas-max']}${props.sensorStat['unit']} ${props.sensorStat['meas-max-time']}`;
    });
    let curr = computed(() => {
      return `${props.sensorStat['meas-curr']}${props.sensorStat['unit']} ${props.sensorStat['meas-curr-time']}`;
    });
    let sensorClass =  computed(() => {
      return "badge-sensor" + props.sensorStat.sensorId;
    });
    return {
      lo, hi, curr, sensorClass
    }
  }
}

</script>

<style>
</style>
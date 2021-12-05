<template>
  <a class="nav-link dropdown-toggle" data-toggle="dropdown">Sensors</a>
  <div class="dropdown-menu">
    <form class="form-inline" v-if="sensors">
      <div class="form-group">
        <div class="form-check" v-for="sensor in sensors" :key="sensor.id" >

           <input type="checkbox" class="form-check-input"
                   :id="sensor.id"
                   :value="sensor.name"
                   v-model="selected.sensors">
            <label class="form-check-label" :for="sensor.id">{{sensor.name}}</label>

        </div>
      </div>
    </form>
  </div>
</template>

<script>
import {watch, reactive} from 'vue';

export default {
  components: {
  },
  emits: [
    'selectSensors'
  ],
  props: ['sensors'],
  setup(props, {emit}) {
    const selected = reactive({sensors: []});
    watch(() => props.sensors, (newVal) => {
      selected.sensors = newVal.map( v => v.name);
    })
    watch(selected, (newVal ) => {
      if(newVal.sensors===undefined)
        emit('selectSensors', []);
      else
        emit('selectSensors', newVal.sensors);
    })
    return {selected}
  }
}
</script>

<style>
</style>
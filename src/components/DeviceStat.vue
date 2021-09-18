<template>
    <div class="form-group statbox" >
        <span class="badge" :class="'badge-sensor'+id" >{{ sensorName }}</span>
        <span class="badge" :class="'badge-sensor'+id">{{ currValue }}</span>
        <span class="badge badge-low">{{ lo }}</span>
        <span class="badge badge-hi">{{ hi }}</span>
    </div>
</template>

<script>
export default {
    emits: [
    ],
    props: ['sensorName', 'id', 'sensorStat'],
    computed: {
        lo() {
            return `Low ${this.sensorStat['meas-min']} ${this.sensorStat['unit']} ${this.sensorStat['meas-min-time']}`;
        },
        hi() {
            return `High ${this.sensorStat['meas-max']} ${this.sensorStat['unit']} ${this.sensorStat['meas-max-time']}`;
        },
        currValue() {
            return `${this.sensorStat['meas-curr']} ${this.sensorStat['unit']} ${this.sensorStat['meas-curr-time']}`;
        }
    },
    data() {
        return {
        }
    }
}

</script>

<style>

</style>
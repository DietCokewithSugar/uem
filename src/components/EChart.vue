<template>
  <div ref="el" class="echart" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({ option: { type: Object, required: true } })
const el = ref()
let chart, ro

onMounted(() => {
  chart = echarts.init(el.value)
  chart.setOption(props.option)
  ro = new ResizeObserver(() => chart.resize())
  ro.observe(el.value)
})
watch(() => props.option, (o) => chart?.setOption(o, true), { deep: true })
onBeforeUnmount(() => {
  ro?.disconnect()
  chart?.dispose()
})
</script>

<style scoped>
.echart { width: 100%; height: 100%; }
</style>

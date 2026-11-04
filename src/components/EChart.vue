<template>
  <div ref="el" class="echart" />
</template>

<script>
import * as echarts from 'echarts'
import { SERIES, INK, INK_2, INK_3, LINE, LINE_2, FONT } from '@/config/charts'

// 图表主题：分类色、文字和坐标轴颜色都来自 config/charts.js；页面中显式指定的颜色优先
echarts.registerTheme('uem', {
  color: SERIES,
  backgroundColor: 'transparent',
  textStyle: { fontFamily: FONT, color: INK_2 },
  title: { textStyle: { color: INK, fontWeight: 600 }, subtextStyle: { color: INK_3 } },
  legend: { textStyle: { color: INK_2 } },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderWidth: 1,
    textStyle: { color: INK, fontSize: 12 },
    extraCssText: 'box-shadow: 0 6px 16px -4px rgba(16,24,40,.12); border-radius: 6px;'
  },
  categoryAxis: { axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, axisLabel: { color: INK_3 }, splitLine: { lineStyle: { color: LINE_2 } } },
  valueAxis: { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: INK_3 }, splitLine: { lineStyle: { color: LINE_2 } }, nameTextStyle: { color: INK_3 } },
  line: { symbolSize: 8, lineStyle: { width: 2 } },
  bar: { barMaxWidth: 24 },
  radar: { axisName: { color: INK_2 }, splitLine: { lineStyle: { color: LINE } }, axisLine: { lineStyle: { color: LINE } }, splitArea: { show: false } }
})
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({ option: { type: Object, required: true } })
const el = ref()
let chart, ro

onMounted(() => {
  chart = echarts.init(el.value, 'uem')
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

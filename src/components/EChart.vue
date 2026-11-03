<template>
  <div ref="el" class="echart" />
</template>

<script>
import * as echarts from 'echarts'

// 图表主题：分类色取自数据可视化默认色板（已校验色盲可辨），文字与坐标轴使用中性色；
// 红色只用于风险与警示，不作为普通数据色。页面中显式指定的颜色优先。
const INK_3 = '#868d98'
const LINE = '#e3e6ea'
const LINE_2 = '#eef0f3'
echarts.registerTheme('uem', {
  color: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  backgroundColor: 'transparent',
  textStyle: { fontFamily: "-apple-system, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif", color: '#4e5561' },
  title: { textStyle: { color: '#1f2329', fontWeight: 600 }, subtextStyle: { color: INK_3 } },
  legend: { textStyle: { color: '#4e5561' } },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderWidth: 1,
    textStyle: { color: '#1f2329', fontSize: 12 },
    extraCssText: 'box-shadow: 0 6px 16px -4px rgba(16,24,40,.12); border-radius: 6px;'
  },
  categoryAxis: { axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, axisLabel: { color: INK_3 }, splitLine: { lineStyle: { color: LINE_2 } } },
  valueAxis: { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: INK_3 }, splitLine: { lineStyle: { color: LINE_2 } } },
  line: { symbolSize: 6, lineStyle: { width: 2 } },
  bar: { barMaxWidth: 24 }
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

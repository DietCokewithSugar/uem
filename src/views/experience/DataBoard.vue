<!-- 数据看板：优化建议多维分析（截图待补充，先按常见口径构建） -->
<template>
  <div class="board">
    <div class="kpis">
      <div v-for="k in kpis" :key="k.label" class="uem-card kpi">
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-value">{{ k.value }}</div>
      </div>
    </div>
    <div class="grid">
      <div class="uem-card chart"><h4>月度提交趋势</h4><EChart :option="trend" /></div>
      <div class="uem-card chart"><h4>状态分布</h4><EChart :option="statusPie" /></div>
      <div class="uem-card chart"><h4>产品 TOP10</h4><EChart :option="topProducts" /></div>
      <div class="uem-card chart"><h4>来源分布</h4><EChart :option="sourcePie" /></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import EChart from '@/components/EChart.vue'
import { suggestions } from '@/mock'

const palette = ['#c7000b', '#e8676d', '#f2a33a', '#4a8fe7', '#47b39c', '#9474d6', '#8a8f99', '#f0c419', '#5bc0de']

const countBy = (fn) => {
  const m = {}
  suggestions.forEach((s) => (m[fn(s)] = (m[fn(s)] || 0) + 1))
  return m
}

const kpis = computed(() => {
  const done = suggestions.filter((s) => s.status.startsWith('已'))
  const adopted = done.filter((s) => ['采纳', '部分采纳'].includes(s.adoptResult))
  return [
    { label: '建议总数', value: suggestions.length },
    { label: '在途建议', value: suggestions.length - done.length },
    { label: '已办结/答复', value: done.length },
    { label: '采纳率', value: done.length ? ((adopted.length / done.length) * 100).toFixed(1) + '%' : '—' }
  ]
})

const trend = computed(() => {
  const m = countBy((s) => s.submitTime.slice(0, 7))
  const keys = Object.keys(m).sort()
  return {
    color: palette,
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: keys },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, areaStyle: { opacity: 0.12 }, data: keys.map((k) => m[k]) }]
  }
})

const pie = (m) => ({
  color: palette,
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [{ type: 'pie', radius: ['45%', '70%'], center: ['38%', '50%'], data: Object.entries(m).map(([name, value]) => ({ name, value })) }]
})
const statusPie = computed(() => pie(countBy((s) => s.status)))
const sourcePie = computed(() => pie(countBy((s) => s.source)))

const topProducts = computed(() => {
  const list = Object.entries(countBy((s) => s.product)).sort((a, b) => b[1] - a[1]).slice(0, 10).reverse()
  return {
    color: palette,
    grid: { left: 140, right: 30, top: 10, bottom: 20 },
    tooltip: {},
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: list.map((l) => l[0]) },
    series: [{ type: 'bar', barWidth: 12, data: list.map((l) => l[1]) }]
  }
})
</script>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.kpi-label { color: #888; font-size: 13px; }
.kpi-value { font-size: 28px; font-weight: 600; margin-top: 6px; color: var(--uem-red); }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart { height: 320px; display: flex; flex-direction: column; }
.chart h4 { margin: 0 0 8px; font-weight: 600; }
.chart .echart { flex: 1; }
</style>

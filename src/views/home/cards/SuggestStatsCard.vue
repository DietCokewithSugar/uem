<!-- 优化建议概览（统计视图 / 数据看板权限）：本年数量、采纳率、解决率、平均处理用时，近 6 个月提交量 -->
<template>
  <HomeCard title="优化建议概览" :subtitle="`${year} 年 · 全行口径，与数据看板一致`" :more="can('suggest.board') ? '/suggestionDataBoard' : '/allView'" more-text="查看看板">
    <div class="hc-tiles">
      <div class="hc-tile"><div class="hc-tile-label">本年提交</div><div class="hc-tile-value">{{ o.total.toLocaleString() }}<small>条</small></div><div class="hc-tile-note">已分析 {{ o.analyzed.toLocaleString() }} 条</div></div>
      <div class="hc-tile"><div class="hc-tile-label">采纳率</div><div class="hc-tile-value">{{ o.adoptRate }}<small>%</small></div><div class="hc-tile-note">采纳 {{ o.adopted.toLocaleString() }} 条</div></div>
      <div class="hc-tile"><div class="hc-tile-label">解决率</div><div class="hc-tile-value">{{ o.solveRate }}<small>%</small></div><div class="hc-tile-note">待解决 {{ o.unsolved.toLocaleString() }} 条</div></div>
      <div class="hc-tile"><div class="hc-tile-label">平均处理用时</div><div class="hc-tile-value">{{ o.stage.total }}<small>个工作日</small></div><div class="hc-tile-note">分拣 {{ o.stage.sort }} · 答复 {{ o.stage.reply }} · 审核 {{ o.stage.audit }}</div></div>
    </div>
    <div class="chart-head">
      <span>近 6 个月提交量</span>
      <span class="legend"><i class="s1" />总行<i class="s2" />分行</span>
    </div>
    <EChart class="chart" :option="option" role="img" :aria-label="ariaText" />
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import EChart from '@/components/EChart.vue'
import { can } from '@/config/access'
import { listOfYear, overview, monthlySubmit, recentRange, monthsBetween, listInRange } from '@/mock/suggestBoard'

const year = String(new Date().getFullYear())
const o = computed(() => overview(listOfYear(year)))
const range = recentRange(6)
const rows = computed(() => monthlySubmit(listInRange(range), monthsBetween(...range)).slice(-6))
const ariaText = computed(() => `近 6 个月提交量：${rows.value.map((r) => `${r.month} 总行 ${r.head} 条、分行 ${r.branch} 条`).join('；')}`)

const SERIES = ['#2a78d6', '#eb6834']
const option = computed(() => ({
  animationDuration: 300,
  grid: { left: 36, right: 8, top: 8, bottom: 24 },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v} 条` },
  xAxis: {
    type: 'category',
    data: rows.value.map((r) => `${Number(r.month.slice(5))}月`),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: '#e3e6ea' } },
    axisLabel: { color: '#6b7280', fontSize: 11 }
  },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef0f3' } }, axisLabel: { color: '#6b7280', fontSize: 11 } },
  series: [
    { name: '总行', type: 'bar', stack: 'n', barMaxWidth: 20, itemStyle: { color: SERIES[0], borderColor: '#fff', borderWidth: 1 }, data: rows.value.map((r) => r.head) },
    { name: '分行', type: 'bar', stack: 'n', barMaxWidth: 20, itemStyle: { color: SERIES[1], borderRadius: [3, 3, 0, 0], borderColor: '#fff', borderWidth: 1 }, data: rows.value.map((r) => r.branch) }
  ]
}))
</script>

<style scoped>
.chart-head { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.legend { display: inline-flex; align-items: center; gap: 6px; }
.legend i { width: 8px; height: 8px; border-radius: 2px; margin-left: 8px; }
.legend .s1 { background: #2a78d6; }
.legend .s2 { background: #eb6834; }
.chart { height: 150px; margin-top: 4px; }
</style>

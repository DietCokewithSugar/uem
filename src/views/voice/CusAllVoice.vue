<!-- 全部声音 #/cusAllVoice：声音分布、趋势、情感得分、词云、热点 + 声音明细管理 -->
<template>
  <div>
    <div class="dash">
      <Panel title="客户声音分布">
        <template #extra><RangeTag text="2026-01 - 2026-10" /></template>
        <EChart class="h220" :option="distOpt" />
      </Panel>
      <Panel title="客户声音变动趋势">
        <template #extra><RangeTag text="2026-01 - 2026-12" /></template>
        <EChart class="h220" :option="trendOpt" />
      </Panel>
      <Panel title="大家都在说">
        <template #extra><RangeTag text="2026-10" /></template>
        <div v-for="(t, i) in d.hotTalk" :key="i" class="talk"><span :class="['badge', `b${i}`]">{{ i + 1 }}</span>{{ t }}</div>
      </Panel>
      <Panel title="声音情感得分">
        <template #extra><RangeTag text="2026-10" /></template>
        <EChart class="h220" :option="gaugeOpt" />
      </Panel>
      <Panel title="客户声音词云图">
        <template #extra><RangeTag text="2026-01 - 2026-10" /></template>
        <EChart class="h220" :option="cloudOpt" />
      </Panel>
      <Panel title="重点关注声音">
        <template #extra><RangeTag text="2026-10" /></template>
        <div v-for="(t, i) in d.focus" :key="i" class="talk"><span :class="['badge', `b${i}`]">{{ i + 1 }}</span>{{ t }}</div>
      </Panel>
    </div>
    <VoiceTable manage />
  </div>
</template>

<script setup>
import { h } from 'vue'
import 'echarts-wordcloud'
import EChart from '@/components/EChart.vue'
import Panel from '@/components/Panel.vue'
import VoiceTable from './VoiceTable.vue'
import { allVoiceData as d } from '@/mock/voice'

const RangeTag = (p) => h('span', { class: 'range-tag' }, p.text)
RangeTag.props = ['text']

const distOpt = {
  color: ['#e8545c', '#3fa89b', '#4a8fe7'],
  tooltip: { formatter: '{b}：{c}%' },
  legend: { orient: 'vertical', right: 0, bottom: 10, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
  title: { text: '客户声音', subtext: `${d.total} 万条`, left: '34%', top: '38%', textAlign: 'center', textStyle: { fontSize: 13, color: '#333', fontWeight: 400 }, subtextStyle: { fontSize: 18, color: '#c7000b', fontWeight: 600 } },
  series: [{ type: 'pie', radius: ['55%', '75%'], center: ['35%', '50%'], label: { show: false }, data: d.dist.map(([name, value]) => ({ name, value })) }]
}
const trendOpt = {
  grid: { left: 50, right: 10, top: 10, bottom: 50 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: d.trend.map((x) => x[0]), axisLabel: { rotate: 40, fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [{ type: 'bar', barWidth: 18, itemStyle: { color: '#e8545c' }, data: d.trend.map((x) => x[1]) }]
}
const gaugeOpt = {
  series: [{
    type: 'gauge', min: -100, max: 100, startAngle: 180, endAngle: 0, radius: '95%', center: ['50%', '70%'], splitNumber: 2,
    progress: { show: true, width: 14, itemStyle: { color: '#e8545c' } }, axisLine: { lineStyle: { width: 14, color: [[1, '#c9ccd1']] } },
    axisTick: { show: false }, splitLine: { show: false }, pointer: { show: false },
    axisLabel: { distance: -40, fontSize: 11, color: '#666', formatter: (v) => `${v}分` },
    detail: { offsetCenter: [0, '-10%'], fontSize: 24, fontWeight: 600, color: '#c7000b', formatter: '{value}' },
    title: { offsetCenter: [0, '35%'], fontSize: 11, color: '#999' },
    data: [{ value: d.emotionScore, name: '兴农通问卷调研' }]
  }]
}
const cloudColors = ['#c7000b', '#4a8fe7', '#3fa89b', '#f2a33a', '#9474d6', '#e8545c']
const cloudOpt = {
  tooltip: {},
  series: [{
    type: 'wordCloud', shape: 'circle', gridSize: 4, sizeRange: [11, 48], rotationRange: [0, 0], width: '95%', height: '95%',
    textStyle: { color: () => cloudColors[Math.floor(Math.random() * cloudColors.length)] },
    data: d.words.map(([name, value]) => ({ name, value }))
  }]
}
</script>

<style scoped>
.dash { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; gap: 12px; margin-bottom: 16px; }
.h220 { height: 220px; }
:deep(.range-tag) { font-size: 11px; color: #999; border: 1px solid #eee; border-radius: 3px; padding: 2px 8px; }
.talk { display: flex; gap: 8px; font-size: 13px; color: #333; padding: 7px 0; line-height: 1.5; }
.badge { width: 16px; height: 16px; line-height: 16px; text-align: center; font-size: 11px; color: #fff; background: #333; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }
.badge.b0 { background: #e8545c; }
.badge.b1 { background: #f08a5d; }
.badge.b2 { background: #f2a33a; }
@media (max-width: 1400px) { .dash { grid-template-columns: 1fr 1fr; } }
</style>

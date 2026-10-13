<!-- 工行品牌 #/experEvaluationIndex：整体 NPS、年龄段 NPS、体验形象、各维度满意度 -->
<template>
  <div class="brand">
    <div class="row3">
      <div class="panel">
        <div class="panel-head"><b>工行整体净推荐值</b><MonthPick v-model="m1" /></div>
        <div class="nps">
          <div class="nps-num"><span>总体NPS</span><b>{{ d1.nps.toFixed(2) }}%</b></div>
          <EChart class="gauge" :option="gauge" />
        </div>
        <p class="note">*NPS（净推荐值，Net Promoter Score）是目前业界衡量客户体验满意度的重要指标。与传统指标相比，NPS能更有效地表达客户满意度、忠诚度，在很大程度上预测客户未来能带来的价值。NPS通过计算推荐者与贬损者在整体中占比的差值获得。</p>
      </div>
      <div class="panel">
        <div class="panel-head"><b>各年龄段用户净推荐值</b><MonthPick v-model="m2" /></div>
        <div class="ages">
          <div v-for="[name, v] in d2.byAge" :key="name" class="age">
            <span class="age-name">{{ name }}</span>
            <div class="age-bar-wrap">
              <div class="age-bar"><div :style="{ width: Math.max(0, v) * 1.6 + '%' }" /></div>
              <span class="age-val">{{ v.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><b>工行体验形象</b><MonthPick v-model="m3" /></div>
        <EChart class="image" :option="imageOpt" />
      </div>
    </div>

    <div class="panel dims-panel">
      <div class="panel-head">
        <span><b>各维度满意度</b><small>各维度满意度取值为1-5分，5分代表最满意</small></span>
        <MonthPick v-model="m4" />
      </div>
      <div class="dims">
        <div v-for="d in d4.dims" :key="d.name" class="dim">
          <div class="dim-title">{{ d.name }}<b>{{ d.score.toFixed(2) }}</b></div>
          <EChart class="radar" :option="radar(d)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import EChart from '@/components/EChart.vue'
import { brandData, months } from '@/mock/monitor'

const MonthPick = (props, { emit }) =>
  h(ElSelect, { modelValue: props.modelValue, size: 'small', style: 'width: 110px', 'onUpdate:modelValue': (v) => emit('update:modelValue', v) }, () =>
    months.map((m) => h(ElOption, { label: m, value: m }))
  )
MonthPick.props = ['modelValue']
MonthPick.emits = ['update:modelValue']

const m1 = ref(months[0]), m2 = ref(months[0]), m3 = ref(months[0]), m4 = ref(months[0])
const d1 = computed(() => brandData[m1.value])
const d2 = computed(() => brandData[m2.value])
const d3 = computed(() => brandData[m3.value])
const d4 = computed(() => brandData[m4.value])

const gauge = computed(() => ({
  series: [{
    type: 'gauge', min: -100, max: 100, startAngle: 180, endAngle: 0, radius: '100%', center: ['50%', '72%'],
    progress: { show: true, width: 12, itemStyle: { color: '#5aa6e0' } },
    axisLine: { lineStyle: { width: 12, color: [[1, '#cfd3d9']] } },
    axisTick: { show: false }, splitLine: { show: false }, pointer: { show: false },
    axisLabel: { distance: -36, fontSize: 11, color: '#666', formatter: (v) => ([-100, 0, 100].includes(v) ? `${v}%` : '') },
    splitNumber: 2, detail: { show: false }, data: [{ value: d1.value.nps }]
  }]
}))

const imageColors = ['#e8545c', '#4a8fe7', '#5bc0b5', '#f2c43a', '#5a63d6', '#7cc99a', '#e8545c', '#f2c43a']
const imageOpt = computed(() => ({
  grid: { left: 10, right: 10, top: 20, bottom: 10 },
  tooltip: { formatter: (p) => `${p.name}：${p.value}` },
  xAxis: { type: 'category', show: false, data: d3.value.image.map((x) => x[0]) },
  yAxis: { type: 'value', show: false, max: 110 },
  series: [{
    type: 'bar', barWidth: 14,
    label: { show: true, position: 'top', formatter: '{b}', color: 'inherit', fontSize: 13 },
    data: d3.value.image.map(([, v], i) => ({
      value: v,
      itemStyle: { borderRadius: 7, color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: imageColors[i] }, { offset: 1, color: imageColors[i] + '10' }] } },
      label: { color: imageColors[i] }
    }))
  }]
}))

const radar = (d) => ({
  tooltip: {},
  legend: { bottom: 0, right: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10, color: '#999' }, data: [m4.value] },
  radar: { indicator: d.items.map(([name]) => ({ name, max: 5, min: 3 })), radius: '50%', axisName: { color: '#666', fontSize: 11 }, splitArea: { show: false } },
  series: [{ type: 'radar', name: m4.value, symbol: 'none', lineStyle: { color: d.color }, areaStyle: { color: d.color, opacity: 0.85 }, data: [{ value: d.items.map((x) => x[1]), name: m4.value }] }]
})
</script>

<style scoped>
.brand { padding: 16px 20px 30px; }
.row3 { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.panel { background: #fff; border-radius: 4px; padding: 16px 20px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin: -16px -20px 12px; padding: 14px 20px; background: linear-gradient(90deg, #fdf1f0, #fff); }
.panel-head b { font-size: 15px; color: #333; font-weight: 600; }
.panel-head small { color: #999; font-size: 11px; margin-left: 12px; }
.nps { display: flex; align-items: center; }
.nps-num { flex: 1; text-align: center; }
.nps-num span { display: block; color: #666; font-size: 15px; }
.nps-num b { font-size: 32px; font-family: Georgia, serif; color: #333; }
.gauge { flex: 1; height: 150px; }
.note { font-size: 11px; color: #999; line-height: 1.6; margin: 8px 0 0; }
.ages { padding: 6px 0; }
.age { display: flex; gap: 12px; margin-bottom: 10px; font-size: 12px; color: #666; }
.age-name { width: 70px; flex-shrink: 0; padding-top: 2px; }
.age-bar-wrap { flex: 1; }
.age-bar { height: 12px; }
.age-bar > div { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #7cd3c8, #4a7fe0); }
.age-val { font-size: 11px; color: #777; }
.image { height: 220px; }
.dims { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.dim-title { text-align: center; color: #555; font-size: 14px; }
.dim-title b { font-size: 18px; color: #333; margin-left: 10px; font-family: Georgia, serif; }
.radar { height: 240px; }
@media (max-width: 1280px) { .row3, .dims { grid-template-columns: 1fr 1fr; } }
</style>

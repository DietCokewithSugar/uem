<!-- 工行品牌 #/experEvaluationIndex：整体 NPS、年龄段 NPS、体验形象、各维度满意度 -->
<template>
  <div class="brand">
    <div class="row3">
      <div class="panel">
        <div class="panel-head"><b>工行整体净推荐值</b><MonthPick v-model="m1" /></div>
        <div class="nps">
          <div class="nps-num"><span>总体NPS</span><b>{{ d1.nps.toFixed(2) }}%</b></div>
          <div class="gauge-wrap">
            <EChart class="gauge" :option="gauge" />
            <div class="gauge-scale" aria-hidden="true"><span>-100%</span><span>100%</span></div>
          </div>
        </div>
        <p class="note">*NPS（净推荐值，Net Promoter Score）是目前业界衡量客户体验满意度的重要指标。与传统指标相比，NPS能更有效地表达客户满意度、忠诚度，在很大程度上预测客户未来能带来的价值。NPS通过计算推荐者与贬损者在整体中占比的差值获得。</p>
      </div>
      <div class="panel">
        <div class="panel-head"><b>各年龄段用户净推荐值</b><MonthPick v-model="m2" /></div>
        <div class="ages">
          <div v-for="[name, v] in d2.byAge" :key="name" class="age">
            <span class="age-name">{{ name }}</span>
            <div class="age-track"><div class="age-fill" :style="{ width: Math.max(0, Math.min(100, v)) + '%' }" /></div>
            <span class="age-val">{{ v.toFixed(2) }}%</span>
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
import { BLUE, INK_2, LINE_2, rankBarOption } from '@/config/charts'

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

// 仪表盘只作为数值的位置参考（-100% ～ 100%）；两端刻度用页面文字标在弧线下方，避免被裁切或重叠
const gauge = computed(() => ({
  series: [{
    type: 'gauge', min: -100, max: 100, startAngle: 180, endAngle: 0, radius: '88%', center: ['50%', '72%'],
    progress: { show: true, width: 12, itemStyle: { color: BLUE } },
    axisLine: { lineStyle: { width: 12, color: [[1, LINE_2]] } },
    axisTick: { show: false }, splitLine: { show: false }, pointer: { show: false },
    axisLabel: { show: false },
    splitNumber: 2, detail: { show: false }, data: [{ value: d1.value.nps }]
  }]
}))

// 体验形象：按得分排行，一种颜色
const imageOpt = computed(() => rankBarOption(d3.value.image.map(([name, value]) => ({ name, value })), { unit: '', share: false, labelWidth: 48 }))

// 各维度满意度：每张雷达图只有一组数据，统一用第 1 色，浅色填充
const radar = (d) => ({
  tooltip: { trigger: 'item' },
  radar: { indicator: d.items.map(([name]) => ({ name, max: 5, min: 3 })), radius: '56%', axisName: { color: INK_2, fontSize: 11 } },
  series: [{
    type: 'radar', name: d.name, symbol: 'circle', symbolSize: 4,
    lineStyle: { color: BLUE, width: 2 }, itemStyle: { color: BLUE }, areaStyle: { color: BLUE, opacity: 0.12 },
    data: [{ value: d.items.map((x) => x[1]), name: m4.value }]
  }]
})
</script>

<style scoped>
.brand { display: flex; flex-direction: column; gap: 16px; }
.row3 { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 16px; }
.panel { display: flex; flex-direction: column; min-width: 0; background: var(--uem-surface); border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); padding: 16px 20px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.panel-head b { font-size: var(--uem-fs-md); color: var(--uem-ink); font-weight: 600; }
.panel-head small { color: var(--uem-ink-3); font-size: var(--uem-fs-xs); margin-left: 12px; }
.nps { display: flex; align-items: center; }
.nps-num { flex: 1; text-align: center; }
.nps-num span { display: block; color: var(--uem-ink-2); font-size: var(--uem-fs-sm); }
.nps-num b { display: block; margin-top: 4px; font-size: 32px; font-weight: 600; line-height: 1.2; color: var(--uem-ink); }
.gauge-wrap { flex: 1; position: relative; min-width: 0; }
.gauge { height: 150px; }
.gauge-scale { position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); width: 156px; display: flex; justify-content: space-between; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.note { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); line-height: 1.6; margin: 8px 0 0; }
.ages { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; gap: 12px; }
.age { display: grid; grid-template-columns: 72px minmax(0, 1fr) 60px; align-items: center; gap: 12px; font-size: var(--uem-fs-sm); color: var(--uem-ink-2); }
.age-track { height: 8px; border-radius: 4px; background: var(--uem-line-2); overflow: hidden; }
.age-fill { height: 100%; border-radius: 4px; background: #2a78d6; }
.age-val { text-align: right; color: var(--uem-ink); font-variant-numeric: tabular-nums; }
.image { flex: 1; min-height: 220px; }
.dims { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.dim-title { text-align: center; color: var(--uem-ink-2); font-size: var(--uem-fs); }
.dim-title b { margin-left: 8px; font-size: var(--uem-fs-lg); font-weight: 600; color: var(--uem-ink); }
.radar { height: 240px; }
@media (max-width: 1280px) { .row3, .dims { grid-template-columns: 1fr 1fr; } }
</style>

<!-- 体验问题 · 统计视图：整体视图 #/allView ，产品维度 #/productView -->
<template>
  <div class="stat">
    <div class="filters">
      <template v-if="mode === 'product'">
        <span class="lbl">产品</span>
        <el-select v-model="draft.products" multiple collapse-tags filterable clearable placeholder="请选择产品" class="product">
          <el-option v-for="p in products" :key="p" :label="p" :value="p" />
        </el-select>
      </template>
      <span class="lbl">时间</span>
      <el-date-picker v-model="draft.from" type="date" value-format="YYYY-MM-DD" placeholder="请选择" class="day" />
      <span class="dash">-</span>
      <el-date-picker v-model="draft.to" type="date" value-format="YYYY-MM-DD" placeholder="请选择" class="day" />
      <el-button type="primary" @click="query">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <div class="range-line">
      <template v-if="mode === 'product'">
        <span class="range-k">产品：</span>
        <b>{{ applied.products.join('、') || '未选择' }}</b>
        <span class="range-d">{{ slash(applied.from) }}-{{ slash(applied.to) }}</span>
      </template>
      <template v-else>
        <div class="range-k">数据区间：</div>
        <div class="range-v">{{ slash(applied.from) }}-{{ slash(applied.to) }}</div>
      </template>
    </div>

    <div class="kpis">
      <div class="kpi kpi-red">
        <div class="k-title">体验问题数量</div>
        <div class="num">{{ data.problem.total }}<small>条</small></div>
      </div>
      <div class="kpi kpi-red kpi-split">
        <div v-for="m in problemMetrics" :key="m.key" class="metric">
          <div>
            <div class="k-title">{{ m.title }}</div>
            <div class="num">{{ m.value }}<small>条</small></div>
          </div>
          <div class="side">
            <div class="ring-cap">{{ m.rateLabel }}</div>
            <div class="ring-box">
              <div class="ring" :style="{ '--p': m.rate + '%' }" />
              <span class="ring-text">{{ m.rate }} %</span>
            </div>
            <button type="button" class="reason" @click="openReason(m.reason)">{{ m.reasonLabel }}</button>
          </div>
        </div>
      </div>
      <div class="kpi kpi-blue">
        <div class="k-title">优化建议数量</div>
        <div class="num">{{ data.suggestion.total }}<small>条</small></div>
      </div>
      <div class="kpi kpi-blue kpi-adopt">
        <div>
          <div class="k-title">优化建议采纳数量</div>
          <div class="num">{{ data.suggestion.adopted }}<small>条</small></div>
        </div>
        <div class="side solo">
          <div class="ring-cap">采纳率</div>
          <div class="ring-box">
            <div class="ring" :style="{ '--p': sugRate + '%' }" />
            <span class="ring-text">{{ sugRate }} %</span>
          </div>
          <button type="button" class="reason" @click="openReason('suggestionReject')">未采纳原因</button>
        </div>
      </div>
    </div>

    <div :class="mode === 'all' ? 'charts charts-4' : 'charts charts-3'">
      <div class="chart-card">
        <div class="c-title">体验问题分级情况</div>
        <EChart class="chart" :option="levelOption" />
      </div>
      <div v-if="mode === 'all'" class="chart-card">
        <div class="c-title">体验问题所属产品情况</div>
        <EChart class="chart" :option="problemProductOption" />
      </div>
      <div v-if="mode === 'all'" class="chart-card">
        <div class="c-title">优化建议所属产品情况</div>
        <EChart class="chart" :option="suggestProductOption" />
      </div>
      <div v-if="mode === 'all'" class="chart-card">
        <div class="c-title">优化建议热词TOP10</div>
        <EChart class="chart" :option="wordOption" />
      </div>
      <div v-if="mode === 'product'" class="chart-card">
        <div class="c-title">体验问题发现阶段情况</div>
        <EChart class="chart" :option="stageOption" />
      </div>
      <div v-if="mode === 'product'" class="chart-card">
        <div class="c-title">优化建议来源</div>
        <EChart class="chart tall" :option="sourceOption" />
      </div>
    </div>

    <div :class="mode === 'all' ? 'charts charts-3' : 'charts charts-1'">
      <div v-if="mode === 'all'" class="chart-card">
        <div class="c-title">体验问题发现阶段情况</div>
        <EChart class="chart" :option="stageOption" />
      </div>
      <div class="chart-card">
        <div class="c-title">体验问题各版本分布情况</div>
        <EChart class="chart tall" :option="versionOption" />
      </div>
      <div v-if="mode === 'all'" class="chart-card">
        <div class="c-title">优化建议来源</div>
        <EChart class="chart tall" :option="sourceOption" />
      </div>
    </div>

    <el-dialog v-model="reasonOpen" :title="reasonTitle" width="520px">
      <p v-if="!reasonRows.length" class="empty-reason">该区间内没有对应记录</p>
      <el-table v-else :data="reasonRows" size="small">
        <el-table-column prop="name" label="原因" min-width="220" />
        <el-table-column prop="value" label="数量" width="80" align="right" />
        <el-table-column label="占比" width="90" align="right">
          <template #default="{ row }">{{ truncRate(row.value, reasonTotal) }}%</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import EChart from '@/components/EChart.vue'
import { products } from '@/mock'
import { snapshot, truncRate, PRODUCT_SHOWCASE, PRODUCT_RANGE, ALL_RANGE } from '@/mock/statView'
import { BLUE, ORDINAL, INK_3, LINE, LINE_2, rankBarOption } from '@/config/charts'

const props = defineProps({ mode: { type: String, default: 'all' } })

const defaults = () =>
  props.mode === 'product'
    ? { products: [PRODUCT_SHOWCASE], from: PRODUCT_RANGE[0], to: PRODUCT_RANGE[1] }
    : { products: [], from: ALL_RANGE[0], to: ALL_RANGE[1] }

const draft = reactive(defaults())
const applied = ref({ ...defaults(), products: [...defaults().products] })

const data = computed(() => snapshot({ mode: props.mode, products: applied.value.products, from: applied.value.from, to: applied.value.to }))
const slash = (d) => (d || '').replaceAll('-', '/')
const sugRate = computed(() => truncRate(data.value.suggestion.adopted, data.value.suggestion.total))
const problemMetrics = computed(() => [
  { key: 'adopt', title: '体验问题采纳数量', value: data.value.problem.adopted, rateLabel: '采纳率', rate: truncRate(data.value.problem.adopted, data.value.problem.total), reason: 'problemReject', reasonLabel: '未采纳原因' },
  { key: 'solve', title: '体验问题解决数量', value: data.value.problem.solved, rateLabel: '解决率', rate: truncRate(data.value.problem.solved, data.value.problem.total), reason: 'problemUnsolved', reasonLabel: '未解决原因' }
])

function query() {
  if (!draft.from || !draft.to) return ElMessage.warning('请选择时间')
  if (draft.from > draft.to) return ElMessage.warning('开始时间不能晚于结束时间')
  if (props.mode === 'product' && !draft.products.length) return ElMessage.warning('请选择产品')
  applied.value = { products: [...draft.products], from: draft.from, to: draft.to }
}
function reset() {
  const d = defaults()
  draft.products = [...d.products]
  draft.from = d.from
  draft.to = d.to
  query()
}

const reasonOpen = ref(false)
const reasonKey = ref('')
const reasonMap = computed(() => ({
  problemReject: { title: '未采纳原因', rows: data.value.problem.rejectReasons },
  problemUnsolved: { title: '未解决原因', rows: data.value.problem.unsolvedReasons },
  suggestionReject: { title: '未采纳原因', rows: data.value.suggestion.rejectReasons }
}))
const reasonTitle = computed(() => reasonMap.value[reasonKey.value]?.title || '')
const reasonRows = computed(() => reasonMap.value[reasonKey.value]?.rows || [])
const reasonTotal = computed(() => reasonRows.value.reduce((n, r) => n + r.value, 0))
const openReason = (key) => {
  reasonKey.value = key
  reasonOpen.value = true
}

// 分级、发现阶段：类别少且有先后，用横向条形并标出数量与占比；分级越严重颜色越深
const LEVELS = ['一级', '二级', '三级']
const levelOption = computed(() => rankBarOption(data.value.problem.levels, { sort: false, keepZero: true, showPct: true, labelWidth: 48, colorOf: (n) => ORDINAL[LEVELS.indexOf(n)] ?? BLUE }))
const stageOption = computed(() => rankBarOption(data.value.problem.stages, { sort: false, keepZero: true, showPct: true, labelWidth: 64 }))
// 来源、产品、热词：按数量排行，一组数据一种颜色
const sourceOption = computed(() => rankBarOption(data.value.suggestion.sources, { limit: 12, labelWidth: 132 }))
const problemProductOption = computed(() => rankBarOption(data.value.problem.products, { limit: 10, labelWidth: 84 }))
const suggestProductOption = computed(() => rankBarOption(data.value.suggestion.products, { limit: 10, labelWidth: 84 }))
const wordOption = computed(() => rankBarOption(data.value.suggestion.words, { unit: '次', limit: 10, labelWidth: 48 }))

// 版本分布：版本号本身有先后，保留纵向柱图
const versionOption = computed(() => {
  const list = data.value.problem.versions
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(31, 35, 41, 0.04)' } }, formatter: (ps) => `版本 ${ps[0].axisValue}：${ps[0].value} 条` },
    grid: { left: 36, right: 12, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: list.map((d) => d.name), axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, axisLabel: { color: INK_3, fontSize: 11, interval: 0 } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: INK_3, fontSize: 11 }, splitLine: { lineStyle: { color: LINE_2 } } },
    series: [{ type: 'bar', data: list.map((d) => d.value), barMaxWidth: 16, itemStyle: { color: BLUE, borderRadius: [4, 4, 0, 0] } }]
  }
})
</script>


<style scoped>
.stat { padding: 0; }
.filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; padding: 14px 20px; background: var(--uem-surface); border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); }
.filters .el-button + .el-button { margin-left: 0; }
.lbl { color: var(--uem-ink-2); font-size: var(--uem-fs-sm); }
.dash { color: var(--uem-ink-4); }
.product { width: 320px; }
.day { width: 160px; }
.range-line { margin: 4px 0 12px; color: var(--uem-ink-2); font-size: var(--uem-fs-sm); display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap; }
.range-k { color: var(--uem-ink-3); }
.range-d { margin-left: 16px; color: var(--uem-ink-3); font-size: var(--uem-fs-sm); }
.range-v { font-weight: 600; color: var(--uem-ink); }

.kpis { display: grid; grid-template-columns: 1.05fr 1.55fr 1.05fr 1.2fr; gap: 12px; }
.kpi {
  position: relative; min-height: 140px; border-radius: var(--uem-radius-lg);
  padding: 16px 18px 14px; background: var(--uem-surface); border: 1px solid var(--uem-line); color: var(--uem-ink);
}
.k-title { font-size: var(--uem-fs-sm); color: var(--uem-ink-2); }
.num { margin-top: 16px; font-size: var(--uem-fs-3xl); font-weight: 600; line-height: 1.1; }
.num small { margin-left: 3px; font-size: var(--uem-fs-sm); font-weight: 500; color: var(--uem-ink-3); }
.kpi-split { display: flex; flex-direction: column; justify-content: space-between; gap: 12px; padding-bottom: 12px; }
.kpi-split .metric + .metric { padding-top: 12px; border-top: 1px solid var(--uem-line-2); }
.kpi-split .num { margin-top: 6px; font-size: var(--uem-fs-2xl); }
.kpi-adopt { display: flex; justify-content: space-between; align-items: center; }
.metric { display: flex; justify-content: space-between; align-items: center; }
.side { display: flex; flex-direction: column; align-items: center; min-width: 84px; }
.side.solo { margin-top: 2px; }
.ring-cap { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); margin-bottom: 4px; }
.ring-box { position: relative; width: 72px; height: 72px; }
.ring {
  width: 100%; height: 100%; border-radius: 50%;
  background: conic-gradient(#2a78d6 var(--p), var(--uem-line-2) 0);
  -webkit-mask: radial-gradient(farthest-side, transparent 74%, #000 75%);
  mask: radial-gradient(farthest-side, transparent 74%, #000 75%);
}
.ring-text { position: absolute; inset: 0; display: grid; place-items: center; font-size: var(--uem-fs-xs); font-weight: 600; color: var(--uem-ink); }
.reason {
  margin-top: 6px; padding: 0 8px; height: 22px; border-radius: var(--uem-radius-sm); border: 1px solid var(--uem-line);
  background: var(--uem-surface); color: var(--uem-ink-2); font-size: var(--uem-fs-xs); cursor: pointer;
}
.reason:hover { border-color: #cfd4db; color: var(--uem-ink); }

.charts { display: grid; gap: 12px; margin-top: 12px; }
.charts-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.charts-3 { grid-template-columns: 1fr 1.15fr 1.25fr; }
.charts-1 { grid-template-columns: 1fr; }
.chart-card { background: var(--uem-surface); border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); padding: 14px 14px 4px; min-width: 0; }
.c-title { font-size: var(--uem-fs); font-weight: 600; color: var(--uem-ink); padding: 0 4px; }
.chart { height: 260px; }
.tall { height: 300px; }
.empty-reason { margin: 8px 0 16px; color: var(--uem-ink-3); }

@media (max-width: 1280px) {
  .kpis, .charts-4, .charts-3 { grid-template-columns: 1fr 1fr; }
}
</style>

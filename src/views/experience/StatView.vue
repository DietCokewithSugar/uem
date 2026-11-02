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
        <Bird class="bird" />
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
        <Bird class="bird" />
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
        <EChart class="chart bubble-chart" :option="bubbleOption" />
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
        <EChart class="chart" :option="sourceOption" />
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
        <EChart class="chart" :option="sourceOption" />
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
import { snapshot, truncRate, LEVEL_COLOR, STAGE_COLOR, SOURCE_COLORS, BAR_RED, BAR_BLUE, PRODUCT_SHOWCASE, PRODUCT_RANGE, ALL_RANGE } from '@/mock/statView'

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

const axis = { axisLine: { lineStyle: { color: '#e5e8ee' } }, axisTick: { show: false }, axisLabel: { color: '#888', fontSize: 11 } }
const valueAxis = { type: 'value', minInterval: 1, axisLabel: { color: '#999', fontSize: 11 }, splitLine: { lineStyle: { color: '#f0f2f5' } } }
const tip = { trigger: 'item', formatter: (p) => `${p.name}：${p.value} 条（${p.percent}%）` }

function pieOption(list, colorOf, { radius, center, legend }) {
  const rows = list.filter((d) => d.value > 0).map((d) => ({ name: d.name, value: d.value, itemStyle: { color: colorOf(d.name) } }))
  return {
    tooltip: tip,
    legend,
    series: [{
      type: 'pie',
      radius,
      center,
      avoidLabelOverlap: true,
      label: { formatter: '{c}', color: '#555', fontSize: 13 },
      labelLine: { length: 8, length2: 6 },
      data: rows
    }]
  }
}
const legendBottom = { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#666', fontSize: 12 } }
const legendRight = { orient: 'vertical', right: 4, top: 'middle', icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 5, textStyle: { color: '#666', fontSize: 11 } }

const levelOption = computed(() => pieOption(data.value.problem.levels, (n) => LEVEL_COLOR[n], { radius: '58%', center: ['50%', '44%'], legend: legendBottom }))
const stageOption = computed(() =>
  pieOption(data.value.problem.stages, (n) => STAGE_COLOR[n], {
    radius: ['46%', '68%'],
    center: ['40%', '50%'],
    legend: { ...legendRight, top: 'middle', bottom: undefined }
  })
)
const sourceOption = computed(() =>
  pieOption(data.value.suggestion.sources, (n) => SOURCE_COLORS[data.value.suggestion.sources.findIndex((s) => s.name === n) % SOURCE_COLORS.length], {
    radius: ['42%', '64%'],
    center: ['34%', '50%'],
    legend: legendRight
  })
)

function vBar(list, color) {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (ps) => `${ps[0].axisValue}：${ps[0].value} 条` },
    grid: { left: 36, right: 12, top: 24, bottom: list.length > 6 ? 64 : 36 },
    xAxis: { type: 'category', data: list.map((d) => d.name), ...axis, axisLabel: { ...axis.axisLabel, interval: 0, rotate: list.length > 6 ? 32 : 0 } },
    yAxis: valueAxis,
    series: [{ type: 'bar', data: list.map((d) => d.value), barMaxWidth: 16, itemStyle: { color, borderRadius: [3, 3, 0, 0] } }]
  }
}
const problemProductOption = computed(() => vBar(data.value.problem.products, BAR_RED))
const versionOption = computed(() => vBar(data.value.problem.versions, BAR_RED))
const wordOption = computed(() => {
  const list = data.value.suggestion.words
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (ps) => `${ps[0].axisValue}：${ps[0].value}` },
    grid: { left: 48, right: 28, top: 12, bottom: 24 },
    xAxis: { ...valueAxis, type: 'value' },
    yAxis: { type: 'category', data: list.map((d) => d.name), inverse: true, ...axis, axisLabel: { ...axis.axisLabel, color: '#555' } },
    series: [{ type: 'bar', data: list.map((d) => d.value), barMaxWidth: 12, itemStyle: { color: BAR_BLUE, borderRadius: [0, 3, 3, 0] } }]
  }
})
const bubbleOption = computed(() => {
  const list = data.value.suggestion.products
  const cols = 3
  return {
    tooltip: { formatter: (p) => `${p.data.name}：${p.data.value} 条` },
    grid: { left: 4, right: 4, top: 16, bottom: 8 },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{
      type: 'scatter',
      data: list.map((b, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const rows = Math.ceil(list.length / cols)
        return {
          name: b.name,
          value: [16 + (col * 68) / Math.max(cols - 1, 1), 86 - (row * 72) / Math.max(rows - 1, 1), b.value]
        }
      }),
      symbolSize: (val) => Math.max(58, Math.min(74, 36 + Math.sqrt(val[2]) * 4)),
      itemStyle: { color: (p) => SOURCE_COLORS[p.dataIndex % SOURCE_COLORS.length], opacity: 0.92 },
      label: { show: true, formatter: '{b}', color: '#fff', fontSize: 10 }
    }]
  }
})
</script>

<script>
// 卡片右侧的白色飞鸟，对应截图里的装饰图形
const Bird = {
  template: `<svg class="bird-svg" viewBox="0 0 120 120" aria-hidden="true">
    <path fill="rgba(255,255,255,.92)" d="M18 68c22-6 36-30 46-52 1 22 12 36 32 42-20 6-34 20-42 40-8-12-22-22-36-30z"/>
    <path fill="rgba(255,255,255,.55)" d="M64 20c10 16 14 32 8 48 14-6 28-6 42 2-16 2-30 12-38 28 4-22 0-42-12-78z"/>
  </svg>`
}
export default { components: { Bird } }
</script>

<style scoped>
.stat { padding: 8px 20px 32px; }
.filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.lbl { color: #333; }
.dash { color: #999; }
.product { width: 320px; }
.day { width: 160px; }
.range-line { margin: 4px 0 14px; color: #333; }
.range-k { color: #666; }
.range-d { margin-left: 16px; color: #888; font-size: 13px; }
.range-v { margin-top: 4px; font-weight: 600; }

.kpis { display: grid; grid-template-columns: 1.05fr 1.55fr 1.05fr 1.2fr; gap: 14px; }
.kpi {
  position: relative; overflow: hidden; min-height: 148px; border-radius: 8px; color: #fff;
  padding: 16px 18px 14px; box-shadow: 0 6px 16px rgba(180, 40, 50, 0.08);
}
.kpi-red { background: linear-gradient(160deg, #f39198 0%, #ef6672 55%, #e85a68 100%); }
.kpi-blue { background: linear-gradient(160deg, #64a6f8 0%, #3d8ef3 60%, #347fe0 100%); box-shadow: 0 6px 16px rgba(40, 90, 180, 0.12); }
.k-title { font-size: 14px; opacity: 0.95; }
.num { margin-top: 18px; font-size: 40px; font-weight: 500; line-height: 1; letter-spacing: 0.5px; }
.num small { margin-left: 2px; font-size: 16px; font-weight: 400; }
.bird { position: absolute; right: 8px; top: 50%; width: 108px; height: 108px; transform: translateY(-50%); }
.kpi-split { display: flex; flex-direction: column; justify-content: space-between; gap: 8px; padding-bottom: 10px; }
.kpi-split .num { margin-top: 6px; font-size: 32px; }
.kpi-adopt { display: flex; justify-content: space-between; align-items: center; }
.metric { display: flex; justify-content: space-between; align-items: center; }
.side { display: flex; flex-direction: column; align-items: center; min-width: 84px; }
.side.solo { margin-top: 2px; }
.ring-cap { font-size: 12px; margin-bottom: 2px; }
.ring-box { position: relative; width: 84px; height: 84px; }
.ring {
  width: 100%; height: 100%; border-radius: 50%;
  background: conic-gradient(#fff var(--p), rgba(255, 255, 255, 0.28) 0);
  -webkit-mask: radial-gradient(farthest-side, transparent 68%, #000 69%);
  mask: radial-gradient(farthest-side, transparent 68%, #000 69%);
}
.ring-text { position: absolute; inset: 0; display: grid; place-items: center; font-size: 12px; font-weight: 600; }
.reason {
  margin-top: 4px; padding: 0 8px; height: 22px; border-radius: 11px; border: 1px solid rgba(255, 255, 255, 0.75);
  background: transparent; color: #fff; font-size: 12px; cursor: pointer;
}
.reason:hover { background: rgba(255, 255, 255, 0.16); }

.charts { display: grid; gap: 14px; margin-top: 14px; }
.charts-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.charts-3 { grid-template-columns: 1fr 1.15fr 1.25fr; }
.charts-1 { grid-template-columns: 1fr; }
.chart-card { background: #fff; border-radius: 8px; padding: 12px 12px 4px; min-width: 0; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); }
.c-title { font-size: 15px; font-weight: 600; color: #333; padding: 2px 6px 0; }
.chart { height: 250px; }
.bubble-chart { height: 300px; }
.tall { height: 280px; }
.empty-reason { margin: 8px 0 16px; color: #888; }

@media (max-width: 1280px) {
  .kpis, .charts-4, .charts-3 { grid-template-columns: 1fr 1fr; }
}
</style>

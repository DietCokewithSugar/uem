<!-- 声音看板 #/journeyVoiceAnalyze：用户声音总览 / 功能监测 / 实时监测（本页内容使用 AI 分析计算） -->
<template>
  <div class="board">
    <div class="top">
      <div class="tabs">
        <span v-for="t in tabs" :key="t.key" class="tab" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}<el-icon><component :is="t.icon" /></el-icon></span>
      </div>
      <div class="selects">
        <el-select v-model="product" size="small" class="red"><el-option v-for="p in productOpts" :key="p" :label="p" :value="p" /></el-select>
        <el-select v-model="month" size="small" class="red month"><el-option v-for="m in boardMonths" :key="m" :label="m" :value="m" /></el-select>
      </div>
    </div>
    <div class="ai-note">本页内容使用AI分析计算</div>

    <!-- 用户声音总览 -->
    <template v-if="tab === 'overview'">
      <div class="kpis">
        <div class="kpi k1"><div class="k-lbl">有效用户声音总数</div><div class="k-val">{{ d.valid }}<small>条</small></div><div class="k-sub">较上期 {{ d.diff }} 条　全量声音 {{ d.all }} 条</div></div>
        <div class="kpi k2">
          <div class="k-lbl">用户声音压力指数等级 <el-tooltip content="综合负面声音占比、情绪强度与声音增速计算，共五级"><el-icon><InfoFilled /></el-icon></el-tooltip></div>
          <div class="k-val txt">{{ d.pressure }}</div><div class="k-sub">上期用户声音压力指数等级：{{ d.lastPressure }}</div>
        </div>
        <div class="kpi k3"><div class="k-lbl">用户声音集中维度</div><div class="k-val txt">{{ d.focusDim }}</div></div>
      </div>

      <div class="problems">
        <div class="p-title"><el-icon><MagicStick /></el-icon>重要典型问题</div>
        <el-carousel height="190px" indicator-position="outside" :autoplay="false" arrow="never">
          <el-carousel-item v-for="(chunk, ci) in problemPages" :key="ci">
            <div class="p-grid">
              <div v-for="p in chunk" :key="p" class="p-item" @click="filterByProblem(p)">• {{ p }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="charts">
        <Panel title="有效用户声音总数变化趋势"><EChart class="h260" :option="areaOpt" /></Panel>
        <Panel title="用户声音压力指数变化趋势"><EChart class="h260" :option="levelOpt(d.pressureTrend, pressureLevels, true)" /></Panel>
        <Panel title="各产品用户声音数量"><EChart class="h260" :option="barOpt(d.byProduct, '#4a8fe7')" /></Panel>
        <Panel title="用户声音维度分布"><EChart class="h260" :option="barOpt(d.byDim, '#4a8fe7')" /></Panel>
        <Panel title="用户声音情绪指数变化趋势"><EChart class="h260" :option="levelOpt(d.emotionTrend, emoLevels)" /></Panel>
        <Panel title="各产品用户声音情绪指数"><EChart class="h260" :option="emoProductOpt" /></Panel>
      </div>

      <Panel ref="detailRef" title="用户声音明细" class="detail"><VoiceTable :key="detailKey" /></Panel>
    </template>

    <!-- 功能监测（截图未覆盖，按总览口径推测） -->
    <Panel v-else-if="tab === 'func'" title="功能监测" sub="按功能栏目统计负面声音与压力">
      <el-table :data="funcStats" size="small">
        <el-table-column prop="product" label="产品" min-width="140" />
        <el-table-column prop="column" label="功能栏目" min-width="120" />
        <el-table-column prop="total" label="声音数" width="90" sortable />
        <el-table-column prop="neg" label="负面声音" width="100" sortable />
        <el-table-column label="负面占比" width="180">
          <template #default="{ row }"><el-progress :percentage="row.ratio" :color="row.ratio > 60 ? '#c7000b' : '#f2a33a'" /></template>
        </el-table-column>
        <el-table-column prop="level" label="压力等级" width="110" />
      </el-table>
    </Panel>

    <!-- 实时监测（截图未覆盖，推测） -->
    <Panel v-else title="实时监测" sub="高度负面声音实时预警，推送给「实时监测收件人」">
      <el-timeline>
        <el-timeline-item v-for="v in alerts" :key="v.id" :timestamp="v.time" :type="v.emotion === '高度负面' ? 'danger' : 'warning'">
          <b>{{ v.product }} · {{ v.column }}</b>　{{ v.desc }} <el-tag size="small" type="danger" effect="plain">{{ v.emotion }}</el-tag>
        </el-timeline-item>
      </el-timeline>
    </Panel>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import EChart from '@/components/EChart.vue'
import Panel from '@/components/Panel.vue'
import VoiceTable from './VoiceTable.vue'
import { boardData as d, boardMonths, pressureLevels, voices, voiceProducts } from '@/mock/voice'

const tabs = [{ key: 'overview', label: '用户声音总览', icon: 'DataAnalysis' }, { key: 'func', label: '功能监测', icon: 'Aim' }, { key: 'realtime', label: '实时监测', icon: 'Monitor' }]
const tab = ref('overview')
const productOpts = ['全部产品', ...voiceProducts.map((p) => p.name)]
const product = ref('全部产品')
const month = ref(boardMonths.at(-1))
const emoLevels = ['高度负面', '中度负面', '轻度负面', '中性', '正面']

const problemPages = computed(() => [d.problems.slice(0, 12), d.problems.slice(12)])
const detailRef = ref()
const detailKey = ref(0)
const filterByProblem = async () => {
  detailKey.value++
  await nextTick()
  detailRef.value?.$el.scrollIntoView({ behavior: 'smooth' })
}

const areaOpt = {
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', boundaryGap: false, data: boardMonths },
  yAxis: { type: 'value' },
  series: [{ type: 'line', smooth: true, symbolSize: 6, lineStyle: { color: '#f2c46b' }, itemStyle: { color: '#f2c46b' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#fbe1a6' }, { offset: 1, color: '#fff8e8' }] } }, data: d.validTrend }]
}
// 等级折线：越负面越红，用表情标注
const face = (lv, max) => (lv >= max - 1 ? '😊' : lv === Math.floor(max / 2) ? '😐' : '😟')
const levelOpt = (data, levels, reverse = false) => ({
  grid: { left: 80, right: 20, top: 30, bottom: 30 },
  tooltip: { trigger: 'axis', formatter: (p) => `${p[0].axisValue}：${levels[p[0].value]}` },
  xAxis: { type: 'category', data: boardMonths },
  yAxis: { type: 'value', min: 0, max: levels.length - 1, interval: 1, axisLabel: { formatter: (v) => levels[v] } },
  series: [{
    type: 'line', smooth: true, symbolSize: 18, lineStyle: { color: '#ccc' },
    itemStyle: { color: (p) => ((reverse ? p.value >= 3 : p.value <= 1) ? '#e8545c' : '#f2a33a') },
    label: { show: true, formatter: (p) => (reverse ? (p.value >= 3 ? '😣' : '😟') : face(p.value, levels.length)), fontSize: 14 },
    data
  }]
})
const barOpt = (list, color) => ({
  grid: { left: 50, right: 10, top: 20, bottom: 60 },
  tooltip: { trigger: 'axis' },
  dataZoom: list.length > 10 ? [{ type: 'slider', height: 8, bottom: 4, end: 70, showDetail: false }] : [],
  xAxis: { type: 'category', data: list.map((x) => x[0]), axisLabel: { interval: 0, fontSize: 10, width: 60, overflow: 'break' } },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', barWidth: 14, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color }, { offset: 1, color: '#d6e6fb' }] } }, data: list.map((x) => x[1]) }]
})
const emoProductOpt = {
  grid: { left: 80, right: 20, top: 20, bottom: 70 },
  tooltip: { formatter: (p) => `${p.name}：${emoLevels[p.value[1]]}` },
  xAxis: { type: 'category', data: d.emotionByProduct.map((x) => x[0]), axisLabel: { interval: 0, fontSize: 10, rotate: 35 } },
  yAxis: { type: 'value', min: 0, max: 4, interval: 1, axisLabel: { formatter: (v) => emoLevels[v] } },
  series: [{
    type: 'scatter', symbolSize: 18,
    itemStyle: { color: (p) => (p.value[1] === 0 ? '#e8545c' : '#7cc9b8') },
    label: { show: true, formatter: (p) => (p.value[1] === 0 ? '😣' : '😊'), fontSize: 14 },
    data: d.emotionByProduct.map(([n, v]) => [n, v])
  }]
}

// 功能监测：由声音明细实时统计
const levelOf = (r) => pressureLevels[Math.min(4, Math.floor(r / 20))]
const funcStats = computed(() => {
  const m = {}
  voices.filter((v) => product.value === '全部产品' || v.product === product.value).forEach((v) => {
    const k = `${v.product}|${v.column}`
    const x = (m[k] ||= { product: v.product, column: v.column, total: 0, neg: 0 })
    x.total++
    if (v.emotion.includes('负面')) x.neg++
  })
  return Object.values(m).map((x) => ({ ...x, ratio: Math.round((x.neg / x.total) * 100), level: levelOf((x.neg / x.total) * 100) })).sort((a, b) => b.neg - a.neg)
})
const alerts = computed(() => voices.filter((v) => /中度|高度/.test(v.emotion) && (product.value === '全部产品' || v.product === product.value)).slice(0, 15))
</script>

<style scoped>
.board { padding: 0 20px 30px; }
.top { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0d9d9; background: linear-gradient(90deg, #fdf1f0, transparent); margin: 0 -20px; padding: 10px 20px; }
.tabs { display: flex; gap: 32px; }
.tab { font-size: 15px; font-weight: 600; color: #333; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding-bottom: 4px; }
.tab.active { color: var(--uem-red); border-bottom: 2px solid var(--uem-red); }
.selects { display: flex; gap: 10px; }
.selects .el-select { width: 180px; }
.selects .month { width: 120px; }
.red :deep(.el-select__wrapper) { background: var(--uem-red); box-shadow: none; }
.red :deep(.el-select__placeholder), .red :deep(.el-select__caret) { color: #fff; }
.ai-note { text-align: right; font-size: 11px; color: #999; margin: 8px 0; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.kpi { border-radius: 6px; padding: 18px 24px; min-height: 120px; }
.k1 { background: linear-gradient(120deg, #fff 40%, #fde3e3); }
.k2 { background: linear-gradient(120deg, #fff 40%, #dff5ea); }
.k3 { background: linear-gradient(120deg, #fff 40%, #dceafb); }
.k-lbl { font-size: 15px; color: #333; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.k-val { font-size: 26px; font-family: Georgia, serif; margin: 10px 0 6px; color: #222; }
.k-val small { font-size: 12px; margin-left: 2px; }
.k-val.txt { font-family: inherit; font-weight: 700; }
.k-sub { font-size: 12px; color: #888; }
.problems { margin-top: 16px; border-radius: 6px; padding: 14px 18px 4px; background: linear-gradient(120deg, #eef4fd, #e3edfb); }
.p-title { display: flex; align-items: center; gap: 6px; color: #2f5fbf; font-weight: 600; font-size: 15px; margin-bottom: 10px; }
.p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.p-item { background: rgba(255, 255, 255, 0.85); border-radius: 4px; padding: 10px 14px; font-size: 13px; color: #3a5ea8; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.p-item:hover { background: #fff; }
.charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
.h260 { height: 260px; }
.detail :deep(.search-form), .detail :deep(.uem-card) { padding: 0; }
</style>

<!-- 声音看板 · 实时监测：近 3 日 UVSI 走势、各产品压力、实时典型问题 -->
<template>
  <div>
    <div class="update"><span class="dot" />更新时间：{{ r.updateTime }}</div>
    <KpiRow :items="kpis" />

    <div class="charts">
      <Panel title="近3日用户声音压力指数变化趋势"><EChart class="h300" :option="uvsiOpt" /></Panel>
      <Panel title="主要产品用户声音压力指数"><EChart class="h300" :option="productOpt" /></Panel>
    </div>

    <div class="rt-problems">
      <div class="p-title"><el-icon><Clock /></el-icon>实时典型问题</div>
      <div class="p-grid">
        <div v-for="p in realtimeProblems.slice(0, 8)" :key="p.id" class="p-card">
          <div>• {{ p.text }}</div>
          <div class="p-meta">{{ p.product }} 覆盖声音：{{ p.voices }}条</div>
        </div>
      </div>
    </div>

    <Panel title="实时典型问题列表" class="block">
      <div class="filters">
        <span>产品</span>
        <el-select v-model="q.product" clearable placeholder="请选择产品"><el-option v-for="p in products" :key="p" :label="p" :value="p" /></el-select>
        <span>提交时间</span>
        <el-date-picker v-model="q.time" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="请选择开始时间" end-placeholder="请选择截止时间" />
        <el-button type="primary" @click="applied = { ...q }; page = 1">查询</el-button>
        <el-button @click="Object.assign(q, { product: '', time: [] }); applied = { product: '', time: [] }">重置</el-button>
      </div>
      <div class="uem-toolbar"><AsyncExport name="实时典型问题列表" :columns="cols" :rows="filtered" compact /></div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="60" :index="(i) => (page - 1) * 10 + i + 1" />
        <el-table-column prop="text" label="典型问题描述" min-width="280" />
        <el-table-column prop="period" label="统计时间" width="300" />
        <el-table-column label="覆盖声音数" width="100"><template #default="{ row }">{{ row.voices }}条</template></el-table-column>
        <el-table-column prop="product" label="产品名称" width="160" />
        <el-table-column label="对应用户声音举例" min-width="300" show-overflow-tooltip><template #default="{ row }">1.{{ row.example }}</template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next" :page-size="10" :total="filtered.length" />
    </Panel>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import EChart from '@/components/EChart.vue'
import Panel from '@/components/Panel.vue'
import AsyncExport from '@/components/AsyncExport.vue'
import KpiRow from './KpiRow.vue'
import { realtime as r, realtimeProblems, pressureLevels } from '@/mock/voice'

const kpis = [
  { label: '用户声音压力指数等级', value: r.pressure, text: true, cmp: `较上一期：${r.pressureCmp}`, tip: '基于用户声音压力指数（UVSI）所在区间判定' },
  { label: '有效用户声音数量', value: r.valid, unit: '条', cmp: `较上期 ${r.validDiff} 条`, tip: '统计周期内经智能模型判定为有效的用户声音' },
  { label: '用户声音压力最高产品', value: r.topProduct, text: true }
]

// 每 3 小时一个点，覆盖近 3 日
const times = r.uvsi.map((_, i) => {
  const d = new Date(2026, 9, 10, 0)
  d.setHours(d.getHours() + i * 3 + 3)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`
})
const uvsiOpt = {
  grid: { left: 40, right: 20, top: 20, bottom: 70 },
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, itemWidth: 14, itemHeight: 2, textStyle: { fontSize: 10 } },
  xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10, interval: 7 } },
  yAxis: { type: 'value', min: -3, max: 2 },
  series: [
    { name: '整体用户声音压力指数（UVSI）值', type: 'line', symbol: 'circle', symbolSize: 4, lineStyle: { color: '#4a7fe0' }, itemStyle: { color: '#4a7fe0' }, data: r.uvsi },
    ...r.thresholds.map(([name, v, color]) => ({ name, type: 'line', symbol: 'none', lineStyle: { color, width: 1.5 }, itemStyle: { color }, data: r.uvsi.map(() => v) }))
  ]
}
const faces = ['🙂', '🙂', '😟', '😣', '😣']
const productOpt = {
  grid: { left: 80, right: 20, top: 20, bottom: 80 },
  tooltip: { formatter: (p) => `${p.value[0]}：${pressureLevels[p.value[1]]}` },
  xAxis: { type: 'category', data: r.byProduct.map((x) => x[0]), axisLabel: { interval: 0, fontSize: 10, rotate: 35 } },
  yAxis: { type: 'value', min: 0, max: 4, interval: 1, axisLabel: { formatter: (v) => pressureLevels[v] } },
  series: [{
    type: 'scatter', symbolSize: 18,
    itemStyle: { color: (p) => (p.value[1] >= 3 ? '#e8545c' : p.value[1] === 2 ? '#f08a8f' : '#f2c43a') },
    label: { show: true, formatter: (p) => faces[p.value[1]], fontSize: 14 },
    data: r.byProduct
  }]
}

const products = [...new Set(realtimeProblems.map((p) => p.product))]
const q = reactive({ product: '', time: [] })
const applied = ref({ product: '', time: [] })
const page = ref(1)
const filtered = computed(() =>
  realtimeProblems.filter((p) => (!applied.value.product || p.product === applied.value.product) && (!applied.value.time?.length || (p.time >= applied.value.time[0] && p.time <= applied.value.time[1])))
)
const rows = computed(() => filtered.value.slice((page.value - 1) * 10, page.value * 10))
const cols = [
  { prop: 'text', label: '典型问题描述' }, { prop: 'period', label: '统计时间' }, { prop: 'voices', label: '覆盖声音数' },
  { prop: 'product', label: '产品名称' }, { prop: 'example', label: '对应用户声音举例' }
]
</script>

<style scoped>
.update { font-size: 12px; color: #666; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--uem-red); }
.charts { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-top: 16px; }
.h300 { height: 300px; }
.rt-problems { margin-top: 16px; border-radius: 6px; padding: 14px 18px; background: linear-gradient(120deg, #eef4fd, #e3edfb); }
.p-title { display: flex; align-items: center; gap: 6px; color: #2f5fbf; font-weight: 600; font-size: 15px; margin-bottom: 10px; }
.p-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.p-card { background: rgba(255, 255, 255, 0.85); border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #3a5ea8; min-height: 72px; display: flex; flex-direction: column; justify-content: space-between; }
.p-meta { text-align: right; font-size: 11px; color: #999; }
.block { margin-top: 16px; }
.filters { display: grid; grid-template-columns: auto 1fr auto 1.4fr auto auto; gap: 12px; align-items: center; font-size: 13px; color: #555; margin-bottom: 16px; }
.filters .el-button + .el-button { margin-left: 0; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

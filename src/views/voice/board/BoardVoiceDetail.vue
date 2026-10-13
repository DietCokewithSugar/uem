<!-- 声音看板 · 用户声音明细（列与筛选项与截图一致） -->
<template>
  <div>
    <el-form :model="form" label-width="80px" class="filters">
      <el-form-item label="产品">
        <el-select v-model="form.product" clearable placeholder="请选择产品"><el-option v-for="p in productNames" :key="p" :label="p" :value="p" /></el-select>
      </el-form-item>
      <el-form-item label="功能栏目"><el-input v-model="form.column" clearable placeholder="请输入功能栏目" /></el-form-item>
      <el-form-item label="旅程行为">
        <el-select v-model="form.action" clearable placeholder="请选择旅程行为"><el-option v-for="a in actions" :key="a" :label="a" :value="a" /></el-select>
      </el-form-item>
      <el-form-item label="ETS维度">
        <el-select v-model="form.dim" clearable placeholder="请选择ETS维度"><el-option v-for="d in etsDims" :key="d" :label="d" :value="d" /></el-select>
      </el-form-item>
      <el-form-item label="情绪指数">
        <el-select v-model="form.emotion" clearable placeholder="请选择情绪指数"><el-option v-for="e in emotions" :key="e" :label="e" :value="e" /></el-select>
      </el-form-item>
      <el-form-item label="声音来源">
        <el-select v-model="form.source" clearable placeholder="请选择声音来源"><el-option v-for="s in voiceSources" :key="s" :label="s" :value="s" /></el-select>
      </el-form-item>
      <el-form-item label="关键字"><el-input v-model="form.keyword" clearable placeholder="请输入关键字" /></el-form-item>
      <el-form-item label="提交时间">
        <el-date-picker v-model="form.time" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="请选择开始时间" end-placeholder="请选择截止时间" />
      </el-form-item>
      <div class="actions">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </el-form>

    <div class="uem-toolbar"><AsyncExport name="用户声音明细" :columns="exportCols" :rows="filtered" compact /></div>
    <el-table :data="rows">
      <el-table-column type="index" label="编号" width="60" :index="(i) => (page - 1) * pageSize + i + 1" />
      <el-table-column prop="desc" label="声音描述" min-width="240" />
      <el-table-column prop="time" label="提出时间" width="160" />
      <el-table-column prop="source" label="声音来源" width="110" />
      <el-table-column prop="product" label="产品" min-width="140" />
      <el-table-column prop="column" label="功能栏目" width="110" />
      <el-table-column prop="journeyAction" label="旅程行为" width="120" />
      <el-table-column prop="dim" label="ETS维度" width="100" />
      <el-table-column label="情绪指数" width="90">
        <template #default="{ row }"><span :class="{ neg: row.score < 0, pos: row.score > 2 }">{{ row.score }}</span></template>
      </el-table-column>
      <el-table-column prop="handled" label="转处理情况" width="110" />
    </el-table>
    <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
  </div>
</template>

<script setup>
import AsyncExport from '@/components/AsyncExport.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { voices, voiceProducts, voiceSources, etsDims, emotions } from '@/mock/voice'

const props = defineProps({ product: { type: String, default: '' } })
const productNames = voiceProducts.map((p) => p.name)
const actions = [...new Set(voices.map((v) => v.journeyAction).filter(Boolean))]
const exportCols = [
  { prop: 'desc', label: '声音描述' }, { prop: 'time', label: '提出时间' }, { prop: 'source', label: '声音来源' }, { prop: 'product', label: '产品' },
  { prop: 'column', label: '功能栏目' }, { prop: 'journeyAction', label: '旅程行为' }, { prop: 'dim', label: 'ETS维度' }, { prop: 'score', label: '情绪指数' },
  { prop: 'handled', label: '转处理情况' }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => voices.filter((v) => v.valid && (!props.product || v.product === props.product)),
  { product: '', column: '', action: '', dim: '', emotion: '', source: '', keyword: '', time: [] },
  (v, q) =>
    match.equals(v.product, q.product) &&
    match.contains(v.column, q.column) &&
    match.equals(v.journeyAction, q.action) &&
    match.equals(v.dim, q.dim) &&
    match.equals(v.emotion, q.emotion) &&
    match.equals(v.source, q.source) &&
    match.contains(v.desc, q.keyword) &&
    match.inRange(v.time.slice(0, 10), q.time)
)
</script>

<style scoped>
.filters { display: grid; grid-template-columns: repeat(3, 1fr) auto; column-gap: 24px; }
.filters :deep(.el-form-item) { margin-bottom: 16px; }
.filters .el-select, .filters :deep(.el-date-editor) { width: 100%; }
.actions { grid-column: 4; grid-row: 1 / span 3; display: flex; gap: 8px; align-items: flex-start; }
.actions .el-button + .el-button { margin-left: 0; }
.pager { margin-top: 16px; justify-content: flex-end; }
.neg { color: var(--uem-red); }
.pos { color: #3c9a5f; }
</style>

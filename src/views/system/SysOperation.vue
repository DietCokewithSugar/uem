<!-- 运营数据 #/sysOperation：按时间维度导出平台运营数据表 -->
<template>
  <div>
    <div class="uem-card bar">
      <span>时间维度</span>
      <el-select v-model="dim" placeholder="请选择" style="width: 360px"><el-option v-for="o in dims" :key="o" :label="o" :value="o" /></el-select>
      <span class="gap" />
      <el-button type="primary" @click="download">导出数据表</el-button>
      <el-button @click="dim = ''">重置</el-button>
    </div>
    <!-- 截图中页面仅有导出功能，以下预览为演示补充 -->
    <div v-if="dim" class="uem-card">
      <div class="title">数据预览（{{ dim }}）</div>
      <el-table :data="rows" size="small">
        <el-table-column v-for="c in cols" :key="c.prop" :prop="c.prop" :label="c.label" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { exportCsv } from '@/components/exportCsv'
import { suggestions, activities, infos, journeys } from '@/mock'
import { voices } from '@/mock/voice'
import { qcReports } from '@/mock/qc'
import { persons } from '@/mock/system'

const dims = ['按年', '按季度', '按月']
const dim = ref('')
const keyOf = (date) => {
  const y = date.slice(0, 4)
  const m = Number(date.slice(5, 7))
  return { 按年: y, 按季度: `${y}-Q${Math.ceil(m / 3)}`, 按月: date.slice(0, 7) }[dim.value]
}
const cols = [
  { prop: 'period', label: '统计周期' }, { prop: 'suggest', label: '新增优化建议' }, { prop: 'done', label: '办结/答复' },
  { prop: 'activity', label: '体验活动' }, { prop: 'voice', label: '用户声音' }, { prop: 'qc', label: '质检报告' }, { prop: 'info', label: '资讯发布' }
]
const rows = computed(() => {
  if (!dim.value) return []
  const m = {}
  const add = (date, k, n = 1) => {
    if (!date) return
    const p = keyOf(date)
    ;(m[p] ||= { period: p, suggest: 0, done: 0, activity: 0, voice: 0, qc: 0, info: 0 })[k] += n
  }
  suggestions.forEach((s) => {
    add(s.submitTime, 'suggest')
    if (s.status.startsWith('已')) add(s.replyTime || s.submitTime, 'done')
  })
  activities.forEach((a) => add(a.submitTime, 'activity'))
  voices.forEach((v) => add(v.time.slice(0, 10), 'voice'))
  qcReports.forEach((r) => add(r.createTime.slice(0, 10), 'qc'))
  infos.forEach((i) => add(i.publishTime, 'info'))
  return Object.values(m).sort((a, b) => b.period.localeCompare(a.period))
})
function download() {
  if (!dim.value) return ElMessage.warning('请选择时间维度')
  exportCsv(`运营数据_${dim.value}`, [...cols, { prop: 'users', label: '平台用户数' }, { prop: 'journeys', label: '灵犀旅程数' }], rows.value.map((r) => ({ ...r, users: persons.length, journeys: journeys.length })))
}
</script>

<style scoped>
.bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.bar .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.title { font-weight: 600; margin-bottom: 10px; }
</style>

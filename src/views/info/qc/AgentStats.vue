<!-- 质检智能体统计 #/agentStatistic：按创建时间下载统计 -->
<template>
  <div>
    <div class="uem-card bar">
      <span class="label">创建时间</span>
      <el-date-picker v-model="range" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="请选择开始时间" end-placeholder="请选择截止时间" class="range" />
      <el-button type="primary" @click="download">下载</el-button>
      <el-button @click="range = []">重置</el-button>
    </div>
    <!-- 统计预览：截图中页面仅有下载功能，此处为演示补充 -->
    <div class="uem-card preview">
      <div class="preview-title">统计预览（共 {{ list.length }} 份报告）</div>
      <el-table :data="byRole" size="small">
        <el-table-column prop="role" label="评估角色" />
        <el-table-column prop="count" label="使用次数" width="120" />
        <el-table-column prop="avg" label="平均评分" width="120" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { qcReports, qcRoles, averageScore, abVoteText } from '@/mock/qc'
import { exportCsv } from '@/components/exportCsv'

const range = ref([])
const list = computed(() => qcReports.filter((r) => !range.value?.length || (r.createTime.slice(0, 10) >= range.value[0] && r.createTime.slice(0, 10) <= range.value[1])))
const byRole = computed(() => {
  const m = {}
  list.value.forEach((r) =>
    r.roleIds.forEach((id) => {
      const x = (m[id] ||= { role: qcRoles.find((q) => q.id === id)?.name || `角色${id}`, count: 0, scored: 0, sum: 0 })
      x.count++
      // AB方案对比报告只记录角色在A、B方案间的选择，不打分，不计入平均评分
      const score = r.type === 'ab' ? null : r.roleViews[id]?.score || averageScore(r.dimensions)
      if (typeof score === 'number') {
        x.scored++
        x.sum += score
      }
    })
  )
  return Object.values(m).map((x) => ({ ...x, avg: x.scored ? (x.sum / x.scored).toFixed(2) : '—' })).sort((a, b) => b.count - a.count)
})

function download() {
  exportCsv('质检智能体统计', [
    { prop: 'title', label: '报告名称' }, { prop: 'kind', label: '报告类型' }, { prop: 'createTime', label: '创建时间' }, { prop: 'creator', label: '创建人' },
    { prop: 'roles', label: '评估角色' }, { prop: 'avg', label: '维度平均分' }, { prop: 'votes', label: 'AB方案对比选择' }, { prop: 'issues', label: '待优化点数' }
  ], list.value.map((r) => ({
    ...r,
    roles: r.roleIds.map((id) => qcRoles.find((q) => q.id === id)?.name).join('、'),
    kind: r.type === 'ab' ? 'AB方案对比' : '单场景质检',
    avg: averageScore(r.dimensions)?.toFixed(2) || '—',
    votes: r.type === 'ab' ? abVoteText(r) : '—',
    issues: r.type === 'ab' ? (r.suggestions || []).length : (r.issues || []).length
  })))
}
</script>

<style scoped>
.bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.label { color: #555; font-size: 14px; }
.range { max-width: 520px; }
.bar .el-button + .el-button { margin-left: 0; }
.preview-title { font-weight: 600; margin-bottom: 12px; }
</style>

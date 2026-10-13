<!-- 管理报表：按产品统计优化建议处理情况（截图待补充，先按常见口径构建） -->
<template>
  <div class="uem-card">
    <div class="uem-toolbar">
      <el-radio-group v-model="dim">
        <el-radio-button value="product">按产品</el-radio-button>
        <el-radio-button value="org">按提出机构</el-radio-button>
        <el-radio-button value="bizDept">按业研部门</el-radio-button>
      </el-radio-group>
    </div>
    <el-table :data="data" show-summary :summary-method="summary" border>
      <el-table-column prop="name" :label="dimLabel" min-width="180" />
      <el-table-column prop="total" label="建议总数" align="center" sortable />
      <el-table-column prop="pending" label="在途" align="center" sortable />
      <el-table-column prop="done" label="已办结/答复" align="center" sortable />
      <el-table-column prop="adopted" label="采纳数" align="center" sortable />
      <el-table-column label="采纳率" align="center">
        <template #default="{ row }">{{ row.done ? ((row.adopted / row.done) * 100).toFixed(1) + '%' : '—' }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { suggestions } from '@/mock'

const dim = ref('product')
const dimLabel = computed(() => ({ product: '产品名称', org: '提出机构', bizDept: '所属业研部门' })[dim.value])

const data = computed(() => {
  const map = {}
  for (const s of suggestions) {
    const k = s[dim.value] || '未分配'
    const m = (map[k] ||= { name: k, total: 0, pending: 0, done: 0, adopted: 0 })
    m.total++
    s.status.startsWith('已') ? m.done++ : m.pending++
    if (s.adoptResult === '采纳' || s.adoptResult === '部分采纳') m.adopted++
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
})

const summary = ({ columns }) =>
  columns.map((c, i) => {
    if (i === 0) return '合计'
    if (!c.property) return ''
    return data.value.reduce((n, r) => n + r[c.property], 0)
  })
</script>

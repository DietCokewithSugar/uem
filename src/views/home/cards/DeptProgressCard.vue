<!-- 部门处理进展（管理报表权限，按岗位上的业研部门范围）：在办各环节数量、逾期与已完成 -->
<template>
  <HomeCard title="部门处理进展" :subtitle="`${deptName} · ${year} 年提交`" more="/manageExcel" more-text="管理报表">
    <div class="total">
      <span class="num">{{ inProgress }}</span><span class="unit">条在办</span>
      <span v-if="overdue" class="hc-tag danger">逾期 {{ overdue }} 条</span>
      <span v-else class="hc-tag ok">无逾期</span>
    </div>
    <div class="bar" role="img" :aria-label="stages.map((s) => `${s.label} ${s.n} 条`).join('，')">
      <span v-for="s in stages.filter((x) => x.n)" :key="s.key" class="seg" :style="{ flex: s.n, background: s.color }" :title="`${s.label} ${s.n} 条`" />
    </div>
    <ul class="legend">
      <li v-for="s in stages" :key="s.key"><i :style="{ background: s.color }" /><span>{{ s.label }}</span><b>{{ s.n }}</b></li>
    </ul>
    <div class="hc-foot"><span>已完成 {{ row.centerDone + row.bizDone + row.devDone }} 条 · 合计 {{ row.total }} 条</span></div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { scopeOf } from '@/config/access'
import { deptReport } from '@/mock/suggestReport'
import { yearRange } from '@/mock/suggestBoard'
import { suggestions, isOverdue } from '@/mock/suggest'

const year = String(new Date().getFullYear())
const dept = computed(() => scopeOf('管理报表查看权限', 'bizDept'))
const deptName = computed(() => dept.value || '业务研发中心')
const report = computed(() => deptReport('progress', yearRange(year)))
const row = computed(() => report.value.find((r) => r.dept === (dept.value || '合计') && r.level !== 'line') || report.value[report.value.length - 1])

const stages = computed(() => [
  { key: 'toSort', label: '待分拣', n: row.value.toSort, color: '#2a78d6' },
  { key: 'toReply', label: '待答复', n: row.value.toReply, color: '#eb6834' },
  { key: 'toAudit', label: '待审核', n: row.value.toAudit, color: '#1baf7a' },
  { key: 'toFollow', label: '待跟进', n: row.value.toFollow, color: '#eda100' }
])
const inProgress = computed(() => stages.value.reduce((n, s) => n + s.n, 0))
const overdue = computed(
  () => suggestions.filter((s) => (!dept.value || s.bizDept === dept.value) && ['待分拣', '待答复', '待审核', '待跟进'].includes(s.status) && isOverdue(s)).length
)
</script>

<style scoped>
.total { display: flex; align-items: baseline; gap: 6px; }
.num { font-size: var(--uem-fs-3xl); font-weight: 600; line-height: 1.2; }
.unit { font-size: var(--uem-fs-sm); color: var(--uem-ink-3); margin-right: 6px; }
.bar { display: flex; gap: 2px; height: 10px; margin-top: 14px; border-radius: 5px; overflow: hidden; background: var(--uem-line-2); }
.seg { min-width: 4px; }
.legend { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 16px; }
.legend li { display: flex; align-items: center; gap: 6px; font-size: var(--uem-fs-sm); color: var(--uem-ink-2); }
.legend i { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.legend b { margin-left: auto; font-weight: 600; color: var(--uem-ink); font-variant-numeric: tabular-nums; }
</style>

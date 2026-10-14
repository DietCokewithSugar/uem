<!-- 优化建议 · 管理报表 #/manageExcel：按提交时间统计各业研部门优化建议的处理进展、答复解决、逾期、处理时长、满意度及明细清单 -->
<template>
  <div class="manage-report">
    <el-form ref="formRef" :model="form" :rules="rules" class="uem-card filter" @submit.prevent>
      <el-form-item label="提交时间" prop="range">
        <el-date-picker
          v-model="form.range"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="-"
          start-placeholder="请选择开始时间"
          end-placeholder="请选择截止时间"
          style="width: 360px"
        />
      </el-form-item>
      <span class="gap" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </el-form>

    <div class="uem-card">
      <div class="tabs-wrap">
        <el-tabs v-model="tab" class="tabs">
          <el-tab-pane v-for="t in tabs" :key="t.key" :name="t.key">
            <template #label>
              {{ t.label }}
              <el-tooltip v-if="t.key === 'overdue'" placement="top" :show-after="100">
                <template #content><div class="rule-tip">逾期规则：{{ overdueRule }}</div></template>
                <el-icon class="info"><Warning /></el-icon>
              </el-tooltip>
            </template>
          </el-tab-pane>
        </el-tabs>
        <div class="tab-actions">
          <el-checkbox v-model="withPerson">同步下载个人维度报表</el-checkbox>
          <el-button type="primary" @click="download">下载</el-button>
        </div>
      </div>

      <!-- 部门统计：部门行可展开到产品线；非零计数可点击查看明细（推测） -->
      <template v-if="current.dept">
        <p v-if="spec.note" class="note">{{ spec.note }}</p>
        <el-table :key="tab" :data="deptRows" row-key="id" border size="small" class="report" :row-class-name="rowClass" :indent="12">
          <el-table-column prop="name" label="部门/产品线" min-width="230" header-align="center" fixed="left" />
          <template v-for="col in spec.columns" :key="col.key || col.label">
            <el-table-column v-if="col.children" :label="col.label" align="center">
              <el-table-column v-for="c in col.children" :key="c.key" :label="c.label" :min-width="c.width || 96" align="center">
                <template #default="{ row }"><NumCell :row="row" :col="c" /></template>
              </el-table-column>
            </el-table-column>
            <el-table-column v-else :label="col.label" :min-width="col.width || 96" align="center">
              <template #default="{ row }"><NumCell :row="row" :col="col" /></template>
            </el-table-column>
          </template>
        </el-table>
      </template>

      <!-- 明细清单 -->
      <template v-else>
        <el-table :key="tab" :data="listRows" :row-key="(r) => r.key || r.seq" border size="small" class="report">
          <el-table-column label="优化建议编号" width="180" fixed="left">
            <template #default="{ row }"><span class="uem-link" @click="toDetail(sOf(row), listSuggestions)">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="product" label="产品名称" min-width="130" show-overflow-tooltip />
          <template v-if="tab === 'vip'">
            <el-table-column label="描述及解决建议" min-width="240">
              <template #default="{ row }"><div class="clamp2" :title="row.desc">{{ row.desc }}</div></template>
            </el-table-column>
            <el-table-column prop="proposer" label="提出人" width="80" />
            <el-table-column prop="proposerOrg" label="提出人所在机构" min-width="150" show-overflow-tooltip />
            <el-table-column prop="submitTime" label="提交时间" width="100" />
            <el-table-column prop="status" label="状态" width="104" />
            <el-table-column prop="currentHandler" label="当前处理人" width="96" />
          </template>
          <template v-else-if="tab === 'follow'">
            <el-table-column prop="bizDept" label="所属业研部门" min-width="120" show-overflow-tooltip />
            <el-table-column prop="solution" label="解决方式" min-width="190" />
            <el-table-column prop="reqNo" label="需求项编号" width="126" />
            <el-table-column prop="planTime" label="计划落实时间" width="104" />
            <el-table-column label="是否逾期" width="76" align="center">
              <template #default="{ row }"><span v-if="isOverdue(row)" class="late">已逾期</span><span v-else class="muted">未逾期</span></template>
            </el-table-column>
            <el-table-column prop="currentHandler" label="当前处理人" width="96" />
          </template>
          <template v-else>
            <el-table-column prop="bizDept" label="所属业研部门" min-width="130" show-overflow-tooltip />
            <el-table-column prop="returnTime" label="退回时间" width="140" />
            <el-table-column prop="reason" label="退回原因" min-width="220" />
            <el-table-column prop="status" label="当前状态" width="104" />
            <el-table-column prop="currentHandler" label="当前处理人" width="96" />
          </template>
        </el-table>
        <el-pagination v-model:current-page="pages[tab]" class="pager" layout="total, prev, pager, next, jumper" :page-size="10" :total="listAll.length" />
      </template>
    </div>

    <!-- 下钻明细（推测） -->
    <el-dialog v-model="drill.visible" :title="drill.title" :width="drill.overdue ? '1040px' : '900px'">
      <el-table :data="drillRows" row-key="seq" border size="small" class="report">
        <el-table-column label="优化建议编号" width="180">
          <template #default="{ row }"><span class="uem-link" @click="toDetail(row, drill.list)">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="product" label="产品名称" min-width="130" show-overflow-tooltip />
        <el-table-column label="描述及解决建议" min-width="240">
          <template #default="{ row }"><div class="clamp2" :title="row.desc">{{ row.desc }}</div></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="104" />
        <el-table-column prop="currentHandler" label="当前处理人" width="96" />
        <el-table-column prop="submitTime" label="提交时间" width="100" />
        <el-table-column v-if="drill.overdue" label="逾期情况" width="150">
          <template #default="{ row }"><span class="late">{{ overdueText(row) }}</span></template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="drill.page" class="pager" layout="total, prev, pager, next, jumper" :page-size="10" :total="drill.list.length" />
    </el-dialog>
  </div>
</template>

<script>
// 模块级状态：从详情页返回时恢复页签、提交时间、勾选与列表分页（推测；刷新页面后恢复默认）
const saved = { tab: 'progress', range: null, withPerson: false, pages: {} }
</script>

<script setup>
import { ref, reactive, computed, watch, h, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { exportCsv } from '@/components/exportCsv'
import { fmtDate } from '@/mock/holidays'
import { isOverdue, detailRoute } from '@/mock/suggest'
import {
  deptSpecs, deptReport, personReport, deptCsvColumns, flattenDeptRows, isDrillable,
  vipList, followList, ekeyReturnList, overdueRule, overdueText
} from '@/mock/suggestReport'

const router = useRouter()

// 页签顺序与截图一致；dept 为部门统计类（可同步下载个人维度）
const tabs = [
  { key: 'progress', label: '处理进展', dept: true },
  { key: 'reply', label: '答复解决', dept: true },
  { key: 'overdue', label: '逾期处理', dept: true },
  { key: 'duration', label: '平均处理时长', dept: true },
  { key: 'vip', label: '要客问题列表' },
  { key: 'follow', label: '待跟进列表' },
  { key: 'satisfaction', label: '答复满意度', dept: true },
  { key: 'ekeyReturn', label: 'e键通退回明细' }
]

// ===== 查询条件：提交时间必填，默认当年 1 月 1 日至今天 =====
const defaultRange = () => {
  const today = new Date()
  return [`${today.getFullYear()}-01-01`, fmtDate(today)]
}
const formRef = ref()
const form = reactive({ range: saved.range ? [...saved.range] : defaultRange() })
const applied = ref(saved.range ? [...saved.range] : defaultRange())
const rules = { range: [{ required: true, type: 'array', message: '请选择提交时间', trigger: 'change' }] }
const pages = reactive({ vip: 1, follow: 1, ekeyReturn: 1, ...saved.pages })

function apply(range) {
  applied.value = [...range]
  saved.range = [...range]
  Object.keys(pages).forEach((k) => (pages[k] = 1))
}
async function search() {
  if (!(await formRef.value.validate().catch(() => false))) return
  apply(form.range)
}
function reset() {
  form.range = defaultRange()
  nextTick(() => formRef.value?.clearValidate())
  apply(form.range)
}

const tab = ref(saved.tab)
const withPerson = ref(saved.withPerson)
watch(tab, (v) => (saved.tab = v))
watch(withPerson, (v) => (saved.withPerson = v))
watch(pages, (v) => (saved.pages = { ...v }))
const current = computed(() => tabs.find((t) => t.key === tab.value))
const spec = computed(() => deptSpecs[tab.value] || { columns: [] })

// ===== 部门统计 =====
const deptRows = computed(() => (current.value.dept ? deptReport(tab.value, applied.value) : []))
const rowClass = ({ row }) => (row.level === 'total' ? 'total-row' : row.level === 'line' ? 'line-row' : '')
// 计数单元格：非零时可点击下钻
const NumCell = ({ row, col }) =>
  isDrillable(col) && row[col.key] > 0 ? h('span', { class: 'num', onClick: () => openDrill(row, col) }, row[col.key]) : String(row[col.key] ?? '')
NumCell.props = ['row', 'col']

const drill = reactive({ visible: false, title: '', list: [], page: 1, overdue: false })
const drillRows = computed(() => drill.list.slice((drill.page - 1) * 10, drill.page * 10))
function openDrill(row, col) {
  const list = row.lists[col.key]
  const name = row.level === 'line' ? `${row.dept} / ${row.name}` : row.name
  Object.assign(drill, { visible: true, title: `${[name, col.group, col.label].filter(Boolean).join(' · ')}（${list.length}）`, list, page: 1, overdue: tab.value === 'overdue' })
}
function toDetail(s, list) {
  drill.visible = false
  router.push(detailRoute(s, '管理报表', list))
}

// ===== 明细清单 =====
const listAll = computed(() => {
  if (tab.value === 'vip') return vipList(applied.value)
  if (tab.value === 'follow') return followList(applied.value)
  if (tab.value === 'ekeyReturn') return ekeyReturnList(applied.value)
  return []
})
const sOf = (row) => row.s || row
// 详情页「上一条 / 下一条」按当前清单顺序（退回明细按建议去重）
const listSuggestions = computed(() => [...new Set(listAll.value.map(sOf))])
const listRows = computed(() => listAll.value.slice((pages[tab.value] - 1) * 10, pages[tab.value] * 10))

// ===== 下载 =====
const listCsv = {
  vip: [
    { prop: 'id', label: '优化建议编号' }, { prop: 'product', label: '产品名称' }, { prop: 'desc', label: '描述及解决建议' }, { prop: 'proposer', label: '提出人' },
    { prop: 'proposerOrg', label: '提出人所在机构' }, { prop: 'submitTime', label: '提交时间' }, { prop: 'status', label: '状态' }, { prop: 'currentHandler', label: '当前处理人' }
  ],
  follow: [
    { prop: 'id', label: '优化建议编号' }, { prop: 'product', label: '产品名称' }, { prop: 'bizDept', label: '所属业研部门' }, { prop: 'solution', label: '解决方式' },
    { prop: 'reqNo', label: '需求项编号' }, { prop: 'planTime', label: '计划落实时间' }, { prop: 'overdue', label: '是否逾期' }, { prop: 'currentHandler', label: '当前处理人' }
  ],
  ekeyReturn: [
    { prop: 'id', label: '优化建议编号' }, { prop: 'product', label: '产品名称' }, { prop: 'bizDept', label: '所属业研部门' }, { prop: 'returnTime', label: '退回时间' },
    { prop: 'reason', label: '退回原因' }, { prop: 'status', label: '当前状态' }, { prop: 'currentHandler', label: '当前处理人' }
  ]
}
function download() {
  const t = current.value
  const name = `管理报表_${t.label}`
  if (t.dept) {
    exportCsv(name, deptCsvColumns(t.key), flattenDeptRows(deptRows.value))
    if (withPerson.value) {
      const p = personReport(t.key, applied.value)
      // 两个文件间隔触发，避免浏览器合并或丢弃第二个下载
      setTimeout(() => exportCsv(`${name}_个人维度`, p.columns, p.rows), 400)
    }
    return
  }
  if (!listAll.value.length) return ElMessage.warning('所选提交时间范围内暂无数据')
  const rows = t.key === 'follow' ? listAll.value.map((s) => ({ ...s, overdue: isOverdue(s) ? '已逾期' : '未逾期' })) : listAll.value
  exportCsv(name, listCsv[t.key], rows)
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.filter :deep(.el-form-item) { margin: 0; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }

.tabs-wrap { position: relative; }
.tabs :deep(.el-tabs__header) { margin: 0 0 14px; box-shadow: inset 0 -2px 0 var(--el-border-color-light); }
.tabs :deep(.el-tabs__nav-wrap) { margin-right: 236px; }
.tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.tabs :deep(.el-tabs__item) { padding: 0 12px; }
.tab-actions { position: absolute; top: 0; right: 0; height: 40px; display: flex; align-items: center; gap: 14px; }
.tab-actions :deep(.el-checkbox__label) { font-size: 13px; color: #666; }
/* ⓘ：叹号图标旋转 180° */
.info { margin-left: 3px; color: #999; font-size: 13px; transform: rotate(180deg); vertical-align: -2px; }
.rule-tip { max-width: 360px; line-height: 20px; }
.note { margin: 0 0 10px; font-size: 12px; color: #999; }

.report { font-size: 12px; color: #666; }
.report :deep(th.el-table__cell) { font-size: 12px; }
.report :deep(.cell) { line-height: 18px; padding: 0 8px; }
.report :deep(.num) { color: #3a6fd8; cursor: pointer; }
.report :deep(.num:hover) { text-decoration: underline; }
.report :deep(.total-row) { font-weight: 600; color: #333; }
.report :deep(.line-row > td.el-table__cell) { background: #fcfcfd; }
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; }
.late { color: var(--uem-red); }
.muted { color: #999; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

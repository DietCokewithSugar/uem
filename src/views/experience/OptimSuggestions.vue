<!-- 优化建议（运营阶段）：全部列表 / 我的提交 / 我已处理；点击编号进入详情页 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />

    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="router.push('/optimSuggestAdd')">新增</el-button>
        <el-button @click="notReady('下载模板')">下载模板</el-button>
        <el-button @click="notReady('批量导入')">批量导入</el-button>
        <el-button @click="doExport">批量导出</el-button>
        <el-button @click="notReady('查看结果')">查看结果</el-button>
      </div>
      <el-table :data="rows">
        <el-table-column label="优化建议编号" width="205">
          <template #default="{ row }"><span class="uem-link" @click="openDetail(row)">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="product" label="产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="desc" label="描述及解决建议" min-width="190">
          <template #default="{ row }"><div class="clamp2" :title="row.desc">{{ row.desc }}</div></template>
        </el-table-column>
        <el-table-column prop="proposerOrg" label="提出机构" min-width="130" show-overflow-tooltip />
        <el-table-column prop="proposer" label="提出人" width="80" />
        <el-table-column prop="submitTime" label="提交时间" width="110" />
        <el-table-column prop="adoptResult" label="采纳结果" width="80" />
        <el-table-column prop="status" label="状态" width="110" />
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { suggestions, sources, statusList, adoptResults, detailRoute } from '@/mock/suggest'
import { productList, branchOrgs, rdDepts, rdLines, deptLines, persons } from '@/mock/system'
import { fmtDate } from '@/mock/holidays'
import { currentUser } from '@/config/user'

const props = defineProps({ mode: { type: String, default: 'all' } })
const router = useRouter()
const menuTitle = { all: '全部列表', mine: '我的提交', handled: '我已处理' }[props.mode] || '全部列表'

const today = new Date()
const lastYear = new Date(today)
lastYear.setFullYear(today.getFullYear() - 1)

// 提出机构 / 提交机构：分行 + 数据中出现的业务研发中心等机构
const orgsOf = (key) => [...new Set([...branchOrgs, ...suggestions.map((s) => s[key]).filter(Boolean).sort()])]
const proposerOrgs = computed(() => orgsOf('proposerOrg'))
const submitOrgs = computed(() => orgsOf('submitOrg'))

const initial = {
  id: '', keyword: '', proposer: '', org: '', submitter: '', submitOrg: '', status: '全部', product: '', source: '',
  bizDept: '', productLine: '', proposeTime: [], submitTime: [fmtDate(lastYear), fmtDate(today)], replyTime: [], adoptResult: '', implemented: ''
}

// 是否落实：已采纳的建议未落实时视为「否」（推测）
const implementedOf = (r) => r.implemented || (r.adoptResult === '采纳' ? '否' : '')

// 我的提交：本人提交；我已处理：本人在操作日志中办理过（不含提交、修改并提交、满意度评价等提交人操作，推测）
const SUBMITTER_ACTIONS = ['提交', '修改并提交', '满意度评价']
const scope = (r) => {
  if (props.mode === 'mine') return r.submitterId === currentUser.id
  if (props.mode === 'handled') return r.logs.some((l) => l.operatorId === currentUser.id && !SUBMITTER_ACTIONS.includes(l.action))
  return true
}

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => suggestions,
  initial,
  (r, q) =>
    scope(r) &&
    match.contains(r.id, q.id) &&
    match.contains(r.desc, q.keyword) &&
    match.contains(r.proposer, q.proposer) &&
    match.equals(r.proposerOrg, q.org) &&
    match.contains(r.submitter, q.submitter) &&
    match.equals(r.submitOrg, q.submitOrg) &&
    match.equals(r.status, q.status) &&
    match.equals(r.product, q.product) &&
    match.equals(r.source, q.source) &&
    match.equals(r.bizDept, q.bizDept) &&
    match.equals(r.productLine, q.productLine) &&
    match.inRange(r.proposeTime, q.proposeTime) &&
    match.inRange(r.submitTime, q.submitTime) &&
    match.inRange(r.replyTime, q.replyTime) &&
    match.equals(r.adoptResult, q.adoptResult) &&
    match.equals(implementedOf(r), q.implemented)
)

// 所属业研产品线随所选业研部门收窄
const lineOptions = computed(() => (form.bizDept ? deptLines[form.bizDept] || [] : rdLines))
watch(
  () => form.bizDept,
  () => {
    if (form.productLine && !lineOptions.value.includes(form.productLine)) form.productLine = ''
  }
)

const fields = computed(() => [
  { prop: 'id', label: '优化建议编号' },
  { prop: 'keyword', label: '关键字' },
  { prop: 'proposer', label: '提出人' },
  { prop: 'org', label: '提出机构', type: 'select', options: proposerOrgs.value },
  { prop: 'submitter', label: '提交人' },
  { prop: 'submitOrg', label: '提交机构', type: 'select', options: submitOrgs.value },
  { prop: 'status', label: '状态', type: 'select', options: ['全部', ...statusList] },
  { prop: 'product', label: '产品名称', type: 'select', options: productList.map((p) => p.name), placeholder: '2021年12月3日前所涉及的产品名称末端均加（原）' },
  { prop: 'source', label: '来源', type: 'select', options: sources },
  { prop: 'bizDept', label: '所属业研部门', type: 'select', options: rdDepts },
  { prop: 'productLine', label: '所属业研产品线', type: 'select', options: lineOptions.value },
  { prop: 'proposeTime', label: '提出时间', type: 'daterange' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' },
  { prop: 'replyTime', label: '答复时间', type: 'daterange' },
  { prop: 'adoptResult', label: '采纳结果', type: 'select', options: adoptResults },
  { prop: 'implemented', label: '是否落实', type: 'select', options: ['是', '否'] }
])

const openDetail = (row) => router.push(detailRoute(row, menuTitle, filtered.value))
const notReady = (name) => ElMessage.info(`演示环境：「${name}」功能待接入`)

const exportColumns = [
  { prop: 'id', label: '优化建议编号' }, { prop: 'product', label: '产品名称' }, { prop: 'channelText', label: '产品使用渠道' }, { prop: 'column', label: '功能栏目' },
  { prop: 'desc', label: '描述及解决建议' }, { prop: 'source', label: '来源' }, { prop: 'proposer', label: '提出人' }, { prop: 'proposerOrg', label: '提出人所在机构' },
  { prop: 'submitTime', label: '提交时间' }, { prop: 'bizDept', label: '所属业研部门' }, { prop: 'productLine', label: '所属业研产品线' }, { prop: 'category', label: '优化建议分类' },
  { prop: 'impact', label: '影响程度' }, { prop: 'status', label: '状态' }, { prop: 'currentHandler', label: '当前处理人' }, { prop: 'adoptResult', label: '采纳结果' },
  { prop: 'solution', label: '解决方式' }, { prop: 'replyTime', label: '答复时间' }, { prop: 'implementedText', label: '是否落实' }
]
// 批量导出需持有「优化建议批量导出权限」（人员维护岗位，推测）
const canExport = () => !!persons.find((p) => p.id === currentUser.id)?.roles.includes('优化建议批量导出权限')
function doExport() {
  if (!canExport()) return ElMessage.warning('您没有「优化建议批量导出权限」，请联系系统管理员')
  if (!filtered.value.length) return ElMessage.warning('当前查询条件下没有可导出的数据')
  exportCsv(
    '优化建议',
    exportColumns,
    filtered.value.map((r) => ({ ...r, channelText: (r.channels || []).join('、'), implementedText: implementedOf(r) }))
  )
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>

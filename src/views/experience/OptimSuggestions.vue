<!-- 优化建议（运营阶段）：全部列表 / 我的提交 / 我已处理 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />

    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="openCreate">新增</el-button>
        <el-button @click="notReady('下载模板')">下载模板</el-button>
        <el-button @click="notReady('批量导入')">批量导入</el-button>
        <el-button @click="doExport">批量导出</el-button>
        <el-button @click="notReady('查看结果')">查看结果</el-button>
      </div>
      <el-table :data="rows">
        <el-table-column label="优化建议编号" width="220">
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="product" label="产品名称" min-width="130" />
        <el-table-column prop="desc" label="描述及解决建议" min-width="260">
          <template #default="{ row }"><div class="clamp2">{{ row.desc }}</div></template>
        </el-table-column>
        <el-table-column prop="org" label="提出机构" min-width="150" show-overflow-tooltip />
        <el-table-column prop="proposer" label="提出人" width="90" />
        <el-table-column prop="submitTime" label="提交时间" width="110" />
        <el-table-column prop="adoptResult" label="采纳结果" width="100" />
        <el-table-column prop="status" label="状态" width="110" />
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>

    <el-dialog v-model="createDialog" title="新增优化建议" width="600px">
      <el-form ref="createRef" :model="draft" :rules="rules" label-width="100px">
        <el-form-item label="所属产品" prop="product">
          <el-select v-model="draft.product" filterable style="width: 100%"><el-option v-for="p in products" :key="p" :label="p" :value="p" /></el-select>
        </el-form-item>
        <el-form-item label="功能栏目"><el-input v-model="draft.column" /></el-form-item>
        <el-form-item label="提出机构" prop="org">
          <el-select v-model="draft.org" filterable style="width: 100%"><el-option v-for="o in orgs" :key="o" :label="o" :value="o" /></el-select>
        </el-form-item>
        <el-form-item label="提出人" prop="proposer"><el-input v-model="draft.proposer" /></el-form-item>
        <el-form-item label="描述及建议" prop="desc">
          <el-input v-model="draft.desc" type="textarea" :rows="5" placeholder="【现象】……【建议】……" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>

    <!-- 相似度检测（系统管理 · 体验问题维护 中开启且在应用范围内时生效） -->
    <el-dialog v-model="similarDialog" title="发现相似优化建议" width="760px" append-to-body>
      <el-alert type="warning" :closable="false" show-icon title="以下已有优化建议与本次描述相似，请确认是否重复提交。" class="similar-tip" />
      <el-table :data="similar" size="small">
        <el-table-column label="优化建议编号" width="210">
          <template #default="{ row }"><span class="uem-link" @click="detail = row.item">{{ row.item.id }}</span></template>
        </el-table-column>
        <el-table-column label="产品名称" width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.item.product }}</template>
        </el-table-column>
        <el-table-column label="描述及解决建议" min-width="240">
          <template #default="{ row }"><div class="clamp2" :title="row.item.desc">{{ excerpt(row.item.desc) }}</div></template>
        </el-table-column>
        <el-table-column label="相似度" width="80" align="center">
          <template #default="{ row }"><span class="score">{{ Math.round(row.score * 100) }}%</span></template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="similarDialog = false">返回修改</el-button>
        <el-button type="primary" @click="similarDialog = false; doCreate()">继续提交</el-button>
      </template>
    </el-dialog>
    <SuggestionDetail :row="detail" @close="detail = null" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import SuggestionDetail from '@/components/SuggestionDetail.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { suggestions, products, orgs, sources, bizDepts, productLines, adoptResults } from '@/mock'
import { currentUser } from '@/config/user'
import { exportCsv } from '@/components/exportCsv'
import { featureActive, findSimilar } from '@/mock/problemFeatures'

const props = defineProps({ mode: { type: String, default: 'all' } })

const today = new Date()
const fmt = (d) => d.toISOString().slice(0, 10)
const lastYear = new Date(today)
lastYear.setFullYear(today.getFullYear() - 1)

const allStatuses = ['全部', '待修改', '待处理', '待分拣', '待答复', '待跟进', '已答复', '已办结', '已纳入e键通', '已中止']
const fields = [
  { prop: 'id', label: '优化建议编号' },
  { prop: 'keyword', label: '关键字' },
  { prop: 'proposer', label: '提出人' },
  { prop: 'org', label: '提出机构', type: 'select', options: orgs },
  { prop: 'submitter', label: '提交人' },
  { prop: 'submitOrg', label: '提交机构', type: 'select', options: orgs },
  { prop: 'status', label: '状态', type: 'select', options: allStatuses },
  { prop: 'product', label: '产品名称', type: 'select', options: products, placeholder: '2021年12月3日前所涉及的产品名称末端均加（原）' },
  { prop: 'source', label: '来源', type: 'select', options: sources },
  { prop: 'bizDept', label: '所属业研部门', type: 'select', options: bizDepts },
  { prop: 'productLine', label: '所属业研产品线', type: 'select', options: productLines },
  { prop: 'proposeTime', label: '提出时间', type: 'daterange' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' },
  { prop: 'replyTime', label: '答复时间', type: 'daterange' },
  { prop: 'adoptResult', label: '采纳结果', type: 'select', options: adoptResults },
  { prop: 'implemented', label: '是否落实', type: 'select', options: ['是', '否'] }
]

// 演示：用编号尾号模拟"我的提交 / 我已处理"
const scope = (r) => {
  const tail = Number(r.id.slice(-2))
  if (props.mode === 'mine') return tail % 6 === 0 || r.submitter === currentUser.name
  if (props.mode === 'handled') return r.status.startsWith('已') && tail % 3 === 0
  return true
}

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => suggestions,
  {
    id: '', keyword: '', proposer: '', org: '', submitter: '', submitOrg: '', status: '全部', product: '', source: '',
    bizDept: '', productLine: '', proposeTime: [], submitTime: [fmt(lastYear), fmt(today)], replyTime: [], adoptResult: '', implemented: ''
  },
  (r, q) =>
    scope(r) &&
    match.contains(r.id, q.id) &&
    match.contains(r.desc, q.keyword) &&
    match.contains(r.proposer, q.proposer) &&
    match.equals(r.org, q.org) &&
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
    match.equals(r.implemented, q.implemented)
)

const detail = ref(null)
const notReady = (name) => ElMessage.info(`演示环境：「${name}」功能待接入`)

const exportColumns = [
  { prop: 'id', label: '优化建议编号' }, { prop: 'product', label: '产品名称' }, { prop: 'desc', label: '描述及解决建议' },
  { prop: 'org', label: '提出机构' }, { prop: 'proposer', label: '提出人' }, { prop: 'submitTime', label: '提交时间' },
  { prop: 'adoptResult', label: '采纳结果' }, { prop: 'status', label: '状态' }
]
const doExport = () => exportCsv('优化建议', exportColumns, filtered.value)

// 新增
const createDialog = ref(false)
const createRef = ref()
const draft = reactive({})
const rules = {
  product: [{ required: true, message: '请选择所属产品' }],
  org: [{ required: true, message: '请选择提出机构' }],
  proposer: [{ required: true, message: '请填写提出人' }],
  desc: [{ required: true, message: '请填写描述及建议' }]
}
function openCreate() {
  Object.assign(draft, { product: '', column: '', org: '', proposer: currentUser.name, desc: '' })
  createDialog.value = true
}
// 相似度：功能开启且当前用户在应用范围内时，提交前检索相似建议
const similarDialog = ref(false)
const similar = ref([])
const excerpt = (t, n = 60) => (t.length > n ? `${t.slice(0, n)}…` : t)
async function submitCreate() {
  await createRef.value.validate()
  if (featureActive('相似度')) {
    similar.value = findSimilar(draft.desc, suggestions, { product: draft.product })
    if (similar.value.length) return (similarDialog.value = true)
  }
  doCreate()
}
function doCreate() {
  const d = fmt(new Date())
  suggestions.unshift({
    ...draft,
    id: `UEM${d.replace(/-/g, '')}${String(Date.now()).slice(-10)}`,
    submitter: currentUser.name,
    submitOrg: draft.org,
    proposeTime: d,
    submitTime: d,
    replyTime: '',
    status: '待分拣',
    adoptResult: '',
    implemented: '',
    source: '行内员工',
    bizDept: '',
    productLine: '',
    stayDays: 0
  })
  createDialog.value = false
  ElMessage.success('提交成功，已进入「待分拣」')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.similar-tip { margin-bottom: 12px; }
.score { color: var(--uem-red); font-weight: 600; }
</style>

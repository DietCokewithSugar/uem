<!-- 待办工作：待修改 / 待处理 / 待分拣 / 待答复 / 待审核 / 待业务部门答复 / 待跟进（由 suggestStatus 区分）
     列表为当前用户作为当前处理人的优化建议；办理在详情页进行，待处理、待分拣支持批量操作 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />

    <div class="uem-card">
      <div v-if="batchActions.length" class="uem-toolbar">
        <el-button v-for="(a, i) in batchActions" :key="a.key" :type="i === 0 ? 'primary' : 'default'" @click="runBatch(a)">{{ a.label }}</el-button>
      </div>

      <el-table ref="tableRef" :data="rows" @selection-change="(v) => (selected = v)">
        <el-table-column type="selection" width="44" />
        <el-table-column label="编号" width="205">
          <template #default="{ row }"><span class="uem-link" @click="openDetail(row)">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="product" label="所属产品" min-width="110" show-overflow-tooltip />
        <el-table-column prop="column" label="功能栏目" min-width="90" show-overflow-tooltip />
        <el-table-column prop="desc" label="描述及解决建议" min-width="160" show-overflow-tooltip />
        <el-table-column prop="proposerOrg" label="提出机构" min-width="110" show-overflow-tooltip />
        <el-table-column prop="proposer" label="提出人" width="80" />
        <el-table-column prop="submitTime" label="提交时间" width="110" />
        <el-table-column label="当前状态停留时长(工作日)" width="110" align="center">
          <template #default="{ row }">{{ stayDays(row) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { suggestions, sources, stayDays, detailRoute, transferToSort, abortSuggestion, removeSuggestion, returnToSubmitter } from '@/mock/suggest'
import { productList, branchOrgs } from '@/mock/system'
import { pendingStatus } from '@/config/menus'
import { currentUser } from '@/config/user'

const route = useRoute()
const router = useRouter()
const statusName = computed(() => pendingStatus[route.query.suggestStatus] || '待处理')

// 提出机构：分行 + 数据中出现的业务研发中心等机构
const orgOptions = computed(() => [...new Set([...branchOrgs, ...suggestions.map((s) => s.proposerOrg).filter(Boolean).sort()])])
const fields = computed(() => [
  { prop: 'id', label: '优化建议编号' },
  { prop: 'keyword', label: '关键字' },
  { prop: 'proposer', label: '提出人' },
  { prop: 'org', label: '提出机构', type: 'select', options: orgOptions.value },
  { prop: 'product', label: '产品名称', type: 'select', options: productList.map((p) => p.name), placeholder: '12月3日前所涉及的产品名称末端均加（原）' },
  { prop: 'source', label: '来源', type: 'select', options: sources },
  { prop: 'proposeTime', label: '提出时间', type: 'daterange' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' }
])

// 当前用户的待办：待修改为本人提交且被退回的建议，其余为本人为当前处理人的建议
const mine = (r) => (statusName.value === '待修改' ? r.submitterId === currentUser.id : r.currentHandlerId === currentUser.id)

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => suggestions,
  { id: '', keyword: '', proposer: '', org: '', product: '', source: '', proposeTime: [], submitTime: [] },
  (r, q) =>
    r.status === statusName.value &&
    mine(r) &&
    match.contains(r.id, q.id) &&
    match.contains(r.desc, q.keyword) &&
    match.contains(r.proposer, q.proposer) &&
    match.equals(r.proposerOrg, q.org) &&
    match.equals(r.product, q.product) &&
    match.equals(r.source, q.source) &&
    match.inRange(r.proposeTime, q.proposeTime) &&
    match.inRange(r.submitTime, q.submitTime)
)

const openDetail = (row) => router.push(detailRoute(row, statusName.value, filtered.value))

// 批量操作：待处理为截图中的四个按钮；待分拣的批量退回、批量中止为推测；其余状态在详情页逐条办理
const ACTIONS = {
  transfer: { key: 'transfer', label: '批量转处理', name: '转处理', run: (s) => transferToSort(s) },
  abort: { key: 'abort', label: '批量中止', name: '中止', reason: '中止原因', run: (s, r) => abortSuggestion(s, r) },
  remove: { key: 'remove', label: '批量删除', name: '删除', run: (s) => removeSuggestion(s) },
  back: { key: 'back', label: '批量退回提交人', name: '退回提交人', reason: '退回原因', run: (s, r) => returnToSubmitter(s, r) }
}
const batchActions = computed(() => {
  if (statusName.value === '待处理') return [ACTIONS.transfer, ACTIONS.abort, ACTIONS.remove, ACTIONS.back]
  if (statusName.value === '待分拣') return [ACTIONS.back, ACTIONS.abort]
  return []
})

const tableRef = ref()
const selected = ref([])
async function runBatch(a) {
  const list = [...selected.value]
  if (!list.length) return ElMessage.warning('请先勾选需要操作的记录')
  let reason = ''
  try {
    if (a.reason) {
      const res = await ElMessageBox.prompt(`已选择 ${list.length} 条优化建议，请填写${a.reason}：`, a.label, {
        inputType: 'textarea',
        inputPlaceholder: `请输入${a.reason}`,
        inputValidator: (v) => (!!v && !!v.trim()) || `请输入${a.reason}`,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      reason = res.value.trim()
    } else {
      await ElMessageBox.confirm(`确认对选中的 ${list.length} 条优化建议执行「${a.name}」？${a.key === 'remove' ? '删除后不可恢复。' : ''}`, '提示', { type: 'warning' })
    }
  } catch {
    return
  }
  list.forEach((s) => a.run(s, reason))
  tableRef.value?.clearSelection()
  selected.value = []
  if (page.value > 1 && (page.value - 1) * pageSize.value >= filtered.value.length) page.value = Math.max(1, Math.ceil(filtered.value.length / pageSize.value))
  const tip = { transfer: '已转至产品线分拣岗「待分拣」', back: '已退回提交人「待修改」', abort: '状态已变更为「已中止」', remove: '' }[a.key]
  ElMessage.success(`${a.name}成功，共 ${list.length} 条${tip ? `，${tip}` : ''}`)
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

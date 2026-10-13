<!-- 待办工作：待修改 / 待处理 / 待分拣 / 待答复 / 待跟进（由 suggestStatus 区分） -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />

    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="batch('转处理', '待答复')">批量转处理</el-button>
        <el-button @click="batch('中止', '已中止')">批量中止</el-button>
        <el-button @click="batch('删除', null)">批量删除</el-button>
        <el-button @click="batch('退回提交人', '待修改')">批量退回提交人</el-button>
      </div>

      <el-table :data="rows" @selection-change="(v) => (selected = v)">
        <el-table-column type="selection" width="44" />
        <el-table-column label="编号" width="220">
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="product" label="所属产品" min-width="130" />
        <el-table-column prop="column" label="功能栏目" min-width="110" show-overflow-tooltip />
        <el-table-column prop="desc" label="描述及解决建议" min-width="220" show-overflow-tooltip />
        <el-table-column prop="org" label="提出机构" min-width="150" show-overflow-tooltip />
        <el-table-column prop="proposer" label="提出人" width="90" />
        <el-table-column prop="submitTime" label="提交时间" width="110" />
        <el-table-column prop="stayDays" label="当前状态停留时长(工作日)" width="120" align="center" />
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>
    <SuggestionDetail :row="detail" @close="detail = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import SuggestionDetail from '@/components/SuggestionDetail.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { suggestions, products, orgs, sources } from '@/mock'
import { pendingStatus } from '@/config/menus'

const route = useRoute()
const statusName = computed(() => pendingStatus[route.query.suggestStatus] || '待处理')

const fields = [
  { prop: 'id', label: '优化建议编号' },
  { prop: 'keyword', label: '关键字' },
  { prop: 'proposer', label: '提出人' },
  { prop: 'org', label: '提出机构', type: 'select', options: orgs },
  { prop: 'product', label: '产品名称', type: 'select', options: products, placeholder: '12月3日前所涉及的产品名称末端均加（原）' },
  { prop: 'source', label: '来源', type: 'select', options: sources },
  { prop: 'proposeTime', label: '提出时间', type: 'daterange' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' }
]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => suggestions,
  { id: '', keyword: '', proposer: '', org: '', product: '', source: '', proposeTime: [], submitTime: [] },
  (r, q) =>
    r.status === statusName.value &&
    match.contains(r.id, q.id) &&
    match.contains(r.desc, q.keyword) &&
    match.contains(r.proposer, q.proposer) &&
    match.equals(r.org, q.org) &&
    match.equals(r.product, q.product) &&
    match.equals(r.source, q.source) &&
    match.inRange(r.proposeTime, q.proposeTime) &&
    match.inRange(r.submitTime, q.submitTime)
)

const selected = ref([])
const detail = ref(null)

async function batch(action, nextStatus) {
  if (!selected.value.length) return ElMessage.warning('请先勾选需要操作的记录')
  await ElMessageBox.confirm(`确认对选中的 ${selected.value.length} 条记录执行「${action}」？`, '提示', { type: 'warning' })
  const ids = new Set(selected.value.map((r) => r.id))
  for (let i = suggestions.length - 1; i >= 0; i--) {
    if (!ids.has(suggestions[i].id)) continue
    if (nextStatus) suggestions[i].status = nextStatus
    else suggestions.splice(i, 1)
  }
  ElMessage.success(`${action}成功`)
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

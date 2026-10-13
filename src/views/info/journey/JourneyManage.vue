<!-- 灵犀旅程管理 #/userJourneyManagementNew：旅程基本情况管理 / 典型问题管理 -->
<template>
  <div>
    <template v-if="tab === 'basic'">
      <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
      <div class="uem-card">
        <div class="uem-toolbar">
          <el-button type="primary" @click="exportJourneys(filtered)">全部导出</el-button>
          <el-button @click="exportJourneyDetail(filtered)">导出明细</el-button>
        </div>
        <JourneyTable :rows="rows">
          <template #ops="{ row }">
            <template v-if="row.status === '已发布旅程结构'">
              <el-button link type="primary" @click="router.push({ path: '/journeysBoardConfig', query: { id: row.id } })">查看旅程结构</el-button>
              <el-button link type="primary" @click="router.push({ path: '/myjourneyAdd', query: { id: row.id, status: 'view' } })">查看旅程内容</el-button>
            </template>
            <el-button link type="primary" @click="remove(row)">删除</el-button>
            <el-button v-if="row.status === '已发布旅程结构'" link type="primary" @click="exportJourneyDetail([row])">下载</el-button>
          </template>
        </JourneyTable>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, sizes, prev, pager, next, jumper" :total="filtered.length" />
      </div>
    </template>

    <!-- 典型问题管理（截图未覆盖，按看板口径推测） -->
    <template v-else>
      <SearchForm :model="pform" :fields="pfields" @search="psearch" @reset="preset" />
      <div class="uem-card">
        <div class="uem-toolbar">
          <el-button type="primary" @click="exportProblems(pfiltered)">导出典型问题明细</el-button>
        </div>
        <el-table :data="prows" empty-text="暂无数据">
          <el-table-column label="旅程名称" min-width="180"><template #default="{ row }">{{ row.journey.name }}</template></el-table-column>
          <el-table-column prop="behavior" label="旅程行为" min-width="120" />
          <el-table-column prop="text" label="典型问题" min-width="260" />
          <el-table-column label="关联用户声音数" width="150">
            <template #default="{ row }"><el-input-number v-model="row.problem.voices" :min="0" size="small" controls-position="right" /></template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }"><span :class="row.problem.status === '待处理' ? 'warn' : 'ok'">{{ row.problem.status }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="110">
            <template #default="{ row }">
              <el-button link type="primary" @click="row.problem.status = row.problem.status === '待处理' ? '已处理' : '待处理'">
                {{ row.problem.status === '待处理' ? '标记已处理' : '重新打开' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="ppage" v-model:page-size="ppageSize" class="pager" layout="total, sizes, prev, pager, next" :total="pfiltered.length" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import JourneyTable from '@/components/journey/JourneyTable.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportJourneys, exportJourneyDetail, exportProblems, problemsOf } from '@/components/journey/journeyUtils'
import { journeys, journeyStatuses, products, applyDepts, staff } from '@/mock'
import { creatorName } from '@/mock/journey'

const route = useRoute()
const router = useRouter()
const tab = computed(() => route.query.tab || 'basic')

const fields = [
  { prop: 'name', label: '旅程名称' },
  { prop: 'product', label: '产品名称', type: 'select', options: products },
  { prop: 'creator', label: '创建人' },
  { prop: 'adminDept', label: '所属部门', type: 'select', options: [...new Set([...applyDepts, ...staff.map((s) => s.dept)])] },
  { prop: 'createTime', label: '创建时间', type: 'daterange' },
  { prop: 'updateTime', label: '更新时间', type: 'daterange' },
  { prop: 'status', label: '旅程状态', type: 'select', options: journeyStatuses }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => journeys,
  { name: '', product: '', creator: '', adminDept: '', createTime: [], updateTime: [], status: '' },
  (j, q) =>
    match.contains(j.name, q.name) &&
    match.equals(j.product, q.product) &&
    (!q.creator || creatorName(j).includes(q.creator) || j.creatorId === q.creator) &&
    match.equals(j.adminDept, q.adminDept) &&
    match.inRange(j.createTime, q.createTime) &&
    match.inRange(j.updateTime, q.updateTime) &&
    match.equals(j.status, q.status)
)

async function remove(row) {
  await ElMessageBox.confirm(`确认删除旅程「${row.name}」？`, '提示', { type: 'warning' })
  journeys.splice(journeys.indexOf(row), 1)
  ElMessage.success('删除成功')
}

// 典型问题
const pfields = [
  { prop: 'journey', label: '旅程名称', type: 'select', options: journeys.map((j) => j.name) },
  { prop: 'status', label: '状态', type: 'select', options: ['待处理', '已处理'] },
  { prop: 'keyword', label: '关键字' }
]
const {
  form: pform, page: ppage, pageSize: ppageSize, filtered: pfiltered, rows: prows, search: psearch, reset: preset
} = useTableQuery(
  () => journeys.flatMap(problemsOf),
  { journey: '', status: '', keyword: '' },
  (p, q) => match.equals(p.journey.name, q.journey) && match.equals(p.problem.status, q.status) && match.contains(p.text, q.keyword)
)
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.ok { color: #3c9a5f; }
.warn { color: var(--uem-red); }
</style>

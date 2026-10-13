<!-- 体验任务列表：待办 / 体验管理任务 / 我的体验任务 -->
<template>
  <div>
    <SearchForm v-if="scope !== 'pending'" :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div v-if="scope !== 'pending'" class="uem-toolbar">
        <el-button type="primary" @click="router.push({ path: '/taskAdd', query: { taskListType: scope === 'mine' ? '2' : '1' } })">新增</el-button>
        <el-button @click="exportCsv(route.meta.title, columns, filtered)">批量导出</el-button>
      </div>
      <el-table :data="rows" empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="64" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="任务名称" min-width="260">
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column prop="board" label="所属板块" min-width="120" />
        <el-table-column prop="leader" label="牵头人" min-width="100" />
        <el-table-column prop="submitTime" label="提交时间" min-width="110" />
        <el-table-column prop="status" label="当前状态" min-width="100" />
        <el-table-column prop="creator" label="创建人" min-width="100" />
      </el-table>
      <el-pagination
        v-if="filtered.length"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>

    <el-drawer :model-value="!!detail" title="体验任务详情" size="520px" @close="detail = null">
      <template v-if="detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item v-for="c in detailFields" :key="c.prop" :label="c.label">{{ detail[c.prop] || '—' }}</el-descriptions-item>
          <el-descriptions-item label="附件">
            <div v-for="f in detail.files" :key="f">{{ f }}</div>
            <span v-if="!detail.files?.length">—</span>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { tasks, taskBoards, taskStatuses } from '@/mock'
import { currentUser } from '@/config/user'

const props = defineProps({ scope: { type: String, default: 'manage' } })
const route = useRoute()
const router = useRouter()

const columns = [
  { prop: 'name', label: '任务名称' }, { prop: 'board', label: '所属板块' }, { prop: 'leader', label: '牵头人' },
  { prop: 'submitTime', label: '提交时间' }, { prop: 'status', label: '当前状态' }, { prop: 'creator', label: '创建人' }
]
const detailFields = [...columns, { prop: 'intro', label: '任务简介' }, { prop: 'startTime', label: '开始时间' }, { prop: 'executor', label: '执行人' }]

const fields = [
  { prop: 'name', label: '任务名称' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' },
  { prop: 'board', label: '所属板块', type: 'select', options: taskBoards },
  { prop: 'leader', label: '牵头人' },
  { prop: 'status', label: '当前状态', type: 'select', options: taskStatuses },
  { prop: 'creator', label: '创建人' }
]

const inScope = (t) =>
  ({
    pending: t.pendingForMe,
    manage: true,
    mine: t.creator === currentUser.name || t.leader === currentUser.name || t.executor === currentUser.name
  })[props.scope]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => tasks,
  { name: '', submitTime: [], board: '', leader: '', status: '', creator: '' },
  (t, q) =>
    inScope(t) &&
    match.contains(t.name, q.name) &&
    match.inRange(t.submitTime, q.submitTime) &&
    match.equals(t.board, q.board) &&
    match.contains(t.leader, q.leader) &&
    match.equals(t.status, q.status) &&
    match.contains(t.creator, q.creator)
)

const detail = ref(null)
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

<!-- 体验公告列表：总行 / 分行 / 我的 / 待办 -->
<template>
  <div>
    <SearchForm v-if="scope !== 'pending'" :model="form" :fields="fields" :collapsed-count="2" @search="search" @reset="reset" />
    <div class="uem-card">
      <div v-if="scope !== 'pending'" class="uem-toolbar">
        <el-button type="primary" @click="create">新增</el-button>
        <el-button @click="exportCsv(route.meta.title, columns, filtered)">批量导出</el-button>
      </div>
      <el-table :data="rows" empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="64" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="公告名称" min-width="280" show-overflow-tooltip>
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column prop="content" label="公告内容" min-width="260" show-overflow-tooltip />
        <el-table-column prop="org" label="所属机构" min-width="180" show-overflow-tooltip />
        <el-table-column prop="submitTime" label="提交时间" width="120" />
        <el-table-column prop="status" label="公告状态" width="100" />
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="detail = row">查看</el-button>
            <el-button v-if="canEdit(row)" link type="primary" @click="edit(row)">修改</el-button>
            <el-button v-if="canEdit(row)" link type="primary" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
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

    <el-drawer :model-value="!!detail" title="体验公告" size="560px" @close="detail = null">
      <template v-if="detail">
        <h3 class="d-title">{{ detail.name }}</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="所属机构">{{ detail.org }}</el-descriptions-item>
          <el-descriptions-item label="公告级别">{{ detail.level }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ detail.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="展示时间">{{ detail.startTime }} 至 {{ detail.endTime }}</el-descriptions-item>
          <el-descriptions-item label="公告状态">{{ detail.status }}</el-descriptions-item>
          <el-descriptions-item label="置顶">{{ detail.pinned ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="公告图">{{ detail.image || '—' }}</el-descriptions-item>
          <el-descriptions-item label="附件">{{ detail.files.length ? detail.files.join('、') : '—' }}</el-descriptions-item>
          <el-descriptions-item label="公告内容">{{ detail.content }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { notices, noticeStatuses } from '@/mock/notices'
import { currentUser } from '@/config/user'

const props = defineProps({ scope: { type: String, default: 'mine' } })
const route = useRoute()
const router = useRouter()

const columns = [
  { prop: 'name', label: '公告名称' }, { prop: 'content', label: '公告内容' }, { prop: 'org', label: '所属机构' },
  { prop: 'submitTime', label: '提交时间' }, { prop: 'status', label: '公告状态' }
]
const fields = [
  { prop: 'name', label: '公告名称' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' },
  { prop: 'status', label: '公告状态', type: 'select', options: noticeStatuses }
]

const inScope = (n) =>
  ({
    pending: n.status === '待审批',
    head: n.level === '总行',
    branch: n.level === '分行',
    mine: n.creator === currentUser.name
  })[props.scope]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => notices,
  { name: '', submitTime: [], status: '' },
  (n, q) => inScope(n) && match.contains(n.name, q.name) && match.inRange(n.submitTime, q.submitTime) && match.equals(n.status, q.status)
)

const detail = ref(null)
const canEdit = (row) => row.creator === currentUser.name && row.status !== '已完成'
const queryOf = () => ({ isFh: props.scope === 'branch' ? '1' : '0', routeType: { head: '1', branch: '2', mine: '0' }[props.scope] || '0' })
const create = () => router.push({ path: '/noticeAdd', query: queryOf() })
const edit = (row) => router.push({ path: '/noticeAdd', query: { ...queryOf(), id: row.id } })

async function remove(row) {
  await ElMessageBox.confirm(`确认删除公告「${row.name}」？`, '提示', { type: 'warning' })
  const i = notices.findIndex((n) => n.id === row.id)
  if (i >= 0) notices.splice(i, 1)
  if (detail.value?.id === row.id) detail.value = null
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.d-title { margin: 0 0 16px; font-size: 16px; line-height: 1.5; }
</style>

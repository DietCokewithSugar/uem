<!-- 数据管理 #/experInformation：资讯发布、冻结、解冻、删除 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="router.push('/experInformationAdd')">新增</el-button>
        <el-button @click="batch('冻结')">批量冻结</el-button>
        <el-button @click="batch('解冻')">批量解冻</el-button>
        <el-button @click="batch('删除')">批量删除</el-button>
        <el-button @click="exportCsv('资讯数据', columns, filtered)">批量导出</el-button>
      </div>
      <el-table :data="rows" empty-text="暂无数据" @selection-change="(v) => (selected = v)">
        <el-table-column type="selection" width="44" />
        <el-table-column type="index" label="序号" width="64" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="资讯名称" min-width="320">
          <template #default="{ row }"><span class="uem-link" @click="router.push({ path: '/experInformationAdd', query: { id: row.id } })">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column prop="type" label="资讯类型" width="110" />
        <el-table-column prop="org" label="所属机构" width="140" />
        <el-table-column prop="author" label="作者" width="110" />
        <el-table-column prop="publishTime" label="发布时间" width="120" />
        <el-table-column label="资讯状态" width="100">
          <template #default="{ row }">
            <span :class="{ frozen: row.status === '冻结' }">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="apply([row], row.status === '冻结' ? '解冻' : '冻结')">
              {{ row.status === '冻结' ? '解冻' : '冻结' }}
            </el-button>
            <el-button link type="primary" @click="confirmApply([row], '删除')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { infos, infoTypes, infoOrgs } from '@/mock'

const router = useRouter()

const fields = [
  { prop: 'name', label: '名称' },
  { prop: 'publishTime', label: '发布时间', type: 'daterange' },
  { prop: 'type', label: '资讯类型', type: 'select', options: infoTypes },
  { prop: 'org', label: '所属机构', type: 'select', options: infoOrgs },
  { prop: 'author', label: '作者' },
  { prop: 'status', label: '资讯状态', type: 'select', options: ['发布', '冻结'] }
]
const columns = [
  { prop: 'name', label: '资讯名称' }, { prop: 'type', label: '资讯类型' }, { prop: 'org', label: '所属机构' },
  { prop: 'author', label: '作者' }, { prop: 'publishTime', label: '发布时间' }, { prop: 'status', label: '资讯状态' }
]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => infos,
  { name: '', publishTime: [], type: '', org: '', author: '', status: '' },
  (it, q) =>
    match.contains(it.name, q.name) &&
    match.inRange(it.publishTime, q.publishTime) &&
    match.equals(it.type, q.type) &&
    match.equals(it.org, q.org) &&
    match.contains(it.author, q.author) &&
    match.equals(it.status, q.status)
)

const selected = ref([])

function apply(list, action) {
  const ids = new Set(list.map((r) => r.id))
  for (let i = infos.length - 1; i >= 0; i--) {
    if (!ids.has(infos[i].id)) continue
    if (action === '删除') infos.splice(i, 1)
    else infos[i].status = action === '冻结' ? '冻结' : '发布'
  }
  ElMessage.success(`${action}成功`)
}
async function confirmApply(list, action) {
  await ElMessageBox.confirm(`确认${action}选中的 ${list.length} 条资讯？`, '提示', { type: 'warning' })
  apply(list, action)
}
function batch(action) {
  if (!selected.value.length) return ElMessage.warning('请先勾选需要操作的资讯')
  confirmApply(selected.value, action)
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.frozen { color: #999; }
</style>

<!-- 待办工作：待修改旅程 / 待审核旅程 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <el-table :data="rows" empty-text="暂无数据">
        <el-table-column prop="id" label="编号" width="90" />
        <el-table-column prop="name" label="旅程名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="product" label="所属产品" min-width="120" />
        <el-table-column prop="scene" label="场景/功能" min-width="100" />
        <el-table-column prop="members" label="旅程群组人员" min-width="110" show-overflow-tooltip />
        <el-table-column prop="adminDept" label="旅程管理员部门" min-width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="当前状态" width="90" />
        <el-table-column prop="createTime" label="创建时间" width="110" />
        <el-table-column prop="creator" label="旅程创建人" width="100" />
        <template v-if="mode === 'modify'">
          <el-table-column prop="updateTime" label="更新时间" width="110" />
          <el-table-column prop="reviewer" label="审核人" width="90" />
          <el-table-column prop="reviewComment" label="审核意见" min-width="120" show-overflow-tooltip />
        </template>
        <el-table-column label="操作" width="70">
          <template #default="{ row }">
            <el-button link type="primary" @click="act(row)">{{ mode === 'modify' ? '修改' : '审核' }}</el-button>
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
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { journeys, products, applyDepts } from '@/mock'
import { currentUser } from '@/config/user'

const props = defineProps({ mode: { type: String, default: 'modify' } })

const fields = [
  { prop: 'name', label: '旅程名称' },
  { prop: 'product', label: '产品名称', type: 'select', options: products },
  { prop: 'creator', label: '创建人' },
  { prop: 'adminDept', label: '所属部门', type: 'select', options: applyDepts },
  { prop: 'createTime', label: '创建时间', type: 'daterange' },
  { prop: 'updateTime', label: '更新时间', type: 'daterange' }
]

// 截图中「待修改」默认带出当前用户工号作为创建人
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => journeys,
  { name: '', product: '', creator: props.mode === 'modify' ? currentUser.id : '', adminDept: '', createTime: [], updateTime: [] },
  (j, q) =>
    j.status === (props.mode === 'modify' ? '待修改' : '待审核') &&
    match.contains(j.name, q.name) &&
    match.equals(j.product, q.product) &&
    (!q.creator || j.creator === q.creator || j.creatorId === q.creator) &&
    match.equals(j.adminDept, q.adminDept) &&
    match.inRange(j.createTime, q.createTime) &&
    match.inRange(j.updateTime, q.updateTime)
)

const act = () => ElMessage.info('演示环境：旅程编辑/审核页待「灵犀旅程」截图补充')
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

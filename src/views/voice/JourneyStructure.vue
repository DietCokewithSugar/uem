<!-- 旅程结构管理 #/jouranalyManage：产品 / 功能栏目下的旅程行为，供「旅程行为分类」与「功能监测」使用 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <el-table :data="rows">
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column prop="product" label="产品名称" width="170" />
        <el-table-column prop="scene" label="功能栏目/旅程场景" width="150" />
        <el-table-column prop="name" label="旅程名称" width="160" />
        <el-table-column prop="creator" label="旅程创建人" width="100" />
        <el-table-column label="旅程行为" min-width="360">
          <template #default="{ row }">{{ row.actions.join('，') }}</template>
        </el-table-column>
        <el-table-column prop="time" label="维护时间" width="110" />
        <el-table-column prop="status" label="当前状态" width="90">
          <template #default="{ row }"><span :class="{ frozen: row.status === '冻结' }">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }"><el-button link type="primary" @click="toggle(row)">{{ row.status === '启用' ? '冻结' : '启用' }}</el-button></template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { journeyStructures } from '@/mock/voiceTools'

const products = [...new Set(journeyStructures.map((j) => j.product))]
const actions = [...new Set(journeyStructures.flatMap((j) => j.actions))]
const fields = [
  { prop: 'product', label: '产品名称', type: 'select', options: products, placeholder: '请选择产品名称' },
  { prop: 'scene', label: '功能栏目/旅程场景', placeholder: '请输入旅程场景' },
  { prop: 'action', label: '旅程行为', type: 'select', options: actions, placeholder: '请选择旅程行为' },
  { prop: 'status', label: '状态', type: 'select', options: ['启用', '冻结'], placeholder: '请选择状态' },
  { prop: 'time', label: '创建时间', type: 'daterange' }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => journeyStructures,
  { product: '', scene: '', action: '', status: '', time: [] },
  (j, q) => match.equals(j.product, q.product) && match.contains(j.scene, q.scene) && (!q.action || j.actions.includes(q.action)) && match.equals(j.status, q.status) && match.inRange(j.time, q.time)
)
function toggle(row) {
  row.status = row.status === '启用' ? '冻结' : '启用'
  ElMessage.success(`已${row.status}，${row.status === '冻结' ? '「旅程行为分类」将不再使用该旅程结构' : '已恢复用于旅程行为分类'}`)
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.frozen { color: #999; }
</style>

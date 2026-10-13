<!-- 旅程列表（灵犀旅程管理 / 灵犀旅程维护共用） -->
<template>
  <el-table :data="rows" empty-text="暂无数据">
    <el-table-column prop="id" label="编号" width="150">
      <template #default="{ row }"><span class="code">{{ row.id }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="旅程名称" min-width="150" />
    <el-table-column prop="product" label="所属产品" min-width="110" />
    <el-table-column prop="scene" label="场景/功能" min-width="90" />
    <el-table-column label="旅程群组人员" min-width="140">
      <template #default="{ row }">{{ memberText(row) }}</template>
    </el-table-column>
    <el-table-column prop="adminDept" label="旅程管理员部门" min-width="120" />
    <el-table-column prop="status" label="当前状态" min-width="100">
      <template #default="{ row }"><span :class="statusClass(row.status)">{{ row.status }}</span></template>
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" width="100" />
    <el-table-column prop="updateTime" label="更新时间" width="100" />
    <el-table-column prop="reviewer" label="审核人" width="80" />
    <el-table-column label="操作" width="110">
      <template #default="{ row }"><div class="ops"><slot name="ops" :row="row" /></div></template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { memberText } from '@/mock/journey'

defineProps({ rows: { type: Array, required: true } })
const statusClass = (s) => ({ 已发布旅程结构: 'ok', 待审核: 'wait', 待修改: 'warn' })[s] || ''
</script>

<style scoped>
.code { font-size: 12px; color: #666; word-break: break-all; }
.ops { display: flex; flex-direction: column; align-items: flex-start; }
.ops :deep(.el-button) { margin-left: 0; height: 22px; }
.ok { color: #3c9a5f; }
.wait { color: #e6a23c; }
.warn { color: var(--uem-red); }
</style>

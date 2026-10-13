<!-- 体验活动 / 体验任务 列表 -->
<template>
  <div class="uem-card">
    <el-table :data="[]" :empty-text="'暂无数据'">
      <el-table-column type="index" label="序号" width="70" />
      <template v-if="kind === 'activity'">
        <el-table-column label="活动名称" min-width="200" />
        <el-table-column label="产品名称" min-width="120" />
        <el-table-column label="体验渠道类别" min-width="110" />
        <el-table-column label="体验渠道名称" min-width="110" />
        <el-table-column label="体验方法" min-width="100" />
        <el-table-column label="活动申请部门" min-width="120" />
        <el-table-column label="提交时间" width="110" />
        <el-table-column label="活动状态" width="100" />
      </template>
      <template v-else>
        <el-table-column label="任务名称" min-width="200" />
        <el-table-column label="所属活动" min-width="160" />
        <el-table-column label="产品名称" min-width="120" />
        <el-table-column label="截止时间" width="110" />
        <el-table-column label="任务状态" width="100" />
      </template>
    </el-table>
  </div>
</template>

<script setup>
defineProps({ kind: { type: String, default: 'activity' } })
</script>

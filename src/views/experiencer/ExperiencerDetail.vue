<!-- 体验员详情：基本信息 + 活动参与记录 -->
<template>
  <el-drawer :model-value="!!row" :title="row ? `体验员：${row.name}` : ''" size="560px" @close="$emit('close')">
    <template v-if="row">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="row.kind === '行外' ? '编号' : '统一认证号'">{{ row.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ row.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ row.gender || '—' }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ row.age || '—' }}</el-descriptions-item>
        <el-descriptions-item label="地区" :span="2">{{ row.region?.join('-') || '—' }}</el-descriptions-item>
        <template v-if="row.kind !== '行外'">
          <el-descriptions-item label="所属机构" :span="2">{{ row.org?.join('-') }}</el-descriptions-item>
          <el-descriptions-item label="职务层级">{{ row.jobLevel || '—' }}</el-descriptions-item>
          <el-descriptions-item label="体验官等级">{{ row.officerLevel }}</el-descriptions-item>
          <el-descriptions-item label="熟悉渠道" :span="2">{{ row.channels?.join('、') || '—' }}</el-descriptions-item>
          <el-descriptions-item label="熟悉业务" :span="2">{{ row.businesses?.join('、') || '—' }}</el-descriptions-item>
        </template>
        <template v-else>
          <el-descriptions-item label="教育程度">{{ row.education || '—' }}</el-descriptions-item>
          <el-descriptions-item label="所属行业">{{ row.industry || '—' }}</el-descriptions-item>
          <el-descriptions-item label="星级">{{ row.star || '—' }}</el-descriptions-item>
          <el-descriptions-item label="评级">{{ row.rating || '—' }}</el-descriptions-item>
        </template>
        <el-descriptions-item label="人员状态">{{ row.status }}</el-descriptions-item>
      </el-descriptions>
      <h4>活动参与记录</h4>
      <el-table :data="row.activities" size="small" empty-text="暂无活动记录">
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="time" label="参与时间" width="110" />
        <el-table-column prop="score" label="评价得分" width="90" />
      </el-table>
    </template>
  </el-drawer>
</template>

<script setup>
defineProps({ row: Object })
defineEmits(['close'])
</script>

<style scoped>
h4 { margin: 20px 0 10px; }
</style>

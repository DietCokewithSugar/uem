<!-- 体验问题（研发阶段）详情抽屉；优化建议详情见 #/optimSuggestDetail -->
<template>
  <el-drawer :model-value="!!row" size="560px" title="体验问题详情" @close="$emit('close')">
    <template v-if="row">
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="(label, key) in fields" :key="key" :label="label">
          <el-tag v-if="key === 'status' && row[key]" size="small" effect="plain">{{ row[key] }}</el-tag>
          <span v-else>{{ row[key] || '—' }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <div class="flow">
        <h4>处理流程</h4>
        <el-steps direction="vertical" :active="2" finish-status="success">
          <el-step title="提交" :description="`${row.proposer || ''} ${row.time || ''}`" />
          <el-step title="分拣" description="系统/管理员分拣至产品负责人" />
          <el-step :title="row.status || '处理中'" description="产品负责人处理与答复" />
        </el-steps>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
// kind 保留以兼容旧调用，目前仅用于体验问题
defineProps({ row: Object, kind: { type: String, default: 'problem' } })
defineEmits(['close'])

const fields = { id: '问题编号', product: '产品名称', desc: '描述及解决建议', dept: '问题提出部门', proposer: '提出人', time: '提出时间', adoptResult: '采纳结果', status: '状态' }
</script>

<style scoped>
.flow { margin-top: 24px; }
.flow h4 { margin: 0 0 12px; font-weight: 600; }
</style>

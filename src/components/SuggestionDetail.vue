<!-- 优化建议 / 体验问题 详情抽屉 -->
<template>
  <el-drawer :model-value="!!row" size="560px" :title="title" @close="$emit('close')">
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
          <el-step title="提交" :description="`${row.proposer || ''} ${row.submitTime || row.time || ''}`" />
          <el-step title="分拣" description="系统/管理员分拣至产品负责人" />
          <el-step :title="row.status || '处理中'" description="产品负责人处理与答复" />
        </el-steps>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ row: Object, kind: { type: String, default: 'suggestion' } })
defineEmits(['close'])

const title = computed(() => (props.kind === 'problem' ? '体验问题详情' : '优化建议详情'))
const fields = computed(() =>
  props.kind === 'problem'
    ? { id: '问题编号', product: '产品名称', desc: '描述及解决建议', dept: '问题提出部门', proposer: '提出人', time: '提出时间', adoptResult: '采纳结果', status: '状态' }
    : {
        id: '优化建议编号', product: '所属产品', column: '功能栏目', desc: '描述及解决建议', org: '提出机构', proposer: '提出人',
        submitter: '提交人', submitTime: '提交时间', source: '来源', bizDept: '所属业研部门', productLine: '所属业研产品线',
        status: '状态', adoptResult: '采纳结果', replyTime: '答复时间', implemented: '是否落实'
      }
)
</script>

<style scoped>
.flow { margin-top: 24px; }
.flow h4 { margin: 0 0 12px; font-weight: 600; }
</style>

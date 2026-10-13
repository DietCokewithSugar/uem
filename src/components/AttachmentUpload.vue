<!-- 附件上传（演示环境仅在前端保留文件名）：限制 50M 以下，最多 9 个 -->
<template>
  <div>
    <el-upload
      :file-list="modelValue"
      action="#"
      :auto-upload="false"
      multiple
      :limit="9"
      :on-change="onChange"
      :on-remove="onRemove"
      :on-exceed="() => ElMessage.warning('最多上传9个附件')"
    >
      <el-button>选择附件</el-button>
      <template #tip><div class="tip">限制在50M以下，最多上传9个附件</div></template>
    </el-upload>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

function onChange(file, list) {
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.warning('附件大小需在50M以下')
    list = list.filter((f) => f.uid !== file.uid)
  }
  emit('update:modelValue', list)
}
const onRemove = (_, list) => emit('update:modelValue', list)
</script>

<style scoped>
.tip { color: #888; font-size: 12px; line-height: 1.6; }
</style>

<!-- 附件上传（演示环境仅在前端保留文件名）：默认限制 50M 以下，最多 9 个 -->
<template>
  <div>
    <el-upload
      :file-list="modelValue"
      action="#"
      :auto-upload="false"
      multiple
      :limit="limit"
      :accept="accept"
      :on-change="onChange"
      :on-remove="onRemove"
      :on-exceed="() => ElMessage.warning(`最多上传${limit}个附件`)"
    >
      <el-button>选择附件</el-button>
      <template #tip><div class="tip">{{ tip }}</div></template>
    </el-upload>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  tip: { type: String, default: '限制在50M以下，最多上传9个附件' },
  accept: { type: String, default: '' },
  limit: { type: Number, default: 9 },
  maxMb: { type: Number, default: 50 }
})
const emit = defineEmits(['update:modelValue'])

function allowed(name) {
  if (!props.accept) return true
  const ext = (name.match(/\.[^.]+$/) || [''])[0].toLowerCase()
  return props.accept.split(',').map((s) => s.trim().toLowerCase()).includes(ext)
}
function onChange(file, list) {
  if (!allowed(file.name)) {
    ElMessage.warning('附件格式不在支持范围内')
    list = list.filter((f) => f.uid !== file.uid)
  } else if (file.size > props.maxMb * 1024 * 1024) {
    ElMessage.warning(`附件大小需在${props.maxMb}M以下`)
    list = list.filter((f) => f.uid !== file.uid)
  }
  emit('update:modelValue', list)
}
const onRemove = (_, list) => emit('update:modelValue', list)
</script>

<style scoped>
.tip { color: #888; font-size: 12px; line-height: 1.6; }
</style>

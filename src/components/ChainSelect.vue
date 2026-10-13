<!-- 级联下拉（地区：省-市-区；机构：分行-支行-网点），值为数组 -->
<template>
  <div class="chain">
    <template v-for="(opts, i) in levels" :key="i">
      <span v-if="i" class="sep">-</span>
      <el-select :model-value="modelValue[i] || ''" clearable :placeholder="' '" @update:model-value="(v) => set(i, v)">
        <el-option v-for="o in opts" :key="o.label" :label="o.label" :value="o.label" />
      </el-select>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  tree: { type: Array, required: true },
  depth: { type: Number, default: 3 }
})
const emit = defineEmits(['update:modelValue'])

const levels = computed(() => {
  const out = [props.tree]
  let nodes = props.tree
  for (let i = 1; i < props.depth; i++) {
    nodes = nodes.find((n) => n.label === props.modelValue[i - 1])?.children || []
    out.push(nodes)
  }
  return out
})
const set = (i, v) => emit('update:modelValue', [...props.modelValue.slice(0, i), ...(v ? [v] : [])])
</script>

<style scoped>
.chain { display: flex; align-items: center; gap: 6px; width: 100%; }
.chain .el-select { flex: 1; }
.sep { color: #999; }
</style>

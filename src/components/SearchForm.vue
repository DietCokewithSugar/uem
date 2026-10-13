<!-- 通用查询表单：两列布局，右上角"查询/重置/展开收起" -->
<template>
  <div class="search-form uem-card">
    <el-form :model="model" label-width="110px" class="grid">
      <el-form-item v-for="f in shownFields" :key="f.prop" :label="f.label">
        <el-input v-if="f.type === 'input' || !f.type" v-model="model[f.prop]" :placeholder="f.placeholder" clearable />
        <el-select
          v-else-if="f.type === 'select'"
          v-model="model[f.prop]"
          :placeholder="f.placeholder || ' '"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option v-for="o in f.options" :key="o" :label="o" :value="o" />
        </el-select>
        <el-date-picker
          v-else-if="f.type === 'daterange'"
          v-model="model[f.prop]"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="-"
          start-placeholder="请选择开始时间"
          end-placeholder="请选择截止时间"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <div class="actions">
      <el-button type="primary" @click="$emit('search')">查询</el-button>
      <el-button @click="$emit('reset')">重置</el-button>
      <span v-if="fields.length > collapsedCount" class="toggle" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
        <el-icon><component :is="expanded ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  model: { type: Object, required: true },
  fields: { type: Array, required: true },
  collapsedCount: { type: Number, default: 2 },
  defaultExpanded: { type: Boolean, default: true }
})
defineEmits(['search', 'reset'])

const expanded = ref(props.defaultExpanded)
const shownFields = computed(() => (expanded.value ? props.fields : props.fields.slice(0, props.collapsedCount)))
</script>

<style scoped>
.search-form { display: flex; gap: 24px; margin-bottom: 20px; }
.grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; column-gap: 32px; }
.grid :deep(.el-form-item) { margin-bottom: 18px; }
.actions { display: flex; align-items: flex-start; gap: 8px; white-space: nowrap; }
.actions .el-button + .el-button { margin-left: 0; }
.toggle { color: var(--uem-red); cursor: pointer; font-size: 13px; line-height: 32px; display: inline-flex; align-items: center; gap: 2px; }
</style>

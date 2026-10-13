<!-- 带标签的按行为分列的文本行（驱动因素、优化点） -->
<template>
  <div>
    <div v-for="(r, i) in rows" :key="i" class="row">
      <div class="label">
        <input v-if="!readonly" v-model="r.label" class="chip-input" :placeholder="labelPlaceholder" />
        <span v-else class="chip">{{ r.label || '—' }}</span>
      </div>
      <div v-for="b in behaviors" :key="b.id" class="cell">
        <input v-if="!readonly" v-model="r.cells[b.id]" :placeholder="cellPlaceholder" />
        <span v-else>{{ r.cells[b.id] || '—' }}</span>
      </div>
      <el-icon v-if="!readonly" class="del" @click="rows.splice(i, 1)"><Close /></el-icon>
    </div>
    <div v-if="readonly && !rows.length" class="none">暂无内容</div>
    <div v-if="!readonly" class="add" @click="rows.push({ label: '', cells: {} })"><el-icon><Plus /></el-icon></div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  behaviors: { type: Array, required: true },
  readonly: Boolean,
  labelPlaceholder: String,
  cellPlaceholder: String
})
</script>

<style scoped>
.row { display: flex; align-items: stretch; gap: 8px; margin-bottom: 8px; }
.label { width: 150px; flex-shrink: 0; display: flex; align-items: center; }
.chip, .chip-input {
  display: inline-flex; align-items: center; justify-content: center; width: 130px; height: 34px;
  background: #f8dfb4; color: #6b4a12; border: 1px solid #efc98a; border-radius: 2px; font-size: 13px; outline: none; text-align: center;
}
.cell { width: 200px; flex-shrink: 0; border: 1px solid #e6e8eb; background: #fff; padding: 6px 8px; font-size: 13px; display: flex; align-items: center; }
.cell input { width: 100%; border: none; outline: none; background: transparent; font-size: 13px; }
.cell input::placeholder { color: #c0c4cc; }
.del { align-self: center; color: #bbb; cursor: pointer; font-size: 12px; }
.del:hover { color: var(--uem-red); }
.add {
  width: 50px; height: 30px; margin-left: 40px; display: flex; align-items: center; justify-content: center;
  border: 1px dashed #f3d3a5; background: #fdf3e6; color: #e3a54a; cursor: pointer;
}
.none { color: #aaa; font-size: 12px; padding: 4px 0 8px; }
</style>

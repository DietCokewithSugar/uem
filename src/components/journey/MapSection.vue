<template>
  <div class="map-section">
    <div class="head">
      <span class="toggle" @click="$emit('update:open', !open)">
        <el-icon><component :is="open ? 'ArrowDown' : 'ArrowRight'" /></el-icon>
        {{ title }}
      </span>
      <el-tooltip :content="tip" placement="top"><el-icon class="tip"><InfoFilled /></el-icon></el-tooltip>
      <slot name="extra" />
    </div>
    <div v-show="open" class="body">
      <slot v-if="$slots.empty" name="empty" />
      <slot v-else />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String, tip: String, open: Boolean })
defineEmits(['update:open'])
</script>

<style scoped>
.map-section { margin-bottom: 14px; }
.head { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; font-size: 13px; color: #555; }
.toggle { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font-weight: 600; }
.tip { color: #b7bcc4; font-size: 12px; cursor: help; }
.body { padding-left: 12px; }
</style>

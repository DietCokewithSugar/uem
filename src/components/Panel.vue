<!-- 看板面板：标题栏 + 右侧扩展区 -->
<template>
  <div class="panel">
    <div class="panel-head">
      <span class="title">{{ title }}<small v-if="sub">{{ sub }}</small></span>
      <slot name="extra" />
    </div>
    <div class="panel-body"><slot /></div>
  </div>
</template>

<script setup>
defineProps({ title: String, sub: String })
</script>

<style scoped>
.panel { background: var(--uem-surface); border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); display: flex; flex-direction: column; min-width: 0; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 14px 18px 4px; }
.title { font-size: var(--uem-fs); font-weight: 600; color: var(--uem-ink); }
.title small { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); font-weight: 400; margin-left: 10px; }
.panel-body { padding: 8px 18px 16px; flex: 1; min-height: 0; }
</style>

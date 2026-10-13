<!-- 看板面板：浅红渐变标题栏 + 右侧扩展区 -->
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
.panel { background: #fff; border-radius: 4px; display: flex; flex-direction: column; min-width: 0; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 12px 18px; background: linear-gradient(90deg, #fdf1f0, #fff 70%); border-radius: 4px 4px 0 0; }
.title { font-size: 15px; font-weight: 600; color: #333; }
.title small { font-size: 11px; color: #999; font-weight: 400; margin-left: 10px; }
.panel-body { padding: 12px 18px 16px; flex: 1; min-height: 0; }
</style>

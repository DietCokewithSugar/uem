<!-- 声音看板顶部三联指标卡 -->
<template>
  <div class="kpis">
    <div v-for="(k, i) in items" :key="k.label" class="kpi" :class="`k${i}`">
      <div class="k-lbl">
        {{ k.label }}
        <el-tooltip v-if="k.tip" :content="k.tip"><el-icon class="tip"><InfoFilled /></el-icon></el-tooltip>
      </div>
      <div class="k-val" :class="{ txt: k.text }">{{ k.value }}<small v-if="k.unit">{{ k.unit }}</small><span v-if="k.cmp" class="cmp">{{ k.cmp }}</span></div>
      <div v-if="k.sub" class="k-sub">{{ k.sub }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, required: true } })
</script>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.kpi { border-radius: var(--uem-radius-lg); padding: 16px 20px; min-height: 112px; background: var(--uem-surface); border: 1px solid var(--uem-line); }
.k-lbl { font-size: var(--uem-fs-sm); color: var(--uem-ink-2); font-weight: 500; display: flex; align-items: center; gap: 4px; }
.tip { color: var(--uem-ink-3); cursor: help; }
.k-val { font-size: var(--uem-fs-3xl); font-weight: 600; margin: 8px 0 4px; color: var(--uem-ink); line-height: 1.2; }
.k-val small { font-size: var(--uem-fs-sm); font-weight: 500; margin-left: 3px; color: var(--uem-ink-3); }
.k-val.txt { font-size: var(--uem-fs-2xl); }
.cmp { font-size: var(--uem-fs-xs); font-weight: 400; color: var(--uem-ink-3); margin-left: 12px; }
.k-sub { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
</style>

<!-- 声音看板顶部三联指标卡（红 / 绿 / 蓝渐变） -->
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
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.kpi { border-radius: 6px; padding: 18px 24px; min-height: 120px; }
.k0 { background: linear-gradient(120deg, #fff 40%, #fde3e3); }
.k1 { background: linear-gradient(120deg, #fff 40%, #dff5ea); }
.k2 { background: linear-gradient(120deg, #fff 40%, #dceafb); }
.k-lbl { font-size: 15px; color: #333; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.tip { color: #6b9ee3; cursor: help; }
.k-val { font-size: 26px; font-family: Georgia, serif; margin: 10px 0 6px; color: #222; }
.k-val small { font-size: 12px; margin-left: 2px; }
.k-val.txt { font-family: inherit; font-weight: 700; }
.cmp { font-size: 12px; font-weight: 400; color: #666; margin-left: 16px; font-family: inherit; }
.k-sub { font-size: 12px; color: #888; }
</style>

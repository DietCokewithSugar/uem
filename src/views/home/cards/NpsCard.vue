<!-- 品牌 NPS（体验监测白名单）：整体净推荐值与四个维度满意度 -->
<template>
  <HomeCard title="品牌 NPS" :subtitle="`工行品牌 · ${month}`" more="/experEvaluationIndex" more-text="体验监测">
    <div class="nps">
      <span class="num">{{ d.nps.toFixed(1) }}</span><span class="unit">%</span>
      <span class="hc-tag" :class="delta >= 0 ? 'ok' : 'danger'">较上期 {{ delta >= 0 ? '+' : '' }}{{ delta.toFixed(1) }}</span>
    </div>
    <ul class="dims">
      <li v-for="x in d.dims" :key="x.name">
        <span class="dim-name">{{ x.name.replace('工行', '').replace('满意度', '') }}</span>
        <span class="track"><span class="fill" :style="{ width: (x.score / 5) * 100 + '%' }" /></span>
        <b>{{ x.score.toFixed(2) }}</b>
      </li>
    </ul>
    <div class="hc-foot"><span>满意度满分 5 分</span></div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { brandData, months } from '@/mock/monitor'

const month = months[0]
const d = computed(() => brandData[month])
const delta = computed(() => d.value.nps - brandData[months[1]].nps)
</script>

<style scoped>
.nps { display: flex; align-items: baseline; gap: 4px; }
.num { font-size: var(--uem-fs-3xl); font-weight: 600; line-height: 1.2; }
.unit { font-size: var(--uem-fs-md); color: var(--uem-ink-3); margin-right: 8px; }
.dims { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.dims li { display: grid; grid-template-columns: 64px minmax(0, 1fr) 36px; align-items: center; gap: 8px; font-size: var(--uem-fs-sm); }
.dim-name { color: var(--uem-ink-2); }
.track { height: 6px; border-radius: 3px; background: var(--uem-line-2); overflow: hidden; }
.fill { display: block; height: 100%; border-radius: 3px; background: #2a78d6; }
.dims b { font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
</style>

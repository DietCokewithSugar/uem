<!-- 方法培训：最新的方法课程（所有人可见） -->
<template>
  <HomeCard title="方法培训" more="/methodTraining">
    <ul class="hc-list">
      <li v-for="i in list" :key="i.id">
        <router-link to="/methodTraining" class="hc-row">
          <span class="hc-row-title">{{ i.name }}</span>
          <span class="hc-row-meta">{{ i.board }} · {{ i.fileType }} · {{ i.publishTime }}</span>
          <span class="hc-row-side"><span class="dl">{{ i.downloads }} 次下载</span></span>
        </router-link>
      </li>
    </ul>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { infos } from '@/mock'

const list = computed(() =>
  infos
    .filter((i) => i.type === '方法培训' && i.status === '发布')
    .slice()
    .sort((a, b) => (a.publishTime < b.publishTime ? 1 : -1))
    .slice(0, 5)
)
</script>

<style scoped>
.dl { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>

<!-- AI 技能：帮你研、伴你想（入口与简介） -->
<template>
  <HomeCard title="AI 技能" subtitle="在 AI 助手中按步骤完成用户研究与需求梳理" more="/skills">
    <ul class="skills">
      <li v-for="k in skills" :key="k.id">
        <router-link :to="{ path: '/skillDetail', query: { id: k.id } }" class="skill">
          <span class="name">{{ k.name }}<span v-if="k.concept" class="hc-tag">构思中</span></span>
          <span class="desc">{{ k.summary }}</span>
        </router-link>
      </li>
    </ul>
  </HomeCard>
</template>

<script setup>
import HomeCard from '@/components/HomeCard.vue'
import { skills } from '@/mock/skills'
</script>

<style scoped>
.skills { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.skills li + li { border-top: 1px solid var(--uem-line-2); }
.skill { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; }
.skills li:first-child .skill { padding-top: 2px; }
.skill:hover .name { color: var(--uem-red); }
.name { display: flex; align-items: center; gap: 8px; font-size: var(--uem-fs); font-weight: 600; color: var(--uem-ink); transition: color 0.15s; }
.desc { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); line-height: 1.5; }
</style>

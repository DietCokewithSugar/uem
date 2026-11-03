<!-- AI 工具 · 技能 #/skills：在 AI 助手中运行的技能（平台只提供介绍与入口，产出不与平台数据联动） -->
<template>
  <div class="skills">
    <p class="intro">技能在 AI 助手中按步骤运行，这里介绍每个技能能做什么、怎么开口。技能产出的文档供你继续编辑，不会写入平台数据。</p>
    <div class="list">
      <article v-for="s in skills" :key="s.id" class="skill">
        <header class="head">
          <h2>{{ s.name }}</h2>
          <span v-if="s.concept" class="hc-tag">构思中</span>
        </header>
        <p class="summary">{{ s.summary }}</p>
        <dl class="meta">
          <div><dt>适合</dt><dd>{{ s.audience }}</dd></div>
          <div><dt>产出</dt><dd>{{ s.output }}</dd></div>
        </dl>
        <div v-if="s.researchTypes" class="types">
          <span v-for="t in s.researchTypes" :key="t" class="type">{{ t }}</span>
        </div>
        <footer class="foot">
          <el-button v-if="!s.concept" type="primary" @click="router.push({ path: '/skillDetail', query: { id: s.id } })">查看说明与演示</el-button>
          <el-button v-else @click="router.push({ path: '/skillDetail', query: { id: s.id } })">查看构思</el-button>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { skills } from '@/mock/skills'
import '@/views/home/home.css'

const router = useRouter()
</script>

<style scoped>
.intro { margin: 0 0 16px; max-width: 70ch; color: var(--uem-ink-2); font-size: var(--uem-fs); line-height: 1.7; }
.list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.skill { display: flex; flex-direction: column; gap: 12px; padding: 20px 24px; background: var(--uem-surface); border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); }
.head { display: flex; align-items: center; gap: 10px; }
.head h2 { margin: 0; font-size: var(--uem-fs-lg); font-weight: 600; }
.summary { margin: 0; color: var(--uem-ink); line-height: 1.7; }
.meta { margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: var(--uem-fs-sm); }
.meta div { display: flex; gap: 12px; }
.meta dt { width: 32px; flex-shrink: 0; color: var(--uem-ink-3); }
.meta dd { margin: 0; color: var(--uem-ink-2); }
.types { display: flex; flex-wrap: wrap; gap: 6px; }
.type { padding: 2px 8px; border-radius: var(--uem-radius-sm); background: var(--uem-surface-2); border: 1px solid var(--uem-line-2); font-size: var(--uem-fs-xs); color: var(--uem-ink-2); }
.foot { margin-top: auto; padding-top: 4px; }
@media (max-width: 1100px) { .list { grid-template-columns: minmax(0, 1fr); } }
</style>

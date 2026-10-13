<!-- 质检报告详情 #/agentDetail?id= -->
<template>
  <div v-if="report" ref="root" class="uem-card detail">
    <div class="head">
      <div>
        <b class="title">{{ report.title }}</b>
        <span class="time">{{ report.createTime }}</span>
      </div>
      <div class="actions">
        <el-button size="small" plain type="primary" @click="router.push('/agentFirst')">返回列表</el-button>
        <el-button size="small" type="primary" @click="exportDoc"><el-icon><Download /></el-icon>导出当前报告</el-button>
      </div>
    </div>
    <div class="sub">
      <div class="tabs">
        <span v-for="t in tabs" :key="t.key" class="tab" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</span>
      </div>
      <span class="ai-note">AI 仅作为辅助来进行用户体验评估</span>
    </div>

    <section class="box">
      <div class="box-head">
        <b>测评素材</b>
        <a class="fold" @click="showMaterial = !showMaterial">{{ showMaterial ? '收起' : '展开' }}<el-icon><component :is="showMaterial ? 'ArrowUp' : 'ArrowDown'" /></el-icon></a>
      </div>
      <div v-show="showMaterial" class="materials">
        <div v-for="(m, i) in report.materials" :key="i" class="material"><ScreenThumb :material="m" /></div>
      </div>
    </section>

    <!-- 综合报告 -->
    <template v-if="tab === 'all'">
      <div class="two">
        <section class="box">
          <b>执行摘要</b>
          <p v-for="(p, i) in report.summary" :key="i">{{ p }}</p>
        </section>
        <section class="box">
          <b>用户诉求</b>
          <p><strong>用户的根本诉求是</strong>{{ report.demand }}</p>
          <p><strong>体验关键词：</strong>{{ report.keywords.join('、') }}</p>
        </section>
      </div>

      <section class="box">
        <b>维度详细解读</b>
        <div class="dims">
          <div v-for="d in report.dimensions" :key="d.name" class="dim">
            <div class="dim-head"><b>{{ d.name }}</b><el-rate :model-value="d.score" disabled allow-half size="small" /><span class="score">{{ d.score }}</span></div>
            <p>{{ d.text }}</p>
          </div>
        </div>
      </section>

      <div class="two">
        <section class="box">
          <b>维度评分</b>
          <EChart class="radar" :option="radar" />
        </section>
        <section class="box">
          <b>待优化点</b>
          <div v-for="(x, i) in report.issues" :key="i" class="issue">
            <el-tag :type="x.severity === '高' ? 'danger' : 'warning'" size="small" effect="plain">{{ x.severity }}</el-tag>
            <div>
              <div class="issue-title">{{ x.title }}</div>
              <div class="issue-sub">维度：{{ x.dimension }} ｜ 建议：{{ x.suggestion }}</div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- 单角色 -->
    <template v-else-if="roleView">
      <section class="box">
        <b>{{ roleName(tab) }} · 评估结论</b>
        <p>{{ roleView.summary }}</p>
        <p>角色综合评分：<span class="score big">{{ roleView.score }}</span> / 5</p>
      </section>
      <section class="box">
        <b>主要发现</b>
        <div v-for="(f, i) in roleView.findings" :key="i" class="finding"><strong>{{ f.dimension }}：</strong>{{ f.text }}</div>
      </section>
      <section class="box">
        <b>优化建议</b>
        <ol><li v-for="(s, i) in roleView.suggestions" :key="i">{{ s }}</li></ol>
      </section>
    </template>
  </div>
  <el-empty v-else description="报告不存在或已删除" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EChart from '@/components/EChart.vue'
import ScreenThumb from '@/components/ScreenThumb.vue'
import { qcReports, qcRoles } from '@/mock/qc'

const route = useRoute()
const router = useRouter()
const report = computed(() => qcReports.find((r) => r.id === route.query.id))
const roleName = (id) => qcRoles.find((r) => r.id === Number(id))?.name || '已删除角色'

const tab = ref('all')
const tabs = computed(() => [{ key: 'all', label: '综合报告' }, ...report.value.roleIds.map((id) => ({ key: String(id), label: roleName(id) }))])
const roleView = computed(() => report.value.roleViews[tab.value])
const showMaterial = ref(true)

const radar = computed(() => ({
  color: ['#c7000b'],
  radar: { indicator: report.value.dimensions.map((d) => ({ name: d.name, max: 5 })), radius: '65%' },
  series: [{ type: 'radar', areaStyle: { opacity: 0.15 }, data: [{ value: report.value.dimensions.map((d) => d.score), name: '得分' }] }]
}))

// 导出为 Word 可打开的 .doc（HTML 格式）
function exportDoc() {
  const r = report.value
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const html = `<html><head><meta charset="utf-8"><title>${esc(r.title)}</title></head><body>
<h1>${esc(r.title)}</h1><p>${esc(r.createTime)}　AI 仅作为辅助来进行用户体验评估</p>
<h2>执行摘要</h2>${r.summary.map((p) => `<p>${esc(p)}</p>`).join('')}
<h2>用户诉求</h2><p>用户的根本诉求是${esc(r.demand)}</p><p>体验关键词：${esc(r.keywords.join('、'))}</p>
<h2>维度详细解读</h2>${r.dimensions.map((d) => `<h3>${esc(d.name)}（${d.score} 分）</h3><p>${esc(d.text)}</p>`).join('')}
<h2>待优化点</h2><ol>${r.issues.map((x) => `<li>【${x.severity}】${esc(x.title)}——${esc(x.suggestion)}</li>`).join('')}</ol>
${r.roleIds.map((id) => { const v = r.roleViews[id]; return v ? `<h2>${esc(roleName(id))}</h2><p>${esc(v.summary)}</p><p>评分：${v.score}</p>` : '' }).join('')}
</body></html>`
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + html], { type: 'application/msword' }))
  a.download = `${r.title}.doc`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 16px; }
.time { color: #999; font-size: 12px; margin-left: 8px; }
.sub { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
.tabs { display: flex; gap: 10px; }
.tab { padding: 4px 16px; border: 1px solid #ddd; border-radius: 14px; font-size: 12px; color: #555; cursor: pointer; }
.tab.active { border-color: var(--uem-red); color: var(--uem-red); }
.ai-note { font-size: 12px; color: #888; }
.box { border: 1px solid #eee; border-radius: 4px; padding: 16px 20px; margin-bottom: 16px; font-size: 13px; color: #555; line-height: 1.8; }
.box > b { color: #333; font-size: 14px; display: block; margin-bottom: 8px; }
.box-head { display: flex; justify-content: space-between; }
.fold { color: #3a6fd8; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 2px; }
.materials { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; padding: 12px 0; }
.material { width: 280px; height: 140px; border: 1px solid #eee; }
.two { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }
.dims { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dim { border: 1px solid #f2f2f2; border-radius: 4px; padding: 10px 14px; }
.dim-head { display: flex; align-items: center; gap: 8px; }
.dim p { margin: 6px 0 0; }
.score { color: var(--uem-red); font-weight: 600; }
.score.big { font-size: 20px; }
.radar { height: 260px; }
.issue { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px dashed #eee; }
.issue-title { color: #333; }
.issue-sub { color: #888; font-size: 12px; }
.finding { margin-bottom: 6px; }
</style>

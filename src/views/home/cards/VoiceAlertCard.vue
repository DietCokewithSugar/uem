<!-- 声音异动（智能分析查看岗）：按岗位上的产品领域显示；产品领域为「全领域」时可进入全量声音看板 -->
<template>
  <HomeCard title="声音异动" :subtitle="`产品领域：${domain}${full ? '（全量）' : ''} · ${month}`" :more="full ? '/journeyVoiceAnalyze' : null" more-text="声音看板">
    <div class="kpis">
      <div>
        <div class="hc-tile-label">有效声音</div>
        <div class="kpi-val">{{ valid.toLocaleString() }}<small>条</small></div>
        <div class="hc-tile-note" :class="{ up: diff > 0 }">较上期 {{ diff > 0 ? '+' : '' }}{{ diff.toLocaleString() }}</div>
      </div>
      <div>
        <div class="hc-tile-label">压力等级</div>
        <div class="kpi-val sm">{{ boardData.pressure }}</div>
        <div class="hc-tile-note">集中在{{ boardData.focusDim }}</div>
      </div>
    </div>
    <div class="sub-title">本领域典型问题</div>
    <ol class="problems">
      <li v-for="p in problems" :key="p">{{ p }}</li>
    </ol>
    <div class="hc-foot"><span class="uem-ai-tag"><el-icon><MagicStick /></el-icon>AI 分析</span><span>依据：声音看板 {{ month }} 数据</span></div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { scopeOf, isAdmin } from '@/config/access'
import { boardData, boardMonths } from '@/mock/voice'
import { productDomains } from '@/mock/voiceTools'

const month = boardMonths[boardMonths.length - 1]
const domain = computed(() => scopeOf('智能分析查看岗', 'productDomain') || (isAdmin() ? '全领域' : ''))
const full = computed(() => domain.value === '全领域')
const products = computed(() => productDomains.find((d) => d.name === domain.value)?.products || [])
// 本领域内产品的有效声音数（全领域取看板总数）
const share = computed(() => {
  if (full.value) return 1
  const all = boardData.byProduct.reduce((n, [, v]) => n + v, 0)
  const mine = boardData.byProduct.filter(([p]) => products.value.includes(p)).reduce((n, [, v]) => n + v, 0)
  return all ? mine / all : 0
})
const valid = computed(() => Math.round(boardData.valid * share.value))
const diff = computed(() => Math.round(boardData.diff * share.value))
const problems = computed(() => (full.value ? boardData.problems.slice(0, 3) : boardData.problems.filter((p) => /转账|短信|交易|登录|扣款/.test(p)).slice(0, 3)))
</script>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.kpi-val { margin-top: 2px; font-size: var(--uem-fs-2xl); font-weight: 600; line-height: 1.25; }
.kpi-val.sm { font-size: var(--uem-fs-lg); line-height: 1.6; }
.kpi-val small { margin-left: 2px; font-size: var(--uem-fs-sm); font-weight: 500; color: var(--uem-ink-3); }
.up { color: var(--uem-danger); }
.sub-title { margin-top: 14px; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.problems { margin: 6px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; font-size: var(--uem-fs-sm); color: var(--uem-ink); line-height: 1.5; }
</style>

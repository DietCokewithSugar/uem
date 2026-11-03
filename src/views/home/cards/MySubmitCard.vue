<!-- 我的提交进度：本人提交的优化建议在哪个环节、由谁处理 -->
<template>
  <HomeCard title="我的提交进度" :subtitle="summary" more="/mySubmit">
    <ul v-if="rows.length" class="hc-list">
      <li v-for="r in rows" :key="r.id">
        <router-link :to="r.to" class="hc-row">
          <span class="hc-row-title">{{ r.title }}</span>
          <span class="hc-row-meta">{{ r.product }} · 提交于 {{ r.submitTime }}</span>
          <span class="hc-row-side">
            <span class="steps" :aria-label="`进度：${r.status}`">
              <i v-for="(st, i) in r.steps" :key="st" :class="{ on: i <= r.step, now: i === r.step && !r.finished }" :title="st" />
            </span>
            <span class="hc-tag" :class="r.tone">{{ r.status }}{{ r.handler ? ` · ${r.handler}` : '' }}</span>
          </span>
        </router-link>
      </li>
    </ul>
    <div v-else class="hc-empty">
      <b>还没有提交过优化建议</b>
      <span>发现问题时可以在「提交优化建议」里一句话描述。</span>
    </div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { currentUser } from '@/config/user'
import { suggestions, detailRoute, isBranchOrg, pendingStatuses } from '@/mock/suggest'

const firstLine = (t = '') => t.split('\n')[0].replace(/^【现象】/, '')
const mine = computed(() => suggestions.filter((s) => s.submitterId === currentUser.id))

// 进度：提交 →（审批）→ 分拣 → 答复 → 审核 → 落实
const STEP = { 待修改: 0, 待审批: 1, 待分拣: 2, 待答复: 3, 待业务部门答复: 3, 待审核: 4, 待跟进: 5, 待开发中心处理: 5 }
function progressOf(s) {
  const branch = isBranchOrg(s.submitOrg)
  const steps = branch ? ['提交', '审批', '分拣', '答复', '审核', '落实'] : ['提交', '分拣', '答复', '审核', '落实']
  const finished = !pendingStatuses.includes(s.status)
  let step = finished ? steps.length - 1 : STEP[s.status] ?? 0
  if (!branch && !finished && step > 0) step -= 1
  const tone = s.status === '待修改' ? 'warn' : s.status === '已中止' ? '' : finished ? 'ok' : 'info'
  return { steps, step, finished, tone }
}
const rows = computed(() =>
  mine.value
    .slice()
    .sort((a, b) => (a.submitTime < b.submitTime ? 1 : -1))
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      title: firstLine(s.desc),
      product: s.product,
      submitTime: s.submitTime,
      status: s.status,
      handler: pendingStatuses.includes(s.status) && s.status !== '待修改' ? s.currentHandler : '',
      to: detailRoute(s, '我的提交'),
      ...progressOf(s)
    }))
)
const summary = computed(() => {
  const all = mine.value.length
  const doing = mine.value.filter((s) => pendingStatuses.includes(s.status)).length
  return all ? `共提交 ${all} 条，处理中 ${doing} 条` : ''
})
</script>

<style scoped>
.steps { display: inline-flex; gap: 3px; }
.steps i { width: 14px; height: 4px; border-radius: 2px; background: var(--uem-line); }
.steps i.on { background: #9aa3af; }
.steps i.now { background: var(--uem-ink); }
</style>

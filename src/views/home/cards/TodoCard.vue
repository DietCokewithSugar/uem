<!-- 我的待办：按岗位汇总当前用户为处理人的事项（优化建议各环节、旅程审核、公告审批、体验任务） -->
<template>
  <HomeCard title="我的待办" :subtitle="subtitle" :count="rows.length || null" :more="moreTo">
    <div v-if="chips.length" class="chips">
      <router-link v-for="c in chips" :key="c.label" :to="c.to" class="chip" :class="{ zero: !c.n }">
        <span>{{ c.label }}</span><b>{{ c.n }}</b>
      </router-link>
    </div>
    <ul v-if="rows.length" class="hc-list">
      <li v-for="r in rows.slice(0, limit)" :key="r.key">
        <router-link :to="r.to" class="hc-row">
          <span class="hc-row-title"><span class="kind">{{ r.kind }}</span>{{ r.title }}</span>
          <span class="hc-row-meta">{{ r.meta }}</span>
          <span class="hc-row-side"><span class="hc-tag" :class="r.dueClass">{{ r.due }}</span></span>
        </router-link>
      </li>
    </ul>
    <div v-else class="hc-empty">
      <b>暂无待办</b>
      <span>{{ emptyText }}</span>
    </div>
    <div v-if="rows.length > limit" class="hc-foot"><span>还有 {{ rows.length - limit }} 项，按逾期风险排序</span></div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { currentUser } from '@/config/user'
import { can } from '@/config/access'
import { visibleMenus } from '@/config/menus'
import { suggestions, slaDays, stayDays, detailRoute } from '@/mock/suggest'
import { journeys, tasks, activities } from '@/mock'
import { notices } from '@/mock/notices'
import { fmtDate } from '@/mock/holidays'

const limit = 6
const today = fmtDate(new Date())
const firstLine = (t = '') => t.split('\n')[0].replace(/^【现象】/, '')

// 当前身份可见的「我的待办」菜单（待修改对所有人可见）
const statusMenus = computed(() => visibleMenus('suggest').find((g) => g.title === '我的待办')?.children || [])
const mine = computed(() => suggestions.filter((s) => s.currentHandlerId === currentUser.id && statusMenus.value.some((m) => m.title === s.status)))

function dueOf(s) {
  if (s.status === '待跟进') {
    if (!s.planTime) return ['跟进中', '']
    return s.planTime < today ? ['计划落实已过期', 'danger'] : [`计划 ${s.planTime.slice(5)} 落实`, '']
  }
  const sla = slaDays[s.status]
  if (sla == null) return [`已停留 ${stayDays(s)} 个工作日`, '']
  const left = sla - stayDays(s)
  if (left < 0) return [`逾期 ${-left} 个工作日`, 'danger']
  return left === 0 ? ['今天到期', 'warn'] : [`剩 ${left} 个工作日`, '']
}
const RANK = { danger: 0, warn: 1, '': 2 }

const rows = computed(() => {
  const list = mine.value.map((s) => {
    const [due, dueClass] = dueOf(s)
    return {
      key: s.id,
      kind: `优化建议 · ${s.status}`,
      title: firstLine(s.desc),
      meta: `${s.product} · ${s.status === '待修改' ? '退回人 ' + (s.logs.find((l) => l.action === '退回提交人')?.operator || '') : `${s.proposer} · ${s.proposerOrg}`}`,
      due,
      dueClass,
      rank: RANK[dueClass],
      stay: stayDays(s),
      to: detailRoute(s, s.status)
    }
  })
  if (can('journey.manage')) {
    for (const j of journeys) {
      if (j.status === '待审核') list.push({ key: j.id, kind: '灵犀旅程 · 待审核', title: j.name, meta: `${j.product} · 提交于 ${j.updateTime || j.createTime || ''}`, due: '待审核', dueClass: '', rank: 2, stay: 0, to: '/journeyExamine' })
      if (j.status === '待修改' && (j.maintainerIds || []).includes(currentUser.id)) list.push({ key: j.id + 'm', kind: '灵犀旅程 · 待修改', title: j.name, meta: j.product, due: '待修改', dueClass: 'warn', rank: 1, stay: 0, to: '/journeyModify' })
    }
  }
  if (can('notice.approve')) {
    for (const n of notices.filter((x) => x.status === '待审批')) list.push({ key: n.id || n.name, kind: '体验公告 · 待审批', title: n.name, meta: `${n.org || ''} · ${n.submitTime}`, due: '待审批', dueClass: '', rank: 2, stay: 0, to: '/noticePending' })
  }
  if (can('activity.approve')) {
    for (const a of activities.filter((x) => x.pendingForMe)) list.push({ key: a.id, kind: '体验活动 · 待审批', title: a.name, meta: a.submitTime, due: '待审批', dueClass: '', rank: 2, stay: 0, to: '/activityPending' })
  }
  for (const t of tasks.filter((x) => x.pendingForMe)) list.push({ key: t.id || t.name, kind: '体验任务', title: t.name, meta: t.endTime ? `截止 ${t.endTime}` : '', due: '待执行', dueClass: '', rank: 2, stay: 0, to: '/taskPending' })
  return list.sort((a, b) => a.rank - b.rank || b.stay - a.stay)
})

const STATUS_TO = (m) => ({ path: m.path, query: m.query })
const chips = computed(() =>
  statusMenus.value
    .map((m) => ({ label: m.title, n: mine.value.filter((s) => s.status === m.title).length, to: STATUS_TO(m) }))
    .filter((c) => c.n || c.label !== '待修改')
)
const duties = computed(() => statusMenus.value.map((m) => m.title).filter((t) => t !== '待修改'))
const subtitle = computed(() => (duties.value.length ? `负责环节：${duties.value.join('、')}` : '被退回的优化建议会出现在这里，修改后重新提交'))
const emptyText = computed(() => (duties.value.length ? '新的待办会按提醒邮件同步出现在这里。' : '你提交的优化建议进展可在「我的提交进度」查看。'))
const moreTo = computed(() => {
  const hit = chips.value.find((c) => c.n) || chips.value[0]
  return hit ? hit.to : '/mySubmit'
})
</script>

<style scoped>
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--uem-line);
  border-radius: var(--uem-radius);
  font-size: var(--uem-fs-sm);
  color: var(--uem-ink-2);
  transition: border-color 0.15s, color 0.15s;
}
.chip b { font-weight: 600; color: var(--uem-ink); font-variant-numeric: tabular-nums; }
.chip:hover { border-color: var(--uem-red-line); color: var(--uem-red); }
.chip.zero b { color: var(--uem-ink-4); }
.kind { margin-right: 8px; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
</style>

<!-- 灵犀旅程：旅程维护人员看待办与本人维护的旅程，其他人看已发布的旅程看板 -->
<template>
  <HomeCard title="灵犀旅程" :subtitle="manage ? `待审核 ${count('待审核')} · 待修改 ${count('待修改')}` : '已发布的旅程看板'" :more="manage ? '/myJourney' : '/journeysBoardConfig'" :more-text="manage ? '旅程维护' : '旅程看板'">
    <ul v-if="list.length" class="hc-list">
      <li v-for="j in list" :key="j.id">
        <router-link :to="j.status === '已发布旅程结构' ? { path: '/journeysBoardConfig', query: { id: j.id } } : '/myJourney'" class="hc-row">
          <span class="hc-row-title">{{ j.name }}</span>
          <span class="hc-row-meta">{{ j.product }}</span>
          <span class="hc-row-side"><span class="hc-tag" :class="tone(j.status)">{{ j.status.replace('旅程结构', '') }}</span></span>
        </router-link>
      </li>
    </ul>
    <div v-else class="hc-empty"><b>暂无已发布的旅程</b></div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { can } from '@/config/access'
import { currentUser } from '@/config/user'
import { journeys } from '@/mock'

const manage = computed(() => can('journey.manage'))
const count = (st) => journeys.filter((j) => j.status === st).length
const mine = (j) => (j.maintainerIds || []).includes(currentUser.id) || j.adminId === currentUser.id
const list = computed(() => {
  if (!manage.value) return journeys.filter((j) => j.status === '已发布旅程结构').slice(0, 4)
  const order = { 待审核: 0, 待修改: 1, 待编辑旅程结构: 2, 已发布旅程结构: 3 }
  return journeys
    .filter((j) => j.status === '待审核' || mine(j) || j.status === '已发布旅程结构')
    .slice()
    .sort((a, b) => order[a.status] - order[b.status])
    .slice(0, 4)
})
const tone = (st) => (st === '已发布旅程结构' ? 'ok' : st === '待审核' ? 'info' : st === '待修改' ? 'warn' : '')
</script>

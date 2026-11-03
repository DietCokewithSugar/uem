<!-- 体验质检智能体（质检智能体使用岗）：最近的质检报告与新建入口 -->
<template>
  <HomeCard title="体验质检智能体" subtitle="上传设计稿，由专家角色和用户画像评估" more="/agentFirst">
    <ul class="hc-list">
      <li v-for="r in recent" :key="r.id">
        <router-link :to="{ path: '/agentDetail', query: { id: r.id } }" class="hc-row">
          <span class="hc-row-title">{{ r.title }}</span>
          <span class="hc-row-meta">{{ r.creator }} · {{ r.createTime.slice(0, 16) }}</span>
          <span class="hc-row-side"><span class="hc-tag" :class="{ info: r.type === 'ab' }">{{ r.type === 'ab' ? 'AB方案对比' : '单场景质检' }}</span></span>
        </router-link>
      </li>
    </ul>
    <div class="hc-foot">
      <span>共 {{ qcReports.length }} 份报告</span>
      <el-button type="primary" plain size="small" @click="router.push('/agentFirst')">新建质检</el-button>
    </div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import HomeCard from '@/components/HomeCard.vue'
import { qcReports } from '@/mock/qc'

const router = useRouter()
const recent = computed(() => qcReports.slice().sort((a, b) => (a.createTime < b.createTime ? 1 : -1)).slice(0, 3))
</script>

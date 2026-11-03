<!-- 体验活动：进行中的体验活动（所有人可看列表） -->
<template>
  <HomeCard title="体验活动" :subtitle="`进行中 ${ongoing.length} 场`" more="/headOfficeAllActivity">
    <ul class="hc-list">
      <li v-for="a in ongoing.slice(0, 4)" :key="a.id">
        <router-link :to="a.level === '总行' ? '/headOfficeAllActivity' : '/branchAllActivity'" class="hc-row">
          <span class="hc-row-title">{{ a.name }}</span>
          <span class="hc-row-meta">{{ a.method }} · {{ a.people }} 人 · {{ a.submitTime }}</span>
          <span class="hc-row-side"><span class="hc-tag">{{ a.level }}</span></span>
        </router-link>
      </li>
    </ul>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { activities } from '@/mock'

const ongoing = computed(() => activities.filter((a) => a.status === '进行中'))
</script>

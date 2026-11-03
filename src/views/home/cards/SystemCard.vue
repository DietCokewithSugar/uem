<!-- 系统运行概况（系统管理员）：人员、产品、定时任务与提醒邮件 -->
<template>
  <HomeCard title="系统运行概况" subtitle="平台配置与后台任务的当前状态" more="/personMaintenance" more-text="系统管理">
    <div class="hc-tiles">
      <router-link to="/personMaintenance" class="hc-tile tile-link">
        <div class="hc-tile-label">平台人员</div>
        <div class="hc-tile-value">{{ activePersons }}<small>人</small></div>
        <div class="hc-tile-note">冻结 {{ persons.length - activePersons }} 人</div>
      </router-link>
      <router-link to="/productMaintenance" class="hc-tile tile-link">
        <div class="hc-tile-label">在用产品</div>
        <div class="hc-tile-value">{{ activeProducts }}<small>个</small></div>
        <div class="hc-tile-note">未分类 {{ unclassified }} 个</div>
      </router-link>
      <router-link to="/scheduleJobList" class="hc-tile tile-link">
        <div class="hc-tile-label">定时任务</div>
        <div class="hc-tile-value">{{ runningJobs }}<small>/{{ scheduleJobs.length }}</small></div>
        <div class="hc-tile-note">运行中 / 全部</div>
      </router-link>
      <router-link to="/menuMaintenance" class="hc-tile tile-link">
        <div class="hc-tile-label">一级菜单</div>
        <div class="hc-tile-value">{{ topNav.filter((n) => !n.frozen).length }}<small>个</small></div>
        <div class="hc-tile-note">冻结 {{ topNav.filter((n) => n.frozen).length }} 个</div>
      </router-link>
    </div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { persons, productList } from '@/mock/system'
import { scheduleJobs } from '@/mock/scheduleJobs'
import { topNav } from '@/config/menus'

const activePersons = computed(() => persons.filter((p) => p.status !== '冻结').length)
const inUse = computed(() => productList.filter((p) => p.status !== '冻结' && p.state !== '已废弃'))
const activeProducts = computed(() => inUse.value.length)
const unclassified = computed(() => inUse.value.filter((p) => !p.rdDept && p.outer !== '软件开发中心').length)
const runningJobs = computed(() => scheduleJobs.filter((j) => j.status === '已启动').length)
</script>

<style scoped>
.tile-link { color: inherit; transition: background 0.15s; }
.tile-link:hover { background: var(--uem-hover); }
</style>

<!-- 首页横幅：展示「系统管理 · 轮播图维护」中状态为「展示中」的横幅 -->
<template>
  <div class="banner">
    <el-carousel v-if="slides.length" height="160px" :autoplay="slides.length > 1" :interval="6000" :indicator-position="slides.length > 1 ? '' : 'none'" arrow="hover">
      <el-carousel-item v-for="c in slides" :key="c.id"><CarouselSlide :item="c" /></el-carousel-item>
    </el-carousel>
    <div v-else class="empty">暂无展示中的横幅，可在「轮播图维护」中激活</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CarouselSlide from '@/components/CarouselSlide.vue'
import { carousels } from '@/mock/system'

const slides = computed(() => carousels.filter((c) => c.status === '展示中').sort((a, b) => (a.sort || 99) - (b.sort || 99)))
</script>

<style scoped>
.banner { height: 100%; border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); overflow: hidden; background: var(--uem-surface); }
.empty { height: 160px; display: grid; place-items: center; color: var(--uem-ink-3); font-size: var(--uem-fs-sm); }
</style>

<!-- 尚未拿到截图的页面占位 -->
<template>
  <div class="placeholder" :class="{ standalone: route.path === '/' + route.meta.section }">
    <el-empty :description="desc">
      <p class="tip">请上传该页签截图后补充构建</p>
    </el-empty>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { topNav } from '@/config/menus'

const route = useRoute()
const desc = computed(() => {
  const name = route.meta.title || topNav.find((n) => n.key === route.meta.section)?.title
  return `「${name}」页面待构建`
})
</script>

<style scoped>
.placeholder { background: #fff; border-radius: 4px; padding: 60px 0; }
.placeholder.standalone { margin: 20px; min-height: calc(100vh - 190px); }
.tip { color: #999; font-size: 13px; margin: 0; }
</style>

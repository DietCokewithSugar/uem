<!-- 二级页面布局：左侧分组菜单 + 面包屑 + 页面标题 -->
<template>
  <div class="section">
    <aside class="side">
      <div v-for="group in menus" :key="group.title" class="group">
        <div class="group-title" @click="toggle(group.title)">
          <span>{{ group.title }}</span>
          <el-icon><component :is="isOpen(group.title) ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        </div>
        <el-collapse-transition>
          <div v-show="isOpen(group.title)">
            <router-link
              v-for="item in group.children"
              :key="item.title"
              :to="{ path: item.path, query: item.query }"
              class="side-item"
              :class="{ active: isActive(item) }"
            >
              {{ item.title }}<template v-if="item.countKey"> ({{ todoCounts[item.countKey] }})</template>
            </router-link>
          </div>
        </el-collapse-transition>
      </div>
    </aside>

    <section class="content">
      <div class="page-head">
        <div class="crumbs">
          <span v-for="(c, i) in crumbs" :key="i" class="crumb" :class="{ last: i === crumbs.length - 1 }">{{ c }}</span>
        </div>
        <h2 class="page-title">{{ pageTitle }}</h2>
      </div>
      <div class="page-body">
        <router-view :key="route.fullPath" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sideMenus, topNav, pendingStatus } from '@/config/menus'
import { todoCounts } from '@/mock'

const props = defineProps({ section: { type: String, required: true } })
const route = useRoute()

const menus = computed(() => sideMenus[props.section] || [])
const opened = ref(new Set())

const isActive = (item) => {
  if (item.path !== route.path) return false
  if (item.query?.suggestStatus !== undefined && route.query.suggestStatus !== undefined) {
    return item.query.suggestStatus === route.query.suggestStatus
  }
  return true
}

// 默认展开"待办工作"与当前页面所在分组
watch(
  () => route.fullPath,
  () => {
    const s = new Set(opened.value)
    s.add('待办工作')
    menus.value.forEach((g) => g.children.some(isActive) && s.add(g.title))
    opened.value = s
  },
  { immediate: true }
)
const isOpen = (t) => opened.value.has(t)
const toggle = (t) => {
  const s = new Set(opened.value)
  s.has(t) ? s.delete(t) : s.add(t)
  opened.value = s
}

const pageTitle = computed(() => {
  if (route.path === '/optimPending') return pendingStatus[route.query.suggestStatus] || '待处理'
  return route.meta.title || ''
})
const crumbs = computed(() => {
  const sectionTitle = topNav.find((n) => n.key === props.section)?.title
  return [sectionTitle, route.meta.group, pageTitle.value].filter(Boolean)
})
</script>

<style scoped>
.section { display: flex; min-height: calc(100vh - 148px); }

.side { width: 240px; flex-shrink: 0; background: #fff; padding: 8px 0 40px; }
.group-title {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; color: #555; cursor: pointer; font-size: 14px;
}
.group-title .el-icon { color: #999; font-size: 12px; }
.side-item { display: block; padding: 11px 20px 11px 44px; color: #666; font-size: 13px; }
.side-item:hover { color: var(--uem-red); }
.side-item.active { background: linear-gradient(90deg, #e5575e, #f08a8f); color: #fff; }

.content { flex: 1; min-width: 0; }
.page-head {
  padding: 16px 24px 24px;
  background:
    radial-gradient(ellipse at 30% 160%, rgba(199, 0, 11, 0.16), transparent 60%),
    radial-gradient(ellipse at 90% -60%, rgba(199, 0, 11, 0.18), transparent 60%),
    linear-gradient(180deg, #fff, #fbeff0);
}
.crumbs { display: flex; margin-bottom: 14px; }
.crumb {
  position: relative;
  padding: 7px 22px;
  background: #f2f2f2;
  color: #777;
  font-size: 12px;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%);
  margin-right: -6px;
}
.crumb:first-child { clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%); }
.crumb.last { background: var(--uem-red); color: #fff; }
.page-title { margin: 0; font-size: 22px; font-weight: 500; color: #333; }
.page-body { padding: 20px 24px 40px; }
</style>

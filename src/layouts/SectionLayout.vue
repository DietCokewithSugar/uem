<!-- 二级页面布局：左侧分组菜单 + 面包屑 + 页面标题 -->
<template>
  <div class="section">
    <aside class="side">
      <div v-for="group in menus" :key="group.title" class="group">
        <router-link v-if="!group.children" :to="group.path" class="group-title leaf" :class="{ active: isActive(group) }">
          {{ group.title }}
        </router-link>
        <div v-else class="group-title" @click="toggle(group.title)">
          <span>{{ group.title }}</span>
          <el-icon><component :is="isOpen(group.title) ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        </div>
        <el-collapse-transition v-if="group.children">
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
      <div v-if="!route.meta.bare" class="page-head">
        <div class="crumbs-row">
          <div class="crumbs">
            <span v-for="(c, i) in crumbs" :key="i" class="crumb" :class="{ last: i === crumbs.length - 1 }">{{ c }}</span>
          </div>
          <!-- 页面可通过 <Teleport defer to="#page-head-extra"> 放置右上角工具栏 -->
          <div id="page-head-extra" />
        </div>
        <div v-if="route.meta.titleTabs" class="title-tabs">
          <router-link
            v-for="t in route.meta.titleTabs"
            :key="t.key"
            :to="{ path: route.path, query: { tab: t.key } }"
            class="title-tab"
            :class="{ active: (route.query.tab || route.meta.titleTabs[0].key) === t.key }"
          >
            {{ t.label }}
          </router-link>
        </div>
        <h2 v-else-if="!route.meta.hideTitle" class="page-title">{{ pageTitle }}</h2>
      </div>
      <div :class="route.meta.bare ? 'page-bare' : 'page-body'">
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

// 子页面（如新增）通过 meta.parent 指定所属列表
const parentPath = computed(() => route.meta.parent?.(route))
const allItems = computed(() => menus.value.flatMap((g) => g.children || [g]))

const isActive = (item) => {
  if (parentPath.value) return item.path === parentPath.value
  if (item.path !== route.path) return false
  if (item.query?.suggestStatus !== undefined && route.query.suggestStatus !== undefined) {
    return item.query.suggestStatus === route.query.suggestStatus
  }
  if (item.query?.productId) return item.query.productId === (route.query.productId || '10117')
  return true
}

// 默认展开"待办工作"与当前页面所在分组
watch(
  () => route.fullPath,
  () => {
    const s = new Set(opened.value)
    s.add('待办工作')
    menus.value.forEach((g) => g.children?.some(isActive) && s.add(g.title))
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
  if (route.meta.dynamicEditTitle) return route.query.id ? '修改' : '新增'
  if (route.meta.dynamicTitle) return allItems.value.find((i) => isActive(i))?.title || route.meta.title
  return route.meta.title || ''
})
const crumbs = computed(() => {
  if (parentPath.value) {
    const parent = allItems.value.find((i) => i.path === parentPath.value)
    const head = route.meta.crumbsWithSection ? [topNav.find((n) => n.key === props.section)?.title] : []
    return [...head, route.meta.group, parent?.title, pageTitle.value].filter((c, i, arr) => c && c !== arr[i - 1])
  }
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
.group-title.leaf:hover { color: var(--uem-red); }
.group-title.leaf.active { background: linear-gradient(90deg, #e5575e, #f08a8f); color: #fff; }
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
.crumbs-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 14px; }
.crumbs { display: flex; }
.title-tabs { display: flex; gap: 32px; }
.title-tab { font-size: 20px; font-weight: 600; color: #333; }
.title-tab.active { color: var(--uem-red); }
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

<!-- 页面框架：面包屑 + 页面标题（或标题页签）+ 右上角工具栏 + 内容 -->
<template>
  <div class="page">
    <div class="page-head">
      <nav class="crumbs" aria-label="当前位置">
        <template v-for="(c, i) in crumbs" :key="i">
          <span v-if="i" class="sep" aria-hidden="true">/</span>
          <span class="crumb" :class="{ last: i === crumbs.length - 1 }">{{ c }}</span>
        </template>
      </nav>
      <div class="head-row">
        <div v-if="route.meta.titleTabs" class="title-tabs" role="tablist">
          <router-link
            v-for="t in route.meta.titleTabs"
            :key="t.key"
            :to="{ path: route.path, query: { tab: t.key } }"
            class="title-tab"
            role="tab"
            :aria-selected="activeTab === t.key"
            :class="{ active: activeTab === t.key }"
          >
            {{ t.label }}
          </router-link>
        </div>
        <h1 v-else class="page-title">{{ pageTitle }}</h1>
        <!-- 页面可通过 <Teleport defer to="#page-head-extra"> 放置右上角工具栏 -->
        <div id="page-head-extra" class="head-extra" />
      </div>
    </div>
    <div class="page-body">
      <router-view :key="route.fullPath" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { topNav, visibleMenus } from '@/config/menus'

const props = defineProps({ section: { type: String, required: true } })
const route = useRoute()

const sectionTitle = computed(() => topNav.find((n) => n.key === props.section)?.title || '')
const items = computed(() => visibleMenus(props.section).flatMap((g) => (g.children || [g]).map((c) => ({ ...c, group: g.children ? g.title : '' }))))
const activeTab = computed(() => route.query.tab || route.meta.titleTabs?.[0].key)

// 产品声音等同一路径的多个菜单：按查询参数取菜单名作标题
const menuTitle = computed(() => {
  const hit = items.value.find((i) => i.path === route.path && Object.entries(i.query || {}).every(([k, v]) => String(route.query[k] ?? (k === 'productId' ? '10117' : '')) === String(v)))
  return hit?.title
})
const pageTitle = computed(() => {
  if (route.meta.pageTitle) return route.meta.pageTitle(route)
  if (route.meta.dynamicTitle) return menuTitle.value || route.meta.title
  return route.meta.title || ''
})

// 子页面（新增、详情）的面包屑带上来源列表
const parentTitle = computed(() => {
  const t = route.meta.parent?.(route)
  if (!t) return ''
  const [path, qs = ''] = t.split('?')
  const q = Object.fromEntries(new URLSearchParams(qs))
  return items.value.find((i) => i.path === path && (q.suggestStatus === undefined || i.query?.suggestStatus === q.suggestStatus))?.title || ''
})
const crumbs = computed(() => {
  if (route.meta.crumbs) return route.meta.crumbs(route)
  const list = [sectionTitle.value, route.meta.group, parentTitle.value, pageTitle.value]
  return list.filter((c, i) => c && c !== list[i - 1])
})
</script>

<style scoped>
.page { padding: 16px 24px 40px; max-width: 1680px; }
.page-head { margin-bottom: 16px; }
.crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); min-height: 18px; }
.sep { color: var(--uem-ink-4); }
.crumb.last { color: var(--uem-ink-2); }
.head-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 6px; min-height: 34px; }
.page-title { margin: 0; font-size: var(--uem-fs-xl); font-weight: 600; line-height: 1.4; color: var(--uem-ink); }
.title-tabs { display: flex; gap: 24px; }
.title-tab { position: relative; padding: 4px 0 8px; font-size: var(--uem-fs-md); font-weight: 600; color: var(--uem-ink-3); transition: color 0.15s; }
.title-tab:hover { color: var(--uem-ink); }
.title-tab.active { color: var(--uem-ink); }
.title-tab.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; border-radius: 1px; background: var(--uem-red); }
.head-extra { display: flex; align-items: center; gap: 8px; }
.head-extra:empty { display: none; }
</style>

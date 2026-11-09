<!-- 左侧导航：一级板块 + 板块内菜单，按当前身份的岗位过滤；待办菜单显示数量 -->
<template>
  <nav class="side" :class="{ collapsed }" aria-label="主导航">
    <div class="side-scroll">
      <template v-for="sec in sections" :key="sec.key">
        <el-tooltip v-if="collapsed" :content="sec.title" placement="right" :show-after="200">
          <router-link :to="sec.entry" class="sec-row" :class="{ current: activeSection === sec.key }" :aria-label="sec.title">
            <el-icon class="sec-icon"><component :is="sec.icon" /></el-icon>
            <span v-if="sec.count" class="dot" />
          </router-link>
        </el-tooltip>

        <router-link v-else-if="sec.direct" :to="sec.entry" class="sec-row" :class="{ current: activeSection === sec.key, active: activeSection === sec.key }">
          <el-icon class="sec-icon"><component :is="sec.icon" /></el-icon>
          <span class="sec-title">{{ sec.title }}</span>
        </router-link>

        <div v-else class="sec">
          <button type="button" class="sec-row" :class="{ current: activeSection === sec.key }" :aria-expanded="isOpen(sec.key)" @click="toggle(sec.key)">
            <el-icon class="sec-icon"><component :is="sec.icon" /></el-icon>
            <span class="sec-title">{{ sec.title }}</span>
            <span v-if="sec.count" class="count todo">{{ sec.count }}</span>
            <el-icon class="chev" :class="{ open: isOpen(sec.key) }"><ArrowDown /></el-icon>
          </button>
          <div v-show="isOpen(sec.key)" class="sec-items">
            <template v-for="g in sec.menus" :key="g.title">
              <router-link v-if="!g.children" :to="{ path: g.path, query: g.query }" class="item" :class="{ active: isActive(g) }">
                <span class="item-title">{{ g.title }}</span>
              </router-link>
              <div v-else class="group">
                <button type="button" class="group-row" :aria-expanded="groupOpen(sec.key, g)" @click="toggleGroup(sec.key, g)">
                  <span class="item-title">{{ g.title }}</span>
                  <span v-if="groupCount(g) && !groupOpen(sec.key, g)" class="count todo">{{ groupCount(g) }}</span>
                  <el-icon class="chev sm" :class="{ open: groupOpen(sec.key, g) }"><ArrowDown /></el-icon>
                </button>
                <div v-show="groupOpen(sec.key, g)">
                  <router-link
                    v-for="c in g.children"
                    :key="c.title + (c.query?.productId || '')"
                    :to="{ path: c.path, query: c.query }"
                    class="item sub"
                    :class="{ active: isActive(c) }"
                  >
                    <span class="item-title">{{ c.title }}</span>
                    <span v-if="c.countKey && todoCounts[c.countKey]" class="count" :class="{ todo: !isActive(c) }">{{ todoCounts[c.countKey] }}</span>
                  </router-link>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    <button type="button" class="collapse-btn" :aria-label="collapsed ? '展开导航' : '收起导航'" @click="$emit('toggle')">
      <el-icon><component :is="collapsed ? 'Expand' : 'Fold'" /></el-icon>
      <span v-if="!collapsed">收起导航</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { visibleNav, visibleMenus, sectionEntry } from '@/config/menus'
import { todoCounts } from '@/mock'

defineProps({ collapsed: { type: Boolean, default: false } })
defineEmits(['toggle'])

const route = useRoute()
const activeSection = computed(() => route.meta.section)

const countOf = (items) => items.reduce((n, c) => n + (c.countKey ? todoCounts[c.countKey] || 0 : 0), 0)
const groupCount = (g) => countOf(g.children || [])
const sections = computed(() =>
  visibleNav.value.map((n) => {
    const menus = n.path ? [] : visibleMenus(n.key)
    return {
      ...n,
      menus,
      direct: !!n.path,
      entry: sectionEntry(n) || { path: '/mainIndex' },
      count: countOf(menus.flatMap((g) => g.children || [g]))
    }
  })
)

// 子页面（如详情、新增）通过 meta.parent 指定所属菜单；parent 可带查询参数定位同一路径下的不同菜单
const parentTarget = computed(() => {
  const t = route.meta.parent?.(route)
  if (!t) return null
  const [path, qs = ''] = t.split('?')
  return { path, query: Object.fromEntries(new URLSearchParams(qs)) }
})
function isActive(item) {
  const target = parentTarget.value || { path: route.path, query: route.query }
  if (item.path !== target.path) return false
  const st = target.query.suggestStatus
  if (item.query?.suggestStatus !== undefined && st !== undefined) return item.query.suggestStatus === st
  if (item.query?.productId) return item.query.productId === (target.query.productId || '10117')
  return true
}

// 展开状态：当前板块自动展开；分组默认展开（待办分组、含当前页面、或不超过 3 项），其余可手动展开
const opened = ref(new Set())
const groupState = ref({})
watch(
  () => [route.fullPath, activeSection.value],
  () => {
    if (activeSection.value) opened.value = new Set([...opened.value, activeSection.value])
  },
  { immediate: true }
)
const isOpen = (key) => opened.value.has(key)
function toggle(key) {
  const s = new Set(opened.value)
  s.has(key) ? s.delete(key) : s.add(key)
  opened.value = s
}
const TODO_GROUPS = ['我的待办', '待办工作']
function groupOpen(sec, g) {
  const k = `${sec}/${g.title}`
  if (k in groupState.value) return groupState.value[k]
  return TODO_GROUPS.includes(g.title) || g.children.length <= 3 || g.children.some(isActive)
}
function toggleGroup(sec, g) {
  groupState.value = { ...groupState.value, [`${sec}/${g.title}`]: !groupOpen(sec, g) }
}
</script>

<style scoped>
.side {
  position: sticky;
  top: var(--uem-topbar-h);
  height: calc(100vh - var(--uem-topbar-h));
  width: var(--uem-side-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--uem-surface);
  border-right: 1px solid var(--uem-line);
  transition: width 0.2s var(--uem-ease);
}
.side.collapsed { width: var(--uem-side-w-collapsed); }
.side-scroll { flex: 1; overflow-y: auto; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }

.sec-row {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--uem-radius);
  background: transparent;
  color: var(--uem-ink);
  font: inherit;
  font-size: var(--uem-fs);
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.sec-row:hover { background: var(--uem-hover); }
.sec-row.active { background: var(--uem-red-soft); color: var(--uem-red); }
.sec-icon { font-size: 17px; color: var(--uem-ink-3); flex-shrink: 0; }
.sec-row.current .sec-icon { color: var(--uem-red); }
.sec-title { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.chev { font-size: 12px; color: var(--uem-ink-3); transition: transform 0.2s var(--uem-ease); }
.chev.open { transform: rotate(180deg); }
.chev.sm { font-size: 11px; }
.collapsed .sec-row { justify-content: center; padding: 0; }
.dot { position: absolute; top: 9px; right: 12px; width: 6px; height: 6px; border-radius: 50%; background: var(--uem-red); }

.sec-items { padding: 2px 0 8px; }
.item, .group-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 10px 6px 37px;
  border: 0;
  border-radius: var(--uem-radius);
  background: transparent;
  color: var(--uem-ink-2);
  font: inherit;
  font-size: var(--uem-fs-sm);
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.item:hover, .group-row:hover { background: var(--uem-hover); color: var(--uem-ink); }
.item.active { background: var(--uem-red-soft); color: var(--uem-red); font-weight: 600; }
.group-row { color: var(--uem-ink-3); font-size: var(--uem-fs-xs); min-height: 30px; margin-top: 4px; }
.group-row:hover { background: transparent; color: var(--uem-ink-2); }
.item.sub { padding-left: 49px; }
.item-title { flex: 1; min-width: 0; }

.count {
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: var(--uem-line-2);
  color: var(--uem-ink-2);
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.count.todo { background: var(--uem-red-soft); color: var(--uem-red); }
.item.active .count { background: var(--uem-surface); color: var(--uem-red); }

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border: 0;
  border-top: 1px solid var(--uem-line);
  background: transparent;
  color: var(--uem-ink-3);
  font: inherit;
  font-size: var(--uem-fs-sm);
  cursor: pointer;
}
.collapse-btn:hover { color: var(--uem-ink); }
.collapsed .collapse-btn { justify-content: center; padding: 0; }
</style>

<!-- 快速搜索（Ctrl K）：按名称查找当前身份可用的页面，或按编号、关键字查找优化建议 -->
<template>
  <el-dialog v-model="open" :show-close="false" width="600px" top="12vh" class="palette" append-to-body @opened="focus" @closed="q = ''">
    <div class="box" @keydown="onKey">
      <div class="input-row">
        <el-icon class="search-icon"><Search /></el-icon>
        <input ref="inputRef" v-model="q" class="input" placeholder="输入功能名称、优化建议编号或关键字" aria-label="快速搜索" />
        <kbd>Esc</kbd>
      </div>
      <div class="results" role="listbox">
        <template v-for="group in groups" :key="group.title">
          <div class="group-title">{{ group.title }}</div>
          <button
            v-for="r in group.items"
            :key="r.key"
            type="button"
            class="result"
            :class="{ on: flat[cursor]?.key === r.key }"
            role="option"
            :aria-selected="flat[cursor]?.key === r.key"
            @mouseenter="cursor = flat.indexOf(r)"
            @click="go(r)"
          >
            <span class="r-title">{{ r.title }}</span>
            <span class="r-meta">{{ r.meta }}</span>
          </button>
        </template>
        <div v-if="!flat.length" class="empty">没有找到「{{ q }}」相关的页面或优化建议，试试其他关键字</div>
      </div>
      <div class="foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span></div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { visibleNav, visibleMenus } from '@/config/menus'
import { suggestions, detailRoute } from '@/mock/suggest'

const open = defineModel({ type: Boolean, default: false })
const router = useRouter()
const q = ref('')
const cursor = ref(0)
const inputRef = ref()
const focus = () => nextTick(() => inputRef.value?.focus())

const pages = computed(() =>
  visibleNav.value.flatMap((n) => {
    if (n.path) return [{ key: n.key, title: n.title, meta: '板块', to: { path: n.path } }]
    return visibleMenus(n.key).flatMap((g) =>
      (g.children || [g]).map((c) => ({
        key: `${n.key}:${g.title}:${c.title}:${c.query?.productId || ''}`,
        title: c.title,
        meta: [n.title, g.children ? g.title : ''].filter(Boolean).join(' · '),
        to: { path: c.path, query: c.query }
      }))
    )
  })
)
const groups = computed(() => {
  const k = q.value.trim()
  const hitPages = (k ? pages.value.filter((p) => p.title.includes(k) || p.meta.includes(k)) : pages.value.slice(0, 8)).slice(0, 8)
  const hitSuggest = k
    ? suggestions
        .filter((s) => s.id.includes(k.toUpperCase()) || String(s.seq).includes(k) || (k.length >= 2 && s.desc.includes(k)))
        .slice(0, 6)
        .map((s) => ({ key: s.id, title: s.desc.split('\n')[0].replace(/^【现象】/, ''), meta: `${s.id} · ${s.status}`, suggestion: s }))
    : []
  return [
    { title: k ? '页面' : '常用页面', items: hitPages },
    { title: '优化建议', items: hitSuggest }
  ].filter((g) => g.items.length)
})
const flat = computed(() => groups.value.flatMap((g) => g.items))
watch(q, () => (cursor.value = 0))

function go(r) {
  open.value = false
  router.push(r.suggestion ? detailRoute(r.suggestion, '全部优化建议') : r.to)
}
function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); cursor.value = Math.min(cursor.value + 1, flat.value.length - 1) }
  if (e.key === 'ArrowUp') { e.preventDefault(); cursor.value = Math.max(cursor.value - 1, 0) }
  if (e.key === 'Enter' && flat.value[cursor.value]) { e.preventDefault(); go(flat.value[cursor.value]) }
}
</script>

<style scoped>
.box { display: flex; flex-direction: column; }
.input-row { display: flex; align-items: center; gap: 10px; padding: 0 16px; height: 52px; border-bottom: 1px solid var(--uem-line); }
.search-icon { font-size: 18px; color: var(--uem-ink-3); }
.input { flex: 1; border: 0; outline: none; font: inherit; font-size: var(--uem-fs-md); color: var(--uem-ink); background: transparent; }
.input::placeholder { color: var(--uem-ink-4); }
kbd { font: 11px/1 var(--uem-font-mono); padding: 3px 6px; border: 1px solid var(--uem-line); border-radius: 4px; color: var(--uem-ink-3); background: var(--uem-surface-2); }
.results { max-height: 52vh; overflow-y: auto; padding: 8px; }
.group-title { padding: 8px 10px 4px; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.result {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border: 0;
  border-radius: var(--uem-radius);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.result.on { background: var(--uem-hover); }
.r-title { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: var(--uem-fs); color: var(--uem-ink); }
.r-meta { flex-shrink: 0; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.empty { padding: 28px 16px; text-align: center; color: var(--uem-ink-3); font-size: var(--uem-fs-sm); }
.foot { display: flex; gap: 16px; padding: 10px 16px; border-top: 1px solid var(--uem-line); font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.foot kbd { margin-right: 4px; }
</style>

<style>
.palette.el-dialog { padding: 0; overflow: hidden; }
.palette .el-dialog__header { display: none; }
.palette .el-dialog__body { padding: 0; }
</style>

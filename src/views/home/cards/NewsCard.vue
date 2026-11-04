<!-- 体验动态：总行 / 分行体验公告（所有人可见） -->
<template>
  <HomeCard title="体验动态" :more="tab === '总行' ? '/headOfficeAllNotice' : '/branchAllNotice'">
    <template #extra>
      <div class="seg" role="tablist" aria-label="公告范围">
        <button v-for="t in ['总行', '分行']" :key="t" type="button" role="tab" :aria-selected="tab === t" class="seg-btn" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <router-link :to="tab === '总行' ? '/headOfficeAllNotice' : '/branchAllNotice'" class="more" aria-label="查看全部公告"><el-icon><ArrowRight /></el-icon></router-link>
    </template>
    <ul v-if="list.length" class="hc-list">
      <li v-for="n in list" :key="n.name">
        <button type="button" class="hc-row as-btn" @click="current = n">
          <span class="hc-row-title">{{ n.name }}</span>
          <span class="hc-row-meta">{{ n.org }}</span>
          <span class="hc-row-side"><span class="date">{{ n.submitTime }}</span></span>
        </button>
      </li>
    </ul>
    <div v-else class="hc-empty"><b>暂无{{ tab }}公告</b></div>

    <el-dialog :model-value="!!current" :title="current?.name" width="640px" append-to-body @close="current = null">
      <p v-if="current" class="body">{{ current.content }}</p>
      <template #footer>
        <span class="foot-meta">{{ current?.submitTime }} · {{ current?.org }}</span>
        <el-button type="primary" @click="current = null">关闭</el-button>
      </template>
    </el-dialog>
  </HomeCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import HomeCard from '@/components/HomeCard.vue'
import { notices, homeNotices } from '@/mock/notices'

const tab = ref('总行')
const current = ref(null)
const list = computed(() => {
  const src = tab.value === '总行' ? homeNotices() : notices.filter((n) => n.level === '分行' && n.status !== '待审批').sort((a, b) => (a.submitTime < b.submitTime ? 1 : -1))
  return src.slice(0, 6)
})
</script>

<style scoped>
.seg { display: inline-flex; padding: 2px; border-radius: var(--uem-radius); background: var(--uem-surface-2); border: 1px solid var(--uem-line-2); }
.seg-btn { border: 0; background: transparent; padding: 2px 10px; border-radius: 4px; font: inherit; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); cursor: pointer; }
.seg-btn.on { background: var(--uem-surface); color: var(--uem-ink); box-shadow: var(--uem-shadow-sm); }
.more { display: inline-flex; color: var(--uem-ink-3); }
.more:hover { color: var(--uem-red); }
.as-btn { width: 100%; border: 0; border-top: 1px solid var(--uem-line-2); background: transparent; font: inherit; text-align: left; cursor: pointer; }
.as-btn:hover .hc-row-title { color: var(--uem-red); }
.date { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); font-variant-numeric: tabular-nums; white-space: nowrap; }
.body { margin: 0; line-height: 1.75; color: var(--uem-ink); white-space: pre-wrap; }
.foot-meta { float: left; color: var(--uem-ink-3); font-size: var(--uem-fs-sm); line-height: 32px; }
</style>

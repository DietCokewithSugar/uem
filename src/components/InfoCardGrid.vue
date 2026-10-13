<!-- 资讯卡片列表（方法培训 / 体验研究） -->
<template>
  <div>
    <div v-if="items.length" class="grid">
      <div v-for="it in items" :key="it.id" class="card" @click="open(it)">
        <div class="cover"><CoverArt :variant="it.cover" /></div>
        <div class="body">
          <div class="title">
            {{ it.name }}<span class="tag">{{ it.board || it.reportType }}</span>
          </div>
          <div class="meta">
            <span><el-icon><View /></el-icon>{{ it.views }}</span>
            <span><el-icon><Download /></el-icon>{{ it.downloads }}</span>
            <span><el-icon><Clock /></el-icon>{{ it.publishTime }}</span>
          </div>
          <div class="meta">
            <span><el-icon><Monitor /></el-icon>{{ it.form || '—' }}</span>
            <span><el-icon><Document /></el-icon>{{ it.fileType }}</span>
            <span><el-icon><OfficeBuilding /></el-icon>{{ it.org }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="uem-card empty">暂无数据</div>

    <el-pagination
      v-if="total > pageSize"
      :current-page="page"
      :page-size="pageSize"
      class="pager"
      layout="total, prev, pager, next"
      :total="total"
      @current-change="$emit('update:page', $event)"
    />

    <el-drawer :model-value="!!current" :title="current?.name" size="560px" @close="current = null">
      <template v-if="current">
        <div class="drawer-cover"><CoverArt :variant="current.cover" /></div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="类型">{{ current.type }}</el-descriptions-item>
          <el-descriptions-item label="板块">{{ current.board || current.reportType || '—' }}</el-descriptions-item>
          <el-descriptions-item label="所属机构">{{ current.org }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ current.author || '—' }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ current.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ current.fileType }}</el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">{{ current.intro || '—' }}</el-descriptions-item>
        </el-descriptions>
        <div class="drawer-actions">
          <el-button type="primary" @click="download">下载资料</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CoverArt from '@/components/CoverArt.vue'

defineProps({
  items: { type: Array, required: true },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 8 }
})
defineEmits(['update:page'])

const current = ref(null)
const open = (it) => {
  it.views++
  current.value = it
}
const download = () => {
  current.value.downloads++
  ElMessage.success('演示环境：已模拟下载')
}
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.card { background: #fff; border-radius: 4px; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
.card:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); transform: translateY(-2px); }
.cover { height: 160px; }
.body { padding: 12px 14px 14px; }
.title { font-size: 14px; color: #333; line-height: 1.5; min-height: 42px; }
.tag { color: var(--uem-red); font-size: 11px; margin-left: 6px; }
.meta { display: flex; justify-content: space-between; color: #888; font-size: 12px; margin-top: 8px; }
.meta span { display: inline-flex; align-items: center; gap: 3px; }
.empty { text-align: center; color: #aaa; font-size: 13px; padding: 40px 0; }
.pager { margin-top: 16px; justify-content: flex-end; }
.drawer-cover { height: 200px; margin-bottom: 16px; border-radius: 4px; overflow: hidden; }
.drawer-actions { margin-top: 20px; }
@media (max-width: 1280px) { .grid { grid-template-columns: repeat(2, 1fr); } }
</style>

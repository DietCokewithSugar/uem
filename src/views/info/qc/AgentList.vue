<!-- 体验质检智能体 #/agentFirst：质检报告卡片列表 -->
<template>
  <div class="uem-card">
    <div class="top">
      <div class="uem-toolbar">
        <el-button type="primary" @click="goCreate('standard')">新增</el-button>
        <el-button plain type="primary" @click="goCreate('ab')">AB对比</el-button>
        <el-button plain type="primary" @click="refresh">刷新</el-button>
      </div>
      <el-input v-model="keyword" placeholder="请输入搜索关键词" clearable class="search" @input="page = 1">
        <template #suffix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <div v-loading="loading" class="grid">
      <div v-for="r in pageItems" :key="r.id" class="card">
        <div class="thumb" @click="view(r)"><ScreenThumb :material="r.materials[0]" /></div>
        <div class="title">
          <el-tag v-if="r.type === 'ab'" size="small" effect="plain" class="ab-tag">AB对比</el-tag>
          {{ r.title }}
        </div>
        <div class="time">{{ r.createTime }}<template v-if="r.verdict"> · {{ r.verdict }}</template></div>
        <div class="ops">
          <el-button size="small" plain type="primary" @click="view(r)">查看报告</el-button>
          <span class="links">
            <a @click="edit(r)">编辑</a>
            <a @click="copy(r)">复制</a>
            <a @click="remove(r)">删除</a>
          </span>
        </div>
      </div>
    </div>
    <el-empty v-if="!filtered.length" description="暂无报告" />
    <el-pagination
      v-model:current-page="page"
      class="pager"
      layout="total, prev, pager, next, jumper"
      :page-size="pageSize"
      :total="filtered.length"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ScreenThumb from '@/components/ScreenThumb.vue'
import { qcReports, nowText } from '@/mock/qc'

const router = useRouter()
const keyword = ref('')
const page = ref(1)
const pageSize = 8
const loading = ref(false)

const filtered = computed(() => qcReports.filter((r) => !keyword.value || r.title.includes(keyword.value) || r.scene?.includes(keyword.value)))
const pageItems = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

const view = (r) => router.push({ path: '/agentDetail', query: { id: r.id } })
const refresh = () => {
  loading.value = true
  setTimeout(() => (loading.value = false), 400)
}

const goCreate = (mode) => router.push({ path: '/agentTools', query: { mode } })

async function edit(r) {
  const { value } = await ElMessageBox.prompt('报告名称', '编辑报告', { inputValue: r.title, inputValidator: (v) => !!v?.trim() || '请输入报告名称' })
  r.title = value.trim()
  ElMessage.success('保存成功')
}
function copy(r) {
  qcReports.splice(qcReports.indexOf(r) + 1, 0, { ...JSON.parse(JSON.stringify(r)), id: `QC${Date.now()}`, title: `${r.title}（副本）`, createTime: nowText() })
  ElMessage.success('复制成功')
}
async function remove(r) {
  await ElMessageBox.confirm(`确认删除「${r.title}」？`, '提示', { type: 'warning' })
  qcReports.splice(qcReports.indexOf(r), 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.top { display: flex; justify-content: space-between; align-items: flex-start; }
.search { width: 220px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.card { border: 1px solid #eee; border-radius: 4px; padding: 12px; background: #fff; }
.thumb { height: 130px; border-radius: 4px; overflow: hidden; cursor: pointer; background: #f5f6f8; }
.title { margin-top: 12px; font-size: 14px; color: #333; }
.ab-tag { margin-right: 6px; border-color: var(--uem-red); color: var(--uem-red); vertical-align: text-bottom; }
.time { margin-top: 4px; font-size: 12px; color: #999; }
.ops { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.links a { color: #3a6fd8; cursor: pointer; font-size: 12px; margin-left: 8px; }
.links a:hover { text-decoration: underline; }
.pager { margin-top: 20px; justify-content: flex-end; }
@media (max-width: 1280px) { .grid { grid-template-columns: repeat(2, 1fr); } }
</style>

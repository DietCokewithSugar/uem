<!-- 灵犀旅程看板 #/journeysBoardConfig?id= -->
<template>
  <div>
    <Teleport defer to="#page-head-extra">
      <div class="toolbar">
        <span class="zoom-tip">鼠标拖动滑块可调节画布大小</span>
        <el-slider v-model="zoom" :min="0.5" :max="1.4" :step="0.05" :show-tooltip="false" class="zoom" />
        <span class="zoom-tip">旅程名称：</span>
        <el-select v-model="selectedId" filterable clearable size="small" style="width: 220px" @change="(id) => router.replace({ query: id ? { id } : {} })">
          <el-option v-for="j in journeys" :key="j.id" :label="j.name" :value="j.id" />
        </el-select>
        <el-button size="small" plain type="primary" :disabled="!journey" @click="maintain">维护旅程内容</el-button>
      </div>
    </Teleport>

    <div class="kpis">
      <div class="kpi"><b>待处理典型问题：</b>{{ stats.pending }}条</div>
      <div class="kpi"><b>典型问题最集中的旅程行为：</b>{{ stats.topBehavior }}</div>
      <div class="kpi"><b>覆盖用户声音最多的典型问题是：</b>{{ stats.topProblem }}</div>
    </div>

    <div class="uem-card">
      <div class="basic">
        <span>旅程名称：<em>{{ journey?.name || '请输入场景名称' }}</em></span>
        <span>所属产品：<em>{{ journey?.product }}</em></span>
        <span>场景/功能：<em>{{ journey?.scene }}</em></span>
        <span>旅程类型：<em>{{ journey?.type }}</em></span>
      </div>
      <JourneyMap :key="journey?.id || 'none'" :map="journey?.map || emptyMap" readonly :zoom="zoom">
        <template #empty-structure>
          <div class="empty-structure">
            <el-button plain type="primary" :disabled="!journey" @click="maintain"><el-icon><Edit /></el-icon>编辑</el-button>
          </div>
        </template>
        <template #problems-extra>
          <el-button size="small" plain type="primary" class="export" :disabled="!journey" @click="exportProblems(problems)">导出典型问题明细</el-button>
        </template>
      </JourneyMap>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JourneyMap from '@/components/journey/JourneyMap.vue'
import { problemsOf, exportProblems } from '@/components/journey/journeyUtils'
import { journeys } from '@/mock'
import { createEmptyMap } from '@/mock/journey'

const route = useRoute()
const router = useRouter()
const zoom = ref(1)
const emptyMap = createEmptyMap()
emptyMap.behaviors[0].name = ''

const selectedId = ref(route.query.id || journeys.find((j) => j.status === '已发布旅程结构')?.id || '')
const journey = computed(() => journeys.find((j) => j.id === selectedId.value))
const problems = computed(() => (journey.value ? problemsOf(journey.value) : []))

const stats = computed(() => {
  const list = problems.value
  const byBehavior = {}
  list.forEach((p) => (byBehavior[p.behavior] = (byBehavior[p.behavior] || 0) + 1))
  const top = Object.entries(byBehavior).sort((a, b) => b[1] - a[1])[0]
  const topProblem = [...list].sort((a, b) => b.voices - a.voices)[0]
  return {
    pending: list.filter((p) => p.status === '待处理').length,
    topBehavior: top ? `${top[0]}（${top[1]}个问题）` : '',
    topProblem: topProblem ? `${topProblem.text}（${topProblem.voices}条声音）` : ''
  }
})

const maintain = () => router.push({ path: '/myjourneyAdd', query: { id: journey.value.id, status: 'edit' } })
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 10px; }
.zoom-tip { font-size: 12px; color: #888; white-space: nowrap; }
.zoom { width: 120px; margin-right: 12px; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.kpi { background: #fff; border: 1px solid #f0d9d9; border-radius: 4px; padding: 28px 16px; font-size: 14px; color: #555; }
.kpi b { color: #333; }
.basic { display: flex; gap: 48px; font-size: 13px; color: #555; margin-bottom: 16px; flex-wrap: wrap; }
.basic em { font-style: normal; color: #333; }
.empty-structure { height: 160px; display: flex; align-items: center; justify-content: center; }
.export { margin-left: 40px; }
</style>

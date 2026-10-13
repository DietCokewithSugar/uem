<!-- 旅程编辑 #/myjourneyAdd?id=&status=edit|view -->
<template>
  <div v-if="journey" class="uem-card editor">
    <Teleport defer to="#page-head-extra">
      <div class="toolbar">
        <span class="zoom-tip">鼠标拖动滑块可调节画布大小</span>
        <el-slider v-model="zoom" :min="0.5" :max="1.4" :step="0.05" :show-tooltip="false" class="zoom" />
        <el-button @click="back">返回</el-button>
        <el-button @click="preview = true">预览</el-button>
        <el-button v-if="!readonly" type="primary" @click="submit">提交</el-button>
      </div>
    </Teleport>

    <div class="basic">
      <label>旅程名称：<el-input v-model="journey.name" :disabled="readonly" placeholder="请输入场景名称" size="small" /></label>
      <label>所属产品<el-select v-model="journey.product" :disabled="readonly" size="small"><el-option v-for="p in products" :key="p" :label="p" :value="p" /></el-select></label>
      <label>场景/功能<el-select v-model="journey.scene" :disabled="readonly" size="small"><el-option v-for="p in journeyScenes" :key="p" :label="p" :value="p" /></el-select></label>
      <label>旅程类型<el-select v-model="journey.type" :disabled="readonly" size="small"><el-option v-for="p in journeyTypes" :key="p" :label="p" :value="p" /></el-select></label>
    </div>

    <div v-if="journey.reviewComment && journey.status === '待修改'" class="review-note">
      <el-alert type="warning" :closable="false" show-icon :title="`审核意见（${journey.reviewer}）：${journey.reviewComment}`" />
    </div>

    <div class="arrow-switch">
      <el-button v-if="!readonly" size="small" plain type="primary" @click="journey.map.arrow = journey.map.arrow === 'chevron' ? 'line' : 'chevron'">
        {{ journey.map.arrow === 'chevron' ? '切换为直线箭头' : '切换为折线箭头' }}
      </el-button>
    </div>
    <JourneyMap :map="journey.map" :readonly="readonly" :zoom="zoom" />

    <el-dialog v-model="preview" title="旅程预览" width="90%" top="4vh">
      <h3 class="preview-title">{{ journey.name || '（未命名旅程）' }} <small>{{ journey.product }} · {{ journey.scene }} · {{ journey.type }}</small></h3>
      <JourneyMap :map="journey.map" readonly />
    </el-dialog>
  </div>
  <el-empty v-else description="旅程不存在或已删除" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import JourneyMap from '@/components/journey/JourneyMap.vue'
import { journeys, products, journeyScenes, journeyTypes } from '@/mock'

const route = useRoute()
const router = useRouter()
const journey = computed(() => journeys.find((j) => j.id === route.query.id))
const readonly = computed(() => route.query.status === 'view')
const zoom = ref(1)
const preview = ref(false)

const back = () => (window.history.length > 1 ? router.back() : router.push('/myJourney'))

function submit() {
  const j = journey.value
  if (!j.name) return ElMessage.warning('请输入旅程名称')
  if (!j.map.behaviors.length || j.map.behaviors.some((b) => !b.name.trim())) return ElMessage.warning('请完整填写旅程结构中的用户行为')
  j.status = '待审核'
  j.updateTime = new Date().toISOString().slice(0, 10)
  ElMessage.success('已提交，等待旅程管理员审核')
  router.push('/myJourney')
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 10px; }
.toolbar .el-button + .el-button { margin-left: 0; }
.zoom-tip { font-size: 12px; color: #888; white-space: nowrap; }
.zoom { width: 120px; margin-right: 12px; }
.basic { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 16px; font-size: 13px; color: #555; }
.basic label { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.basic .el-input, .basic .el-select { width: 180px; }
.arrow-switch { display: flex; justify-content: flex-end; margin-bottom: 4px; }
.review-note { margin-bottom: 12px; }
.preview-title { margin: 0 0 16px; }
.preview-title small { font-weight: 400; color: #888; font-size: 13px; margin-left: 8px; }
</style>

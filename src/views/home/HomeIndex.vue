<!-- 首页 #/mainIndex：按岗位组合的卡片。能看到哪些卡片由岗位决定，看到哪些数据由岗位的数据范围决定；
     默认卡片在「系统管理 · 首页卡片配置」中按岗位设置，个人可隐藏或调整顺序 -->
<template>
  <div class="home">
    <header class="home-head">
      <div>
        <h1 class="greet">{{ greeting }}，{{ currentUser.name }}</h1>
        <p class="who">{{ personaTitle }} · {{ currentUser.dept }} · {{ dateText }}</p>
      </div>
      <el-button @click="customizing = true"><el-icon><Operation /></el-icon>调整卡片</el-button>
    </header>

    <div class="grid">
      <div v-for="c in placed" :key="c.key" class="cell" :style="{ gridColumn: `span ${c.span}` }">
        <component :is="CARDS[c.key]" />
      </div>
    </div>
    <div v-if="!placed.length" class="none">
      <p>首页没有展示中的卡片。</p>
      <el-button type="primary" @click="customizing = true">选择卡片</el-button>
    </div>

    <el-drawer v-model="customizing" title="调整首页卡片" size="420px" append-to-body>
      <p class="drawer-tip">只列出你有权限查看的卡片。默认展示的卡片由管理员按岗位设置，你可以隐藏或调整顺序，设置保存在本浏览器。</p>
      <ul class="cfg-list">
        <li v-for="(k, i) in draft.order" :key="k" class="cfg-item">
          <el-switch :model-value="!draft.hidden.includes(k)" :aria-label="`显示「${cardOf(k).title}」`" @change="(v) => toggle(k, v)" />
          <div class="cfg-text">
            <b>{{ cardOf(k).title }}</b>
            <span>{{ cardOf(k).desc }}</span>
          </div>
          <div class="cfg-move">
            <el-button link :disabled="i === 0" aria-label="上移" @click="move(i, -1)"><el-icon><ArrowUp /></el-icon></el-button>
            <el-button link :disabled="i === draft.order.length - 1" aria-label="下移" @click="move(i, 1)"><el-icon><ArrowDown /></el-icon></el-button>
          </div>
        </li>
      </ul>
      <template #footer>
        <el-button @click="restore">恢复默认</el-button>
        <el-button type="primary" @click="apply">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { currentUser } from '@/config/user'
import { currentPersona } from '@/config/session'
import { cardOf, permittedCards, loadPrefs, savePrefs, activeKeys, layout } from '@/config/homeCards'
import './home.css'
import TodoCard from './cards/TodoCard.vue'
import QuickSubmitCard from './cards/QuickSubmitCard.vue'
import MySubmitCard from './cards/MySubmitCard.vue'
import SuggestStatsCard from './cards/SuggestStatsCard.vue'
import DeptProgressCard from './cards/DeptProgressCard.vue'
import VoiceAlertCard from './cards/VoiceAlertCard.vue'
import NpsCard from './cards/NpsCard.vue'
import JourneysCard from './cards/JourneysCard.vue'
import ActivitiesCard from './cards/ActivitiesCard.vue'
import QcCard from './cards/QcCard.vue'
import VoiceToolCard from './cards/VoiceToolCard.vue'
import SkillsCard from './cards/SkillsCard.vue'
import NewsCard from './cards/NewsCard.vue'
import TrainingCard from './cards/TrainingCard.vue'
import SystemCard from './cards/SystemCard.vue'
import BannerCard from './cards/BannerCard.vue'

const CARDS = {
  todo: TodoCard, quickSubmit: QuickSubmitCard, mySubmit: MySubmitCard, suggestStats: SuggestStatsCard, deptProgress: DeptProgressCard,
  voiceAlert: VoiceAlertCard, nps: NpsCard, journeys: JourneysCard, activities: ActivitiesCard, qc: QcCard, voiceTool: VoiceToolCard,
  skills: SkillsCard, news: NewsCard, training: TrainingCard, system: SystemCard, banner: BannerCard
}

const prefs = ref(loadPrefs())
const keys = computed(() => activeKeys(prefs.value))
const placed = computed(() => layout(keys.value))

const now = new Date()
const hour = now.getHours()
const greeting = hour < 11 ? '上午好' : hour < 13 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
const dateText = `${now.getMonth() + 1} 月 ${now.getDate()} 日 星期${'日一二三四五六'[now.getDay()]}`
const personaTitle = computed(() => currentPersona.value?.title || '平台用户')

// ===== 调整卡片 =====
const customizing = ref(false)
const draft = reactive({ order: [], hidden: [] })
function fillDraft(p) {
  const shown = activeKeys(p)
  const rest = permittedCards.value.map((c) => c.key).filter((k) => !shown.includes(k))
  draft.order = [...shown, ...rest]
  draft.hidden = rest
}
watch(customizing, (open) => open && fillDraft(prefs.value))
const toggle = (k, on) => (draft.hidden = on ? draft.hidden.filter((x) => x !== k) : [...draft.hidden, k])
function move(i, d) {
  const o = [...draft.order]
  ;[o[i], o[i + d]] = [o[i + d], o[i]]
  draft.order = o
}
function apply() {
  prefs.value = { order: [...draft.order], hidden: [...draft.hidden] }
  savePrefs(prefs.value)
  customizing.value = false
  ElMessage.success('首页卡片已更新')
}
function restore() {
  savePrefs(null)
  prefs.value = null
  customizing.value = false
  ElMessage.success('已恢复为岗位默认卡片')
}
</script>

<style scoped>
.home { padding: 20px 24px 40px; max-width: 1680px; }
.home-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.greet { margin: 0; font-size: var(--uem-fs-xl); font-weight: 600; line-height: 1.4; }
.who { margin: 2px 0 0; font-size: var(--uem-fs-sm); color: var(--uem-ink-3); }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
.cell { min-width: 0; }
.none { padding: 48px 0; text-align: center; color: var(--uem-ink-3); }

.drawer-tip { margin: 0 0 12px; font-size: var(--uem-fs-sm); color: var(--uem-ink-3); line-height: 1.6; }
.cfg-list { list-style: none; margin: 0; padding: 0; }
.cfg-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-top: 1px solid var(--uem-line-2); }
.cfg-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cfg-text b { font-size: var(--uem-fs); font-weight: 600; }
.cfg-text span { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); line-height: 1.5; }
.cfg-move { display: flex; gap: 2px; }
.cfg-move .el-button + .el-button { margin-left: 0; }

@media (max-width: 1200px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cell { grid-column: span 1 !important; }
}
</style>

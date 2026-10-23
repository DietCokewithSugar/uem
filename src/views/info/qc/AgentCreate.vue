<!-- 新建体验质检 / AB对比 #/agentTools：上传素材 → 提炼业务目标 → 选择角色 -->
<template>
  <div class="uem-card wizard">
    <div class="wizard-head">
      <div class="title-line">
        <span class="title-k">标题：</span>
        <el-input
          v-if="editingTitle"
          ref="titleInput"
          v-model="form.title"
          maxlength="80"
          class="title-input"
          @blur="finishTitle"
          @keyup.enter="finishTitle"
        />
        <template v-else>
          <b class="title-v">{{ form.title }}</b>
          <el-icon class="title-edit" @click="beginTitle"><EditPen /></el-icon>
        </template>
        <el-tag v-if="isAb" size="small" effect="plain" class="ab-tag">对比修改前后</el-tag>
      </div>
      <span class="ai-note">AI 仅作为辅助来进行用户体验评估</span>
    </div>

    <div v-if="!running" class="stepper">
      <template v-for="(label, i) in stepLabels" :key="label">
        <div v-if="i" class="line" :class="{ on: step > i - 1 }" />
        <div class="step" :class="{ active: step === i, done: step > i }">
          <span class="dot"><el-icon v-if="step > i"><Check /></el-icon></span>
          <span>{{ label }}</span>
        </div>
      </template>
    </div>

    <div v-if="running" class="running">
      <el-steps direction="vertical" :active="runStep" finish-status="success">
        <el-step v-for="item in runSteps" :key="item" :title="item" />
      </el-steps>
      <p class="run-note">正在生成报告，请稍候</p>
    </div>

    <template v-else>
      <section v-show="step === 0">
        <p v-if="isAb" class="zone-hint">请按任务顺序分别上传修改前、修改后。每一侧支持 PNG、JPG、JPEG，最多 5 张。</p>
        <div class="zones" :class="{ ab: isAb }">
          <div v-for="zone in zones" :key="zone.key" class="zone">
            <div v-if="zone.title" class="zone-title" :class="zone.key">{{ zone.title }}（{{ zone.files.length }}/5）</div>
            <div
              class="drop"
              :class="{ over: overKey === zone.key, filled: zone.files.length }"
              @click="!zone.files.length && choose(zone.key)"
              @dragover.prevent="overKey = zone.key"
              @dragleave="onDragLeave($event, zone.key)"
              @drop.prevent="onDrop($event, zone.key)"
            >
              <template v-if="!zone.files.length">
                <p>支持 PNG、JPG、JPEG格式（最多可上传5张）</p>
                <el-button plain type="primary" @click.stop="choose(zone.key)">点击上传图片</el-button>
              </template>
              <template v-else>
                <div class="shots" @click.stop>
                  <div v-for="file in zone.files" :key="file.uid" class="shot">
                    <img :src="file.src" :alt="file.name" />
                    <button type="button" class="shot-x" @click="removeFile(zone.key, file.uid)">×</button>
                    <div class="shot-name" :title="file.name">{{ file.name }}</div>
                  </div>
                </div>
                <el-button v-if="zone.files.length < 5" plain type="primary" @click.stop="choose(zone.key)">继续上传</el-button>
              </template>
            </div>
          </div>
        </div>
        <input ref="fileInput" class="file-input" type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple @change="onPick" />
      </section>

      <section v-show="step === 1" class="goal">
        <div class="ai-banner">
          <b>建议先用ai快速起草场景</b>
          <p v-if="canExtract">{{ isAb ? '你已上传修改前、修改后素材，可先点击「使用AI提炼场景」。系统会按同一提示词分别看两版，再合并成目标、任务等字段，之后可以手动微调。' : '你已上传素材，可先点击「使用AI提炼场景」，系统会自动生成目标、任务等字段，再手动微调。' }}</p>
          <p v-else>{{ isAb ? '请先上传修改前和修改后素材，再使用 AI 提炼场景。' : '请先在上一步上传评测素材，再使用 AI 提炼场景。' }}</p>
          <div class="ai-actions">
            <el-button type="primary" plain :loading="extracting" :disabled="!canExtract" @click="applyExtract">使用AI提炼场景</el-button>
            <el-button link type="primary" @click="promptVisible = true">查看本次提示词</el-button>
          </div>
        </div>
        <el-alert v-if="fromPrompt" class="draft-tip" type="success" :closable="false" show-icon :title="`草稿已填入。内容来自「${promptName}」，可以直接改。`" />

        <div class="field">
          <div class="field-label">产品类型</div>
          <el-select v-model="form.category" clearable placeholder="请选择产品类型" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <p class="field-note">选项与提示词「{{ promptName }}」里的产品类型字典一致。</p>
        </div>

        <div v-for="field in mainFields" :key="field.key" class="field">
          <div class="field-label">{{ field.label }}<span class="req">（必填）</span></div>
          <el-input v-model="form[field.key]" type="textarea" :rows="3" :placeholder="field.placeholder" />
          <div class="ex-label">推荐示例（可多选）</div>
          <div class="examples">
            <button v-for="text in field.examples" :key="text" type="button" class="chip" :class="{ on: hasExample(field.key, text) }" @click="toggleExample(field.key, text)">{{ text }}</button>
          </div>
        </div>

        <button type="button" class="extra-toggle" @click="extraOpen = !extraOpen">
          收集补充信息
          <el-icon><component :is="extraOpen ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        </button>
        <div v-show="extraOpen" class="extra">
          <div v-for="field in extraFields" :key="field.key" class="field">
            <div class="field-label">{{ field.label }}<span class="opt">（可选）</span></div>
            <el-input v-model="form[field.key]" type="textarea" :rows="3" :placeholder="field.placeholder" />
            <template v-if="field.examples.length">
              <div class="ex-label">推荐示例（可多选）</div>
              <div class="examples">
                <button v-for="text in field.examples" :key="text" type="button" class="chip" :class="{ on: hasExample(field.key, text) }" @click="toggleExample(field.key, text)">{{ text }}</button>
              </div>
            </template>
          </div>
        </div>
      </section>

      <section v-show="step === 2" class="roles">
        <div class="role-layout">
          <aside class="role-nav">
            <div class="nav-head">用户角色 ({{ userTotal }})</div>
            <button v-for="group in navGroups" :key="group" type="button" class="nav-item sub" :class="{ active: roleFilter === group }" @click="roleFilter = group">{{ group }}</button>
            <button type="button" class="nav-item" :class="{ active: roleFilter === 'expert' }" @click="roleFilter = 'expert'">专家角色 ({{ expertTotal }})</button>
            <button type="button" class="nav-item" :class="{ active: roleFilter === 'mine' }" @click="roleFilter = 'mine'">我的角色 ({{ mineTotal }})</button>
          </aside>
          <div class="role-main">
            <div class="role-count">已选 {{ selectedIds.length }} 个 / 最多 10 个</div>
            <div v-if="shownRoles.length" class="role-grid">
              <div v-for="role in shownRoles" :key="role.id" class="role-card" :class="{ on: selectedIds.includes(role.id) }" @click="setRole(role.id, !selectedIds.includes(role.id))">
                <div class="role-top">
                  <el-checkbox :model-value="selectedIds.includes(role.id)" @click.stop @change="(v) => setRole(role.id, v)" />
                  <b class="role-name">{{ role.name }}</b>
                  <div class="role-ops" @click.stop>
                    <a v-if="!role.mine" @click="pinRole(role)">添加为我的角色</a>
                    <span v-else class="muted">已在我的角色</span>
                    <a @click="detailRole = role">查看详情</a>
                    <a @click="removeRole(role)">删除</a>
                  </div>
                </div>
                <p class="role-desc">{{ role.desc }}</p>
                <p v-if="role.roleClass" class="meta">角色分类：{{ role.roleClass }}</p>
                <p v-if="role.portrait?.length" class="meta">画像：<template v-for="(item, i) in role.portrait" :key="item[0]">{{ i ? '　' : '' }}{{ item[0] }}：{{ item[1] }}</template></p>
                <div v-if="role.traits?.length" class="pills">
                  <span v-for="item in role.traits" :key="item[0]" class="pill">{{ item[0] }}：{{ item[1] }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else :description="roleFilter === 'mine' ? '还没有添加。可在用户角色或专家角色中点击「添加为我的角色」' : '该分组暂无角色'" />
          </div>
        </div>
      </section>

      <div class="wizard-foot">
        <el-button @click="back">返回列表</el-button>
        <el-button :disabled="step === 0" @click="prev">上一步</el-button>
        <el-button type="primary" :disabled="step === 2" @click="next">下一步</el-button>
        <el-tooltip :disabled="canStart" :content="startHint" placement="top">
          <span class="start-wrap">
            <el-button class="start-btn" type="primary" :disabled="!canStart" @click="start">开始评测</el-button>
          </span>
        </el-tooltip>
      </div>
    </template>

    <el-dialog v-model="promptVisible" title="本次模型提示词" width="820px">
      <p class="prompt-tip">步骤二使用「{{ promptName }}」。下面全文里的 %s 已换成本次素材说明。演示环境按其中的 JSON 字段生成本地草稿。</p>
      <el-input :model-value="promptPreview" type="textarea" :rows="16" readonly />
      <template #footer>
        <el-button type="primary" @click="promptVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" :title="detailRole?.name || '角色详情'" width="560px">
      <el-descriptions v-if="detailRole" :column="1" border>
        <el-descriptions-item label="角色类型">{{ detailRole.type }}</el-descriptions-item>
        <el-descriptions-item label="所属分组">{{ detailRole.group || '基础型' }}</el-descriptions-item>
        <el-descriptions-item label="角色分类">{{ detailRole.roleClass || '—' }}</el-descriptions-item>
        <el-descriptions-item label="角色设定">{{ detailRole.desc }}</el-descriptions-item>
        <el-descriptions-item v-if="detailRole.portrait?.length" label="画像">{{ detailRole.portrait.map((item) => `${item[0]}：${item[1]}`).join('；') }}</el-descriptions-item>
        <el-descriptions-item v-if="detailRole.traits?.length" label="特征">{{ detailRole.traits.map((item) => `${item[0]}：${item[1]}`).join('；') }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { qcRoles, qcReports, userRoleGroups, generateReport, generateAbReport } from '@/mock/qc'
import { categoriesFromPrompt, materialNote, buildFileAnalysisPrompt, extractBusinessScene, fileAnalysisPrompt } from '@/mock/sceneExtract'
import { currentUser } from '@/config/user'

const route = useRoute()
const router = useRouter()
const isAb = computed(() => route.query.mode === 'ab')
const stepLabels = ['上传评测素材', '定义业务场景与目标', '选择评测角色']
const mainFields = [
  { key: 'businessgoal', label: '评测目标', placeholder: '需要验证什么体验目标？', examples: ['验证新用户能否在 3 分钟内完成首个核心任务', '降低关键流程中的误操作与中途放弃', '提升核心功能的理解效率和操作确定性'] },
  { key: 'keytasks', label: '关键任务流', placeholder: '用户需要完成哪些核心任务？', examples: ['完成注册并进入主流程', '搜索并执行一次核心操作', '异常情况下的修改与重试'] }
]
const extraFields = [
  { key: 'painpoints', label: '用户痛点', placeholder: '当前存在的主要痛点或感受', examples: ['页面信息密度高，关键按钮不够直观', '流程缺少状态反馈，用户不确定是否成功', '异常场景缺少恢复路径，导致任务中断'] },
  { key: 'successcriteria', label: '成功标准', placeholder: '如：完成率≥80%，错误率<5%，平均时长≤3分钟', examples: ['核心任务完成率 ≥ 90%', '关键步骤平均耗时下降 20%', '一级问题数量下降 50%'] },
  { key: 'constraints', label: '约束条件', placeholder: '如：只评估静态界面，不推测未出现的页面和真实性能', examples: [] }
]

function shanghaiParts() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date())
}
function reportDate() {
  const parts = shanghaiParts()
  const get = (type) => parts.find((part) => part.type === type).value
  return `${get('year')}${get('month')}${get('day')}`
}
function shanghaiNow() {
  const parts = shanghaiParts()
  const get = (type) => parts.find((part) => part.type === type).value
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

const step = ref(0)
const running = ref(false)
const runStep = ref(0)
const extracting = ref(false)
const fromPrompt = ref(false)
const extraOpen = ref(true)
const promptVisible = ref(false)
const editingTitle = ref(false)
const titleInput = ref()
const fileInput = ref()
const overKey = ref('')
const roleFilter = ref('基础型')
const selectedIds = ref([])
const detailRole = ref(null)
const detailVisible = computed({
  get: () => !!detailRole.value,
  set: (open) => { if (!open) detailRole.value = null }
})
const files = ref([])
const beforeFiles = ref([])
const afterFiles = ref([])
const form = reactive({
  title: `体验质检智能体报告${reportDate()}`,
  category: '',
  businessgoal: '',
  keytasks: '',
  painpoints: '',
  successcriteria: '',
  constraints: ''
})

const zones = computed(() => (isAb.value
  ? [
      { key: 'before', title: '修改前', files: beforeFiles.value },
      { key: 'after', title: '修改后', files: afterFiles.value }
    ]
  : [{ key: 'standard', title: '', files: files.value }]))
const analysisFiles = computed(() => (isAb.value
  ? [...beforeFiles.value.map((file) => ({ ...file, version: '修改前' })), ...afterFiles.value.map((file) => ({ ...file, version: '修改后' }))]
  : files.value))
const canExtract = computed(() => (isAb.value ? beforeFiles.value.length > 0 && afterFiles.value.length > 0 : files.value.length > 0))
const promptName = computed(() => fileAnalysisPrompt()?.name || '质检工具（文件分析）')
const promptPreview = computed(() => buildFileAnalysisPrompt(materialNote(analysisFiles.value)).content)
const categoryOptions = computed(() => {
  const list = categoriesFromPrompt()
  return form.category && !list.includes(form.category) ? [form.category, ...list] : list
})
const userTotal = computed(() => qcRoles.filter((role) => role.type === '用户画像').length)
const expertTotal = computed(() => qcRoles.filter((role) => role.type === '专家角色').length)
const mineTotal = computed(() => qcRoles.filter((role) => role.mine).length)
const navGroups = computed(() => {
  const extra = []
  qcRoles.forEach((role) => {
    if (role.type === '用户画像' && role.group && !userRoleGroups.includes(role.group) && !extra.includes(role.group)) extra.push(role.group)
  })
  return [...userRoleGroups, ...extra]
})
const shownRoles = computed(() => {
  if (roleFilter.value === 'expert') return qcRoles.filter((role) => role.type === '专家角色')
  if (roleFilter.value === 'mine') return qcRoles.filter((role) => role.mine)
  return qcRoles.filter((role) => role.type === '用户画像' && (role.group || '基础型') === roleFilter.value)
})
const runSteps = computed(() => (isAb.value
  ? ['逐张解析修改前（质检工具·AB对比-单图场景）', '逐张解析修改后（质检工具·AB对比-单图场景）', '生成对比结论（质检工具·AB对比-对比报告）', '汇总生成 AB 对比报告']
  : ['核对业务场景（质检工具·文件分析）', '按体验维度评价（质检工具·ETS维度）', '各角色独立评估', '汇总生成综合报告']))
const startHint = computed(() => {
  if (step.value < 2) return '请先完成上传和业务目标，并进入选择评测角色'
  if (!canExtract.value) return isAb.value ? '请上传修改前和修改后素材' : '请至少上传 1 张评测素材'
  if (!form.businessgoal.trim() || !form.keytasks.trim()) return '请填写评测目标和关键任务流'
  if (!selectedIds.value.length) return '请至少选择 1 个评测角色'
  return ''
})
const canStart = computed(() => !startHint.value)

let pickTarget = 'standard'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function bucketOf(target) {
  if (target === 'before') return beforeFiles
  if (target === 'after') return afterFiles
  return files
}
function choose(target) {
  pickTarget = target
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.click()
}
function onPick(event) {
  addFiles([...event.target.files], pickTarget)
}
function onDrop(event, target) {
  overKey.value = ''
  addFiles([...event.dataTransfer.files], target)
}
function onDragLeave(event, key) {
  if (!event.currentTarget.contains(event.relatedTarget)) overKey.value = ''
}
function readAsDataURL(raw) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('read'))
    reader.readAsDataURL(raw)
  })
}
function measure(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve({ width: 0, height: 0 })
    img.src = src
  })
}
async function addFiles(list, target) {
  const bucket = bucketOf(target)
  const rejected = []
  const accepted = []
  list.forEach((raw) => {
    const okType = raw.type === 'image/png' || raw.type === 'image/jpeg' || /\.(png|jpe?g)$/i.test(raw.name || '')
    if (!okType) rejected.push(`「${raw.name}」不是 PNG、JPG 或 JPEG`)
    else if (!raw.size) rejected.push(`「${raw.name}」是空文件`)
    else if (raw.size > 15 * 1024 * 1024) rejected.push(`「${raw.name}」超过 15MB`)
    else accepted.push(raw)
  })
  const room = 5 - bucket.value.length
  if (accepted.length > room) rejected.push(room > 0 ? `最多上传 5 张，已忽略多余的 ${accepted.length - room} 张` : '最多上传 5 张')
  for (const raw of accepted.slice(0, Math.max(room, 0))) {
    try {
      const src = await readAsDataURL(raw)
      const { width, height } = await measure(src)
      bucket.value.push({ uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: raw.name, src, width, height })
    } catch {
      rejected.push(`「${raw.name}」读取失败`)
    }
  }
  if (rejected.length) ElMessage.warning(rejected[0])
}
function removeFile(target, uid) {
  const bucket = bucketOf(target)
  bucket.value = bucket.value.filter((file) => file.uid !== uid)
}

function parts(key) {
  return String(form[key] || '').split(/[；;]\s*/).map((item) => item.trim()).filter(Boolean)
}
function hasExample(key, text) {
  return parts(key).includes(text)
}
function toggleExample(key, text) {
  const list = parts(key)
  const index = list.indexOf(text)
  if (index >= 0) list.splice(index, 1)
  else list.push(text)
  form[key] = list.join('；')
}
async function applyExtract() {
  if (!canExtract.value || extracting.value) return
  const filled = ['category', 'businessgoal', 'keytasks', 'painpoints', 'successcriteria', 'constraints'].some((key) => String(form[key] || '').trim())
  if (filled) {
    try {
      await ElMessageBox.confirm('将覆盖当前已填写的产品类型、评测目标和补充信息', '使用AI提炼场景', { type: 'warning', confirmButtonText: '覆盖并提炼', cancelButtonText: '取消' })
    } catch {
      return
    }
  }
  extracting.value = true
  try {
    await sleep(650)
    Object.assign(form, extractBusinessScene({ files: analysisFiles.value, mode: isAb.value ? 'ab' : 'standard' }))
    fromPrompt.value = true
    ElMessage.success(`已按「${promptName.value}」生成草稿，请再核对`)
  } finally {
    extracting.value = false
  }
}
function prev() {
  if (step.value > 0) step.value -= 1
}
function next() {
  if (step.value === 1 && (!form.businessgoal.trim() || !form.keytasks.trim())) {
    ElMessage.warning('请填写评测目标和关键任务流')
    return
  }
  if (step.value < 2) step.value += 1
}
function setRole(id, on) {
  const index = selectedIds.value.indexOf(id)
  if (on && index < 0) {
    if (selectedIds.value.length >= 10) {
      ElMessage.warning('最多选择 10 个评测角色')
      return
    }
    selectedIds.value.push(id)
  } else if (!on && index >= 0) selectedIds.value.splice(index, 1)
}
function pinRole(role) {
  role.mine = true
  ElMessage.success(`已将「${role.name}」加入我的角色`)
}
async function removeRole(role) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${role.name}」？删除后新建评测将不能再选择该角色。`, '提示', { type: 'warning' })
  } catch {
    return
  }
  const index = selectedIds.value.indexOf(role.id)
  if (index >= 0) selectedIds.value.splice(index, 1)
  const at = qcRoles.indexOf(role)
  if (at >= 0) qcRoles.splice(at, 1)
  if (detailRole.value?.id === role.id) detailRole.value = null
  ElMessage.success('删除成功')
}
async function beginTitle() {
  editingTitle.value = true
  await nextTick()
  titleInput.value?.focus()
}
function finishTitle() {
  form.title = form.title.trim()
  if (!form.title) form.title = `体验质检智能体报告${reportDate()}`
  editingTitle.value = false
}
async function back() {
  if (running.value) return
  const dirty = analysisFiles.value.length || selectedIds.value.length || ['category', 'businessgoal', 'keytasks', 'painpoints', 'successcriteria', 'constraints'].some((key) => String(form[key] || '').trim())
  if (dirty) {
    try {
      await ElMessageBox.confirm('返回后本次填写的内容不会保存', '提示', { type: 'warning', confirmButtonText: '返回列表', cancelButtonText: '留在本页' })
    } catch {
      return
    }
  }
  router.push('/agentFirst')
}
async function start() {
  if (!canStart.value || running.value) return
  running.value = true
  const business = {
    category: form.category,
    businessgoal: form.businessgoal.trim(),
    keytasks: form.keytasks.trim(),
    painpoints: form.painpoints.trim(),
    successcriteria: form.successcriteria.trim(),
    constraints: form.constraints.trim(),
    fromPrompt: fromPrompt.value,
    promptName: promptName.value
  }
  const scene = [business.category && `产品类型：${business.category}`, `评测目标：${business.businessgoal}`, `关键任务：${business.keytasks}`].filter(Boolean).join('。')
  const roleIds = [...selectedIds.value]
  for (let i = 0; i <= runSteps.value.length; i++) {
    runStep.value = i
    await sleep(420)
  }
  const report = isAb.value
    ? generateAbReport({
        title: form.title,
        roleIds,
        scene,
        business,
        materials: analysisFiles.value.map((file) => ({ src: file.src, name: file.name, version: file.version })),
        before: beforeFiles.value[0] ? { src: beforeFiles.value[0].src, name: beforeFiles.value[0].name } : null,
        after: afterFiles.value[0] ? { src: afterFiles.value[0].src, name: afterFiles.value[0].name } : null
      })
    : generateReport({
        title: form.title,
        roleIds,
        scene,
        business,
        materials: files.value.map((file) => ({ src: file.src, name: file.name }))
      })
  report.creator = currentUser.name
  report.createTime = shanghaiNow()
  qcReports.unshift(report)
  router.push({ path: '/agentDetail', query: { id: report.id } })
}
</script>

<style scoped>
.wizard-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.title-line { display: flex; align-items: center; gap: 6px; min-width: 0; flex-wrap: wrap; }
.title-k { color: #333; flex: none; }
.title-v { font-size: 16px; color: #333; word-break: break-all; }
.title-input { width: 360px; max-width: 100%; }
.title-edit { color: #999; cursor: pointer; }
.title-edit:hover { color: var(--uem-red); }
.ab-tag { border-color: var(--uem-red); color: var(--uem-red); }
.ai-note { flex: none; font-size: 12px; color: #888; line-height: 24px; }
.stepper { display: flex; align-items: center; gap: 10px; margin: 22px 0 26px; }
.step { display: flex; align-items: center; gap: 8px; color: #999; font-size: 14px; white-space: nowrap; }
.step.active, .step.done { color: #333; }
.dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #dcdfe6; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #fff; flex: none; }
.step.active .dot, .step.done .dot { background: var(--uem-red); border-color: var(--uem-red); }
.dot .el-icon { font-size: 12px; }
.line { flex: 1; height: 2px; background: #e6e6e6; min-width: 24px; }
.line.on { background: var(--uem-red); }
.zone-hint { margin: 0 0 12px; color: #888; font-size: 13px; }
.zones.ab { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.zone-title { margin-bottom: 8px; font-size: 14px; color: #666; }
.zone-title.after { color: var(--uem-red); }
.drop { min-height: 320px; border: 1px dashed #dcdfe6; border-radius: 4px; background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: #999; text-align: center; padding: 24px; }
.drop.over { border-color: var(--uem-red); background: #fff7f7; }
.drop.filled { justify-content: flex-start; }
.file-input { display: none; }
.shots { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; justify-content: flex-start; }
.shot { position: relative; width: 120px; }
.shot img { width: 120px; height: 90px; object-fit: cover; border: 1px solid #eee; border-radius: 4px; background: #fff; display: block; }
.shot-x { position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.55); color: #fff; cursor: pointer; line-height: 18px; }
.shot-name { margin-top: 4px; font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ai-banner { border: 1px solid #f3d4d6; background: #fff8f8; border-radius: 4px; padding: 14px 16px; margin-bottom: 16px; }
.ai-banner b { display: block; margin-bottom: 6px; color: #333; }
.ai-banner p { margin: 0 0 12px; color: #666; font-size: 13px; line-height: 1.7; }
.ai-actions { display: flex; align-items: center; gap: 8px; }
.draft-tip { margin-bottom: 16px; }
.field { margin-bottom: 18px; }
.field-label { margin-bottom: 8px; font-weight: 600; color: #333; }
.req { color: #c7000b; font-weight: 500; }
.opt { color: #999; font-weight: 400; }
.field-note, .ex-label { margin: 8px 0 0; font-size: 12px; color: #999; }
.examples { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.chip { border: 1px solid #e5e5e5; background: #fafafa; border-radius: 14px; padding: 4px 10px; font-size: 12px; color: #666; cursor: pointer; }
.chip.on { border-color: var(--uem-red); color: var(--uem-red); background: var(--uem-red-light); }
.extra-toggle { display: flex; align-items: center; gap: 4px; border: 0; background: transparent; padding: 0; margin: 4px 0 12px; color: #333; font-weight: 600; cursor: pointer; }
.extra { padding-bottom: 4px; }
.role-layout { display: grid; grid-template-columns: 180px 1fr; gap: 16px; min-height: 420px; }
.role-nav { border-right: 1px solid #f2f2f2; padding-right: 8px; }
.nav-head { padding: 8px 12px; color: #333; font-weight: 600; }
.nav-item { display: block; width: 100%; text-align: left; border: 0; background: transparent; padding: 8px 12px; border-radius: 4px; color: #555; font-size: 13px; cursor: pointer; }
.nav-item.sub { padding-left: 28px; }
.nav-item.active { background: var(--uem-red-light); color: var(--uem-red); }
.role-count { text-align: right; color: #888; font-size: 13px; margin-bottom: 10px; }
.role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.role-card { border: 1px solid #eee; border-radius: 4px; padding: 12px 14px; cursor: pointer; background: #fff; }
.role-card.on { border-color: var(--uem-red); box-shadow: inset 0 0 0 1px var(--uem-red); }
.role-top { display: flex; align-items: flex-start; gap: 8px; }
.role-card :deep(.el-checkbox) { height: 22px; margin-right: 0; }
.role-name { color: #333; line-height: 22px; }
.role-ops { margin-left: auto; display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; font-size: 12px; line-height: 22px; }
.role-ops a { color: var(--uem-red); cursor: pointer; }
.muted { color: #bbb; }
.role-desc { margin: 8px 0; color: #666; font-size: 13px; line-height: 1.6; }
.meta { margin: 0 0 4px; font-size: 12px; color: #888; line-height: 1.7; }
.pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pill { background: #f6f7f9; border-radius: 2px; padding: 1px 6px; color: #666; font-size: 12px; }
.wizard-foot { position: sticky; bottom: 0; z-index: 2; display: flex; justify-content: center; gap: 12px; margin-top: 22px; padding: 16px 0 4px; background: #fff; border-top: 1px solid #f2f2f2; }
.start-wrap { display: inline-block; }
.wizard-foot :deep(.start-btn.is-disabled) { background-color: #f4c1c4; border-color: #f4c1c4; color: #fff; }
.running { padding: 12px 48px 24px; min-height: 280px; }
.run-note { color: #888; font-size: 13px; }
.prompt-tip { margin: 0 0 10px; color: #888; font-size: 13px; line-height: 1.6; }
@media (max-width: 960px) {
  .zones.ab, .role-layout, .role-grid { grid-template-columns: 1fr; }
  .wizard-head { flex-direction: column; }
  .role-nav { border-right: 0; border-bottom: 1px solid #f2f2f2; padding-bottom: 8px; }
}
</style>

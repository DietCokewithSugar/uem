<!-- 体验问题 · 优化建议 · 新增 #/optimSuggestAdd；?problemId=<流水号> 且为本人提交的「待修改」建议时为修改并重新提交 -->
<template>
  <div class="uem-card add-page">
    <!-- 修改模式提示退回意见（推测：截图未展示修改页） -->
    <el-alert v-if="editTarget" type="warning" :closable="false" show-icon class="top-tip" :title="`优化建议编号：${editTarget.id}`">
      <template v-if="returnLog">退回意见：{{ returnLog.remark || '无' }}（{{ returnLog.operator }}，{{ returnLog.time }}）</template>
    </el-alert>
    <el-alert v-else-if="blockedTip" type="info" :closable="false" show-icon class="top-tip" :title="blockedTip" />

    <el-form ref="formRef" :model="form" :rules="rules" label-width="128px" scroll-to-error class="add-form">
      <el-form-item label="描述及解决建议" prop="desc">
        <!-- 窄屏下示例文字折行时自动增高，保证提示完整可见 -->
        <el-input ref="descInput" v-model="form.desc" type="textarea" :rows="7" :autosize="{ minRows: 7, maxRows: 16 }" :placeholder="descPlaceholder" />
        <div class="similar-row"><span class="similar-link" @click="querySimilar">点我查询相似优化建议</span></div>
      </el-form-item>

      <el-form-item label="来源" prop="source">
        <el-select v-model="form.source" placeholder="请选择来源" style="width: 100%">
          <el-option-group v-for="g in sourceOptions" :key="g.label" :label="g.label">
            <el-option v-for="o in g.items" :key="o.value" :label="o.label" :value="o.value" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="关联体验活动">
        <!-- 占位文字为推测 -->
        <el-select v-model="form.activity" clearable filterable placeholder="请选择关联体验活动" style="width: 100%">
          <el-option v-for="a in activityOptions" :key="a" :label="a" :value="a" />
        </el-select>
      </el-form-item>

      <el-form-item label="产品名称" prop="product">
        <el-select v-model="form.product" filterable placeholder="请选择产品名称，支持输入关键字搜索" style="width: 100%">
          <el-option v-for="p in productOptions" :key="p" :label="p" :value="p" />
        </el-select>
      </el-form-item>

      <el-form-item label="产品使用渠道" prop="channels">
        <el-checkbox-group v-model="form.channels" class="channels">
          <div v-for="g in channelGroups" :key="g.group" class="ch-group">
            <span class="ch-label">{{ g.group }}</span>
            <div class="ch-items">
              <el-checkbox v-for="item in g.items" :key="item" :value="`${g.group}-${item}`">{{ item }}</el-checkbox>
            </div>
          </div>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="功能栏目">
        <el-autocomplete
          v-model="form.column"
          :fetch-suggestions="queryColumns"
          clearable
          placeholder="请您通过下拉选择或手工录入使用渠道中的功能栏目，例如：转账汇款、存款等"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="影响程度" prop="impact">
        <el-select v-model="form.impact" placeholder="请选择影响程度" style="width: 100%">
          <el-option v-for="v in impactOptions" :key="v" :label="v" :value="v" />
        </el-select>
      </el-form-item>

      <el-form-item label="优化建议分类" prop="category">
        <template #label>
          <span class="cat-label">优化建议分类<el-tooltip placement="top-start" :show-after="100">
              <template #content>
                <div class="cat-tip">
                  <div v-for="c in categoryOptions" :key="c.value"><b>{{ c.value }}</b>：{{ c.remark || '—' }}</div>
                </div>
              </template>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </span>
        </template>
        <el-select v-model="form.category" placeholder="请选择优化建议分类" style="width: 100%">
          <el-option v-for="c in categoryOptions" :key="c.value" :label="c.value" :value="c.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="上传附件">
        <div class="pics" :class="{ dragging }">
          <div v-for="(a, i) in form.attachments" :key="`${i}-${a.name}`" class="pic">
            <el-image :src="a.url" :alt="a.name" fit="cover" :preview-src-list="picUrls" :initial-index="i" preview-teleported hide-on-click-modal />
            <span class="pic-del" title="删除" @click="removePic(i)"><el-icon><Close /></el-icon></span>
          </div>
          <div v-if="form.attachments.length < MAX_PICS" class="pic-add" @click="fileInput.click()">
            <el-icon><Plus /></el-icon>
            <span>选择图片</span>
          </div>
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onPick" />
        </div>
        <div class="pic-tip">最多可上传9张(支持按ctrl+alt+d,ctrl+v截图上传(ie浏览器暂不支持))</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="submit" :loading="submitting" @click="submit">提交</el-button>
      </el-form-item>
    </el-form>

    <!-- 相似优化建议：「点我查询」随时可查；提交时由「相似度」功能（系统管理 · 体验问题维护）控制是否提示 -->
    <el-dialog
      v-model="sim.visible"
      :title="sim.mode === 'submit' ? '发现相似优化建议' : '相似优化建议'"
      width="880px"
      append-to-body
      :close-on-click-modal="sim.mode !== 'submit'"
    >
      <el-alert v-if="sim.mode === 'submit'" type="warning" :closable="false" show-icon title="以下已有优化建议与本次描述相似，请确认是否重复提交。" class="similar-tip" />
      <el-table :data="sim.list" size="small" empty-text="未找到相似的优化建议">
        <el-table-column label="优化建议编号" width="210">
          <template #default="{ row }"><span class="uem-link" @click="openDetail(row.item)">{{ row.item.id }}</span></template>
        </el-table-column>
        <el-table-column label="产品名称" width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.item.product }}</template>
        </el-table-column>
        <el-table-column label="描述及解决建议" min-width="260">
          <template #default="{ row }"><div class="clamp2" :title="row.item.desc">{{ row.item.desc }}</div></template>
        </el-table-column>
        <el-table-column label="相似度" width="80" align="center">
          <template #default="{ row }"><span class="score">{{ Math.round(row.score * 100) }}%</span></template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">{{ row.item.status }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <template v-if="sim.mode === 'submit'">
          <el-button @click="sim.visible = false">返回修改</el-button>
          <el-button type="primary" @click="continueSubmit">继续提交</el-button>
        </template>
        <el-button v-else @click="sim.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 从相似建议进入详情页后返回时恢复已填写的内容（推测：仅保留在当前会话内存中）
let savedDraft = null
</script>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { activities } from '@/mock'
import { productList } from '@/mock/system'
import { dictOptions, hasDictType } from '@/mock/dicts'
import { featureActive, findSimilar } from '@/mock/problemFeatures'
import {
  sourceGroups, sources, channelGroups, columnOptions, categories, impacts,
  suggestions, findSuggestion, createSuggestion, resubmit, detailRoute
} from '@/mock/suggest'
import { currentUser } from '@/config/user'
import { nowText } from '@/mock/qc'

const route = useRoute()
const router = useRouter()
const formRef = ref()

const descPlaceholder =
  '请您参照示例填写：\n【现象】请详细描述您所了解的现象，可包含具体操作步骤。\n示例：通过手机银行存入定期存款时页面显示的利率为挂牌利率而不是上浮后的利率，导致客户无法在存入定期时了解实际可以享受的利率情况。\n【建议】请详细描述您期望实现的具体功能或对策。\n示例：建议办理定期存款时选择存入期限并选择产品后，页面可以实时显示客户可以享受的利率信息。\n\n【温馨提示】严禁含有敏感词汇或客户隐私信息（含客户名称、证件号、手机号、地址、银行卡号、账号等）'

// ===== 修改模式：本人提交的「待修改」建议 =====
const target = route.query.problemId ? findSuggestion(route.query.problemId) : null
// 进入页面时确定模式（重新提交后状态改变，不影响本页）
const editTarget = target && target.status === '待修改' && target.submitterId === currentUser.id ? target : null
const returnLog = editTarget?.logs.find((l) => l.action === '退回提交人')
// 不可修改时按新增处理（推测）
const blockedTip = (() => {
  if (!route.query.problemId || editTarget) return ''
  const why = !target ? '不存在' : target.status !== '待修改' ? `当前状态为「${target.status}」` : '不是您提交的'
  return `优化建议「${target?.id || route.query.problemId}」${why}，不能修改；提交后将新增一条优化建议`
})()

const blank = () => ({ desc: '', source: '', activity: '', product: '', channels: [], column: '', impact: '', category: '', attachments: [] })
const pickFields = (s) => ({
  desc: s.desc, source: s.source, activity: s.activity || '', product: s.product, channels: [...(s.channels || [])],
  column: s.column || '', impact: s.impact, category: s.category, attachments: (s.attachments || []).map((a) => ({ name: a.name, url: a.url }))
})
const form = reactive(blank())
if (savedDraft?.key === route.fullPath) Object.assign(form, savedDraft.data)
else if (editTarget) Object.assign(form, pickFields(editTarget))
savedDraft = null

// ===== 选项：来源、影响程度、优化建议分类取自「字典维护」中开启的字典值，字典类型不存在时回退到内置枚举 =====
const dictList = (type, fallback) => (hasDictType(type) ? dictOptions(type) : fallback)
const sourceOptions = computed(() => {
  const values = dictList('SUGGEST_SOURCE', sources.map((value) => ({ value }))).map((o) => o.value)
  const groups = sourceGroups.map((g) => ({
    label: g.label,
    items: values.filter((v) => v.startsWith(`${g.prefix}：`)).map((v) => ({ value: v, label: v.slice(g.prefix.length + 1) }))
  }))
  // 字典中新增的不带「客户：/员工：」前缀的来源归入「其他」（推测）
  const rest = values.filter((v) => !sourceGroups.some((g) => v.startsWith(`${g.prefix}：`)))
  if (rest.length) groups.push({ label: '其他', items: rest.map((v) => ({ value: v, label: v })) })
  return groups.filter((g) => g.items.length)
})
const impactOptions = computed(() => dictList('IMPACT_LEVEL', impacts.map((value) => ({ value }))).map((o) => o.value))
const categoryOptions = computed(() => dictList('SUGGEST_CATEGORY', categories.map((c) => ({ value: c.value, remark: c.desc }))))
const activityOptions = computed(() => [...new Set(activities.map((a) => a.name))])
const productOptions = computed(() => productList.filter((p) => p.status !== '冻结' && p.state !== '已废弃').map((p) => p.name))

const channelValues = channelGroups.flatMap((g) => g.items.map((item) => `${g.group}-${item}`))
const queryColumns = (q, cb) => {
  const kw = String(q ?? '').trim()
  cb(columnOptions.filter((c) => !kw || c.includes(kw)).map((value) => ({ value })))
}

// ===== 校验 =====
// 客户隐私信息（推测）：11 位手机号、18 位身份证号、16–19 位银行卡号/账号
// 紧跟字母的数字串（如优化建议编号 UEM+17 位数字）不视为证件号、卡号
const PRIVACY = [/(?<!\d)1[3-9]\d{9}(?!\d)/, /(?<![\dA-Za-z])\d{17}[\dXx](?!\d)/, /(?<![\dA-Za-z])\d{16,19}(?!\d)/]
const PRIVACY_MSG = '描述中疑似包含客户隐私信息（手机号、证件号、银行卡号等），请删除后再提交'
const descRule = (_, v, cb) => {
  const t = String(v ?? '')
  if (!t.trim()) return cb(new Error('请填写描述及解决建议'))
  if (PRIVACY.some((re) => re.test(t))) return cb(new Error(PRIVACY_MSG))
  cb()
}
const req = (message) => [{ required: true, message, trigger: 'change' }]
const rules = {
  desc: [{ required: true, validator: descRule, trigger: 'blur' }],
  source: req('请选择来源'),
  product: req('请选择产品名称'),
  channels: [{ type: 'array', required: true, min: 1, message: '请选择产品使用渠道', trigger: 'change' }],
  impact: req('请选择影响程度'),
  category: req('请选择优化建议分类')
}

// ===== 图片附件：选择 / Ctrl+V 粘贴 / 拖拽，保存为 data URL =====
const MAX_PICS = 9
const MAX_SIZE = 5 * 1024 * 1024 // 单张上限（推测）
const fileInput = ref()
const picUrls = computed(() => form.attachments.map((a) => a.url))
const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
const stamp = () => nowText().replace(/\D/g, '')
let shotSeq = 0 // 截图序号在本页内递增，避免同一秒内多次粘贴重名
async function addFiles(files, pasted = false) {
  if (!files.length) return
  const notes = []
  const images = files.filter((f) => /^image\//.test(f.type))
  if (images.length < files.length) notes.push('仅支持上传图片')
  const ok = images.filter((f) => f.size <= MAX_SIZE)
  if (ok.length < images.length) notes.push('单张图片不能超过5MB')
  const left = MAX_PICS - form.attachments.length
  if (ok.length > left) notes.push(`最多可上传${MAX_PICS}张`)
  if (notes.length) ElMessage.warning(notes.join('；'))
  const take = ok.slice(0, Math.max(0, left))
  if (!take.length) return
  try {
    const urls = await Promise.all(take.map(readAsDataURL))
    const items = take.map((f, i) => ({
      name: pasted || !f.name ? `截图${stamp()}_${++shotSeq}.${(f.type.split('/')[1] || 'png').replace('jpeg', 'jpg')}` : f.name,
      url: urls[i]
    }))
    form.attachments.push(...items.slice(0, MAX_PICS - form.attachments.length))
  } catch {
    ElMessage.error('图片读取失败，请重试')
  }
}
function onPick(e) {
  addFiles([...(e.target.files || [])])
  e.target.value = ''
}
const removePic = (i) => form.attachments.splice(i, 1)

// 粘贴、拖拽在整个页面生效；弹窗打开时不处理
function onPaste(e) {
  if (sim.visible) return
  // 在输入框中粘贴带文字的内容（如从 Word/Excel 复制，剪贴板同时含图片）时按文字粘贴
  if (e.target?.closest?.('input, textarea') && e.clipboardData?.getData('text/plain')) return
  const files = [...(e.clipboardData?.items || [])].filter((it) => it.kind === 'file' && /^image\//.test(it.type)).map((it) => it.getAsFile()).filter(Boolean)
  if (!files.length) return
  e.preventDefault()
  addFiles(files, true)
}
const dragging = ref(false)
let dragDepth = 0
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files')
const onDragEnter = (e) => {
  if (!hasFiles(e)) return
  dragDepth++
  dragging.value = true
}
const onDragLeave = (e) => {
  if (!hasFiles(e)) return
  if (--dragDepth <= 0) {
    dragDepth = 0
    dragging.value = false
  }
}
// 阻止浏览器直接打开拖入的文件（会丢失页面中的演示数据）
const onDragOver = (e) => hasFiles(e) && e.preventDefault()
function onDrop(e) {
  if (!hasFiles(e)) return
  e.preventDefault()
  dragDepth = 0
  dragging.value = false
  if (!sim.visible) addFiles([...e.dataTransfer.files])
}
const docEvents = { paste: onPaste, dragenter: onDragEnter, dragleave: onDragLeave, dragover: onDragOver, drop: onDrop }
// 窗口宽度变化后重新计算描述框高度
const descInput = ref()
const onResize = () => descInput.value?.resizeTextarea()
onMounted(() => {
  Object.entries(docEvents).forEach(([k, fn]) => document.addEventListener(k, fn))
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  Object.entries(docEvents).forEach(([k, fn]) => document.removeEventListener(k, fn))
  window.removeEventListener('resize', onResize)
})

// ===== 相似优化建议 =====
const sim = reactive({ visible: false, mode: 'query', list: [] })
const similarOf = () => findSimilar(form.desc, editTarget ? suggestions.filter((s) => s !== editTarget) : suggestions, { product: form.product })
function querySimilar() {
  if (!form.desc.trim()) return ElMessage.warning('请先填写描述及解决建议')
  Object.assign(sim, { visible: true, mode: 'query', list: similarOf() })
}
function openDetail(item) {
  savedDraft = { key: route.fullPath, data: JSON.parse(JSON.stringify(form)) }
  sim.visible = false
  router.push(detailRoute(item, '全部列表'))
}

// ===== 提交 =====
const submitting = ref(false)
async function submit() {
  if (submitting.value) return
  if (!(await formRef.value.validate().catch(() => false))) return
  if (featureActive('相似度')) {
    const list = similarOf()
    if (list.length) return Object.assign(sim, { visible: true, mode: 'submit', list })
  }
  doSubmit()
}
function continueSubmit() {
  sim.visible = false
  doSubmit()
}
function doSubmit() {
  submitting.value = true
  const data = { ...blank(), ...JSON.parse(JSON.stringify(form)), column: form.column.trim(), desc: form.desc.trim() }
  // 渠道按页面分组顺序保存，与勾选先后无关
  data.channels = [...channelValues.filter((v) => form.channels.includes(v)), ...form.channels.filter((v) => !channelValues.includes(v))]
  let s = editTarget
  if (s) resubmit(s, data)
  else s = createSuggestion(data)
  ElMessage.success(`提交成功，当前状态：${s.status}${s.currentHandler ? '，当前处理人：' + s.currentHandler : ''}`)
  router.replace(detailRoute(s, '我的提交', [s]))
}
</script>

<style scoped>
.add-page { padding: 28px 40px 32px 16px; }
.top-tip { margin: 0 0 22px 128px; width: auto; }
.add-form :deep(.el-form-item__label) { color: #555; }
.similar-row { width: 100%; text-align: right; line-height: 22px; margin-top: 4px; }
.similar-link { color: #3a6fd8; text-decoration: underline; cursor: pointer; font-size: 13px; }
.similar-link:hover { color: #2858b8; }

.channels { display: block; width: 100%; line-height: normal; }
.ch-group { display: flex; align-items: flex-start; }
.ch-group + .ch-group { margin-top: 2px; }
.ch-label { flex: 0 0 72px; color: #999; font-size: 12px; line-height: 32px; }
.ch-items { display: grid; grid-template-columns: repeat(3, 190px); }
.ch-items .el-checkbox { margin-right: 0; }

.cat-label { display: inline-flex; align-items: center; gap: 3px; }
.info-icon { color: #999; font-size: 14px; cursor: help; }
.cat-tip { max-width: 420px; line-height: 1.8; }

.pics { display: flex; flex-wrap: wrap; gap: 10px; padding: 4px; margin: -4px; border: 1px dashed transparent; border-radius: 6px; transition: border-color 0.2s, background 0.2s; }
.pics.dragging { border-color: var(--uem-red); background: var(--uem-red-light); }
.pic, .pic-add { width: 96px; height: 96px; border-radius: 4px; }
.pic { position: relative; overflow: hidden; border: 1px solid var(--uem-border); }
.pic .el-image { width: 100%; height: 100%; display: block; }
.pic-del {
  position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.5); color: #fff; font-size: 12px; cursor: pointer;
}
.pic-del:hover { background: var(--uem-red); }
.pic-add {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  border: 1px dashed #d0d3d9; background: #fafafa; color: #888; font-size: 12px; line-height: 1; cursor: pointer;
}
.pic-add .el-icon { font-size: 22px; }
.pic-add:hover { border-color: var(--uem-red); color: var(--uem-red); }
.pic-tip { width: 100%; color: #999; font-size: 12px; line-height: 1.6; margin-top: 6px; }
.submit { width: 100px; }

.similar-tip { margin-bottom: 12px; }
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.score { color: var(--uem-red); font-weight: 600; }
</style>

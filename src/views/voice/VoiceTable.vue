<!-- 用户声音明细列表：全部声音（含管理工具栏）/ 各产品声音 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" :collapsed-count="2" :default-expanded="false" @search="search" @reset="reset" />
    <div class="uem-card">
      <div v-if="manage" class="uem-toolbar">
        <el-button type="primary" @click="importVisible = true">批量导入</el-button>
        <el-button @click="exportCsv('用户声音导入模板', templateCols, [])">下载模板</el-button>
        <el-button @click="openCreate">新增</el-button>
        <el-button @click="batchDelete">批量删除</el-button>
        <el-button @click="exportCsv('智能模型训练数据', modelCols, filtered)">模型数据下载</el-button>
        <el-button @click="importVisible = true">模型数据导入</el-button>
        <span class="gap" />
        <el-button @click="exportCsv('用户声音', exportCols, filtered)">批量导出</el-button>
        <el-button type="primary" :loading="analyzing" @click="runModel">智能模型</el-button>
      </div>
      <el-table :data="rows" @selection-change="(v) => (selected = v)">
        <el-table-column v-if="manage" type="selection" width="44" />
        <el-table-column type="index" label="序号" width="60" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="time" label="提出时间" width="175" />
        <el-table-column v-if="manage" prop="source" label="声音来源" width="110" />
        <el-table-column prop="column" label="功能栏目" width="130" />
        <el-table-column v-if="!manage" prop="source" label="声音来源" width="110" />
        <el-table-column v-if="!fixedProduct" prop="product" label="所属产品" width="140" />
        <el-table-column prop="desc" label="声音描述" min-width="280" show-overflow-tooltip />
        <el-table-column label="情绪" width="90">
          <template #default="{ row }"><span :class="emoClass(row.emotion)">{{ row.emotion }}</span></template>
        </el-table-column>
        <el-table-column prop="dim" label="ETS维度" width="100" />
        <el-table-column v-if="manage" label="操作" width="70">
          <template #default="{ row }"><el-button link type="primary" @click="remove([row])">删除</el-button></template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, sizes, prev, pager, next, jumper" :total="filtered.length" />
    </div>

    <el-dialog v-model="importVisible" title="导入数据" width="480px">
      <el-upload drag action="#" :auto-upload="false" accept=".xls,.xlsx,.csv">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div>将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="importVisible = false; ElMessage.success('演示环境：导入任务已提交')">导入</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createVisible" title="新增用户声音" width="560px">
      <el-form ref="formRef" :model="draft" :rules="rules" label-width="90px">
        <el-form-item label="所属产品" prop="product">
          <el-select v-model="draft.product" style="width: 100%" @change="draft.column = ''"><el-option v-for="p in voiceProducts" :key="p.id" :label="p.name" :value="p.name" /></el-select>
        </el-form-item>
        <el-form-item label="功能栏目" prop="column">
          <el-select v-model="draft.column" allow-create filterable style="width: 100%"><el-option v-for="c in columnsOf(draft.product)" :key="c" :label="c" :value="c" /></el-select>
        </el-form-item>
        <el-form-item label="声音来源" prop="source">
          <el-select v-model="draft.source" style="width: 100%"><el-option v-for="s in voiceSources" :key="s" :label="s" :value="s" /></el-select>
        </el-form-item>
        <el-form-item label="声音描述" prop="desc"><el-input v-model="draft.desc" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { voices, voiceProducts, voiceSources, etsDims, emotions } from '@/mock/voice'
import { classifyVoice } from './classifyVoice'

const props = defineProps({ fixedProduct: String, manage: Boolean })
const columnsOf = (name) => voiceProducts.find((p) => p.name === name)?.columns || []
const allColumns = [...new Set(voiceProducts.flatMap((p) => p.columns))]

const fields = computed(() => [
  ...(props.fixedProduct ? [] : [{ prop: 'product', label: '所属产品', type: 'select', options: voiceProducts.map((p) => p.name), placeholder: '12月3日前所涉及的产品名称末端均加（原）' }]),
  { prop: 'column', label: '功能栏目', type: 'select', options: props.fixedProduct ? columnsOf(props.fixedProduct) : allColumns, placeholder: '请选择功能栏目' },
  { prop: 'keyword', label: '关键字' },
  { prop: 'source', label: '声音来源', type: 'select', options: voiceSources },
  { prop: 'emotion', label: '情绪指数', type: 'select', options: emotions },
  { prop: 'dim', label: 'ETS维度', type: 'select', options: etsDims },
  { prop: 'time', label: '提出时间', type: 'daterange' }
])
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => voices,
  { product: '', column: '', keyword: '', source: '', emotion: '', dim: '', time: [] },
  (v, q) =>
    (!props.fixedProduct || v.product === props.fixedProduct) &&
    match.equals(v.product, q.product) &&
    match.equals(v.column, q.column) &&
    match.contains(v.desc, q.keyword) &&
    match.equals(v.source, q.source) &&
    match.equals(v.emotion, q.emotion) &&
    match.equals(v.dim, q.dim) &&
    match.inRange(v.time.slice(0, 10), q.time)
)
const emoClass = (e) => (e.includes('负面') ? 'neg' : e === '正面' ? 'pos' : '')

const exportCols = [
  { prop: 'time', label: '提出时间' }, { prop: 'source', label: '声音来源' }, { prop: 'column', label: '功能栏目' }, { prop: 'product', label: '所属产品' },
  { prop: 'desc', label: '声音描述' }, { prop: 'emotion', label: '情绪' }, { prop: 'dim', label: 'ETS维度' }
]
const templateCols = exportCols.slice(0, 5)
const modelCols = [{ prop: 'desc', label: '声音描述' }, { prop: 'emotion', label: '情绪标签' }, { prop: 'dim', label: '维度标签' }]

const selected = ref([])
async function remove(list) {
  await ElMessageBox.confirm(`确认删除选中的 ${list.length} 条声音？`, '提示', { type: 'warning' })
  const ids = new Set(list.map((x) => x.id))
  for (let i = voices.length - 1; i >= 0; i--) if (ids.has(voices[i].id)) voices.splice(i, 1)
  ElMessage.success('删除成功')
}
const batchDelete = () => (selected.value.length ? remove(selected.value) : ElMessage.warning('请先勾选需要删除的声音'))

// 智能模型：对勾选（或当前页）声音重新做情绪与维度识别（演示用关键词规则模拟）
const analyzing = ref(false)
async function runModel() {
  const list = selected.value.length ? selected.value : rows.value
  analyzing.value = true
  await new Promise((r) => setTimeout(r, 800))
  list.forEach((v) => Object.assign(v, classifyVoice(v.desc)))
  analyzing.value = false
  ElMessage.success(`智能模型已完成 ${list.length} 条声音的情绪与维度识别`)
}

const importVisible = ref(false)
const createVisible = ref(false)
const formRef = ref()
const draft = reactive({})
const rules = {
  product: [{ required: true, message: '请选择所属产品' }],
  column: [{ required: true, message: '请选择功能栏目' }],
  source: [{ required: true, message: '请选择声音来源' }],
  desc: [{ required: true, message: '请输入声音描述' }]
}
function openCreate() {
  Object.assign(draft, { product: props.fixedProduct || '', column: '', source: 'app用户反馈', desc: '' })
  createVisible.value = true
}
async function submitCreate() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  voices.unshift({
    ...draft,
    ...classifyVoice(draft.desc),
    id: `V${Date.now()}`,
    time: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
    valid: true
  })
  createVisible.value = false
  ElMessage.success('新增成功，已自动识别情绪与维度')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.gap { flex: 1; }
.neg { color: var(--uem-red); }
.pos { color: #3c9a5f; }
</style>

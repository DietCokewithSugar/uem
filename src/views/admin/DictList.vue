<!-- 后台管理 · 字典维护 #/genDictList：维护各页面下拉框、单选项的取值，暂停后不再出现在已接入的页面选项中 -->
<template>
  <div>
    <div class="uem-card filter">
      <span>字典类型</span>
      <el-select v-model="form.type" clearable filterable placeholder="请选择" style="width: 260px">
        <el-option v-for="t in dictTypes" :key="t.type" :label="t.label" :value="t.type" />
      </el-select>
      <span class="label">关键词</span>
      <el-input v-model="form.kw" clearable placeholder="字典描述 / 字典编码 / 字典值 / 字典默认值 / 备注" style="width: 380px" @keyup.enter="search" />
      <span class="gap" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
      <el-table :data="rows">
        <el-table-column type="index" label="序列" width="56" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="type" label="字典类型" min-width="150" show-overflow-tooltip />
        <el-table-column prop="desc" label="字典描述" min-width="90" show-overflow-tooltip />
        <el-table-column prop="code" label="字典编码" min-width="84" show-overflow-tooltip />
        <el-table-column prop="value" label="字典值" min-width="140" show-overflow-tooltip />
        <el-table-column prop="defaultValue" label="字典默认值" min-width="140" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="90" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column label="状态" width="60">
          <template #default="{ row }"><span :class="row.status === '开启' ? 'on' : 'off'">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="104">
          <template #default="{ row }">
            <template v-if="row.status === '开启'">
              <el-button link type="primary" @click="toggle(row)">暂停</el-button>
              <el-button link type="primary" @click="open(row)">修改</el-button>
            </template>
            <el-button v-else link type="primary" @click="toggle(row)">启动</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>

    <el-dialog v-model="dialog" :title="editing ? '修改字典' : '新增字典'" width="560px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="100px">
        <el-form-item label="字典类型" prop="type">
          <el-select v-model="d.type" filterable allow-create default-first-option placeholder="选择已有类型，或输入新类型编码" style="width: 100%" @change="onTypeChange">
            <el-option v-for="t in dictTypes" :key="t.type" :label="t.label" :value="t.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典描述" prop="desc"><el-input v-model="d.desc" maxlength="50" placeholder="字典类型的中文名称，如 性别" /></el-form-item>
        <el-form-item label="字典编码" prop="code"><el-input v-model="d.code" maxlength="32" placeholder="同一字典类型下唯一" /></el-form-item>
        <el-form-item label="字典值" prop="value"><el-input v-model="d.value" maxlength="100" placeholder="页面选项中展示的内容" /></el-form-item>
        <el-form-item label="字典默认值"><el-input v-model="d.defaultValue" maxlength="100" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="d.remark" maxlength="100" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="d.sort" :min="0" :max="9999" :precision="0" :step="1" step-strictly /><span class="hint">数值越小越靠前</span></el-form-item>
        <el-form-item v-if="!editing" label="状态">
          <el-radio-group v-model="d.status">
            <el-radio value="开启">开启</el-radio>
            <el-radio value="关闭">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useTableQuery } from '@/components/useTableQuery'
import { dicts, dictTypes, newDict } from '@/mock/dicts'

const kwMatch = (v, kw) => String(v ?? '').toLowerCase().includes(kw)
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => dicts,
  { type: '', kw: '' },
  (x, q) => {
    const kw = q.kw.trim().toLowerCase()
    return (!q.type || x.type === q.type) && (!kw || [x.desc, x.code, x.value, x.defaultValue, x.remark].some((v) => kwMatch(v, kw)))
  }
)

function toggle(row) {
  const start = row.status === '关闭'
  row.status = start ? '开启' : '关闭'
  ElMessage.success(start ? '已启动，该字典值恢复在相关页面的选项中展示' : '已暂停，该字典值不再出现在相关页面的选项中')
}

// ===== 新增 / 修改 =====
const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const nextSort = (type) => {
  const sorts = dicts.filter((x) => x.type === type).map((x) => x.sort)
  return sorts.length ? Math.max(...sorts) + 1 : 1
}
// 选择已有类型时带出字典描述；新增时排序默认排在该类型最后；已填的编码、字典值按新类型重新校验唯一性
let prefilled = ''
function onTypeChange(type) {
  const t = dictTypes.value.find((x) => x.type === type)
  if (t) d.desc = prefilled = t.desc
  else if (d.desc === prefilled) d.desc = prefilled = ''
  if (!editing.value) d.sort = nextSort(type)
  nextTick(() => {
    if (t) formRef.value?.clearValidate('desc')
    const keys = ['code', 'value'].filter((k) => String(d[k] ?? '').trim())
    if (keys.length) formRef.value?.validateField(keys).catch(() => {})
  })
}
// 同一字典类型下重复（修改时排除自身）
const dup = (key, v) => dicts.some((x) => x !== editing.value && x.type === String(d.type ?? '').trim() && x[key] === v)
const check = (fn, trigger = 'blur') => ({ validator: (_, v, cb) => { const e = fn(String(v ?? '').trim()); e ? cb(new Error(e)) : cb() }, trigger })
const req = (message, trigger = 'blur') => ({ required: true, whitespace: true, message, trigger })
const rules = {
  type: [req('请选择或输入字典类型', 'change'), check((v) => (/^[A-Z][A-Z0-9_]*$/.test(v) ? '' : '字典类型应以大写字母开头，仅含大写字母、数字和下划线'), 'change')],
  desc: [req('请输入字典描述')],
  code: [req('请输入字典编码'), check((v) => (dup('code', v) ? '该字典类型下已存在此字典编码' : ''))],
  value: [req('请输入字典值'), check((v) => (dup('value', v) ? '该字典类型下已存在此字典值' : ''))]
}
function open(row) {
  editing.value = row || null
  prefilled = row?.desc || ''
  Object.assign(d, { type: '', desc: '', code: '', value: '', defaultValue: '', remark: '', sort: 1, status: '开启' }, row ? { ...row } : {})
  dialog.value = true
  setTimeout(() => formRef.value?.clearValidate())
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const t = (v) => String(v ?? '').trim()
  const data = { type: t(d.type), desc: t(d.desc), code: t(d.code), value: t(d.value), defaultValue: t(d.defaultValue), remark: t(d.remark), sort: d.sort ?? 0 }
  if (editing.value) Object.assign(editing.value, data)
  else {
    dicts.unshift(newDict({ ...data, status: d.status }))
    page.value = 1
  }
  dialog.value = false
  ElMessage.success(editing.value ? '修改成功' : '新增成功')
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .label { margin-left: 20px; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.on { color: #3c9a5f; }
.off { color: #999; }
.hint { margin-left: 12px; font-size: 12px; color: #999; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

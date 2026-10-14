<!-- 后台管理 · 接口权限 #/interfaceList：按「请求URI + 请求方法」配置后端接口的允许用户、禁止用户和权限（角色）；暂停后该规则不参与访问校验 -->
<template>
  <div>
    <div class="uem-card filter">
      <span>请求URI</span>
      <el-input v-model="form.uri" clearable placeholder="请输入请求URI" style="width: 260px" @keyup.enter="search" />
      <span class="label">接口描述</span>
      <el-input v-model="form.desc" clearable placeholder="请输入接口描述" style="width: 200px" @keyup.enter="search" />
      <span class="label">请求方法</span>
      <el-select v-model="form.method" clearable placeholder="请选择" style="width: 140px">
        <el-option v-for="m in apiMethods" :key="m" :label="m" :value="m" />
      </el-select>
      <span class="gap" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
      <el-table :data="rows" class="apis">
        <el-table-column prop="uri" label="请求URI" min-width="200" />
        <el-table-column prop="desc" label="接口描述" min-width="120" />
        <el-table-column prop="method" label="请求方法" width="90" />
        <el-table-column v-for="c in userCols" :key="c.prop" :label="c.label" min-width="150">
          <template #default="{ row }">
            <el-tooltip v-if="row[c.prop].length" placement="top" :show-after="200">
              <template #content><div v-for="id in row[c.prop]" :key="id">{{ personLabel(id) }}</div></template>
              <span class="ids"><template v-for="(id, k) in row[c.prop]" :key="id">{{ id }}{{ k < row[c.prop].length - 1 ? ',' : '' }}<wbr /></template></span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="权限" min-width="150">
          <template #default="{ row }">{{ row.roles.join('、') }}</template>
        </el-table-column>
        <el-table-column label="状态" width="70">
          <template #default="{ row }"><span :class="row.status === '开启' ? 'on' : 'off'">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="110">
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

    <el-dialog v-model="dialog" :title="editing ? '修改接口权限' : '新增接口权限'" width="640px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="100px">
        <el-form-item label="请求URI" prop="uri"><el-input v-model="d.uri" maxlength="200" placeholder="以 / 开头，如 /icbc/uem-server/log" @blur="recheckDup" /></el-form-item>
        <el-form-item label="接口描述" prop="desc"><el-input v-model="d.desc" maxlength="50" /></el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="d.method" placeholder="请选择" style="width: 100%" @change="recheckDup">
            <el-option v-for="m in apiMethods" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item v-for="c in userCols" :key="c.prop" :label="c.label" :prop="c.prop">
          <el-select
            v-model="d[c.prop]"
            multiple
            filterable
            default-first-option
            :reserve-keyword="false"
            :filter-method="(v) => (query[c.prop] = v)"
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="4"
            placeholder="选择人员，或输入 9 位统一认证号后回车"
            style="width: 100%"
            @change="onUsers(c.prop)"
            @visible-change="(v) => v || (query[c.prop] = '')"
          >
            <template #label="{ value }">{{ personLabel(value, false) }}</template>
            <el-option v-for="o in userOptions(c.prop)" :key="o.value" :label="o.label" :value="o.value">
              <template v-if="o.typed">{{ o.value }}<span class="muted">（{{ isStaffId(o.value) ? '未在人员列表中' : '不是 9 位统一认证号' }}）</span></template>
              <template v-else>{{ o.label }}</template>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-select v-model="d.roles" multiple filterable collapse-tags collapse-tags-tooltip :max-collapse-tags="4" placeholder="拥有任一所选角色的用户可访问" style="width: 100%">
            <el-option-group v-for="m in roleCatalog" :key="m.module" :label="m.module">
              <el-option v-for="r in m.roles" :key="r.name" :label="r.name" :value="r.name" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editing" label="状态">
          <el-radio-group v-model="d.status">
            <el-radio value="开启">开启</el-radio>
            <el-radio value="关闭">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="rule-tip">同一请求URI和方法存在开启的规则时：禁止用户一律拒绝；其余用户须在允许用户中，或拥有所列权限之一，方可访问。</div>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTableQuery, match } from '@/components/useTableQuery'
import { apiPermissions, apiMethods, newApiPermission } from '@/mock/apiPermissions'
import { persons, roleCatalog } from '@/mock/system'
import { isStaffId } from '@/config/validators'

const userCols = [
  { prop: 'allowUsers', label: '允许用户' },
  { prop: 'denyUsers', label: '禁止用户' }
]
const personLabel = (id, mark = true) => {
  const p = persons.find((x) => x.id === id)
  return p ? `${p.name}（${id}）` : mark ? `${id}（未在人员列表中）` : id
}
const lower = (v) => String(v ?? '').trim().toLowerCase()
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => apiPermissions,
  { uri: '', desc: '', method: '' },
  (x, q) => lower(x.uri).includes(lower(q.uri)) && match.contains(x.desc, q.desc.trim()) && match.equals(x.method, q.method)
)

function toggle(row) {
  const start = row.status === '关闭'
  row.status = start ? '开启' : '关闭'
  ElMessage.success(start ? `已启动，${row.method} ${row.uri} 按该规则校验访问` : `已暂停，该规则不再参与 ${row.method} ${row.uri} 的访问校验`)
}

// ===== 新增 / 修改 =====
const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const t = (v) => String(v ?? '').trim()

// 人员下拉：按姓名或统一认证号过滤；输入的内容不在人员列表中时作为候选项，选中后按 9 位统一认证号校验
const query = reactive({ allowUsers: '', denyUsers: '' })
function userOptions(key) {
  const q = t(query[key])
  const list = persons.filter((p) => !q || p.name.includes(q) || p.id.includes(q)).map((p) => ({ value: p.id, label: `${p.name}（${p.id}）` }))
  if (q && !persons.some((p) => p.id === q) && (isStaffId(q) || !list.length)) list.unshift({ value: q, label: q, typed: true })
  return list
}
function onUsers(key) {
  query[key] = ''
  const bad = d[key].filter((v) => !isStaffId(v))
  if (bad.length) {
    d[key] = d[key].filter((v) => isStaffId(v))
    ElMessage.warning(`「${bad.join('、')}」不是有效的统一认证号，请输入 9 位数字或从列表中选择人员`)
  }
  if (key === 'allowUsers' && d.denyUsers.length) nextTick(() => formRef.value?.validateField('denyUsers').catch(() => {}))
}
// 修改 URI 或方法后，重新校验是否与已有规则重复
function recheckDup() {
  if (t(d.desc)) nextTick(() => formRef.value?.validateField('desc').catch(() => {}))
}
const dup = () => apiPermissions.some((r) => r !== editing.value && r.uri === t(d.uri) && r.method === d.method && r.desc === t(d.desc))
const check = (fn, trigger = 'blur') => ({ validator: (_, v, cb) => { const e = fn(v); e ? cb(new Error(e)) : cb() }, trigger })
const req = (message, trigger = 'blur') => ({ required: true, whitespace: true, message, trigger })
const rules = {
  uri: [req('请输入请求URI'), check((v) => (/^\/\S*$/.test(t(v)) ? '' : '请求URI须以 / 开头，且不含空格'))],
  desc: [req('请输入接口描述'), check(() => (d.method && t(d.uri) && dup() ? '已存在相同请求URI、请求方法和接口描述的规则' : ''))],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  denyUsers: [
    check((v) => {
      const both = (v || []).filter((id) => d.allowUsers.includes(id))
      return both.length ? `${both.map((id) => personLabel(id)).join('、')} 不能同时为允许用户和禁止用户` : ''
    }, 'change')
  ]
}
function open(row) {
  editing.value = row || null
  Object.assign(query, { allowUsers: '', denyUsers: '' })
  Object.assign(d, { uri: '', desc: '', method: '', allowUsers: [], denyUsers: [], roles: [], status: '开启' }, row ? { uri: row.uri, desc: row.desc, method: row.method, allowUsers: [...row.allowUsers], denyUsers: [...row.denyUsers], roles: [...row.roles] } : {})
  dialog.value = true
  setTimeout(() => formRef.value?.clearValidate())
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const data = { uri: t(d.uri), desc: t(d.desc), method: d.method, allowUsers: [...d.allowUsers], denyUsers: [...d.denyUsers], roles: [...d.roles] }
  // 开启的规则既无允许用户又无权限时，该接口将拒绝所有用户
  const on = editing.value ? editing.value.status === '开启' : d.status === '开启'
  if (on && !data.allowUsers.length && !data.roles.length) {
    const ok = await ElMessageBox.confirm(`该规则未配置允许用户和权限，保存后所有用户都将无法访问 ${data.method} ${data.uri}，是否继续？`, '提示', { type: 'warning' }).catch(() => false)
    if (!ok) return
  }
  if (editing.value) Object.assign(editing.value, data)
  else {
    apiPermissions.unshift(newApiPermission({ ...data, status: d.status }))
    page.value = 1
  }
  dialog.value = false
  ElMessage.success(editing.value ? '修改成功，规则已生效' : d.status === '开启' ? '新增成功，规则已生效' : '新增成功，规则处于关闭状态，启动后生效')
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .label { margin-left: 20px; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.apis :deep(.cell) { word-break: normal; overflow-wrap: anywhere; }
.ids { cursor: default; }
.on { color: #3c9a5f; }
.off, .muted { color: #999; }
.rule-tip { margin: -4px 0 0 100px; font-size: 12px; line-height: 18px; color: #999; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

<!-- 产品维护 #/productMaintenance：全平台产品字典（归属业研部门 / 产品线 / 业务部门） -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" :collapsed-count="2" :default-expanded="false" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="open()">新增</el-button>
        <el-button @click="exportCsv('产品维护', cols, filtered)">导出</el-button>
        <el-upload :show-file-list="false" action="#" :auto-upload="false" accept=".csv,.xls,.xlsx" :on-change="() => ElMessage.success('演示环境：导入任务已提交')">
          <el-button>导入</el-button>
        </el-upload>
        <el-button @click="keyVisible = true">重保产品维护</el-button>
      </div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="60" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="产品名称" min-width="190">
          <template #default="{ row }">{{ row.name }}<el-tag v-if="keyProducts.includes(row.name)" size="small" type="danger" effect="plain" class="key">重保</el-tag></template>
        </el-table-column>
        <el-table-column prop="rdDept" label="所属业研部门" width="130" />
        <el-table-column prop="rdLine" label="所属业研产品线" width="150" />
        <el-table-column prop="bizDept" label="所属业务部门" width="140" />
        <el-table-column prop="outer" label="所属外部机构" width="120" />
        <el-table-column prop="updater" label="修改人" width="90" />
        <el-table-column prop="time" label="修改时间" width="110" />
        <el-table-column label="状态" width="70">
          <template #default="{ row }"><span :class="{ frozen: row.status === '冻结' }">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="toggleState(row)">{{ row.state === '已废弃' ? '启用' : '废弃' }}</el-button>
            <el-button link type="primary" @click="toggleStatus(row)">{{ row.status === '冻结' ? '激活' : '冻结' }}</el-button>
            <el-button link type="primary" @click="open(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>

    <el-dialog v-model="dialog" :title="editing ? '修改产品' : '新增产品'" width="560px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="120px">
        <el-form-item label="产品名称" prop="name"><el-input v-model="d.name" :disabled="!!editing" /></el-form-item>
        <el-form-item label="所属业研部门"><el-select v-model="d.rdDept" clearable style="width: 100%"><el-option v-for="o in rdDepts" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="所属业研产品线"><el-select v-model="d.rdLine" clearable style="width: 100%"><el-option v-for="o in rdLines" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="所属业务部门"><el-select v-model="d.bizDept" clearable style="width: 100%"><el-option v-for="o in headDepts" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="所属外部机构"><el-select v-model="d.outer" clearable style="width: 100%"><el-option v-for="o in outerOrgs" :key="o" :label="o" :value="o" /></el-select></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="keyVisible" title="重保产品维护" width="560px">
      <p class="hint">重保产品的优化建议在处理时优先提醒，并在管理报表中单独统计。</p>
      <el-select v-model="keyProducts" multiple filterable style="width: 100%">
        <el-option v-for="p in productList.filter((x) => x.state !== '已废弃')" :key="p.name" :label="p.name" :value="p.name" />
      </el-select>
      <template #footer><el-button type="primary" @click="keyVisible = false; ElMessage.success('重保产品已更新')">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { productList, rdDepts, rdLines, headDepts, outerOrgs } from '@/mock/system'
import { products } from '@/mock'
import { currentUser } from '@/config/user'

const fields = [
  { prop: 'name', label: '产品名称', placeholder: '12月3日前所涉及的产品名称末端均加（原）' },
  { prop: 'rdDept', label: '所属业研部门', type: 'select', options: rdDepts },
  { prop: 'rdLine', label: '所属业研产品线', type: 'select', options: rdLines },
  { prop: 'bizDept', label: '所属业务部门', type: 'select', options: headDepts },
  { prop: 'status', label: '状态', type: 'select', options: ['激活', '冻结'] },
  { prop: 'state', label: '是否废弃', type: 'select', options: ['启用中', '已废弃'] }
]
const cols = [
  { prop: 'name', label: '产品名称' }, { prop: 'rdDept', label: '所属业研部门' }, { prop: 'rdLine', label: '所属业研产品线' }, { prop: 'bizDept', label: '所属业务部门' },
  { prop: 'outer', label: '所属外部机构' }, { prop: 'updater', label: '修改人' }, { prop: 'time', label: '修改时间' }, { prop: 'status', label: '状态' }, { prop: 'state', label: '是否废弃' }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => productList,
  { name: '', rdDept: '', rdLine: '', bizDept: '', status: '', state: '' },
  (p, q) => match.contains(p.name, q.name) && match.equals(p.rdDept, q.rdDept) && match.equals(p.rdLine, q.rdLine) && match.equals(p.bizDept, q.bizDept) && match.equals(p.status, q.status) && match.equals(p.state, q.state)
)
const keyProducts = ref(['个人手机银行基础业务', '企业网银基础业务', '个人养老金'])
const keyVisible = ref(false)
const touch = (row) => Object.assign(row, { updater: currentUser.name, time: new Date().toISOString().slice(0, 10) })

// 废弃 / 启用：废弃后产品名称末尾加「（原）」，不再出现在各模块的产品下拉中
function toggleState(row) {
  const abandon = row.state !== '已废弃'
  const old = row.name
  row.state = abandon ? '已废弃' : '启用中'
  row.name = abandon ? (old.endsWith('（原）') ? old : `${old}（原）`) : old.replace(/（原）$/, '')
  const i = products.indexOf(abandon ? old : row.name)
  if (abandon && i >= 0) products.splice(i, 1)
  if (!abandon && i < 0) products.splice(products.length - 1, 0, row.name)
  touch(row)
  ElMessage.success(abandon ? `已废弃，名称变更为「${row.name}」` : '已启用')
}
function toggleStatus(row) {
  row.status = row.status === '冻结' ? '激活' : '冻结'
  touch(row)
  ElMessage.success(`已${row.status}`)
}

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const rules = { name: [{ required: true, message: '请输入产品名称' }, { validator: (_, v, cb) => (!editing.value && productList.some((p) => p.name === v) ? cb(new Error('产品已存在')) : cb()) }] }
function open(row) {
  editing.value = row || null
  Object.assign(d, { name: '', rdDept: '', rdLine: '', bizDept: '', outer: '' }, row || {})
  dialog.value = true
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  if (editing.value) touch(Object.assign(editing.value, d))
  else {
    productList.unshift(touch({ ...d, id: d.name, status: '激活', state: '启用中' }))
    // 新产品同步到全平台产品下拉（体验问题、体验资讯等）
    if (!products.includes(d.name)) products.splice(products.length - 1, 0, d.name)
  }
  dialog.value = false
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.uem-toolbar :deep(.el-upload) { display: inline-flex; }
.key { margin-left: 6px; }
.frozen { color: #999; }
.hint { color: #888; font-size: 12px; margin: 0 0 10px; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

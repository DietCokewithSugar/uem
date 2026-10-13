<!-- 数据管理 #/experInformation：资讯发布、冻结、解冻、删除 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="openCreate">新增</el-button>
        <el-button @click="batch('冻结')">批量冻结</el-button>
        <el-button @click="batch('解冻')">批量解冻</el-button>
        <el-button @click="batch('删除')">批量删除</el-button>
        <el-button @click="exportCsv('资讯数据', columns, filtered)">批量导出</el-button>
      </div>
      <el-table :data="rows" empty-text="暂无数据" @selection-change="(v) => (selected = v)">
        <el-table-column type="selection" width="44" />
        <el-table-column type="index" label="序号" width="64" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="资讯名称" min-width="320">
          <template #default="{ row }"><span class="uem-link" @click="openEdit(row)">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column prop="type" label="资讯类型" width="110" />
        <el-table-column prop="org" label="所属机构" width="140" />
        <el-table-column prop="author" label="作者" width="110" />
        <el-table-column prop="publishTime" label="发布时间" width="120" />
        <el-table-column label="资讯状态" width="100">
          <template #default="{ row }">
            <span :class="{ frozen: row.status === '冻结' }">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="apply([row], row.status === '冻结' ? '解冻' : '冻结')">
              {{ row.status === '冻结' ? '解冻' : '冻结' }}
            </el-button>
            <el-button link type="primary" @click="confirmApply([row], '删除')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>

    <el-dialog v-model="dialog" :title="editing ? '编辑资讯' : '新增资讯'" width="640px">
      <el-form ref="formRef" :model="draft" :rules="rules" label-width="100px">
        <el-form-item label="资讯名称" prop="name"><el-input v-model="draft.name" /></el-form-item>
        <el-form-item label="资讯类型" prop="type">
          <el-radio-group v-model="draft.type">
            <el-radio v-for="t in infoTypes" :key="t" :value="t">{{ t }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="draft.type === '方法培训'" label="培训板块" prop="board">
          <el-select v-model="draft.board" style="width: 100%"><el-option v-for="b in trainingBoards" :key="b" :label="b" :value="b" /></el-select>
        </el-form-item>
        <template v-if="draft.type === '体验研究'">
          <el-form-item label="报告类型"><el-select v-model="draft.reportType" style="width: 100%"><el-option v-for="b in reportTypes" :key="b" :label="b" :value="b" /></el-select></el-form-item>
          <el-form-item label="报告量级"><el-select v-model="draft.level" style="width: 100%"><el-option v-for="b in reportLevels" :key="b" :label="b" :value="b" /></el-select></el-form-item>
          <el-form-item label="所属产品"><el-select v-model="draft.product" filterable style="width: 100%"><el-option v-for="b in products" :key="b" :label="b" :value="b" /></el-select></el-form-item>
        </template>
        <el-form-item label="所属机构" prop="org">
          <el-select v-model="draft.org" style="width: 100%"><el-option v-for="o in infoOrgs" :key="o" :label="o" :value="o" /></el-select>
        </el-form-item>
        <el-form-item label="作者"><el-input v-model="draft.author" /></el-form-item>
        <el-form-item label="形式 / 文件">
          <el-select v-model="draft.form" style="width: 48%; margin-right: 4%"><el-option v-for="o in trainingForms" :key="o" :label="o" :value="o" /></el-select>
          <el-select v-model="draft.fileType" style="width: 48%"><el-option v-for="o in fileTypes" :key="o" :label="o" :value="o" /></el-select>
        </el-form-item>
        <el-form-item label="简介"><el-input v-model="draft.intro" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="上传附件"><AttachmentUpload v-model="draft.files" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="submit">{{ editing ? '保存' : '发布' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import AttachmentUpload from '@/components/AttachmentUpload.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { infos, infoTypes, infoOrgs, trainingBoards, trainingForms, fileTypes, reportTypes, reportLevels, products } from '@/mock'

const fields = [
  { prop: 'name', label: '名称' },
  { prop: 'publishTime', label: '发布时间', type: 'daterange' },
  { prop: 'type', label: '资讯类型', type: 'select', options: infoTypes },
  { prop: 'org', label: '所属机构', type: 'select', options: infoOrgs },
  { prop: 'author', label: '作者' },
  { prop: 'status', label: '资讯状态', type: 'select', options: ['发布', '冻结'] }
]
const columns = [
  { prop: 'name', label: '资讯名称' }, { prop: 'type', label: '资讯类型' }, { prop: 'org', label: '所属机构' },
  { prop: 'author', label: '作者' }, { prop: 'publishTime', label: '发布时间' }, { prop: 'status', label: '资讯状态' }
]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => infos,
  { name: '', publishTime: [], type: '', org: '', author: '', status: '' },
  (it, q) =>
    match.contains(it.name, q.name) &&
    match.inRange(it.publishTime, q.publishTime) &&
    match.equals(it.type, q.type) &&
    match.equals(it.org, q.org) &&
    match.contains(it.author, q.author) &&
    match.equals(it.status, q.status)
)

const selected = ref([])

function apply(list, action) {
  const ids = new Set(list.map((r) => r.id))
  for (let i = infos.length - 1; i >= 0; i--) {
    if (!ids.has(infos[i].id)) continue
    if (action === '删除') infos.splice(i, 1)
    else infos[i].status = action === '冻结' ? '冻结' : '发布'
  }
  ElMessage.success(`${action}成功`)
}
async function confirmApply(list, action) {
  await ElMessageBox.confirm(`确认${action}选中的 ${list.length} 条资讯？`, '提示', { type: 'warning' })
  apply(list, action)
}
function batch(action) {
  if (!selected.value.length) return ElMessage.warning('请先勾选需要操作的资讯')
  confirmApply(selected.value, action)
}

// 新增 / 编辑
const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const draft = reactive({})
const rules = {
  name: [{ required: true, message: '请输入资讯名称' }],
  type: [{ required: true, message: '请选择资讯类型' }],
  board: [{ required: true, message: '请选择培训板块' }],
  org: [{ required: true, message: '请选择所属机构' }]
}
const blank = () => ({
  name: '', type: '方法培训', board: '', reportType: '', level: '', product: '', org: '业务研发中心',
  author: '', form: '网络', fileType: 'PDF', intro: '', files: []
})
function openCreate() {
  editing.value = null
  Object.assign(draft, blank())
  dialog.value = true
}
function openEdit(row) {
  editing.value = row
  Object.assign(draft, blank(), row, { files: (row.files || []).map((name) => ({ name })) })
  dialog.value = true
}
async function submit() {
  await formRef.value.validate()
  const data = { ...draft, files: draft.files.map((f) => f.name) }
  if (editing.value) {
    Object.assign(editing.value, data)
    ElMessage.success('保存成功')
  } else {
    infos.unshift({
      ...data,
      id: `INFO${Date.now()}`,
      publishTime: new Date().toISOString().slice(0, 10),
      status: '发布',
      views: 0,
      downloads: 0,
      cover: infos.length % 4
    })
    ElMessage.success('发布成功')
  }
  dialog.value = false
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.frozen { color: #999; }
</style>

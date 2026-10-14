<!-- 设计工作情况上传 #/experEvalDesignUpLoad -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="70" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="name" label="名称" min-width="260" />
        <el-table-column prop="product" label="所属精品产品" min-width="140" />
        <el-table-column prop="author" label="作者" min-width="200" />
        <el-table-column prop="publishTime" label="发布时间" width="110" />
        <el-table-column label="操作" width="110">
          <template #default="{ row }">
            <el-button link type="primary" @click="open(row)">修改</el-button>
            <el-button link type="primary" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next" :page-size="pageSize" :total="filtered.length" />
    </div>

    <el-dialog v-model="dialog" :title="editing ? '修改设计工作情况' : '新增设计工作情况'" width="620px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name"><el-input v-model="d.name" /></el-form-item>
        <el-form-item label="所属精品产品" prop="product">
          <el-select v-model="d.product" filterable allow-create style="width: 100%"><el-option v-for="p in products" :key="p" :label="p" :value="p" /></el-select>
        </el-form-item>
        <el-form-item label="作者" prop="author"><el-input v-model="d.author" placeholder="多人以顿号分隔" /></el-form-item>
        <el-form-item label="发布时间" prop="publishTime"><el-date-picker v-model="d.publishTime" type="month" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
        <el-form-item label="内容简介"><el-input v-model="d.intro" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="上传附件"><AttachmentUpload v-model="d.files" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import AttachmentUpload from '@/components/AttachmentUpload.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { designWorks, premiumProducts } from '@/mock/monitor'

const products = computed(() => [...new Set([...premiumProducts, ...designWorks.map((x) => x.product)])])
const fields = [
  { prop: 'name', label: '名称' },
  { prop: 'publishTime', label: '发布时间', type: 'daterange' },
  { prop: 'product', label: '所属精品产品', type: 'select', options: products.value },
  { prop: 'author', label: '作者' }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => designWorks,
  { name: '', publishTime: [], product: '', author: '' },
  (r, q) =>
    match.contains(r.name, q.name) &&
    (!q.publishTime?.length || (r.publishTime >= q.publishTime[0].slice(0, 7) && r.publishTime <= q.publishTime[1].slice(0, 7))) &&
    match.equals(r.product, q.product) &&
    match.contains(r.author, q.author)
)

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = { name: req('请输入名称'), product: req('请选择所属精品产品'), author: req('请输入作者'), publishTime: req('请选择发布时间') }
function open(row) {
  editing.value = row || null
  Object.assign(d, { name: '', product: '', author: '', publishTime: new Date().toISOString().slice(0, 7), intro: '', files: [] }, row ? { ...row, files: [...row.files] } : {})
  dialog.value = true
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  if (editing.value) Object.assign(editing.value, d)
  else designWorks.unshift({ ...d, id: Date.now() })
  dialog.value = false
  ElMessage.success('保存成功')
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', { type: 'warning' })
  designWorks.splice(designWorks.indexOf(row), 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

<!-- 体验度量图片 #/productMeasureImg：按度量产品页签管理页面截图 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="bar">
        <el-button type="primary" @click="open()">新增</el-button>
        <el-tabs v-model="product" class="tabs" @tab-change="page = 1">
          <el-tab-pane v-for="p in measureProducts" :key="p" :label="p" :name="p" />
        </el-tabs>
      </div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="70" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="product" label="所属体验度量产品" min-width="160" />
        <el-table-column prop="journey" label="旅程" min-width="140" />
        <el-table-column label="页面名称" min-width="240">
          <template #default="{ row }"><span class="uem-link" @click="preview = row">{{ row.page }}</span></template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="120" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="open(row)">修改</el-button>
            <el-button link type="primary" @click="remove(row)">删除</el-button>
            <el-button link type="primary" @click="reuse(row)">复用</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="pageSize" :total="filtered.length" />
    </div>

    <el-dialog :model-value="!!preview" :title="preview ? `${preview.journey} · ${preview.page}` : ''" width="520px" @close="preview = null">
      <div v-if="preview" class="shots">
        <div v-for="(p, i) in preview.page.split(';')" :key="i" class="shot">
          <div class="shot-img"><ScreenThumb :material="preview.src ? { src: preview.src } : { kind: preview.kind }" /></div>
          <span>{{ p }}</span>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="dialog" :title="editing ? '修改度量图片' : '新增度量图片'" width="560px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="120px">
        <el-form-item label="所属度量产品" prop="product">
          <el-select v-model="d.product" style="width: 100%"><el-option v-for="p in measureProducts" :key="p" :label="p" :value="p" /></el-select>
        </el-form-item>
        <el-form-item label="旅程" prop="journey"><el-input v-model="d.journey" /></el-form-item>
        <el-form-item label="页面名称" prop="page"><el-input v-model="d.page" placeholder="多个页面以英文分号 ; 分隔" /></el-form-item>
        <el-form-item label="发布时间" prop="publishTime"><el-date-picker v-model="d.publishTime" type="month" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
        <el-form-item label="页面截图">
          <el-upload list-type="picture-card" action="#" :auto-upload="false" accept="image/*" :limit="1" :on-change="onImg"><el-icon><Plus /></el-icon></el-upload>
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import ScreenThumb from '@/components/ScreenThumb.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { measureImages, measureProducts, measureFunctions } from '@/mock/monitor'

const product = ref(measureProducts[0])
const publishMonths = computed(() => [...new Set(measureImages.map((x) => x.publishTime))].sort().reverse())
const fields = [
  { prop: 'page', label: '页面名称' },
  { prop: 'publishTime', label: '发布时间', type: 'select', options: publishMonths.value },
  { prop: 'journey', label: '所属功能', type: 'select', options: measureFunctions }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => measureImages.filter((x) => x.product === product.value),
  { page: '', publishTime: '', journey: '' },
  (r, q) => match.contains(r.page, q.page) && match.equals(r.publishTime, q.publishTime) && match.equals(r.journey, q.journey)
)
const preview = ref(null)

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = { product: req('请选择度量产品'), journey: req('请输入旅程'), page: req('请输入页面名称'), publishTime: req('请选择发布时间') }
function open(row) {
  editing.value = row || null
  Object.assign(d, { product: product.value, journey: '', page: '', publishTime: new Date().toISOString().slice(0, 7), src: '', kind: 'mobile-green' }, row || {})
  dialog.value = true
}
function onImg(file) {
  const r = new FileReader()
  r.onload = () => (d.src = r.result)
  r.readAsDataURL(file.raw)
}
async function save() {
  await formRef.value.validate()
  if (editing.value) Object.assign(editing.value, d)
  else measureImages.unshift({ ...d, id: `img${Date.now()}` })
  product.value = d.product
  dialog.value = false
  ElMessage.success('保存成功')
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除「${row.page}」？`, '提示', { type: 'warning' })
  measureImages.splice(measureImages.indexOf(row), 1)
  ElMessage.success('删除成功')
}
// 复用：以当前记录为模板，生成本月的新记录
function reuse(row) {
  editing.value = null
  Object.assign(d, { ...row, publishTime: new Date().toISOString().slice(0, 7) })
  dialog.value = true
}
</script>

<style scoped>
.bar { display: flex; align-items: center; gap: 24px; }
.tabs { flex: 1; }
.tabs :deep(.el-tabs__header) { margin: 0; }
.pager { margin-top: 16px; justify-content: flex-end; }
.shots { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.shot { width: 200px; text-align: center; font-size: 12px; color: #666; }
.shot-img { height: 120px; border: 1px solid #eee; margin-bottom: 4px; }
</style>

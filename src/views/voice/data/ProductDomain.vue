<!-- 产品领域管理 #/productField：产品领域与覆盖产品功能，供「产品分类」模型使用 -->
<template>
  <div>
    <div class="uem-card filter">
      <span>产品领域</span>
      <el-select v-model="q" clearable placeholder="请选择产品领域" style="width: 360px"><el-option v-for="d in productDomains" :key="d.id" :label="d.name" :value="d.name" /></el-select>
      <span class="gap" />
      <el-button type="primary" @click="applied = q">查询</el-button>
      <el-button @click="q = applied = ''">重置</el-button>
    </div>
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
      <el-table :data="rows">
        <el-table-column prop="name" label="产品领域" width="160" />
        <el-table-column label="覆盖产品功能" min-width="600">
          <template #default="{ row }"><div class="products">{{ row.products.join(',') }}</div></template>
        </el-table-column>
        <el-table-column label="操作" width="110">
          <template #default="{ row }">
            <el-button link type="primary" @click="open(row)">修改</el-button>
            <el-button link type="primary" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pager" layout="total, prev, pager, next" :total="rows.length" />
    </div>

    <el-dialog v-model="dialog" :title="editing ? '修改产品领域' : '新增产品领域'" width="680px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="110px">
        <el-form-item label="产品领域" prop="name"><el-input v-model="d.name" /></el-form-item>
        <el-form-item label="覆盖产品功能" prop="products">
          <el-select v-model="d.products" multiple filterable allow-create collapse-tags :max-collapse-tags="8" style="width: 100%">
            <el-option v-for="p in allProducts" :key="p" :label="p" :value="p" />
          </el-select>
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
import { productDomains } from '@/mock/voiceTools'

const q = ref('')
const applied = ref('')
const rows = computed(() => productDomains.filter((d) => !applied.value || d.name === applied.value))
const allProducts = computed(() => [...new Set(productDomains.flatMap((d) => d.products))])

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({ name: '', products: [] })
const rules = { name: [{ required: true, message: '请输入产品领域' }], products: [{ type: 'array', required: true, min: 1, message: '请选择覆盖产品功能', trigger: 'change' }] }
function open(row) {
  editing.value = row || null
  Object.assign(d, { name: row?.name || '', products: row ? [...row.products] : [] })
  dialog.value = true
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  if (editing.value) Object.assign(editing.value, { name: d.name, products: [...d.products] })
  else productDomains.push({ id: Date.now(), name: d.name, products: [...d.products] })
  dialog.value = false
  ElMessage.success('保存成功')
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除产品领域「${row.name}」？`, '提示', { type: 'warning' })
  productDomains.splice(productDomains.indexOf(row), 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.products { font-size: 12px; color: #555; line-height: 1.7; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

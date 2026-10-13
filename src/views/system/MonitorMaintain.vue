<!-- 体验监测维护 #/experEvaluationMaintenance：重点渠道 / 精品产品（标题页签切换），变更同步至「评价数据上传」 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="open()">新增</el-button>
        <span class="hint">*新增{{ label }}之后，请刷新页面更新菜单</span>
      </div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="70" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="name" :label="`${label}名称`" min-width="200" />
        <el-table-column label="对应产品" min-width="200"><template #default="{ row }">{{ row.product || '-' }}</template></el-table-column>
        <el-table-column label="首页排位统计" width="130"><template #default="{ row }">{{ row.homeRank ? '是' : '否' }}</template></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><span :class="{ frozen: row.status === '冻结' }">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="toggle(row)">{{ row.status === '冻结' ? '激活' : '冻结' }}</el-button>
            <el-button link type="primary" @click="open(row)">修改</el-button>
            <el-button v-if="filtered.indexOf(row) > 0" link type="primary" @click="move(row, -1)">上移</el-button>
            <el-button v-if="filtered.indexOf(row) < filtered.length - 1" link type="primary" @click="move(row, 1)">下移</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="pageSize" :total="filtered.length" />
    </div>

    <el-dialog v-model="dialog" :title="`${editing ? '修改' : '新增'}${label}`" width="560px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="120px">
        <el-form-item :label="`${label}名称`" prop="name"><el-input v-model.trim="d.name" maxlength="30" /></el-form-item>
        <el-form-item label="对应产品">
          <el-select v-model="d.product" filterable clearable placeholder="请选择对应产品" style="width: 100%">
            <el-option v-for="p in productOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="首页排位统计"><el-switch v-model="d.homeRank" inline-prompt active-text="是" inactive-text="否" /></el-form-item>
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
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { products } from '@/mock'
import { maintTabs, monitorItems, sortedItems, addItem, updateItem, toggleItem, swapItems } from '@/mock/monitorMaint'

// 切换页签会改变 fullPath，页面随之重建，因此只需读取一次
const route = useRoute()
const tab = route.query.tab === 'product' ? 'product' : 'channel'
const label = maintTabs[tab].label

const fields = computed(() => [
  { prop: 'name', label: `${label}名称`, type: 'select', options: sortedItems(tab).map((i) => i.name) },
  { prop: 'product', label: '对应产品名称', type: 'select', options: [...new Set(sortedItems(tab).map((i) => i.product).filter(Boolean))] }
])
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => sortedItems(tab),
  { name: '', product: '' },
  (r, q) => match.equals(r.name, q.name) && match.equals(r.product, q.product)
)

async function toggle(row) {
  if (row.status !== '冻结') {
    const ok = await ElMessageBox.confirm(`冻结后「评价数据上传」将不再展示「${row.name}」，确认冻结？`, '提示', { type: 'warning' }).catch(() => false)
    if (!ok) return
  }
  toggleItem(tab, row)
  ElMessage.success(`已${row.status}`)
}
// 与当前列表中的相邻行交换顺序
function move(row, step) {
  const list = filtered.value
  swapItems(tab, row, list[list.indexOf(row) + step])
  ElMessage.success(step < 0 ? '上移成功' : '下移成功')
}

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const productOptions = computed(() => [...new Set([...products, d.product].filter(Boolean))])
const rules = {
  name: [
    { required: true, message: `请输入${label}名称`, trigger: 'blur' },
    { validator: (_, v, cb) => (monitorItems[tab].some((i) => i.name === v && i !== editing.value) ? cb(new Error(`${label}已存在`)) : cb()), trigger: 'blur' }
  ]
}
function open(row) {
  editing.value = row || null
  Object.assign(d, { name: '', product: '', homeRank: false }, row ? { name: row.name, product: row.product, homeRank: row.homeRank } : {})
  dialog.value = true
  formRef.value?.clearValidate()
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const data = { name: d.name, product: d.product || '', homeRank: d.homeRank }
  if (editing.value) updateItem(tab, editing.value, data)
  else addItem(tab, data)
  dialog.value = false
  ElMessage.success(editing.value ? '修改成功' : `新增成功，已同步至「评价数据上传」`)
}
</script>

<style scoped>
.uem-toolbar { align-items: center; }
.hint { color: var(--uem-red); font-size: 12px; margin-left: 4px; }
.frozen { color: #999; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

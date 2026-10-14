<!-- 后台管理 · 节假日 #/holidayList：非工作日清单（周六、周日及法定节假日，已扣除调休上班日），按放假日期倒序 -->
<template>
  <div>
    <div class="uem-card filter">
      <span>日期</span>
      <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" placeholder="请选择时间" style="width: 420px" />
      <span class="gap" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open">新增</el-button></div>
      <el-table :data="rows" :empty-text="applied ? `${applied} 不在节假日列表中` : '暂无数据'" :row-class-name="({ row }) => (row.date === fresh ? 'fresh' : '')">
        <el-table-column prop="type" label="假期类型" />
        <el-table-column prop="date" label="放假日期" />
        <el-table-column label="操作">
          <template #default="{ row }"><el-button link type="primary" @click="remove(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="PAGE_SIZE" :total="filtered.length" />
    </div>

    <el-dialog v-model="dialog" title="新增节假日" width="480px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="90px">
        <el-form-item label="放假日期" prop="date">
          <div class="date-row">
            <el-date-picker v-model="d.date" type="date" value-format="YYYY-MM-DD" placeholder="请选择时间" style="width: 100%" @change="onDate" />
            <span class="week">{{ d.date ? weekNameOf(d.date) : '' }}</span>
          </div>
        </el-form-item>
        <el-form-item label="假期类型" prop="type">
          <div class="date-row">
            <el-select v-model="d.type" placeholder="请选择" style="width: 100%">
              <el-option v-for="t in holidayTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <span class="week" />
          </div>
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
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { holidays, holidayTypes, weekNameOf, isHoliday, addHoliday, removeHoliday } from '@/mock/holidays'

const PAGE_SIZE = 10
const date = ref('')
const applied = ref('')
const page = ref(1)
const filtered = computed(() => (applied.value ? holidays.filter((h) => h.date === applied.value) : holidays))
const rows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const search = () => {
  applied.value = date.value || ''
  page.value = 1
}
const reset = () => {
  date.value = ''
  search()
}
// 删除末页最后一条后回到上一页
watch(() => filtered.value.length, (n) => (page.value = Math.min(page.value, Math.max(1, Math.ceil(n / PAGE_SIZE)))))

async function remove(row) {
  const ok = await ElMessageBox.confirm(`确定删除 ${row.date}（${row.type}）吗？删除后该日按工作日处理。`, '提示', { type: 'warning' }).catch(() => false)
  if (!ok) return
  removeHoliday(row.date)
  ElMessage.success('删除成功')
}

// ===== 新增 =====
const WEEKEND = ['星期六', '星期日']
const dialog = ref(false)
const formRef = ref()
const d = reactive({ date: '', type: '' })
const rules = {
  date: [
    { required: true, message: '请选择放假日期', trigger: 'change' },
    { validator: (_, v, cb) => (v && isHoliday(v) ? cb(new Error('该日期已在节假日列表中')) : cb()), trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择假期类型', trigger: 'change' },
    { validator: (_, v, cb) => (d.date && WEEKEND.includes(v) && v !== weekNameOf(d.date) ? cb(new Error(`所选日期为${weekNameOf(d.date)}`)) : cb()), trigger: 'change' }
  ]
}
function open() {
  Object.assign(d, { date: '', type: '' })
  dialog.value = true
  nextTick(() => formRef.value?.clearValidate())
}
// 选中周末时自动带出星期六/星期日；改选工作日时清掉自动带出的类型
function onDate(v) {
  const w = v ? weekNameOf(v) : ''
  if (WEEKEND.includes(w) && (!d.type || WEEKEND.includes(d.type))) d.type = w
  else if (WEEKEND.includes(d.type)) d.type = ''
  nextTick(() => (d.type ? formRef.value?.validateField('type').catch(() => {}) : formRef.value?.clearValidate('type')))
}

// 新增后翻到该日期所在页并短暂高亮
const fresh = ref('')
let timer
onUnmounted(() => clearTimeout(timer))
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  addHoliday(d.date, d.type)
  if (!filtered.value.some((h) => h.date === d.date)) reset()
  page.value = Math.floor(filtered.value.findIndex((h) => h.date === d.date) / PAGE_SIZE) + 1
  fresh.value = d.date
  clearTimeout(timer)
  timer = setTimeout(() => (fresh.value = ''), 3000)
  dialog.value = false
  ElMessage.success('新增成功')
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.date-row { display: flex; align-items: center; gap: 10px; width: 100%; }
.week { flex: none; width: 42px; color: #999; font-size: 13px; }
:deep(.el-table__row.fresh > td.el-table__cell) { background: var(--uem-red-light); }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

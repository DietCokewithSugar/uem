<!-- 质检智能体角色管理 #/roleManagement -->
<template>
  <div class="uem-card">
    <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
    <el-table :data="rows">
      <el-table-column prop="id" label="编号" width="120" />
      <el-table-column prop="name" label="角色名称" min-width="200" />
      <el-table-column prop="type" label="角色类型" width="120" />
      <el-table-column prop="updateTime" label="最新修改时间" width="160" />
      <el-table-column prop="updater" label="修改人" width="140" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">修改</el-button>
          <el-button link type="primary" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="10" :total="qcRoles.length" />

    <el-dialog v-model="dialog" :title="editing ? '修改角色' : '新增角色'" width="600px">
      <el-form ref="formRef" :model="draft" :rules="rules" label-width="90px">
        <el-form-item label="角色名称" prop="name"><el-input v-model="draft.name" /></el-form-item>
        <el-form-item label="角色类型" prop="type">
          <el-radio-group v-model="draft.type"><el-radio value="专家角色">专家角色</el-radio><el-radio value="用户画像">用户画像</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="角色设定" prop="desc">
          <el-input v-model="draft.desc" type="textarea" :rows="5" placeholder="描述该角色的背景、关注点与评估视角，将作为智能体评估时的角色提示词" />
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
import { qcRoles } from '@/mock/qc'
import { currentUser } from '@/config/user'

const page = ref(1)
const rows = computed(() => qcRoles.slice((page.value - 1) * 10, page.value * 10))

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const draft = reactive({})
const rules = { name: [{ required: true, message: '请输入角色名称' }], type: [{ required: true }], desc: [{ required: true, message: '请输入角色设定' }] }

function open(row) {
  editing.value = row || null
  Object.assign(draft, row ? { name: row.name, type: row.type, desc: row.desc } : { name: '', type: '用户画像', desc: '' })
  dialog.value = true
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const meta = { updateTime: new Date().toISOString().slice(0, 10), updater: currentUser.name }
  if (editing.value) Object.assign(editing.value, draft, meta)
  else qcRoles.unshift({ ...draft, ...meta, id: Math.max(...qcRoles.map((r) => r.id)) + 1 })
  dialog.value = false
  ElMessage.success('保存成功')
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除角色「${row.name}」？`, '提示', { type: 'warning' })
  qcRoles.splice(qcRoles.indexOf(row), 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

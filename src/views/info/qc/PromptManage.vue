<!-- 质检智能体提示词管理 #/agentTips -->
<template>
  <div class="uem-card">
    <el-table :data="qcPrompts">
      <el-table-column prop="id" label="编号" width="90" />
      <el-table-column prop="name" label="提示词名称" min-width="260" />
      <el-table-column prop="updateTime" label="最新修改时间" width="160" />
      <el-table-column prop="updater" label="修改人" width="140" />
      <el-table-column prop="limit" label="字数控制" width="120" />
      <el-table-column label="操作" width="90">
        <template #default="{ row }"><el-button link type="primary" @click="open(row)">修改</el-button></template>
      </el-table-column>
    </el-table>
    <el-pagination class="pager" layout="total, prev, pager, next" :total="qcPrompts.length" />

    <el-dialog v-model="dialog" :title="`修改提示词：${editing?.name}`" width="760px">
      <el-form label-width="90px">
        <el-form-item label="字数控制"><el-input-number v-model="draft.limit" :min="500" :max="50000" :step="500" /></el-form-item>
        <el-form-item label="提示词内容">
          <el-input v-model="draft.content" type="textarea" :rows="12" :maxlength="draft.limit" show-word-limit />
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { qcPrompts } from '@/mock/qc'
import { currentUser } from '@/config/user'

const dialog = ref(false)
const editing = ref(null)
const draft = reactive({ content: '', limit: 10000 })
function open(row) {
  editing.value = row
  Object.assign(draft, { content: row.content, limit: row.limit })
  dialog.value = true
}
function save() {
  Object.assign(editing.value, draft, { updateTime: new Date().toISOString().slice(0, 10), updater: currentUser.name })
  dialog.value = false
  ElMessage.success('保存成功，新提示词将用于后续质检')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

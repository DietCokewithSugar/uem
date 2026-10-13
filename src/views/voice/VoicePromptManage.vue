<!-- 模型提示词管理 #/tipsManage：用户声音各智能模型使用的提示词 -->
<template>
  <div class="uem-card">
    <el-table :data="rows" highlight-current-row>
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="name" label="提示词名称" min-width="260" />
      <el-table-column prop="time" label="最新修改时间" width="160" />
      <el-table-column prop="updater" label="修改人" width="140" />
      <el-table-column prop="limit" label="字数控制" width="120" />
      <el-table-column label="操作" width="90">
        <template #default="{ row }"><el-button link type="primary" @click="open(row)">修改</el-button></template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="10" :total="voicePrompts.length" />

    <el-dialog v-model="dialog" title="模型提示词修改" width="820px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="130px">
        <el-form-item label="提示词名称：">{{ editing?.name }}</el-form-item>
        <el-form-item label="提示词字数控制：" prop="limit"><el-input-number v-model="d.limit" :min="500" :max="20000" :step="500" /></el-form-item>
        <el-form-item label="提示词内容：" prop="content">
          <el-input v-model="d.content" type="textarea" :rows="14" :maxlength="d.limit" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { voicePrompts } from '@/mock/voiceTools'
import { currentUser } from '@/config/user'

const page = ref(1)
const rows = computed(() => voicePrompts.slice((page.value - 1) * 10, page.value * 10))
const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({ limit: 2000, content: '' })
const rules = { limit: [{ required: true, message: '请输入字数控制' }], content: [{ required: true, message: '请输入提示词内容' }] }
function open(row) {
  editing.value = row
  Object.assign(d, { limit: row.limit, content: row.content })
  dialog.value = true
}
async function save() {
  await formRef.value.validate()
  if (d.content.length > d.limit) return ElMessage.warning('提示词内容超过字数控制')
  Object.assign(editing.value, d, { time: new Date().toISOString().slice(0, 10), updater: currentUser.name })
  dialog.value = false
  ElMessage.success('保存成功，新提示词将用于后续模型分析')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

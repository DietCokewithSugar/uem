<!-- 新增体验任务 #/taskAdd?taskListType=1|2（1 体验管理任务，2 我的体验任务） -->
<template>
  <div class="uem-card form-page">
    <el-form ref="formRef" :model="model" :rules="rules" label-width="120px" class="form">
      <el-form-item label="所属板块" prop="board">
        <el-select v-model="model.board" placeholder="请选择所属板块" style="width: 100%">
          <el-option v-for="b in taskBoards" :key="b" :label="b" :value="b" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="model.name" placeholder="请输入任务名称" maxlength="100" />
      </el-form-item>
      <el-form-item label="任务简介" prop="intro">
        <el-input v-model="model.intro" type="textarea" :rows="3" placeholder="请输入任务简介" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker v-model="model.startTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择开始时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="牵头人" prop="leader">
        <el-input v-model="model.leader" placeholder="请输入牵头人" />
      </el-form-item>
      <el-form-item label="执行人" prop="executor">
        <el-input v-model="model.executor" placeholder="请输入执行人" />
      </el-form-item>
      <el-form-item label="上传附件">
        <AttachmentUpload v-model="model.files" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="wide" @click="save">保存</el-button>
        <el-button class="wide" @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AttachmentUpload from '@/components/AttachmentUpload.vue'
import { tasks, taskBoards } from '@/mock'
import { currentUser } from '@/config/user'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const model = reactive({ board: '', name: '', intro: '', startTime: '', leader: '', executor: '', files: [] })
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = {
  board: req('请选择所属板块'),
  name: req('请输入任务名称'),
  intro: req('请输入任务简介'),
  startTime: req('请选择开始时间'),
  leader: req('请输入牵头人'),
  executor: req('请输入执行人')
}

const listPath = () => (route.query.taskListType === '1' ? '/experTaskManage' : '/myExperTask')
const back = () => router.push(listPath())

async function save() {
  await formRef.value.validate()
  tasks.unshift({
    ...model,
    files: model.files.map((f) => f.name),
    id: `TASK${Date.now()}`,
    submitTime: new Date().toISOString().slice(0, 10),
    status: '未开始',
    creator: currentUser.name,
    pendingForMe: model.executor === currentUser.name
  })
  ElMessage.success('保存成功')
  back()
}
</script>

<style scoped>
.form-page { padding: 40px 24px; }
.form { max-width: 680px; margin-left: 60px; }
.wide { width: 100px; }
</style>

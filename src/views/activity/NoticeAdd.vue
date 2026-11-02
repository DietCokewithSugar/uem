<!-- 新增体验公告 #/noticeAdd?isFh=0&routeType=0 -->
<template>
  <div class="uem-card form-page">
    <el-form ref="formRef" :model="model" :rules="rules" label-width="100px" class="form">
      <el-form-item label="公告名称" prop="name">
        <el-input v-model="model.name" placeholder="请输入公告名称" maxlength="120" />
      </el-form-item>
      <el-form-item label="时间" prop="startTime">
        <div class="time-row">
          <el-date-picker v-model="model.startTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择" />
          <span class="dash">-</span>
          <el-date-picker v-model="model.endTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择" />
        </div>
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <el-input v-model="model.content" type="textarea" :rows="5" placeholder="请输入公告内容" maxlength="2000" show-word-limit />
      </el-form-item>
      <el-form-item label="公告图">
        <div class="upload-block">
          <div class="upload-line">
            <el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".jpg,.jpeg,.png,.bmp" :on-change="onImage">
              <el-button>选择图片</el-button>
            </el-upload>
            <el-tooltip content="支持 jpg、jpeg、png、bmp，单张 5M 以下" placement="top">
              <el-icon class="hint"><InfoFilled /></el-icon>
            </el-tooltip>
            <span v-if="model.image" class="file-name">{{ model.image }}</span>
          </div>
          <p class="tip">支持jpg/jpeg/png/bmp格式图片，限制在5M以下</p>
          <el-checkbox v-model="model.pinned">置顶</el-checkbox>
        </div>
      </el-form-item>
      <el-form-item label="上传附件">
        <div class="upload-block">
          <div class="upload-line">
            <AttachmentUpload v-model="model.files" :tip="attachTip" :accept="attachAccept" />
          </div>
          <template v-if="isHead">
            <el-checkbox v-model="model.mailAudit">同步发送邮件至分行体验活动-公告审批岗</el-checkbox>
            <el-checkbox v-model="model.mailInput">同步发送邮件至分行体验活动-公告录入岗</el-checkbox>
            <el-select
              v-model="model.branches"
              multiple
              collapse-tags
              filterable
              :disabled="!model.mailAudit && !model.mailInput"
              placeholder="请选择分行: 若不选默认发送全部"
              class="branches"
            >
              <el-option v-for="b in branches" :key="b" :label="b" :value="b" />
            </el-select>
          </template>
          <el-checkbox v-else v-model="model.mailAudit">同步发送邮件至总行体验公告审批岗</el-checkbox>
        </div>
      </el-form-item>
    </el-form>
    <div class="submit-row">
      <el-button type="primary" class="publish" @click="submit">{{ editing ? '保存' : '发布' }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AttachmentUpload from '@/components/AttachmentUpload.vue'
import { notices } from '@/mock/notices'
import { branchOrgs } from '@/mock/system'
import { currentUser } from '@/config/user'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const attachTip = '支持xls/xlsx/csv/dps/doc/docx/jpg/png/jpeg/bmp/gif/svg/tiff/zip格式附件，限制在50M以下，最多9个'
const attachAccept = '.xls,.xlsx,.csv,.dps,.doc,.docx,.jpg,.jpeg,.png,.bmp,.gif,.svg,.tiff,.zip'
const isHead = computed(() => route.query.isFh !== '1')
const branches = branchOrgs.filter((o) => o.includes('分行'))
const parentPath = computed(() => ({ 1: '/headOfficeAllNotice', 2: '/branchAllNotice' })[route.query.routeType] || '/myAllNotice')
const editing = computed(() => notices.find((n) => n.id === route.query.id))

const model = reactive({
  name: '', startTime: '', endTime: '', content: '', image: '', pinned: false, files: [],
  mailAudit: false, mailInput: false, branches: []
})

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date())
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = {
  name: req('请输入公告名称'),
  content: req('请输入公告内容'),
  startTime: [{
    required: true,
    validator: (_r, _v, cb) => {
      if (!model.startTime || !model.endTime) cb(new Error('请选择时间'))
      else if (model.startTime > model.endTime) cb(new Error('开始时间不能晚于结束时间'))
      else cb()
    },
    trigger: 'change'
  }]
}

if (editing.value) {
  const n = editing.value
  Object.assign(model, {
    name: n.name, startTime: n.startTime, endTime: n.endTime, content: n.content, image: n.image, pinned: n.pinned,
    files: (n.files || []).map((name) => ({ name })), mailAudit: n.mailAudit, mailInput: n.mailInput, branches: [...(n.branches || [])]
  })
}

function onImage(file) {
  const ext = (file.name.match(/\.[^.]+$/) || [''])[0].toLowerCase()
  if (!['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) return ElMessage.warning('仅支持 jpg/jpeg/png/bmp 格式图片')
  if (file.size > 5 * 1024 * 1024) return ElMessage.warning('图片需在5M以下')
  model.image = file.name
}

async function submit() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const day = today()
  const level = isHead.value ? '总行' : '分行'
  const data = {
    name: model.name.trim(),
    content: model.content.trim(),
    startTime: model.startTime,
    endTime: model.endTime,
    image: model.image,
    pinned: model.pinned,
    files: model.files.map((f) => f.name),
    mailAudit: model.mailAudit,
    mailInput: model.mailInput,
    branches: model.mailAudit || model.mailInput ? [...model.branches] : [],
    level,
    status: model.endTime >= day ? '进行中' : '已完成',
    showOnHome: level === '总行' && (model.pinned || !!editing.value?.showOnHome)
  }
  if (editing.value) {
    Object.assign(editing.value, data)
  } else {
    notices.unshift({
      ...data,
      id: `NT${Date.now()}`,
      org: currentUser.dept,
      creator: currentUser.name,
      submitTime: day,
      pendingForMe: false,
      homeOrder: 0
    })
  }
  const targets = []
  if (model.mailAudit) targets.push(isHead.value ? '分行体验活动-公告审批岗' : '总行体验公告审批岗')
  if (isHead.value && model.mailInput) targets.push('分行体验活动-公告录入岗')
  if (targets.length) {
    const who = !isHead.value || model.branches.length ? model.branches.join('、') || '总行' : '全部分行'
    ElMessage.success(`${editing.value ? '保存' : '发布'}成功，已同步邮件至${who}的${targets.join('、')}`)
  } else ElMessage.success(editing.value ? '保存成功' : '发布成功')
  router.push(parentPath.value)
}
</script>

<style scoped>
.form-page { padding: 28px 24px 36px; }
.form { max-width: 820px; margin: 8px auto 0; }
.time-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.time-row .el-date-editor { flex: 1; }
.dash { color: #999; }
.upload-block { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; width: 100%; }
.upload-line { display: flex; align-items: center; gap: 8px; }
.hint { color: #909399; cursor: help; }
.file-name { color: #666; font-size: 13px; }
.tip { margin: 0; color: #888; font-size: 12px; line-height: 1.6; }
.branches { width: min(100%, 420px); }
.submit-row { display: flex; justify-content: center; margin-top: 12px; }
.publish { min-width: 88px; }
</style>

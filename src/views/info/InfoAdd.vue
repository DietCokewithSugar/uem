<!-- 新增体验资讯 #/experInformationAdd ；带 id 时为修改 -->
<template>
  <div class="uem-card form-page">
    <el-form ref="formRef" :model="model" :rules="rules" label-width="110px" class="form">
      <el-form-item label="资讯类型" prop="type">
        <el-select v-model="model.type" placeholder="请选择" style="width: 100%" @change="onType">
          <el-option v-for="t in infoTypes" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="model.name" placeholder="请输入名称" maxlength="120" />
      </el-form-item>
      <el-form-item label="一级分类" prop="category1">
        <el-select v-model="model.category1" placeholder="请选择" style="width: 100%" @change="model.category2 = ''">
          <el-option v-for="c in level1" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类" prop="category2">
        <el-select v-model="model.category2" placeholder="请选择" style="width: 100%">
          <el-option v-for="c in level2" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属机构" prop="org">
        <el-select v-model="model.org" placeholder="请选择所属机构" filterable style="width: 100%">
          <el-option v-for="o in infoOrgs" :key="o" :label="o" :value="o" />
        </el-select>
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="model.author" placeholder="请输入作者" maxlength="40" />
      </el-form-item>
      <el-form-item label="完成时间" prop="finishTime">
        <el-date-picker v-model="model.finishTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择完成时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="摘要" prop="intro">
        <el-input v-model="model.intro" type="textarea" :rows="4" placeholder="请输入摘要" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item label="上传附件">
        <div class="upload-line">
          <AttachmentUpload v-model="model.files" :tip="attachTip" :accept="attachAccept" />
          <el-tooltip content="演示环境仅保存文件名，不会上传到服务器" placement="top">
            <el-icon class="hint"><InfoFilled /></el-icon>
          </el-tooltip>
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
import { infos, infoTypes, infoOrgs, infoCategories } from '@/mock'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const attachTip = '支持xls/xlsx/csv/dps/doc/docx/jpg/png/jpeg/bmp/gif/svg/tiff/zip格式附件，限制在50M以下，最多9个'
const attachAccept = '.xls,.xlsx,.csv,.dps,.doc,.docx,.jpg,.jpeg,.png,.bmp,.gif,.svg,.tiff,.zip'
const editing = computed(() => infos.find((i) => i.id === route.query.id))

const model = reactive({
  type: '工作体系', name: '', category1: '', category2: '', org: '', author: '', finishTime: '', intro: '', files: []
})
const level1 = computed(() => Object.keys(infoCategories[model.type] || {}))
const level2 = computed(() => infoCategories[model.type]?.[model.category1] || [])
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = {
  type: req('请选择资讯类型'),
  name: req('请输入名称'),
  category1: req('请选择一级分类'),
  category2: req('请选择二级分类'),
  org: req('请选择所属机构'),
  finishTime: req('请选择完成时间'),
  intro: req('请输入摘要')
}

const onType = () => {
  model.category1 = ''
  model.category2 = ''
}

if (editing.value) {
  const row = editing.value
  Object.assign(model, {
    type: row.type || '工作体系',
    name: row.name,
    category1: row.category1 || (row.type === '方法培训' ? row.board : row.type === '体验研究' ? row.reportType : ''),
    category2: row.category2 || (row.type === '体验研究' ? row.level : ''),
    org: row.org,
    author: row.author,
    finishTime: row.finishTime || row.publishTime,
    intro: row.intro,
    files: (row.files || []).map((name) => ({ name }))
  })
}

const fileTypeOf = (files) => {
  const name = files[0]?.name || ''
  const ext = (name.match(/\.[^.]+$/) || [''])[0].toLowerCase()
  return { '.pdf': 'PDF', '.ppt': 'PPT', '.pptx': 'PPT', '.doc': 'Word', '.docx': 'Word', '.mp4': '视频' }[ext] || ''
}

async function submit() {
  if (!(await formRef.value.validate().catch(() => false))) return
  const files = model.files.map((f) => f.name)
  const data = {
    name: model.name.trim(),
    type: model.type,
    category1: model.category1,
    category2: model.category2,
    org: model.org,
    author: model.author.trim(),
    finishTime: model.finishTime,
    intro: model.intro.trim(),
    files,
    board: model.type === '方法培训' ? model.category1 : '',
    reportType: model.type === '体验研究' ? model.category1 : '',
    level: model.type === '体验研究' ? model.category2 : '',
    fileType: fileTypeOf(model.files) || editing.value?.fileType || 'PDF'
  }
  if (editing.value) {
    Object.assign(editing.value, data)
    ElMessage.success('保存成功')
  } else {
    infos.unshift({
      ...data,
      id: `INFO${Date.now()}`,
      publishTime: new Date().toISOString().slice(0, 10),
      status: '发布',
      form: '网络',
      views: 0,
      downloads: 0,
      cover: infos.length % 4
    })
    ElMessage.success('发布成功')
  }
  router.push('/experInformation')
}
</script>

<style scoped>
.form-page { padding: 28px 24px 40px; }
.form { max-width: 760px; margin: 12px auto 0; }
.upload-line { display: flex; align-items: flex-start; gap: 8px; }
.hint { margin-top: 8px; color: var(--uem-ink-3); cursor: help; }
.submit-row { display: flex; justify-content: center; margin-top: 8px; }
.publish { min-width: 88px; }
</style>

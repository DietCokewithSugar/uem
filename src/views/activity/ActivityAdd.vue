<!-- 新增体验活动（截图待补充：字段依据列表列推测） -->
<template>
  <div class="uem-card form-page">
    <el-alert type="info" :closable="false" show-icon class="note" title="该表单字段依据活动列表推测，待上传新增页截图后校正" />
    <el-form ref="formRef" :model="model" :rules="rules" label-width="120px" class="form">
      <el-form-item label="活动级别" prop="level">
        <el-radio-group v-model="model.level">
          <el-radio value="总行">总行</el-radio>
          <el-radio value="分行">分行</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动名称" prop="name"><el-input v-model="model.name" placeholder="请输入活动名称" /></el-form-item>
      <el-form-item label="产品名称">
        <el-select v-model="model.product" filterable clearable placeholder="请选择产品" style="width: 100%">
          <el-option v-for="p in products" :key="p" :label="p" :value="p" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务领域">
        <el-select v-model="model.domain" clearable placeholder="请选择业务领域" style="width: 100%">
          <el-option v-for="d in bizDomains" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="体验渠道" prop="channel">
        <el-select v-model="model.channel" multiple placeholder="请选择体验渠道" style="width: 100%">
          <el-option v-for="c in channels" :key="c.code" :label="c.value" :value="c.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="体验方法" prop="method">
        <el-select v-model="model.method" multiple placeholder="请选择体验方法" style="width: 100%">
          <el-option v-for="m in methods" :key="m.code" :label="m.value" :value="m.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="活动阶段">
        <el-select v-model="model.stage" clearable placeholder="请选择活动阶段" style="width: 100%">
          <el-option v-for="s in stages" :key="s.code" :label="s.value" :value="s.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请部门" prop="dept">
        <el-select v-model="model.dept" placeholder="请选择申请部门" style="width: 100%">
          <el-option v-for="d in applyDepts" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="参与人数"><el-input-number v-model="model.people" :min="1" /></el-form-item>
      <el-form-item label="活动简介"><el-input v-model="model.intro" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="上传附件"><AttachmentUpload v-model="model.files" /></el-form-item>
      <el-form-item>
        <el-button type="primary" class="wide" @click="save">保存</el-button>
        <el-button class="wide" @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AttachmentUpload from '@/components/AttachmentUpload.vue'
import { activities, products, bizDomains, applyDepts } from '@/mock'
import { dictOptions } from '@/mock/dicts'
import { currentUser } from '@/config/user'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const model = reactive({
  level: route.query.from === '/branchAllActivity' ? '分行' : '总行',
  name: '', product: '', domain: '', channel: [], method: [], stage: '', dept: '', people: 10, intro: '', files: []
})
// 体验渠道、体验方法、活动阶段取自「字典维护」中开启的字典值
const channels = computed(() => dictOptions('EXPER_CHANNEL'))
const methods = computed(() => dictOptions('EXPER_METHOD'))
const stages = computed(() => dictOptions('WORK_LINK'))
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = { level: req('请选择活动级别'), name: req('请输入活动名称'), channel: req('请选择体验渠道'), method: req('请选择体验方法'), dept: req('请选择申请部门') }

const back = () => router.push(route.query.from || '/myAllActivity')

async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  activities.unshift({
    ...model,
    id: `ACT${Date.now()}`,
    channel: model.channel.join('/'),
    channelType: model.channel.some((c) => c.includes('线上') || c.includes('银行')) ? '线上' : '线下',
    method: model.method.join('/'),
    files: model.files.map((f) => f.name),
    submitTime: new Date().toISOString().slice(0, 10),
    status: '待审核',
    creator: currentUser.name,
    pendingForMe: false
  })
  ElMessage.success('保存成功，活动已提交审核')
  back()
}
</script>

<style scoped>
.form-page { padding: 32px 24px 40px; }
.note { max-width: 740px; margin: 0 0 24px 60px; }
.form { max-width: 680px; margin-left: 60px; }
.wide { width: 100px; }
</style>

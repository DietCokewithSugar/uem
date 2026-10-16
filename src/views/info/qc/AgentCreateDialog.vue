<!-- 新建体验质检 / AB对比：上传素材、选择评估角色，用演示数据生成报告 -->
<template>
  <el-dialog :model-value="modelValue" :title="form.mode === 'ab' ? '新建AB对比' : '新建体验质检'" width="760px" :close-on-click-modal="false" @update:model-value="close">
    <template v-if="!running">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="质检类型">
          <el-radio-group v-model="form.mode">
            <el-radio value="standard">单版质检</el-radio>
            <el-radio value="ab">AB对比</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="报告名称" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item v-if="form.mode === 'standard'" label="测评素材">
          <el-upload
            list-type="picture-card"
            action="#"
            accept="image/*"
            :auto-upload="false"
            :file-list="files"
            :limit="9"
            :on-change="onChange"
            :on-remove="(_, list) => (files = list)"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="hint">上传界面截图或设计稿（最多 9 张）；未上传时使用示例素材</div>
        </el-form-item>
        <el-form-item v-else label="设计图">
          <div class="ab-uploads">
            <div>
              <div class="upload-label">修改前</div>
              <el-upload
                list-type="picture-card"
                action="#"
                accept="image/*"
                :auto-upload="false"
                :file-list="beforeFiles"
                :limit="1"
                :on-change="(file, list) => (beforeFiles = list.slice(-1))"
                :on-remove="() => (beforeFiles = [])"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </div>
            <div>
              <div class="upload-label after">修改后</div>
              <el-upload
                list-type="picture-card"
                action="#"
                accept="image/*"
                :auto-upload="false"
                :file-list="afterFiles"
                :limit="1"
                :on-change="(file, list) => (afterFiles = list.slice(-1))"
                :on-remove="() => (afterFiles = [])"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </div>
          </div>
          <div class="hint">每次只上传一张。请分别上传同一页面的修改前、修改后设计图；未上传时使用示例素材</div>
        </el-form-item>
        <el-form-item label="专家角色" prop="experts">
          <el-checkbox-group v-model="form.experts">
            <el-checkbox v-for="r in experts" :key="r.id" :value="r.id">{{ r.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="用户画像">
          <el-select v-model="form.personas" multiple filterable placeholder="可选，模拟典型用户视角" style="width: 100%">
            <el-option v-for="r in personas" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="场景说明">
          <el-input v-model="form.scene" type="textarea" :rows="2" :placeholder="form.mode === 'ab' ? '如：个人手机银行「我的账户」页改版，对比余额展示与常用入口' : '如：手机银行账户管理页，评估信息架构与安全提示'" />
        </el-form-item>
      </el-form>
    </template>
    <div v-else class="running">
      <el-steps direction="vertical" :active="step" finish-status="success">
        <el-step v-for="s in steps" :key="s" :title="s" />
      </el-steps>
    </div>
    <template #footer>
      <template v-if="!running">
        <el-button @click="close(false)">取消</el-button>
        <el-button type="primary" @click="start">{{ form.mode === 'ab' ? '开始对比' : '开始质检' }}</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { qcRoles, generateReport, generateAbReport } from '@/mock/qc'
import { currentUser } from '@/config/user'

const props = defineProps({ modelValue: Boolean, mode: { type: String, default: 'standard' } })
const emit = defineEmits(['update:modelValue', 'created'])

const experts = computed(() => qcRoles.filter((r) => r.type === '专家角色'))
const personas = computed(() => qcRoles.filter((r) => r.type === '用户画像'))

const formRef = ref()
const files = ref([])
const beforeFiles = ref([])
const afterFiles = ref([])
const form = reactive({ mode: 'standard', title: '', experts: [], personas: [], scene: '' })
const rules = {
  title: [{ required: true, message: '请输入报告名称' }],
  experts: [{ type: 'array', required: true, min: 1, message: '请至少选择一个专家角色', trigger: 'change' }]
}
const today = () => new Date().toISOString().slice(0, 10).replace(/-/g, '')

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    Object.assign(form, { mode: props.mode === 'ab' ? 'ab' : 'standard', title: `体验质检智能体报告${today()}`, experts: [1], personas: [2, 106, 6], scene: '' })
    files.value = []
    beforeFiles.value = []
    afterFiles.value = []
    running.value = false
    step.value = 0
  }
)

function onChange(file, list) {
  files.value = list
}

function readFile(file) {
  return new Promise((resolve) => {
    if (!file?.raw) return resolve('')
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file.raw)
  })
}

const running = ref(false)
const step = ref(0)
const steps = computed(() => (form.mode === 'ab'
  ? ['解析修改前素材（单图场景）', '解析修改后素材（单图场景）', '对照可见差异并按维度比较', '汇总生成AB对比报告']
  : ['解析测评素材（文件分析）', '按体验维度评价', '各角色独立评估', '汇总生成综合报告']))

async function start() {
  if (!(await formRef.value.validate().catch(() => false))) return
  running.value = true
  for (let i = 0; i <= steps.value.length; i++) {
    step.value = i
    await new Promise((r) => setTimeout(r, 450))
  }
  const roleIds = [...form.experts, ...form.personas]
  let report
  if (form.mode === 'ab') {
    const [beforeSrc, afterSrc] = await Promise.all([readFile(beforeFiles.value[0]), readFile(afterFiles.value[0])])
    report = generateAbReport({
      title: form.title,
      roleIds,
      scene: form.scene,
      before: beforeSrc ? { src: beforeSrc } : { kind: 'mobile-green' },
      after: afterSrc ? { src: afterSrc } : { kind: 'mobile-fund' }
    })
  } else {
    const materials = []
    for (const file of files.value) {
      const src = await readFile(file)
      if (src) materials.push({ src })
    }
    report = generateReport({ title: form.title, roleIds, materials: materials.length ? materials : [{ kind: 'desktop' }], scene: form.scene })
  }
  emit('created', { ...report, creator: currentUser.name })
  emit('update:modelValue', false)
}
const close = (v) => !running.value && emit('update:modelValue', v)
</script>

<style scoped>
.hint { font-size: 12px; color: #999; width: 100%; line-height: 1.6; }
.ab-uploads { display: flex; gap: 24px; width: 100%; }
.upload-label { font-size: 13px; color: #666; margin-bottom: 6px; }
.upload-label.after { color: var(--uem-red); }
.running { padding: 10px 40px; min-height: 240px; }
</style>

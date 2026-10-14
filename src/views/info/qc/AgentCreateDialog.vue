<!-- 新建体验质检：上传素材、选择评估角色 → 模拟智能体分析（截图未覆盖，流程为推测） -->
<template>
  <el-dialog :model-value="modelValue" title="新建体验质检" width="720px" :close-on-click-modal="false" @update:model-value="close">
    <template v-if="!running">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="报告名称" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="测评素材" prop="materials">
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
        <el-form-item label="场景说明"><el-input v-model="form.scene" type="textarea" :rows="2" placeholder="如：手机银行账户管理页改版，评估信息架构与安全提示" /></el-form-item>
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
        <el-button type="primary" @click="start">开始质检</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { qcRoles, generateReport } from '@/mock/qc'
import { currentUser } from '@/config/user'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'created'])

const experts = computed(() => qcRoles.filter((r) => r.type === '专家角色'))
const personas = computed(() => qcRoles.filter((r) => r.type === '用户画像'))

const formRef = ref()
const files = ref([])
const form = reactive({ title: '', experts: [], personas: [], scene: '' })
const rules = {
  title: [{ required: true, message: '请输入报告名称' }],
  experts: [{ type: 'array', required: true, min: 1, message: '请至少选择一个专家角色', trigger: 'change' }]
}
const today = () => new Date().toISOString().slice(0, 10).replace(/-/g, '')

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    Object.assign(form, { title: `体验质检智能体报告${today()}`, experts: [1, 4], personas: [], scene: '' })
    files.value = []
    running.value = false
    step.value = 0
  }
)

function onChange(file, list) {
  // 读成 dataURL，便于报告中展示
  const reader = new FileReader()
  reader.onload = () => (file.dataUrl = reader.result)
  reader.readAsDataURL(file.raw)
  files.value = list
}

const running = ref(false)
const step = ref(0)
const steps = ['解析测评素材（文件分析）', '按体验维度评分（ETS 维度）', '各角色独立评估', '汇总生成综合报告']

async function start() {
  if (!(await formRef.value.validate().catch(() => false))) return
  running.value = true
  for (let i = 0; i <= steps.length; i++) {
    step.value = i
    await new Promise((r) => setTimeout(r, 450))
  }
  const materials = files.value.length ? files.value.map((f) => ({ src: f.dataUrl || f.url })) : [{ kind: 'desktop' }]
  const report = generateReport({ title: form.title, roleIds: [...form.experts, ...form.personas], materials, scene: form.scene })
  emit('created', { ...report, creator: currentUser.name })
  emit('update:modelValue', false)
}
const close = (v) => !running.value && emit('update:modelValue', v)
</script>

<style scoped>
.hint { font-size: 12px; color: #999; width: 100%; }
.running { padding: 10px 40px; height: 240px; }
</style>

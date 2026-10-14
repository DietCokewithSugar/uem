<!-- 旅程基本信息（新增 / 编辑） -->
<template>
  <el-dialog :model-value="modelValue" title="旅程基本信息" width="860px" @update:model-value="$emit('update:modelValue', $event)">
    <el-form ref="formRef" :model="draft" :rules="rules" label-width="110px" class="form">
      <el-form-item label="旅程名称" prop="name">
        <el-input v-model="draft.name" placeholder="请输入旅程名称" />
      </el-form-item>
      <el-form-item label="所属产品" prop="product">
        <el-select v-model="draft.product" filterable style="width: 100%"><el-option v-for="p in products" :key="p" :label="p" :value="p" /></el-select>
      </el-form-item>
      <el-form-item label="场景/功能" prop="scene">
        <el-select v-model="draft.scene" style="width: 100%"><el-option v-for="p in journeyScenes" :key="p" :label="p" :value="p" /></el-select>
        <div class="hint">如没有适合的场景/功能，请联系平台系统管理员。</div>
      </el-form-item>
      <el-form-item label="旅程类型" prop="type">
        <el-select v-model="draft.type" style="width: 100%"><el-option v-for="p in journeyTypes" :key="p" :label="p" :value="p" /></el-select>
      </el-form-item>
      <el-form-item label="旅程管理员" prop="adminId">
        <el-select v-model="draft.adminId" filterable :filter-method="(q) => (query = q)" placeholder="请输入姓名或统一认证号搜索" style="width: 100%">
          <el-option v-for="s in matched" :key="s.id" :label="`${s.name}（${s.dept}）`" :value="s.id" />
        </el-select>
        <div class="hint">负责审核旅程发布、确保旅程中内容妥当。应由牵头该旅程对应的产品/功能的产品经理担任。</div>
      </el-form-item>
      <el-form-item label="旅程维护员" prop="maintainerIds">
        <el-select v-model="draft.maintainerIds" multiple filterable :filter-method="(q) => (query = q)" style="width: 100%">
          <el-option v-for="s in matched" :key="s.id" :label="`${s.name}（${s.dept}）`" :value="s.id" />
        </el-select>
        <div class="hint">负责创建、编辑维护旅程中各项数据内容。应由该旅程下各旅程行为负责人员担任。</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">返回</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { products, journeyScenes, journeyTypes, staff } from '@/mock'
import { currentUser } from '@/config/user'

const props = defineProps({ modelValue: Boolean, journey: Object })
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref()
const draft = reactive({})
const query = ref('')
const matched = computed(() => staff.filter((s) => !query.value || s.name.includes(query.value) || s.id.includes(query.value)))
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = {
  name: req('请输入旅程名称'),
  product: req('请选择所属产品'),
  scene: req('请选择场景/功能'),
  type: req('请选择旅程类型'),
  adminId: req('请选择旅程管理员'),
  maintainerIds: [{ type: 'array', required: true, min: 1, message: '请选择旅程维护员', trigger: 'change' }]
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    query.value = ''
    const j = props.journey
    Object.assign(draft, {
      name: j?.name || '',
      product: j?.product || '',
      scene: j?.scene || '',
      type: j?.type || '',
      adminId: j?.adminId || '',
      maintainerIds: j ? [...j.maintainerIds] : [currentUser.id]
    })
    formRef.value?.clearValidate()
  }
)

async function submit() {
  if (!(await formRef.value.validate().catch(() => false))) return
  emit('submit', { ...draft, maintainerIds: [...draft.maintainerIds] })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.form { padding-right: 20px; }
.form :deep(.el-form-item) { margin-bottom: 32px; }
.form :deep(.el-form-item__content) { position: relative; }
.hint { position: absolute; left: calc(100% + 16px); top: 0; width: 200px; font-size: 12px; color: #888; line-height: 1.6; }
.form { margin-right: 220px; }
</style>

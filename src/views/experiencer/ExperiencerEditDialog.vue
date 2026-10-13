<!-- 新增 / 修改体验员 -->
<template>
  <el-dialog :model-value="modelValue" :title="row ? '修改体验员' : '新增体验员'" width="760px" @update:model-value="$emit('update:modelValue', $event)">
    <el-form ref="formRef" :model="d" :rules="rules" label-width="150px" class="form">
      <template v-if="kind === 'inside'">
        <el-form-item label="统一认证号" prop="id"><el-input v-model="d.id" :disabled="!!row" maxlength="9" placeholder="9 位数字" /></el-form-item>
        <el-form-item label="姓名" prop="name"><el-input v-model="d.name" /></el-form-item>
        <el-form-item label="性别" prop="gender"><el-radio-group v-model="d.gender"><el-radio v-for="g in E.genders" :key="g" :value="g">{{ g }}</el-radio></el-radio-group></el-form-item>
        <el-form-item label="年龄" prop="age"><el-input-number v-model="d.age" :min="18" :max="70" /></el-form-item>
        <el-form-item label="地区" prop="region"><ChainSelect v-model="d.region" :tree="E.regionTree" /></el-form-item>
        <el-form-item label="所属机构" prop="org"><ChainSelect v-model="d.org" :tree="E.orgTree" /></el-form-item>
        <el-form-item label="职务层级"><el-select v-model="d.jobLevel" style="width: 100%"><el-option v-for="o in E.jobLevels" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="参加工作时间"><el-date-picker v-model="d.workTime" type="month" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
        <el-form-item label="是否营业网点工作人员"><el-radio-group v-model="d.isOutlet"><el-radio v-for="o in E.yesNo" :key="o" :value="o">{{ o }}</el-radio></el-radio-group></el-form-item>
        <el-form-item label="熟悉的我行使用渠道"><el-select v-model="d.channels" multiple style="width: 100%"><el-option v-for="o in E.bankChannels" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="熟悉的我行业务"><el-select v-model="d.businesses" multiple style="width: 100%"><el-option v-for="o in E.bankBusinesses" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="熟悉的银行同业"><el-select v-model="d.peer" style="width: 100%"><el-option v-for="o in E.peerBanks" :key="o" :label="o" :value="o" /></el-select></el-form-item>
      </template>
      <template v-else>
        <el-form-item label="姓名" prop="name"><el-input v-model="d.name" /></el-form-item>
        <el-form-item label="性别" prop="gender"><el-radio-group v-model="d.gender"><el-radio v-for="g in E.genders" :key="g" :value="g">{{ g }}</el-radio></el-radio-group></el-form-item>
        <el-form-item label="年龄" prop="age"><el-input-number v-model="d.age" :min="16" :max="90" /></el-form-item>
        <el-form-item label="地区" prop="region"><ChainSelect v-model="d.region" :tree="E.regionTree" :depth="2" /></el-form-item>
        <el-form-item label="教育程度"><el-select v-model="d.education" style="width: 100%"><el-option v-for="o in E.educations" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="所属行业"><el-select v-model="d.industry" style="width: 100%"><el-option v-for="o in E.industries" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="属性"><el-select v-model="d.attr" style="width: 100%"><el-option v-for="o in E.outsideAttrs" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="类型"><el-select v-model="d.type" style="width: 100%"><el-option v-for="o in E.outsideTypes" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="星级"><el-select v-model="d.star" style="width: 100%"><el-option v-for="o in E.stars" :key="o" :label="o" :value="o" /></el-select></el-form-item>
        <el-form-item label="评级"><el-select v-model="d.rating" style="width: 100%"><el-option v-for="o in E.ratings" :key="o" :label="o" :value="o" /></el-select></el-form-item>
      </template>
      <el-form-item label="人员状态"><el-select v-model="d.status" style="width: 100%"><el-option v-for="o in E.personStatus" :key="o" :label="o" :value="o" /></el-select></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import ChainSelect from '@/components/ChainSelect.vue'
import * as E from '@/mock/experiencer'
import { staffIdRule } from '@/config/validators'

const props = defineProps({ modelValue: Boolean, kind: String, row: Object })
const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref()
const d = reactive({})
const req = (message) => [{ required: true, message, trigger: ['blur', 'change'] }]
const rules = {
  id: [staffIdRule],
  name: req('请输入姓名'),
  gender: req('请选择性别'),
  age: req('请输入年龄'),
  region: [{ type: 'array', required: true, min: 1, message: '请选择地区', trigger: 'change' }],
  org: [{ type: 'array', required: true, min: 1, message: '请选择所属机构', trigger: 'change' }]
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    const blank = {
      id: props.kind === 'outside' ? `W${Date.now().toString().slice(-8)}` : '', name: '', gender: '', age: 30, region: [], org: [],
      jobLevel: '', workTime: '', isOutlet: '否', channels: [], businesses: [], peer: '',
      education: '', industry: '', attr: '', type: '普通体验员', star: '', rating: '', status: '在库'
    }
    Object.assign(d, blank, props.row ? JSON.parse(JSON.stringify(props.row)) : {})
    formRef.value?.clearValidate()
  }
)

async function submit() {
  await formRef.value.validate()
  const { activities, level, kind, officerLevel, ...data } = d
  emit('save', JSON.parse(JSON.stringify(data)))
  emit('update:modelValue', false)
}
</script>

<style scoped>
.form { max-height: 60vh; overflow-y: auto; padding-right: 12px; }
</style>

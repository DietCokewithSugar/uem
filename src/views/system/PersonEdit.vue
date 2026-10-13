<!-- 人员维护 · 新增 / 修改 #/personMaintenanceAdd?id= -->
<template>
  <div class="uem-card page">
    <el-form ref="formRef" :model="d" :rules="rules" label-width="110px" class="form">
      <el-form-item label="统一认证号" prop="id">
        <div class="row">
          <el-input v-model="d.id" :disabled="!!editing" placeholder="请输入统一认证号" />
          <el-button v-if="!editing" type="primary" @click="lookup">查询</el-button>
        </div>
      </el-form-item>
      <el-form-item label="姓名"><el-input v-model="d.name" disabled /></el-form-item>
      <el-form-item label="所属机构"><el-input v-model="d.org" disabled /></el-form-item>
      <el-form-item label="要客标记"><el-checkbox v-model="d.vip">是</el-checkbox></el-form-item>

      <el-form-item label="角色" prop="roles" class="roles">
        <div class="modules">
          <div v-for="m in roleCatalog" :key="m.module" class="module">
            <div class="m-name">{{ m.module }}</div>
            <div class="m-roles">
              <div v-for="r in m.roles" :key="r.name" class="role">
                <el-checkbox :model-value="d.roles.includes(r.name)" @change="(v) => toggleRole(r.name, v)">{{ r.name }}</el-checkbox>
                <el-select
                  v-for="s in r.scope || []"
                  :key="s"
                  v-model="scopeOf(r.name)[s]"
                  :disabled="!d.roles.includes(r.name)"
                  :placeholder="scopeLabels[s]"
                  size="small"
                  clearable
                  class="scope"
                >
                  <el-option v-for="o in scopeOptions[s]" :key="o" :label="o" :value="o" />
                </el-select>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="wide" @click="submit">提交</el-button>
        <el-button class="wide" @click="router.push('/personMaintenance')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { persons, roleCatalog, scopeLabels, headDepts, channels, rdDepts, rdLines } from '@/mock/system'
import { staff } from '@/mock'
import { productDomains } from '@/mock/voiceTools'
import { qcRoles } from '@/mock/qc'

const route = useRoute()
const router = useRouter()
const editing = computed(() => persons.find((p) => p.id === route.query.id))
const formRef = ref()
const src = editing.value
const d = reactive({
  id: src?.id || '', name: src?.name || '', org: src?.org || '', vip: !!src?.vip,
  roles: src ? [...src.roles] : [], scopes: src ? JSON.parse(JSON.stringify(src.scopes || {})) : {}
})
const scopeOptions = {
  productLine: rdLines, bizDept: rdDepts, headDept: headDepts, channel: channels,
  productDomain: productDomains.map((p) => p.name), qcRole: qcRoles.map((r) => r.name)
}
const scopeOf = (role) => (d.scopes[role] ||= {})
const toggleRole = (name, on) => (on ? d.roles.push(name) : d.roles.splice(d.roles.indexOf(name), 1))

const rules = {
  id: [{ required: true, message: '请输入统一认证号并查询' }],
  roles: [{ type: 'array', required: true, min: 1, message: '请至少选择一个角色', trigger: 'change' }]
}

// 按统一认证号从人员目录带出姓名、机构（演示：目录外的号码生成虚构人员）
function lookup() {
  if (!d.id.trim()) return ElMessage.warning('请输入统一认证号')
  if (persons.some((p) => p.id === d.id.trim())) return ElMessage.warning('该人员已存在，请在列表中修改')
  const s = staff.find((x) => x.id === d.id.trim())
  Object.assign(d, s ? { name: s.name, org: s.dept } : { name: `演示人员${d.id.slice(-3)}`, org: '业务研发中心' })
}

async function submit() {
  await formRef.value.validate()
  if (!d.name) return ElMessage.warning('请先点击「查询」带出人员信息')
  const missing = d.roles.find((r) => roleCatalog.flatMap((m) => m.roles).find((x) => x.name === r)?.scope?.some((s) => !d.scopes[r]?.[s]))
  if (missing) return ElMessage.warning(`请为「${missing}」选择数据范围`)
  const data = { id: d.id.trim(), name: d.name, org: d.org, vip: d.vip, roles: [...d.roles], scopes: JSON.parse(JSON.stringify(d.scopes)) }
  if (editing.value) Object.assign(editing.value, data)
  else persons.unshift({ ...data, status: '激活' })
  ElMessage.success('提交成功')
  router.push('/personMaintenance')
}
</script>

<style scoped>
.page { padding: 32px 24px; }
.form { max-width: 1100px; }
.row { display: flex; gap: 12px; width: 460px; }
.form :deep(.el-input) { max-width: 460px; }
.modules { width: 100%; }
.module { display: flex; padding: 10px 0; border-bottom: 1px solid #f2f2f2; }
.m-name { width: 80px; flex-shrink: 0; color: #555; font-size: 13px; line-height: 32px; }
.m-roles { flex: 1; }
.role { display: flex; align-items: center; gap: 10px; min-height: 32px; }
.role :deep(.el-checkbox) { width: 180px; }
.scope { width: 170px; }
.wide { width: 100px; }
</style>

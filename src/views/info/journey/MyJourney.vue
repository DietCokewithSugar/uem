<!-- 灵犀旅程维护 #/myJourney：当前用户作为维护员/管理员的旅程 -->
<template>
  <div class="uem-card">
    <div class="uem-toolbar">
      <el-button type="primary" @click="openCreate">新增</el-button>
    </div>
    <JourneyTable :rows="mine">
      <template #ops="{ row }">
        <el-button v-if="editable(row)" link type="primary" @click="edit(row)">编辑旅程结构</el-button>
        <el-button v-else link type="primary" @click="router.push({ path: '/myjourneyAdd', query: { id: row.id, status: 'view' } })">查看旅程内容</el-button>
        <el-button v-if="editable(row)" link type="primary" @click="basic = row; dialog = true">修改基本信息</el-button>
        <el-button link type="primary" @click="remove(row)">删除</el-button>
      </template>
    </JourneyTable>
    <JourneyBasicDialog v-model="dialog" :journey="basic" @submit="save" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import JourneyTable from '@/components/journey/JourneyTable.vue'
import JourneyBasicDialog from '@/components/journey/JourneyBasicDialog.vue'
import { journeys, staff } from '@/mock'
import { createEmptyMap } from '@/mock/journey'
import { currentUser } from '@/config/user'

const router = useRouter()
const today = () => new Date().toISOString().slice(0, 10)

const mine = computed(() => journeys.filter((j) => j.maintainerIds.includes(currentUser.id) || j.adminId === currentUser.id))
const editable = (j) => j.status === '待编辑旅程结构' || j.status === '待修改'

const dialog = ref(false)
const basic = ref(null)
const openCreate = () => {
  basic.value = null
  dialog.value = true
}
const edit = (row) => router.push({ path: '/myjourneyAdd', query: { id: row.id, status: 'edit' } })

function save(data) {
  const adminDept = staff.find((s) => s.id === data.adminId)?.dept || ''
  if (basic.value) {
    Object.assign(basic.value, data, { adminDept, updateTime: today() })
    ElMessage.success('保存成功')
    return
  }
  const j = {
    ...data,
    id: String(Date.now()) + String(Math.floor(Math.random() * 1e6)).padStart(6, '0'),
    adminDept,
    status: '待编辑旅程结构',
    createTime: today(),
    updateTime: '',
    reviewer: '',
    reviewComment: '',
    creatorId: currentUser.id,
    map: createEmptyMap()
  }
  journeys.unshift(j)
  ElMessage.success('创建成功，请编辑旅程结构')
  edit(j)
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除旅程「${row.name}」？`, '提示', { type: 'warning' })
  journeys.splice(journeys.indexOf(row), 1)
  ElMessage.success('删除成功')
}
</script>

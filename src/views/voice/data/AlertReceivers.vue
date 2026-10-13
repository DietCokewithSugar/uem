<!-- 实时监测收件人管理 #/emailManage：实时监测出现高压力时的邮件预警收件人 -->
<template>
  <div class="uem-card">
    <div class="uem-toolbar"><el-button type="primary" @click="open">新增</el-button></div>
    <el-table :data="alertReceivers">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="name" label="姓名" min-width="140" />
      <el-table-column prop="id" label="统一认证号" min-width="160" />
      <el-table-column prop="org" label="所属机构" min-width="240" />
      <el-table-column label="操作" width="80">
        <template #default="{ row }"><el-button link type="primary" @click="remove(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-pagination class="pager" layout="total, prev, pager, next" :total="alertReceivers.length" />

    <el-dialog v-model="dialog" title="新增收件人" width="480px">
      <el-select v-model="picked" filterable multiple placeholder="请输入姓名或统一认证号搜索" style="width: 100%">
        <el-option v-for="s in candidates" :key="s.id" :label="`${s.name}（${s.id}）`" :value="s.id" />
      </el-select>
      <p class="hint">当实时监测的用户声音压力指数达到「中高度压力」及以上时，系统向收件人发送邮件预警。</p>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { alertReceivers } from '@/mock/voiceTools'
import { staff } from '@/mock'

const dialog = ref(false)
const picked = ref([])
const candidates = computed(() => staff.filter((s) => !alertReceivers.some((r) => r.id === s.id)))
const open = () => {
  picked.value = []
  dialog.value = true
}
function save() {
  if (!picked.value.length) return ElMessage.warning('请选择收件人')
  picked.value.forEach((id) => {
    const s = staff.find((x) => x.id === id)
    alertReceivers.push({ id: s.id, name: s.name, org: s.dept })
  })
  dialog.value = false
  ElMessage.success('新增成功')
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除收件人「${row.name}」？`, '提示', { type: 'warning' })
  alertReceivers.splice(alertReceivers.indexOf(row), 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.hint { color: #999; font-size: 12px; margin-top: 12px; }
</style>

<!-- 人员维护 #/personMaintenance：人员与角色（权限）管理 -->
<template>
  <div>
    <div class="uem-card filter">
      <el-form :model="form" label-width="80px" class="grid">
        <el-form-item label="角色">
          <el-select v-model="form.role" clearable filterable placeholder=" " style="width: 100%"><el-option v-for="r in allRoles" :key="r" :label="r" :value="r" /></el-select>
        </el-form-item>
        <el-form-item label="人员搜索"><el-input v-model="form.keyword" clearable placeholder="请输入姓名或统一认证号" /></el-form-item>
        <el-form-item label="所属机构">
          <el-select v-model="form.org" clearable filterable placeholder=" " style="width: 100%"><el-option v-for="o in orgs" :key="o" :label="o" :value="o" /></el-select>
        </el-form-item>
        <el-form-item label="筛选要客"><el-checkbox v-model="form.vipOnly">仅筛选要客标记</el-checkbox></el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>

    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="router.push('/personMaintenanceAdd')">新增</el-button>
        <el-button @click="doExport">导出</el-button>
      </div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="60" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="id" label="统一认证号" width="110" />
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="org" label="所属机构" min-width="190" show-overflow-tooltip />
        <el-table-column label="是否要客" width="80"><template #default="{ row }">{{ row.vip ? '是' : '否' }}</template></el-table-column>
        <el-table-column label="角色" min-width="320" show-overflow-tooltip><template #default="{ row }">{{ row.roles.join(',') }}</template></el-table-column>
        <el-table-column label="状态" width="70">
          <template #default="{ row }"><span :class="{ frozen: row.status === '冻结' }">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="toggle(row)">{{ row.status === '激活' ? '冻结' : '激活' }}</el-button>
            <el-button link type="primary" @click="router.push({ path: '/personMaintenanceAdd', query: { id: row.id } })">修改</el-button>
            <el-button link type="primary" :disabled="row.id === currentUser.id" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { persons, allRoles } from '@/mock/system'
import { currentUser } from '@/config/user'

const router = useRouter()
const orgs = computed(() => [...new Set(persons.map((p) => p.org))])
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => persons,
  { role: '', keyword: '', org: '', vipOnly: false },
  (p, q) =>
    (!q.role || p.roles.includes(q.role)) &&
    (!q.keyword || p.name.includes(q.keyword) || p.id.includes(q.keyword)) &&
    match.equals(p.org, q.org) &&
    (!q.vipOnly || p.vip)
)

function toggle(row) {
  row.status = row.status === '激活' ? '冻结' : '激活'
  ElMessage.success(`已${row.status}「${row.name}」${row.status === '冻结' ? '，该用户将无法登录平台' : ''}`)
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除人员「${row.name}」及其全部角色？`, '提示', { type: 'warning' })
  persons.splice(persons.indexOf(row), 1)
  ElMessage.success('删除成功')
}
const doExport = () =>
  exportCsv('人员维护', [
    { prop: 'id', label: '统一认证号' }, { prop: 'name', label: '姓名' }, { prop: 'org', label: '所属机构' },
    { prop: 'vipText', label: '是否要客' }, { prop: 'roleText', label: '角色' }, { prop: 'status', label: '状态' }
  ], filtered.value.map((p) => ({ ...p, vipText: p.vip ? '是' : '否', roleText: p.roles.join(',') })))
</script>

<style scoped>
.filter { display: flex; gap: 24px; margin-bottom: 16px; }
.grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; column-gap: 32px; }
.grid :deep(.el-form-item) { margin-bottom: 14px; }
.actions { display: flex; gap: 8px; align-items: flex-start; }
.actions .el-button + .el-button { margin-left: 0; }
.frozen { color: #999; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

<!-- 要客数据 #/majorClient：被标记为「要客」的人员访问平台的记录（访问时间、访问模块） -->
<template>
  <div>
    <div class="search-form uem-card">
      <el-form :model="form" label-width="110px" class="grid">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.range"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="-"
            start-placeholder="请选择开始时间"
            end-placeholder="请选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="人员搜索">
          <el-input v-model="form.keyword" placeholder="请输入姓名或统一认证号" clearable @keyup.enter="search" />
        </el-form-item>
        <el-form-item v-show="expanded" label="访问模块">
          <el-cascader
            v-model="form.module"
            :options="moduleOptions"
            :props="{ checkStrictly: true }"
            placeholder="请选择访问模块"
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <span class="toggle" @click="expanded = !expanded">
          {{ expanded ? '收起' : '展开' }}
          <el-icon><component :is="expanded ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        </span>
      </div>
    </div>

    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="exportAll">批量导出</el-button>
        <span class="hint">
          <el-icon><InfoFilled /></el-icon>
          在「人员维护」中为人员勾选「要客标记」后，其访问平台的记录将出现在此处
          <router-link to="/personMaintenance" class="uem-link">前往人员维护</router-link>
        </span>
      </div>
      <el-table :data="rows" border>
        <el-table-column type="index" label="序号" width="70" align="center" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="org" label="所属机构" min-width="200" show-overflow-tooltip />
        <el-table-column prop="id" label="统一认证号" width="120" />
        <el-table-column prop="time" label="访问时间" width="185" />
        <el-table-column label="访问模块" align="center">
          <el-table-column prop="l1" label="一级菜单" min-width="110" :formatter="dash" />
          <el-table-column prop="l2" label="二级菜单" min-width="130" :formatter="dash" />
          <el-table-column prop="l3" label="三级菜单" min-width="150" :formatter="dash" />
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { vipVisits } from '@/mock/vipVisits'
import { topNav, sideMenus } from '@/config/menus'

const expanded = ref(true)

// 访问模块级联：一级=顶部板块，二级=左侧分组，三级=分组下的页面；任一级均可选
// 按标题路径插入节点，同级同名合并
const insert = (tree, [title, ...rest]) => {
  if (!title) return
  let node = tree.find((n) => n.value === title)
  if (!node) tree.push((node = { value: title, label: title }))
  if (rest[0]) insert((node.children ||= []), rest)
}
const moduleOptions = computed(() => {
  const tree = []
  topNav
    // 冻结的板块仅在已有访问记录时保留
    .filter((n) => !n.frozen || vipVisits.some((v) => v.l1 === n.title))
    .sort((a, b) => a.sort - b.sort)
    .forEach((n) => {
      insert(tree, [n.title])
      const groups = n.key === 'home' ? [] : sideMenus[n.key] || []
      groups.forEach((g) => {
        insert(tree, [n.title, g.title])
        g.children?.forEach((c) => insert(tree, [n.title, g.title, c.title]))
      })
    })
  // 并入记录中实际出现的路径（菜单改名前的旧名称、子页面等），保证每条记录都能按模块筛到
  vipVisits.forEach((v) => insert(tree, [v.l1, v.l2, v.l3]))
  return tree
})

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => [...vipVisits].sort((a, b) => b.time.localeCompare(a.time)),
  { range: [], keyword: '', module: [] },
  (r, q) => {
    const kw = (q.keyword || '').trim()
    return (
      match.inRange(r.time.slice(0, 10), q.range) &&
      (!kw || r.name.includes(kw) || r.id.includes(kw)) &&
      match.chain([r.l1, r.l2, r.l3], q.module || [])
    )
  }
)

const dash = (_, __, v) => v || '-'
const cols = [
  { prop: 'name', label: '姓名' }, { prop: 'org', label: '所属机构' }, { prop: 'id', label: '统一认证号' }, { prop: 'time', label: '访问时间' },
  { prop: 'l1', label: '一级菜单' }, { prop: 'l2', label: '二级菜单' }, { prop: 'l3', label: '三级菜单' }
]
function exportAll() {
  if (!filtered.value.length) return ElMessage.warning('暂无可导出的数据')
  exportCsv('要客数据', cols, filtered.value)
  ElMessage.success(`已导出 ${filtered.value.length} 条记录`)
}
</script>

<style scoped>
/* 查询区与通用 SearchForm 保持一致 */
.search-form { display: flex; gap: 24px; margin-bottom: 20px; }
.grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; column-gap: 32px; }
.grid :deep(.el-form-item) { margin-bottom: 18px; }
.actions { display: flex; align-items: flex-start; gap: 8px; white-space: nowrap; }
.actions .el-button + .el-button { margin-left: 0; }
.toggle { color: var(--uem-red); cursor: pointer; font-size: 13px; line-height: 32px; display: inline-flex; align-items: center; gap: 2px; }
.uem-toolbar { align-items: center; }
.hint { display: inline-flex; align-items: center; gap: 4px; margin-left: 8px; color: #999; font-size: 12px; }
.hint .uem-link { margin-left: 4px; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

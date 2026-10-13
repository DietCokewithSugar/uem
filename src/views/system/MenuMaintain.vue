<!-- 菜单维护 #/menuMaintenance：维护顶部一级菜单的名称、排序与冻结状态，修改后顶部导航与面包屑即时更新 -->
<template>
  <div>
    <div class="uem-card">
      <div class="card-head">
        <span class="card-title">一级菜单</span>
        <span class="tip">*修改菜单名称、排序或冻结后，顶部导航即时更新</span>
      </div>
      <el-table :data="rows" row-key="key">
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <div class="sub">
              <template v-if="subMenus(row).length">
                <div class="sub-label">二级菜单（{{ subMenus(row).length }}）</div>
                <div v-for="g in subMenus(row)" :key="g.title" class="sub-row">
                  <span class="sub-title">{{ g.title }}</span>
                  <span v-if="g.children" class="sub-children">
                    <el-tag v-for="c in g.children" :key="c.title + (c.query?.productId || '')" size="small" type="info" effect="plain">{{ c.title }}</el-tag>
                  </span>
                  <span v-else class="sub-leaf">直接跳转页面</span>
                </div>
              </template>
              <span v-else class="sub-empty">无二级菜单</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="菜单名称" min-width="200">
          <template #default="{ row }">
            <span :class="{ frozen: row.frozen }">{{ row.title }}</span>
            <el-tag v-if="row.frozen" size="small" type="info" class="state">已冻结</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="120" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" @click="open(row)">修改</el-button>
            <el-button link type="primary" @click="toggle(row)">{{ row.frozen ? '激活' : '冻结' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialog" title="修改一级菜单" width="480px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="90px">
        <el-form-item label="菜单名称" prop="title"><el-input v-model="d.title" maxlength="6" show-word-limit placeholder="请输入菜单名称" /></el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="d.sort" :min="0" :max="99" :step="1" step-strictly :precision="0" />
          <span class="hint">数值越小越靠前</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { topNav, sideMenus } from '@/config/menus'

// 直接读写 topNav 的响应式条目，顶部导航（visibleNav）与面包屑随之更新
const rows = computed(() => [...topNav].sort((a, b) => a.sort - b.sort))
const subMenus = (row) => (row.key === 'home' ? [] : sideMenus[row.key] || [])

// 首页为默认入口、系统管理为本页所在板块，均不可冻结
const guards = {
  home: '首页为平台默认入口，不可冻结',
  system: '系统管理不可冻结：冻结后将无法进入系统管理恢复菜单'
}
function toggle(row) {
  if (row.frozen) {
    row.frozen = false
    return ElMessage.success(`已激活，「${row.title}」已显示在顶部导航`)
  }
  if (guards[row.key]) return ElMessage.warning(guards[row.key])
  ElMessageBox.confirm(`冻结后「${row.title}」将不在顶部导航显示，确认冻结？`, '提示', { type: 'warning' })
    .then(() => {
      row.frozen = true
      ElMessage.success('已冻结')
    })
    .catch(() => {})
}

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({ title: '', sort: 0 })
const rules = {
  title: [
    { required: true, whitespace: true, message: '请输入菜单名称' },
    { max: 6, message: '菜单名称不超过6个字' },
    {
      validator: (_, v, cb) => (topNav.some((n) => n !== editing.value && n.title === (v || '').trim()) ? cb(new Error('菜单名称已存在')) : cb())
    }
  ],
  sort: [{ validator: (_, v, cb) => (v === null || v === undefined || v === '' ? cb(new Error('请输入排序')) : cb()) }]
}
function open(row) {
  editing.value = row
  Object.assign(d, { title: row.title, sort: row.sort })
  dialog.value = true
  nextTick(() => formRef.value?.clearValidate())
}
async function save() {
  if (!(await formRef.value.validate().catch(() => false))) return
  Object.assign(editing.value, { title: d.title.trim(), sort: d.sort })
  dialog.value = false
  ElMessage.success('修改成功，顶部导航已更新')
}
</script>

<style scoped>
.card-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.tip { color: var(--uem-red); font-size: 12px; }
.frozen { color: #999; }
.state { margin-left: 6px; }
.hint { color: #999; font-size: 12px; margin-left: 10px; }
.sub { padding: 4px 24px 4px 132px; font-size: 13px; color: #555; }
.sub-label { color: #999; font-size: 12px; margin-bottom: 6px; }
.sub-row { display: flex; align-items: flex-start; gap: 12px; padding: 6px 0; border-bottom: 1px dashed #f0f0f0; }
.sub-row:last-child { border-bottom: none; }
.sub-title { width: 120px; flex-shrink: 0; line-height: 24px; color: #333; }
.sub-children { display: flex; flex-wrap: wrap; gap: 6px; }
.sub-leaf, .sub-empty { color: #999; line-height: 24px; }
</style>

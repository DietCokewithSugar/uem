<!-- 体验问题维护 #/experienceProblemsMaintenance：体验问题模块功能开关及应用范围 / 白名单用户列表 -->
<template>
  <div class="uem-card">
    <el-tabs v-model="tab">
      <el-tab-pane label="体验问题列表" name="feature">
        <el-table :data="problemFeatures">
          <el-table-column type="index" label="序号" width="70" />
          <el-table-column label="功能名称" min-width="200">
            <template #default="{ row }">
              <span class="name">{{ row.name }}</span>
              <el-tooltip :content="row.desc" placement="top"><el-icon class="tip"><InfoFilled /></el-icon></el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><span :class="row.on ? 'on' : 'off'">{{ row.on ? '开启' : '关闭' }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }"><el-switch v-model="row.on" @change="(v) => ElMessage.success(`已${v ? '开启' : '关闭'}「${row.name}」`)" /></template>
          </el-table-column>
          <el-table-column label="应用范围" min-width="360" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.scopeType" class="uem-link" @click="openScope(row)">{{ scopeText(row) }}</span>
              <span v-else class="off">-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="pager" layout="total, prev, pager, next" :total="problemFeatures.length" />
      </el-tab-pane>

      <!-- 白名单功能暂未启用，仅保留空列表 -->
      <el-tab-pane label="白名单用户列表" name="whitelist">
        <el-table :data="whitelistUsers" empty-text="暂无数据">
          <el-table-column type="index" label="序号" width="70" />
          <el-table-column prop="staffId" label="统一认证号" width="140" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="content" label="内容" min-width="260" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column label="操作" width="140" />
        </el-table>
        <el-pagination class="pager" layout="total, prev, pager, next" :total="whitelistUsers.length" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialog" :title="`应用范围 · ${editing?.name || ''}`" width="620px">
      <el-form label-width="60px">
        <template v-if="editing?.scopeType === 'org-role-person'">
          <el-form-item label="机构">
            <el-select v-model="d.orgs" multiple filterable clearable placeholder="未选" style="width: 100%">
              <el-option v-for="o in scopeOrgs" :key="o" :label="o" :value="o" />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位">
            <el-select v-model="d.roles" multiple filterable clearable placeholder="未选" style="width: 100%">
              <el-option v-for="r in allRoles" :key="r" :label="r" :value="r" />
            </el-select>
          </el-form-item>
          <el-form-item label="人员">
            <el-select v-model="d.persons" multiple filterable clearable placeholder="未选，可按姓名或统一认证号搜索" style="width: 100%">
              <el-option v-for="p in persons" :key="p.id" :label="`${p.name}（${p.id}）`" :value="p.id" />
            </el-select>
          </el-form-item>
          <p class="hint">机构、岗位、人员均未选时对全部用户生效；任一项命中即在应用范围内。</p>
        </template>
        <el-form-item v-else label="产品">
          <el-select v-model="d.products" multiple filterable clearable placeholder="未选" style="width: 100%">
            <el-option v-for="p in products" :key="p" :label="p" :value="p" />
          </el-select>
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { problemFeatures, whitelistUsers, scopeOrgs, scopeText } from '@/mock/problemFeatures'
import { allRoles, persons } from '@/mock/system'
import { products } from '@/mock'

const tab = ref('feature')

// 应用范围编辑：草稿复制，保存时回写
const dialog = ref(false)
const editing = ref(null)
const d = reactive({})
function openScope(row) {
  editing.value = row
  const s = row.scope || {}
  for (const k of Object.keys(d)) delete d[k]
  if (row.scopeType === 'org-role-person') Object.assign(d, { orgs: [...(s.orgs || [])], roles: [...(s.roles || [])], persons: [...(s.persons || [])] })
  else Object.assign(d, { products: [...(s.products || [])] })
  dialog.value = true
}
function save() {
  editing.value.scope = JSON.parse(JSON.stringify(d))
  dialog.value = false
  ElMessage.success('应用范围已更新')
}
</script>

<style scoped>
.name { vertical-align: middle; }
.tip { margin-left: 4px; color: #b0b0b0; cursor: help; vertical-align: middle; }
.tip:hover { color: var(--uem-red); }
.on { color: #3c9a5f; }
.off { color: #999; }
.hint { color: #888; font-size: 12px; margin: -6px 0 0 60px; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

<!-- 系统管理 · 首页维护 · 首页卡片配置 #/homeCardConfig：按岗位设置首页默认展示的卡片
     卡片能否看到由权限决定（config/access.js）；这里设置的是有权限时是否默认展示，个人可在首页「调整卡片」中隐藏或排序 -->
<template>
  <div class="cfg">
    <aside class="roles uem-card" aria-label="岗位">
      <div class="roles-head">选择岗位</div>
      <div class="roles-list">
        <template v-for="g in groups" :key="g.module">
          <div class="role-group">{{ g.module }}</div>
          <button
            v-for="r in g.roles"
            :key="r"
            type="button"
            class="role"
            :class="{ on: role === r }"
            @click="role = r"
          >
            <span class="role-name">{{ r }}</span>
            <span class="role-n">{{ (defaultsByRole[r] || []).length }}</span>
          </button>
        </template>
      </div>
    </aside>

    <section class="main uem-card">
      <header class="main-head">
        <div>
          <h2>{{ role }}</h2>
          <p>{{ roleHint }}</p>
        </div>
        <span class="uem-muted">修改即时生效，未调整过首页的人员刷新后按新默认展示</span>
      </header>
      <el-table :data="homeCards" row-key="key">
        <el-table-column label="默认展示" width="96" align="center">
          <template #default="{ row }">
            <el-switch :model-value="isOn(row.key)" :aria-label="`默认展示「${row.title}」`" @change="(v) => setOn(row.key, v)" />
          </template>
        </el-table-column>
        <el-table-column label="卡片" min-width="180">
          <template #default="{ row }"><b class="card-name">{{ row.title }}</b></template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" min-width="320" />
        <el-table-column label="需要的岗位" min-width="220">
          <template #default="{ row }">
            <span v-if="!row.feature" class="uem-muted">所有人可见</span>
            <span v-else class="need">{{ [...new Set(rolesOf(row.feature))].join('、') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { roleCatalog, persons } from '@/mock/system'
import { rolesOf } from '@/config/access'
import { homeCards, defaultsByRole, EVERYONE, NO_ROLE } from '@/config/homeCards'

const groups = [{ module: '通用', roles: [EVERYONE, NO_ROLE] }, ...roleCatalog.map((m) => ({ module: m.module, roles: m.roles.map((r) => r.name) }))]
const role = ref(EVERYONE)

const holders = computed(() => persons.filter((p) => p.status !== '冻结' && p.roles.includes(role.value)).length)
const roleHint = computed(() => {
  if (role.value === EVERYONE) return '对平台所有人生效'
  if (role.value === NO_ROLE) return '对没有任何岗位的员工生效，例如分行一线员工'
  return `当前有 ${holders.value} 名人员持有该岗位；一个人持有多个岗位时，默认卡片取并集`
})
const isOn = (key) => (defaultsByRole[role.value] || []).includes(key)
function setOn(key, on) {
  const list = new Set(defaultsByRole[role.value] || [])
  on ? list.add(key) : list.delete(key)
  defaultsByRole[role.value] = [...list]
}
</script>

<style scoped>
.cfg { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; align-items: start; }
.roles { padding: 12px 8px; position: sticky; top: calc(var(--uem-topbar-h) + 16px); max-height: calc(100vh - var(--uem-topbar-h) - 32px); display: flex; flex-direction: column; }
.roles-head { padding: 4px 12px 8px; font-size: var(--uem-fs-sm); font-weight: 600; }
.roles-list { overflow-y: auto; }
.role-group { padding: 10px 12px 4px; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.role {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border: 0;
  border-radius: var(--uem-radius);
  background: transparent;
  font: inherit;
  font-size: var(--uem-fs-sm);
  color: var(--uem-ink-2);
  text-align: left;
  cursor: pointer;
}
.role:hover { background: var(--uem-hover); }
.role.on { background: var(--uem-red-soft); color: var(--uem-red); font-weight: 600; }
.role-name { flex: 1; min-width: 0; }
.role-n { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); font-variant-numeric: tabular-nums; }
.main { padding: 20px 24px; }
.main-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.main-head h2 { margin: 0; font-size: var(--uem-fs-lg); font-weight: 600; }
.main-head p { margin: 2px 0 0; font-size: var(--uem-fs-sm); color: var(--uem-ink-3); }
.main-head .uem-muted { font-size: var(--uem-fs-xs); }
.card-name { font-weight: 600; }
.need { font-size: var(--uem-fs-sm); color: var(--uem-ink-2); }
</style>

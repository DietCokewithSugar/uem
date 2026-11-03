<!-- 顶栏「切换演示身份」：在演示身份之间切换，菜单、首页卡片和数据范围随岗位变化 -->
<template>
  <el-dropdown trigger="click" placement="bottom-end" popper-class="persona-popper" @command="onSwitch">
    <button type="button" class="trigger" aria-label="切换演示身份">
      <span class="avatar">{{ (currentUser.name || '?').slice(0, 1) }}</span>
      <span class="who">
        <span class="name">{{ currentUser.name }}</span>
        <span class="role">{{ currentPersona?.title || '演示身份' }}</span>
      </span>
      <el-icon class="chev"><ArrowDown /></el-icon>
    </button>
    <template #dropdown>
      <div class="head">
        <b>切换演示身份</b>
        <span>不同身份看到的菜单、首页卡片和数据范围不同，岗位可在「人员维护」中调整</span>
      </div>
      <el-dropdown-menu>
        <el-dropdown-item v-for="p in personaOptions" :key="p.key" :command="p.key" class="opt">
          <div class="opt-body" :class="{ on: p.key === personaKey }">
            <div class="opt-top">
              <b>{{ p.title }}</b>
              <span class="opt-name">{{ p.person.name }} · {{ p.person.org }}</span>
              <el-icon v-if="p.key === personaKey" class="check"><Check /></el-icon>
            </div>
            <div class="opt-desc">{{ p.desc }}</div>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { currentUser } from '@/config/user'
import { personaOptions, currentPersona, personaKey, switchPersona } from '@/config/session'

const router = useRouter()
function onSwitch(key) {
  if (key === personaKey.value) return
  if (!switchPersona(key)) return ElMessage.warning('该身份对应的人员不存在或已冻结')
  router.push('/mainIndex')
  ElMessage.success(`已切换为「${currentPersona.value.title} · ${currentUser.name}」`)
}
</script>

<style scoped>
.trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 8px 0 4px;
  border: 1px solid transparent;
  border-radius: var(--uem-radius);
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.trigger:hover { background: var(--uem-hover); }
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--uem-line-2);
  color: var(--uem-ink-2);
  font-size: var(--uem-fs-sm);
  font-weight: 600;
}
.who { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.25; }
.name { font-size: var(--uem-fs-sm); font-weight: 600; color: var(--uem-ink); }
.role { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.chev { font-size: 12px; color: var(--uem-ink-3); }

.head { display: flex; flex-direction: column; gap: 2px; padding: 12px 16px 8px; max-width: 380px; }
.head b { font-size: var(--uem-fs-sm); color: var(--uem-ink); }
.head span { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); line-height: 1.5; }
.opt-body { width: 348px; padding: 4px 0; }
.opt-top { display: flex; align-items: baseline; gap: 8px; }
.opt-top b { font-size: var(--uem-fs-sm); color: var(--uem-ink); }
.opt-name { flex: 1; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.check { color: var(--uem-red); align-self: center; }
.opt-desc { font-size: var(--uem-fs-xs); color: var(--uem-ink-2); line-height: 1.5; white-space: normal; }
.on .opt-top b { color: var(--uem-red); }
</style>

<style>
.persona-popper .el-dropdown-menu__item { line-height: 1.5; padding: 6px 16px; align-items: flex-start; }
</style>

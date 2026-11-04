<!-- 平台外框：顶栏（工行标识、快速搜索、演示身份）+ 左侧导航 + 内容区 + 水印 -->
<template>
  <div class="app" :class="{ 'side-collapsed': collapsed }">
    <header class="topbar">
      <router-link to="/mainIndex" class="brand" aria-label="用户体验管理平台首页">
        <img :src="lockup" alt="中国工商银行 ICBC" class="brand-logo" width="78" height="28" />
        <span class="brand-divider" aria-hidden="true" />
        <span class="brand-name">用户体验管理平台</span>
        <span class="brand-tag">灵犀</span>
      </router-link>

      <button type="button" class="search" @click="palette = true">
        <el-icon><Search /></el-icon>
        <span class="search-text">搜索功能或优化建议编号</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div class="top-actions">
        <span class="env" title="本平台为行外演示环境，所有数据均为虚构，请勿录入真实客户信息或敏感数据">
          <el-icon><InfoFilled /></el-icon>演示环境
        </span>
        <PersonaSwitcher />
        <el-tooltip content="退出登录" placement="bottom">
          <button type="button" class="icon-btn" aria-label="退出登录" @click="logout"><el-icon><SwitchButton /></el-icon></button>
        </el-tooltip>
      </div>
    </header>

    <div class="frame">
      <SideNav :collapsed="collapsed" @toggle="toggleSide" />
      <main class="main">
        <router-view :key="sessionVersion" />
      </main>
    </div>

    <CommandPalette v-model="palette" />
    <Watermark :text="watermarkText" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { currentUser } from '@/config/user'
import { sessionVersion } from '@/config/session'
import Watermark from '@/components/Watermark.vue'
import SideNav from './SideNav.vue'
import PersonaSwitcher from './PersonaSwitcher.vue'
import CommandPalette from './CommandPalette.vue'
import lockup from '@/assets/brand/icbc-lockup.svg'

const SIDE_KEY = 'uem.side.collapsed'
const readSide = () => { try { return localStorage.getItem(SIDE_KEY) === '1' } catch { return false } }
const collapsed = ref(readSide())
function toggleSide() {
  collapsed.value = !collapsed.value
  try { localStorage.setItem(SIDE_KEY, collapsed.value ? '1' : '0') } catch {}
}

const palette = ref(false)
const onKey = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    palette.value = !palette.value
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const today = new Date().toISOString().slice(0, 10)
const watermarkText = computed(() => `${currentUser.name} ${currentUser.id} ${today} 演示环境`)

const logout = () => ElMessage.info('演示环境不支持退出登录，可在右上角切换演示身份')
</script>

<style scoped>
.app { min-height: 100%; display: flex; flex-direction: column; background: var(--uem-bg); }

.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--uem-topbar-h);
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px 0 20px;
  background: var(--uem-surface);
  border-bottom: 1px solid var(--uem-line);
  box-shadow: inset 0 2px 0 var(--uem-red);
}
.brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; min-width: calc(var(--uem-side-w) - 20px); }
.side-collapsed .brand { min-width: 0; }
.brand-logo { height: 28px; width: auto; display: block; }
.brand-divider { width: 1px; height: 18px; background: var(--uem-line); }
.brand-name { font-size: var(--uem-fs-md); font-weight: 600; color: var(--uem-ink); white-space: nowrap; }
.brand-tag {
  padding: 0 6px;
  border: 1px solid var(--uem-red-line);
  border-radius: var(--uem-radius-sm);
  color: var(--uem-red);
  font-size: var(--uem-fs-xs);
  line-height: 18px;
  white-space: nowrap;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 340px;
  max-width: 34vw;
  height: 34px;
  padding: 0 8px 0 12px;
  border: 1px solid var(--uem-line);
  border-radius: var(--uem-radius);
  background: var(--uem-surface-2);
  color: var(--uem-ink-3);
  font: inherit;
  font-size: var(--uem-fs-sm);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.search:hover { border-color: #cfd4db; background: var(--uem-surface); }
.search-text { flex: 1; text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.search kbd { font: 11px/1 var(--uem-font-mono); padding: 3px 6px; border: 1px solid var(--uem-line); border-radius: 4px; background: var(--uem-surface); color: var(--uem-ink-3); }

.top-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.env {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  height: 24px;
  border-radius: var(--uem-radius-sm);
  background: var(--uem-warning-soft);
  color: var(--uem-warning);
  font-size: var(--uem-fs-xs);
  white-space: nowrap;
}
.icon-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: var(--uem-radius);
  background: transparent;
  color: var(--uem-ink-3);
  font-size: 16px;
  cursor: pointer;
}
.icon-btn:hover { background: var(--uem-hover); color: var(--uem-ink); }

.frame { flex: 1; display: flex; min-height: 0; }
.main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .search-text { display: none; }
  .search { width: auto; }
  .env { display: none; }
}
</style>

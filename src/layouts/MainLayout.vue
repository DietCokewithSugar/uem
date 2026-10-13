<template>
  <div class="uem-app">
    <div v-if="showNotice" class="security-notice">
      <el-icon color="#c7000b"><WarningFilled /></el-icon>
      <span>本平台为行外演示环境，所有数据均为虚构，请勿录入真实客户信息或敏感数据</span>
      <el-icon class="close" @click="showNotice = false"><Close /></el-icon>
    </div>

    <header class="uem-header">
      <div class="header-top">
        <div class="brand">
          <span class="brand-en">ICBC</span>
          <span class="brand-logo">工</span>
          <span class="brand-name">用户体验管理平台</span>
          <span class="brand-sub">
            <el-icon><Opportunity /></el-icon>灵犀
            <small>让产品更贴心</small>
          </span>
        </div>
        <div class="user">
          <el-icon><Avatar /></el-icon>
          <span>欢迎你，{{ currentUser.name }}</span>
          <span class="logout" @click="logout"><el-icon><SwitchButton /></el-icon>退出</span>
        </div>
      </div>
      <nav class="nav">
        <router-link
          v-for="item in topNav"
          :key="item.key"
          :to="{ path: item.path, query: item.query }"
          class="nav-item"
          :class="{ active: activeSection === item.key }"
        >
          {{ item.title }}
        </router-link>
      </nav>
    </header>

    <main class="uem-main">
      <router-view />
    </main>

    <Watermark :text="watermarkText" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { topNav } from '@/config/menus'
import { currentUser } from '@/config/user'
import Watermark from '@/components/Watermark.vue'

const route = useRoute()
const showNotice = ref(true)
const activeSection = computed(() => route.meta.section)

const today = new Date().toISOString().slice(0, 10)
const watermarkText = `${currentUser.name} ${currentUser.id} ${today} 演示环境`

const logout = () => ElMessage.info('演示环境不支持退出登录')
</script>

<style scoped>
.uem-app { min-height: 100%; display: flex; flex-direction: column; }

.security-notice {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  background: #fff;
  font-size: 13px;
  color: #333;
}
.security-notice .close { position: absolute; right: 20px; cursor: pointer; color: #999; }

.uem-header {
  background:
    radial-gradient(ellipse at 70% -40%, rgba(255, 255, 255, 0.18), transparent 60%),
    repeating-radial-gradient(ellipse at 85% 140%, transparent 0 18px, rgba(255, 255, 255, 0.05) 18px 19px),
    linear-gradient(90deg, #c7000b, #d8121c 50%, #c7000b);
  color: #fff;
}
.header-top {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px;
}
.brand { display: flex; align-items: center; gap: 8px; }
.brand-en { font-size: 24px; font-weight: 600; letter-spacing: 1px; }
.brand-logo {
  width: 28px; height: 28px; border: 2px solid #fff; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
}
.brand-name { font-size: 22px; font-weight: 600; letter-spacing: 1px; }
.brand-sub { display: inline-flex; align-items: center; gap: 4px; margin-left: 16px; font-size: 20px; font-weight: 600; }
.brand-sub small { font-size: 13px; margin-left: 8px; font-weight: 500; }

.user { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.logout { display: inline-flex; align-items: center; gap: 2px; margin-left: 14px; cursor: pointer; }

.nav { display: flex; padding: 0 20px; height: 44px; background: rgba(0, 0, 0, 0.06); }
.nav-item {
  width: 146px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.92);
  transition: background 0.2s;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); }
.nav-item.active { font-weight: 700; color: #fff; background: rgba(0, 0, 0, 0.12); }

.uem-main { flex: 1; }
</style>

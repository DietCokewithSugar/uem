<!-- 声音分析智能工具入口（所有人可用） -->
<template>
  <HomeCard title="声音分析智能工具" subtitle="上传用户声音文件，批量识别并导出结果，自动脱敏手机号、证件号和卡号" more="/analyticsTools" more-text="打开">
    <div class="models">
      <span v-for="m in models" :key="m" class="hc-tag">{{ m }}</span>
    </div>
    <div class="hc-foot">
      <span>共 {{ toolDefs.length }} 个分析模型</span>
      <el-button type="primary" plain size="small" @click="router.push('/analyticsTools')">上传声音文件</el-button>
    </div>
  </HomeCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import HomeCard from '@/components/HomeCard.vue'
import { toolDefs } from '@/mock/voiceTools'

const router = useRouter()
const models = computed(() => toolDefs.slice(0, 6).map((t) => t.name))
</script>

<style scoped>
.models { display: flex; flex-wrap: wrap; gap: 6px; }
</style>

<!-- 提交优化建议：一句话描述，进入新增页由 AI 整理并识别字段（演示为规则模拟） -->
<template>
  <HomeCard title="提交优化建议" :subtitle="routeHint">
    <el-input
      id="quick-submit-text"
      v-model="text"
      type="textarea"
      :rows="4"
      resize="none"
      maxlength="500"
      placeholder="用一句话描述你发现的问题或客户的原话，例如：客户反映手机银行里找不到调整转账限额的入口，只能去网点办理"
      aria-label="优化建议描述"
    />
    <div class="actions">
      <span class="uem-ai-tag"><el-icon><MagicStick /></el-icon>AI 帮你整理成【现象】【建议】</span>
      <el-button type="primary" :disabled="!text.trim()" @click="next">下一步</el-button>
    </div>
  </HomeCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HomeCard from '@/components/HomeCard.vue'
import { currentUser } from '@/config/user'
import { suggestDraft } from '@/config/drafts'
import { isBranchOrg } from '@/mock/suggest'

const router = useRouter()
const text = ref('')
const routeHint = computed(() =>
  isBranchOrg(currentUser.dept) ? '提交后先由本行分行科技审核岗审批，再按产品自动分配处理' : '提交后按产品分类自动分配到对应研发部室的分拣岗'
)
function next() {
  suggestDraft.text = text.value.trim()
  router.push('/optimSuggestAdd')
}
</script>

<style scoped>
.actions { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
</style>

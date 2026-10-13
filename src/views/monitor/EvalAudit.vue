<!-- 评价数据审核 #/experEvalDataAudit：待审批 / 已处理 -->
<template>
  <div class="uem-card">
    <div class="head">
      <el-tabs v-model="tab" @tab-change="page = 1">
        <el-tab-pane label="待审批" name="pending" />
        <el-tab-pane label="已处理" name="done" />
      </el-tabs>
      <el-button type="primary" size="small" @click="sync">同步</el-button>
    </div>
    <el-table :data="rows" empty-text="暂无数据">
      <el-table-column type="index" label="序号" width="70" :index="(i) => (page - 1) * 10 + i + 1" />
      <el-table-column prop="title" label="数据同步申请" min-width="300">
        <template #default="{ row }"><span class="uem-link" @click="open(row)">{{ row.title }}</span></template>
      </el-table-column>
      <el-table-column prop="applyTime" label="申请时间" width="170" />
      <el-table-column prop="applicant" label="申请人" width="100" />
      <el-table-column prop="org" label="申请人所属机构" min-width="300" />
      <template v-if="tab === 'done'">
        <el-table-column prop="status" label="审批结果" width="90">
          <template #default="{ row }"><span :class="row.status === '已通过' ? 'ok' : 'warn'">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column prop="handleTime" label="处理时间" width="120" />
      </template>
    </el-table>
    <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="10" :total="list.length" />

    <el-dialog v-model="dialog" title="数据同步申请" width="720px">
      <template v-if="current">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请内容" :span="2">{{ current.title }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ current.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ current.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="所属机构" :span="2">{{ current.org }}</el-descriptions-item>
        </el-descriptions>
        <h4>待同步数据预览（工行品牌 · 各维度满意度）</h4>
        <el-table :data="preview" size="small" max-height="220">
          <el-table-column prop="dim" label="维度" />
          <el-table-column prop="item" label="指标" />
          <el-table-column prop="value" label="得分" width="80" />
        </el-table>
        <el-input v-if="current.status === '待审批'" v-model="comment" type="textarea" :rows="2" placeholder="审批意见（驳回时必填）" class="comment" />
        <p v-else class="comment">审批结果：{{ current.status }}　{{ current.comment }}</p>
      </template>
      <template #footer>
        <el-button @click="dialog = false">返回</el-button>
        <template v-if="current?.status === '待审批'">
          <el-button @click="handle(false)">驳回</el-button>
          <el-button type="primary" @click="handle(true)">通过并同步</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { auditRequests, brandData, months } from '@/mock/monitor'

const tab = ref('pending')
const page = ref(1)
const list = computed(() => auditRequests.filter((r) => (tab.value === 'pending' ? r.status === '待审批' : r.status !== '待审批')))
const rows = computed(() => list.value.slice((page.value - 1) * 10, page.value * 10))

const dialog = ref(false)
const current = ref(null)
const comment = ref('')
const preview = brandData[months[0]].dims.flatMap((d) => d.items.map(([item, value]) => ({ dim: d.name.replace('工行', ''), item, value })))
function open(row) {
  current.value = row
  comment.value = ''
  dialog.value = true
}
function handle(pass) {
  if (!pass && !comment.value.trim()) return ElMessage.warning('驳回时请填写审批意见')
  Object.assign(current.value, { status: pass ? '已通过' : '已驳回', comment: comment.value, handleTime: new Date().toISOString().slice(0, 10) })
  dialog.value = false
  ElMessage.success(pass ? '审批通过，数据已同步至工行品牌看板' : '已驳回')
}
function sync() {
  const n = auditRequests.filter((r) => r.status === '已通过').length
  ElMessage.success(`同步完成：已将 ${n} 条已通过的评价数据同步至品牌印象`)
}
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; }
.head :deep(.el-tabs__header) { margin: 0 0 8px; }
.pager { margin-top: 16px; justify-content: flex-end; }
h4 { margin: 16px 0 8px; }
.comment { margin-top: 12px; }
.ok { color: #3c9a5f; }
.warn { color: var(--uem-red); }
</style>

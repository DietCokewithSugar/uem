<!-- 质检报告详情 #/agentDetail?id=  综合报告 / 各角色报告；AB 对比沿用同一版式 -->
<template>
  <div v-if="report" class="uem-card detail">
    <div class="head">
      <div class="title-line">
        <b class="title">{{ report.title }}</b>
        <el-tag v-if="isAb" size="small" effect="plain" class="ab-tag">AB对比</el-tag>
        <span class="time">{{ report.createTime }}</span>
      </div>
      <div class="actions">
        <el-button size="small" plain type="primary" @click="router.push('/agentFirst')">返回列表</el-button>
        <el-button size="small" type="primary" @click="exportDoc"><el-icon><Download /></el-icon>导出当前报告</el-button>
      </div>
    </div>
    <div class="sub">
      <div class="tabs">
        <span v-for="t in tabs" :key="t.key" class="tab" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</span>
      </div>
      <span class="ai-note">AI 仅作为辅助来进行用户体验评价</span>
    </div>

    <section class="box">
      <div class="box-head">
        <b>测评素材</b>
        <a class="fold" @click="showMaterial = !showMaterial">{{ showMaterial ? '收起' : '展开' }}<el-icon><component :is="showMaterial ? 'ArrowUp' : 'ArrowDown'" /></el-icon></a>
      </div>
      <div v-show="showMaterial" class="materials" :class="{ ab: isAb }">
        <div v-for="(m, i) in report.materials" :key="i" class="shot">
          <div class="frame" :class="{ photo: !!m.src }"><ScreenThumb :material="m" /></div>
          <div v-if="m.version" class="cap" :class="m.version === '修改前' ? 'before' : 'after'">{{ m.version }}</div>
        </div>
      </div>
    </section>

    <div class="two">
      <section class="box">
        <b>执行摘要</b>
        <p v-for="(p, i) in summaryParas" :key="i">{{ p }}</p>
      </section>
      <section v-if="tab === 'all' && !isAb" class="box">
        <b>用户诉求</b>
        <p><strong>用户的根本诉求是</strong>{{ report.demand }}</p>
        <p><strong>体验关键词：</strong>{{ (report.keywords || []).join('、') }}</p>
      </section>
      <section v-else-if="tab === 'all'" class="box">
        <b>对比结论</b>
        <div class="verdict" :class="verdictClass(report.verdict)">{{ report.verdict }}</div>
        <p>{{ report.verdictreason }}</p>
        <p class="scene-label">场景说明</p>
        <p>{{ report.scenariosummary }}</p>
      </section>
      <section v-else class="box">
        <b>角色视角分析</b>
        <p>{{ roleView?.perspective }}</p>
      </section>
    </div>

    <section v-if="tab === 'all' && isAb" class="box">
      <b>可见差异</b>
      <el-table :data="report.differences" class="issue-table">
        <el-table-column prop="location" label="位置" width="140" />
        <el-table-column prop="before" label="修改前" min-width="180" />
        <el-table-column prop="after" label="修改后" min-width="180" />
        <el-table-column prop="usereffect" label="对用户的影响" min-width="180" />
      </el-table>
    </section>

    <section class="box">
      <b>维度详细解读</b>
      <div class="dims">
        <div v-for="d in activeDims" :key="d.name" class="dim">
          <div class="dim-head">
            <b>{{ d.name }}</b>
            <span v-if="d.change" class="change" :class="changeClass(d.change)">{{ d.change }}</span>
            <span v-if="isAb && d.beforescore != null" class="delta">{{ d.beforescore }} 分 → {{ d.afterscore }} 分</span>
          </div>
          <p>{{ d.text }}</p>
        </div>
      </div>
    </section>

    <section v-if="tab === 'all' && isAb && report.improvements?.length" class="box">
      <b>改版改善</b>
      <div v-for="(item, i) in report.improvements" :key="i" class="improve">
        <b>{{ item.location }}</b>
        <p>{{ item.description }}</p>
        <p class="value">对用户的价值：{{ item.uservalue }}</p>
      </div>
    </section>

    <section class="box">
      <div class="box-head">
        <b class="with-icon">发现的问题
          <el-tooltip placement="top-start" effect="light">
            <template #content>
              <div class="sev-tip">
                <p><b>一级问题：</b>常用功能且影响大，导致操作失败，损害用户利益。</p>
                <p><b>二级问题：</b>造成操作延迟或受挫，但不导致失败。</p>
                <p><b>三级问题：</b>仅影响使用感受，无明显阻碍。</p>
              </div>
            </template>
            <el-icon class="q"><QuestionFilled /></el-icon>
          </el-tooltip>
        </b>
        <span class="count">共 {{ activeIssues.length }} 条</span>
      </div>
      <el-table :data="issueRows" class="issue-table" empty-text="暂无问题">
        <el-table-column v-if="tab === 'all'" prop="roleName" label="角色" width="140" />
        <el-table-column label="严重程度" width="110">
          <template #default="{ row }"><span :class="sevClass(row.severity)">{{ row.severity }}</span></template>
        </el-table-column>
        <el-table-column v-if="isAb" label="变化类型" width="120">
          <template #default="{ row }"><span class="change" :class="changeTypeClass(row.changetype)">{{ row.changetype }}</span></template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="160" />
        <el-table-column prop="description" label="问题描述" min-width="220" />
        <el-table-column prop="recommendation" label="优化建议" min-width="200" />
        <el-table-column prop="reason" label="原因" min-width="220" />
      </el-table>
      <el-pagination
        v-if="activeIssues.length > issuePageSize"
        v-model:current-page="issuePage"
        class="pager"
        layout="total, prev, pager, next"
        :page-size="issuePageSize"
        :total="activeIssues.length"
      />
    </section>
  </div>
  <el-empty v-else description="报告不存在或已删除" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenThumb from '@/components/ScreenThumb.vue'
import { qcReports, qcRoles } from '@/mock/qc'

const route = useRoute()
const router = useRouter()
const report = computed(() => qcReports.find((r) => r.id === route.query.id))
const isAb = computed(() => report.value?.type === 'ab')
const roleName = (id) => qcRoles.find((r) => r.id === Number(id))?.name || '已删除角色'

const tab = ref('all')
const tabs = computed(() => {
  if (!report.value) return []
  return [{ key: 'all', label: '综合报告' }, ...report.value.roleIds.map((id) => ({ key: String(id), label: roleName(id) }))]
})
const roleView = computed(() => report.value?.roleViews?.[tab.value] || report.value?.roleViews?.[Number(tab.value)] || null)
const summaryParas = computed(() => {
  const source = tab.value === 'all' ? report.value?.summary : roleView.value?.summary
  if (!source) return []
  return Array.isArray(source) ? source : [source]
})
const activeDims = computed(() => (tab.value === 'all' ? report.value?.dimensions : roleView.value?.dimensions) || [])
const activeIssues = computed(() => (tab.value === 'all' ? report.value?.issues : roleView.value?.issues) || [])

const showMaterial = ref(true)
const issuePage = ref(1)
const issuePageSize = 8
const issueRows = computed(() => activeIssues.value.slice((issuePage.value - 1) * issuePageSize, issuePage.value * issuePageSize))
watch(tab, () => { issuePage.value = 1 })

function sevClass(s) {
  if (s === '一级问题') return 'sev sev-1'
  if (s === '二级问题') return 'sev sev-2'
  return 'sev sev-3'
}
function changeClass(s) {
  if (s === '提升') return 'up'
  if (s === '下降') return 'down'
  if (s === '持平') return 'flat'
  return 'na'
}
function changeTypeClass(s) {
  if (s === '改版新引入') return 'down'
  if (s === '改版后退步') return 'flat'
  return 'na'
}
function verdictClass(s) {
  if (s === '建议采纳修改后') return 'ok'
  if (s === '建议保留修改前') return 'bad'
  if (s === '建议局部采纳') return 'mid'
  return 'na'
}

function exportDoc() {
  const r = report.value
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const dims = activeDims.value
  const issues = activeIssues.value
  const heading = tab.value === 'all' ? '综合报告' : roleName(tab.value)
  const side = tab.value === 'all'
    ? (isAb.value
      ? `<h2>对比结论</h2><p>${esc(r.verdict)}</p><p>${esc(r.verdictreason)}</p><h2>场景说明</h2><p>${esc(r.scenariosummary)}</p>`
      : `<h2>用户诉求</h2><p>用户的根本诉求是${esc(r.demand)}</p><p>体验关键词：${esc((r.keywords || []).join('、'))}</p>`)
    : `<h2>角色视角分析</h2><p>${esc(roleView.value?.perspective)}</p>`
  const diffs = tab.value === 'all' && isAb.value
    ? `<h2>可见差异</h2><ul>${(r.differences || []).map((d) => `<li>${esc(d.location)}：修改前${esc(d.before)}修改后${esc(d.after)}${esc(d.usereffect)}</li>`).join('')}</ul>`
    : ''
  const improves = tab.value === 'all' && isAb.value
    ? `<h2>改版改善</h2><ul>${(r.improvements || []).map((d) => `<li>${esc(d.location)}：${esc(d.description)}对用户的价值：${esc(d.uservalue)}</li>`).join('')}</ul>`
    : ''
  const html = `<html><head><meta charset="utf-8"><title>${esc(r.title)}</title></head><body>
<h1>${esc(r.title)}</h1><p>${esc(r.createTime)}　${esc(heading)}　AI 仅作为辅助来进行用户体验评价</p>
<h2>执行摘要</h2>${summaryParas.value.map((p) => `<p>${esc(p)}</p>`).join('')}
${side}${diffs}
<h2>维度详细解读</h2>${dims.map((d) => `<h3>${esc(d.name)}${d.change ? `（${esc(d.change)}）` : ''}</h3><p>${esc(d.text)}</p>`).join('')}
${improves}
<h2>发现的问题</h2><ol>${issues.map((x) => `<li>【${esc(x.severity)}】${x.roleName && tab.value === 'all' ? esc(x.roleName) + '，' : ''}${esc(x.location)}：${esc(x.description)}优化建议：${esc(x.recommendation)}原因：${esc(x.reason)}</li>`).join('')}</ol>
</body></html>`
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'application/msword' }))
  a.download = `${r.title}-${heading}.doc`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.title-line { display: flex; align-items: center; gap: 8px; min-width: 0; }
.title { font-size: 16px; color: #333; }
.ab-tag { border-color: var(--uem-red); color: var(--uem-red); }
.time { color: #999; font-size: 12px; }
.sub { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin: 16px 0; }
.tabs { display: flex; gap: 10px; flex-wrap: wrap; }
.tab { padding: 4px 16px; border: 1px solid #ddd; border-radius: 14px; font-size: 12px; color: #555; cursor: pointer; background: #fff; }
.tab.active { border-color: var(--uem-red); color: var(--uem-red); }
.ai-note { flex: none; font-size: 12px; color: #888; line-height: 28px; }
.box { border: 1px solid #eee; border-radius: 4px; padding: 16px 20px; margin-bottom: 16px; font-size: 13px; color: #555; line-height: 1.8; }
.box > b, .box-head > b { color: #333; font-size: 14px; display: block; margin-bottom: 8px; }
.box p { margin: 0 0 8px; }
.box-head { display: flex; justify-content: space-between; align-items: center; }
.box-head > b { margin-bottom: 0; }
.with-icon { display: inline-flex; align-items: center; gap: 4px; }
.q { color: #c0c4cc; cursor: pointer; font-size: 14px; }
.count { color: #999; font-size: 12px; }
.fold { color: #3a6fd8; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 2px; }
.materials { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; padding: 12px 0 4px; }
.frame { width: 280px; height: 168px; border: 1px solid #eee; border-radius: 4px; overflow: hidden; background: #f7f8fa; }
.frame.photo { width: 180px; height: 320px; }
.frame.photo :deep(.img) { object-fit: contain; background: #f7f8fa; }
.cap { margin-top: 8px; text-align: center; font-size: 13px; }
.cap.before { color: #888; }
.cap.after { color: var(--uem-red); }
.two { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; }
.dims { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dim { border: 1px solid #f0f0f0; border-radius: 4px; padding: 12px 14px; background: #fff; }
.dim-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.dim-head b { color: #333; font-size: 14px; }
.dim p { margin: 0; }
.change { font-size: 12px; line-height: 20px; padding: 0 8px; border-radius: 10px; font-weight: 500; }
.change.up { color: #1f8a4c; background: #e8f7ee; }
.change.down { color: #c7000b; background: #fdeceb; }
.change.flat { color: #8a6d1a; background: #fbf6e8; }
.change.na { color: #888; background: #f4f4f5; }
.delta { margin-left: auto; color: #999; font-size: 12px; }
.verdict { display: inline-block; margin-bottom: 8px; padding: 2px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.verdict.ok { color: #1f8a4c; background: #e8f7ee; }
.verdict.bad { color: #c7000b; background: #fdeceb; }
.verdict.mid { color: #a15c07; background: #fff4e5; }
.verdict.na { color: #666; background: #f4f4f5; }
.scene-label { margin-top: 12px; color: #333; font-weight: 600; }
.improve { margin-top: 8px; padding: 8px 12px; border-left: 3px solid #1f8a4c; background: #f7fbf8; }
.improve b { color: #333; }
.improve .value { color: #888; }
.sev { font-weight: 600; }
.sev-1 { color: #c7000b; }
.sev-2 { color: #e6a23c; }
.sev-3 { color: #909399; }
.sev-tip { width: 320px; font-size: 12px; line-height: 1.6; color: #555; }
.sev-tip p { margin: 0 0 6px; }
.issue-table { margin-top: 12px; }
.issue-table :deep(.cell) { white-space: normal; line-height: 1.6; }
.pager { margin-top: 12px; justify-content: flex-end; }
@media (max-width: 1100px) {
  .two, .dims { grid-template-columns: 1fr; }
}
</style>

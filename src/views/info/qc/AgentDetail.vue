<!-- 质检报告详情 #/agentDetail?id=  综合报告 / 各角色报告；AB方案对比报告对比同一业务场景下A方案、B方案两套设计 -->
<template>
  <div v-if="report" class="uem-card detail">
    <div class="head">
      <div class="title-line">
        <b class="title">{{ report.title }}</b>
        <el-tag v-if="isAb" size="small" effect="plain" class="ab-tag">AB方案对比</el-tag>
        <span class="time">{{ report.createTime }}</span>
      </div>
      <div class="actions">
        <el-button size="small" plain type="primary" @click="router.push('/agentFirst')">返回列表</el-button>
        <el-button size="small" type="primary" @click="exportDoc"><el-icon><Download /></el-icon>导出当前报告</el-button>
      </div>
    </div>
    <div class="sub">
      <div class="tabs">
        <span v-for="t in tabs" :key="t.key" class="tab" :class="{ active: tab === t.key }" @click="tab = t.key">
          {{ t.label }}<span v-if="t.choice" class="tab-plan" :class="planCls(t.choice)" :title="`选择${planLabel(t.choice)}`">{{ t.choice }}</span>
        </span>
      </div>
      <span class="ai-note">AI 仅作为辅助来进行用户体验评价</span>
    </div>

    <section class="box">
      <div class="box-head">
        <b>测评素材</b>
        <a class="fold" @click="showMaterial = !showMaterial">{{ showMaterial ? '收起' : '展开' }}<el-icon><component :is="showMaterial ? 'ArrowUp' : 'ArrowDown'" /></el-icon></a>
      </div>
      <div v-if="isAb" v-show="showMaterial" class="plan-materials">
        <div v-for="side in planSides" :key="side.key" class="plan-col">
          <div class="plan-col-head"><span class="plan" :class="side.cls">{{ side.label }}</span><span class="count">{{ side.items.length }} 张</span></div>
          <div class="materials">
            <div v-for="(m, i) in side.items" :key="i" class="shot">
              <div class="frame" :class="{ photo: !!m.src }"><ScreenThumb :material="m" /></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else v-show="showMaterial" class="materials">
        <div v-for="(m, i) in report.materials" :key="i" class="shot">
          <div class="frame" :class="{ photo: !!m.src }"><ScreenThumb :material="m" /></div>
        </div>
      </div>
    </section>

    <section v-if="!isAb && businessRows.length" class="box">
      <b>业务场景与目标</b>
      <p class="from">{{ businessSource }}</p>
      <div class="biz">
        <template v-for="row in businessRows" :key="row[0]">
          <span>{{ row[0] }}</span>
          <p>{{ row[1] }}</p>
        </template>
      </div>
    </section>

    <template v-if="!isAb">
      <div class="two">
        <section class="box">
          <b>执行摘要</b>
          <p v-for="(p, i) in summaryParas" :key="i">{{ p }}</p>
        </section>
        <section v-if="tab === 'all'" class="box">
          <b>用户诉求</b>
          <p><strong>用户的根本诉求是</strong>{{ report.demand }}</p>
          <p><strong>体验关键词：</strong>{{ (report.keywords || []).join('、') }}</p>
        </section>
        <section v-else class="box">
          <b>角色视角分析</b>
          <p>{{ roleView?.perspective }}</p>
        </section>
      </div>

      <section class="box">
        <b>维度详细解读</b>
        <div class="dims">
          <div v-for="d in activeDims" :key="d.name" class="dim">
            <div class="dim-head"><b>{{ d.name }}</b></div>
            <p>{{ d.text }}</p>
          </div>
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
    </template>

    <template v-else-if="tab === 'all'">
      <section class="box">
        <b>总结</b>
        <div class="vote">
          <div class="vote-bar">
            <span v-for="key in PLAN_KEYS" v-show="votes[key].length" :key="key" class="seg" :class="planCls(key)" :style="{ flex: votes[key].length }">{{ planLabel(key) }} {{ votes[key].length }} 人</span>
          </div>
          <div class="vote-names">
            <p v-for="key in PLAN_KEYS" :key="key"><span class="plan" :class="planCls(key)">选择{{ planLabel(key) }}</span>{{ votes[key].length ? votes[key].map(roleName).join('、') : '无' }}</p>
          </div>
        </div>
        <p v-for="(p, i) in summaryParas" :key="i">{{ p }}</p>
      </section>

      <section class="box">
        <div class="box-head"><b>可见差异</b><span class="count">共 {{ report.differences?.length || 0 }} 处</span></div>
        <p class="note">汇总各角色对每一处差异的倾向，并归纳原因。</p>
        <el-table :data="report.differences || []" class="issue-table" empty-text="暂无差异">
          <el-table-column label="位置" min-width="200">
            <template #default="{ row }"><b class="loc">{{ row.location }}</b></template>
          </el-table-column>
          <el-table-column prop="a" label="A方案" min-width="170" />
          <el-table-column prop="b" label="B方案" min-width="170" />
          <el-table-column label="角色倾向" width="128">
            <template #default="{ row }">
              <div class="lean"><span v-for="key in PLAN_KEYS" :key="key" class="plan" :class="[planCls(key), { zero: !row.votes?.[key] }]">{{ planLabel(key) }} {{ row.votes?.[key] || 0 }}人</span></div>
            </template>
          </el-table-column>
          <el-table-column prop="conclusion" label="归纳" min-width="220" />
        </el-table>
      </section>
    </template>

    <template v-else-if="roleView">
      <section class="box">
        <b class="with-tag">对比结论<span class="plan" :class="planCls(roleView.choice)">选择{{ planLabel(roleView.choice) }}</span></b>
        <p>{{ roleView.conclusion }}</p>
      </section>

      <section class="box">
        <div class="box-head"><b>可见差异</b><span class="count">共 {{ roleView.differences?.length || 0 }} 处</span></div>
        <p class="note">该角色注意到的差异，以及在每一处倾向哪套方案、为什么。</p>
        <el-table :data="roleView.differences || []" class="issue-table" empty-text="暂无差异">
          <el-table-column label="位置" min-width="210">
            <template #default="{ row }"><b class="loc">{{ row.location }}</b></template>
          </el-table-column>
          <el-table-column prop="a" label="A方案" min-width="170" />
          <el-table-column prop="b" label="B方案" min-width="170" />
          <el-table-column label="角色倾向" width="116">
            <template #default="{ row }"><span class="plan" :class="planCls(row.choice)">{{ planLabel(row.choice) }}</span></template>
          </el-table-column>
          <el-table-column prop="reason" label="选择原因" min-width="210" />
        </el-table>
      </section>
    </template>

    <template v-if="isAb && (tab === 'all' || roleView)">
      <section class="box">
        <b class="with-tag">维度差异<span class="ets-note">基于ETS维度进行分析</span></b>
        <p class="lead">{{ dimLead }}</p>
        <div v-for="dim in abDimDiffs" :key="dim.name" class="dim-diff">
          <div class="dim-diff-head">
            <b>{{ dim.name }}</b>
            <span class="count">{{ dim.items.length }} 项指标有差异<template v-if="tab === 'all' && dim.roles"> · {{ dim.roles }} 个角色涉及</template></span>
          </div>
          <div v-for="item in dim.items" :key="item.code" class="crit">
            <div class="crit-head"><b>{{ item.name }}</b><span class="plan" :class="planCls(item.better)">{{ planLabel(item.better) }}更符合</span></div>
            <p class="crit-desc">指标含义：{{ item.desc }}</p>
            <p class="crit-side"><span class="plan a">A方案</span>{{ item.a }}</p>
            <p class="crit-side"><span class="plan b">B方案</span>{{ item.b }}</p>
          </div>
        </div>
      </section>

      <section v-if="tab === 'all'" class="box">
        <div class="box-head"><b>优化建议</b><span class="count">共 {{ report.suggestions?.length || 0 }} 条</span></div>
        <p class="note">汇总各角色提出的优化建议。</p>
        <el-table :data="report.suggestions || []" class="issue-table" empty-text="暂无建议">
          <el-table-column label="提出角色" min-width="180">
            <template #default="{ row }">{{ (row.roles || []).join('、') }}</template>
          </el-table-column>
          <el-table-column prop="location" label="位置" min-width="210" />
          <el-table-column prop="text" label="优化建议" min-width="260" />
          <el-table-column prop="reason" label="理由" min-width="200" />
        </el-table>
      </section>
      <section v-else class="box">
        <div class="box-head"><b>优化建议</b><span class="count">共 {{ roleView.suggestions?.length || 0 }} 条</span></div>
        <p class="note">从该角色的需求和期待出发给出整体建议，不局限于两套方案之间的差异。</p>
        <el-table :data="roleView.suggestions || []" class="issue-table" empty-text="暂无建议">
          <el-table-column prop="location" label="位置" min-width="210" />
          <el-table-column prop="text" label="优化建议" min-width="280" />
          <el-table-column prop="reason" label="理由" min-width="220" />
        </el-table>
      </section>
    </template>
  </div>
  <el-empty v-else description="报告不存在或已删除" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenThumb from '@/components/ScreenThumb.vue'
import { qcReports, qcRoles, abVotes, PLAN_KEYS, planLabel } from '@/mock/qc'

const route = useRoute()
const router = useRouter()
const report = computed(() => qcReports.find((r) => r.id === route.query.id))
const isAb = computed(() => report.value?.type === 'ab')
const businessRows = computed(() => {
  const business = report.value?.business
  if (!business) return []
  return [
    ['产品类型', business.category],
    ['评测目标', business.businessgoal],
    ['关键任务流', business.keytasks],
    ['用户痛点', business.painpoints],
    ['成功标准', business.successcriteria],
    ['约束条件', business.constraints]
  ].filter(([, value]) => value)
})
const businessSource = computed(() => {
  const business = report.value?.business
  if (!business) return ''
  return business.fromPrompt ? `由提示词「${business.promptName || '质检工具（文件分析）'}」提炼，提交前可修改` : '人工填写'
})
const roleName = (id) => qcRoles.find((r) => r.id === Number(id))?.name || '已删除角色'
const planCls = (key) => String(key || '').toLowerCase()

const tab = ref('all')
const tabs = computed(() => {
  if (!report.value) return []
  return [
    { key: 'all', label: '综合报告' },
    ...report.value.roleIds.map((id) => ({ key: String(id), label: roleName(id), choice: isAb.value ? report.value.roleViews?.[id]?.choice : '' }))
  ]
})
const roleView = computed(() => report.value?.roleViews?.[tab.value] || report.value?.roleViews?.[Number(tab.value)] || null)
const summaryParas = computed(() => {
  const source = tab.value === 'all' ? report.value?.summary : roleView.value?.summary
  if (!source) return []
  return Array.isArray(source) ? source : [source]
})
const activeDims = computed(() => (tab.value === 'all' ? report.value?.dimensions : roleView.value?.dimensions) || [])
const activeIssues = computed(() => (tab.value === 'all' ? report.value?.issues : roleView.value?.issues) || [])

const planSides = computed(() => PLAN_KEYS.map((key) => ({
  key,
  label: planLabel(key),
  cls: planCls(key),
  items: (report.value?.materials || []).filter((m) => m.version === planLabel(key))
})))
const votes = computed(() => abVotes(report.value))
const abDimDiffs = computed(() => (tab.value === 'all' ? report.value?.dimensionDiffs : roleView.value?.dimensionDiffs) || [])
const dimLead = computed(() => {
  const names = abDimDiffs.value.map((dim) => dim.name)
  if (!names.length) return 'A、B方案在 ETS 八个维度上未发现可见差异。'
  if (tab.value !== 'all') return `${roleName(tab.value)}注意到的差异涉及${names.join('、')} ${names.length} 个维度，以下只展示有差异的指标。`
  const same = report.value?.sameDimensions || []
  return `A、B方案在${names.join('、')} ${names.length} 个维度存在差异${same.length ? `；${same.join('、')}未发现可见差异` : ''}。以下按维度归纳有差异的指标。`
})

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

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

function abExportBody() {
  const r = report.value
  const dims = `<h2>维度差异（基于ETS维度进行分析）</h2><p>${esc(dimLead.value)}</p>${abDimDiffs.value.map((dim) => `<h3>${esc(dim.name)}</h3><ul>${dim.items.map((item) => `<li>${esc(item.name)}（${esc(planLabel(item.better))}更符合）<br>指标含义：${esc(item.desc)}<br>A方案：${esc(item.a)}<br>B方案：${esc(item.b)}</li>`).join('')}</ul>`).join('')}`
  if (tab.value === 'all') {
    const voteLine = PLAN_KEYS.map((key) => `选择${planLabel(key)} ${votes.value[key].length} 人：${esc(votes.value[key].map(roleName).join('、') || '无')}`).join('<br>')
    return `<h2>总结</h2><p>${voteLine}</p>${summaryParas.value.map((p) => `<p>${esc(p)}</p>`).join('')}
<h2>可见差异</h2><ol>${(r.differences || []).map((d) => `<li>${esc(d.location)}<br>A方案：${esc(d.a)}<br>B方案：${esc(d.b)}<br>角色倾向：A方案 ${d.votes?.A || 0} 人，B方案 ${d.votes?.B || 0} 人<br>归纳：${esc(d.conclusion)}</li>`).join('')}</ol>
${dims}
<h2>优化建议</h2><ol>${(r.suggestions || []).map((s) => `<li>${esc(s.location)}：${esc(s.text)}<br>理由：${esc(s.reason)}<br>提出角色：${esc((s.roles || []).join('、'))}</li>`).join('')}</ol>`
  }
  const v = roleView.value || {}
  const choice = `选择${planLabel(v.choice)}`
  return `<h2>对比结论（${esc(choice)}）</h2><p>${esc(v.conclusion)}</p>
<h2>可见差异</h2><ol>${(v.differences || []).map((d) => `<li>${esc(d.location)}<br>A方案：${esc(d.a)}<br>B方案：${esc(d.b)}<br>角色倾向：${esc(planLabel(d.choice))}<br>选择原因：${esc(d.reason)}</li>`).join('')}</ol>
${dims}
<h2>优化建议</h2><ol>${(v.suggestions || []).map((s) => `<li>${esc(s.location)}：${esc(s.text)}<br>理由：${esc(s.reason)}</li>`).join('')}</ol>`
}

function standardExportBody() {
  const r = report.value
  const side = tab.value === 'all'
    ? `<h2>用户诉求</h2><p>用户的根本诉求是${esc(r.demand)}</p><p>体验关键词：${esc((r.keywords || []).join('、'))}</p>`
    : `<h2>角色视角分析</h2><p>${esc(roleView.value?.perspective)}</p>`
  return `<h2>执行摘要</h2>${summaryParas.value.map((p) => `<p>${esc(p)}</p>`).join('')}
${side}
<h2>维度详细解读</h2>${activeDims.value.map((d) => `<h3>${esc(d.name)}</h3><p>${esc(d.text)}</p>`).join('')}
<h2>发现的问题</h2><ol>${activeIssues.value.map((x) => `<li>【${esc(x.severity)}】${x.roleName && tab.value === 'all' ? esc(x.roleName) + '，' : ''}${esc(x.location)}：${esc(x.description)}优化建议：${esc(x.recommendation)}原因：${esc(x.reason)}</li>`).join('')}</ol>`
}

function exportDoc() {
  const r = report.value
  const heading = tab.value === 'all' ? '综合报告' : roleName(tab.value)
  const biz = !isAb.value && businessRows.value.length
    ? `<h2>业务场景与目标</h2><p>${esc(businessSource.value)}</p><ul>${businessRows.value.map(([k, v]) => `<li>${esc(k)}：${esc(v)}</li>`).join('')}</ul>`
    : ''
  const html = `<html><head><meta charset="utf-8"><title>${esc(r.title)}</title></head><body>
<h1>${esc(r.title)}${isAb.value ? '（AB方案对比）' : ''}</h1><p>${esc(r.createTime)}　${esc(heading)}　AI 仅作为辅助来进行用户体验评价</p>
${biz}
${isAb.value ? abExportBody() : standardExportBody()}
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
.tab { display: inline-flex; align-items: center; gap: 6px; padding: 4px 16px; border: 1px solid #ddd; border-radius: 14px; font-size: 12px; color: #555; cursor: pointer; background: #fff; }
.tab.active { border-color: var(--uem-red); color: var(--uem-red); }
.tab-plan { width: 16px; height: 16px; border-radius: 50%; font-size: 11px; line-height: 16px; text-align: center; color: #fff; }
.tab-plan.a { background: #2f6fde; }
.tab-plan.b { background: #d46b08; }
.ai-note { flex: none; font-size: 12px; color: #888; line-height: 28px; }
.box { border: 1px solid #eee; border-radius: 4px; padding: 16px 20px; margin-bottom: 16px; font-size: 13px; color: #555; line-height: 1.8; }
.box > b, .box-head > b { color: #333; font-size: 14px; display: block; margin-bottom: 8px; }
.box p { margin: 0 0 8px; }
.box > b.with-tag { display: flex; align-items: center; gap: 8px; }
.from, .note { color: #999; font-size: 12px; }
.biz { display: grid; grid-template-columns: 88px 1fr; gap: 8px 12px; margin-top: 8px; }
.biz span { color: #888; }
.biz p { margin: 0; }
.box-head { display: flex; justify-content: space-between; align-items: center; }
.box-head > b { margin-bottom: 0; }
.box-head + .note { margin-top: 4px; }
.with-icon { display: inline-flex; align-items: center; gap: 4px; }
.q { color: #c0c4cc; cursor: pointer; font-size: 14px; }
.count { color: #999; font-size: 12px; font-weight: normal; }
.fold { color: #3a6fd8; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 2px; }
.materials { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; padding: 12px 0 4px; }
.frame { width: 280px; height: 168px; border: 1px solid #eee; border-radius: 4px; overflow: hidden; background: #f7f8fa; }
.frame.photo { width: 180px; height: 320px; }
.frame.photo :deep(.img) { object-fit: contain; background: #f7f8fa; }
.two { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; }
.dims { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dim { border: 1px solid #f0f0f0; border-radius: 4px; padding: 12px 14px; background: #fff; }
.dim-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.dim-head b { color: #333; font-size: 14px; }
.dim p { margin: 0; }
.sev { font-weight: 600; }
.sev-1 { color: #c7000b; }
.sev-2 { color: #e6a23c; }
.sev-3 { color: #909399; }
.sev-tip { width: 320px; font-size: 12px; line-height: 1.6; color: #555; }
.sev-tip p { margin: 0 0 6px; }
.issue-table { margin-top: 12px; }
.issue-table :deep(.cell) { white-space: normal; line-height: 1.6; }
.pager { margin-top: 12px; justify-content: flex-end; }

/* AB方案对比：A方案蓝、B方案橙，两者并列，不代表先后或好坏 */
.plan { display: inline-block; flex: none; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 20px; font-weight: 500; white-space: nowrap; }
.plan.a { color: #2f6fde; background: #eef3fd; }
.plan.b { color: #d46b08; background: #fff4e6; }
.plan.zero { color: #aaa; background: #f4f4f5; }
.plan-materials { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 8px; }
.plan-col { border: 1px solid #f0f0f0; border-radius: 4px; padding: 10px 12px; }
.plan-col-head { display: flex; align-items: center; justify-content: space-between; }
.vote { margin: 4px 0 12px; }
.vote-bar { display: flex; height: 28px; border-radius: 14px; overflow: hidden; background: #f4f4f5; }
.seg { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; white-space: nowrap; padding: 0 10px; }
.seg.a { background: #2f6fde; }
.seg.b { background: #d46b08; }
.vote-names { margin-top: 10px; }
.vote-names p { display: flex; align-items: center; gap: 8px; margin: 0 0 4px; }
.loc { color: #333; }
.lean { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.ets-note { font-size: 12px; font-weight: normal; color: #999; }
.lead { color: #333; }
.dim-diff { border: 1px solid #f0f0f0; border-radius: 4px; padding: 12px 14px; margin-top: 12px; }
.dim-diff-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dim-diff-head b { color: #333; font-size: 14px; }
.crit { margin-top: 10px; padding: 8px 12px; background: #fafafa; border-radius: 4px; }
.crit-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.crit-head b { color: #333; }
.crit-desc { color: #999; font-size: 12px; margin: 2px 0 6px !important; }
.crit-side { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 4px !important; }
@media (max-width: 1100px) {
  .two, .dims, .plan-materials { grid-template-columns: 1fr; }
}
</style>

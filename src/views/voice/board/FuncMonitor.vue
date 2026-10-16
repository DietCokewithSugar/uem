<!-- 声音看板 · 功能监测：按 产品 + 功能栏目 展开旅程阶段的典型问题与优化点 -->
<template>
  <div>
    <KpiRow :items="kpis" />

    <Panel title="旅程典型问题" class="block">
      <div class="journey-name">旅程名称：<span class="j-tab">{{ m.journey }}</span></div>
      <div class="map-scroll">
        <div class="map" :style="{ gridTemplateColumns: `56px repeat(${m.stages.length}, 220px)` }">
          <div class="row-label stage-label">阶段</div>
          <div v-for="(st, i) in m.stages" :key="st.name" class="stage" :class="{ first: !i }">{{ st.name }}</div>

          <div class="row-label vertical"><span v-for="c in '典型问题'" :key="c">{{ c }}</span></div>
          <div v-for="st in m.stages" :key="st.name + 'p'" class="cell">
            <span class="count">典型问题数 {{ st.count }}</span>
            <ol><li v-for="p in st.problems" :key="p">{{ p }}</li></ol>
          </div>

          <div class="row-label vertical"><span v-for="c in '优化点'" :key="c">{{ c }}</span></div>
          <div v-for="st in m.stages" :key="st.name + 'o'" class="cell opt">
            <ol><li v-for="o in st.optimizations" :key="o">{{ o }}</li></ol>
          </div>
        </div>
      </div>
    </Panel>

    <Panel title="典型问题与优化点明细" class="block">
      <div class="filters">
        <span>旅程行为</span>
        <el-select v-model="q.action" clearable placeholder="请选择旅程行为"><el-option v-for="s in m.stages" :key="s.name" :label="s.name" :value="s.name" /></el-select>
        <span>关键字</span>
        <el-input v-model="q.keyword" clearable placeholder="请输入关键字" />
        <span>转处理情况</span>
        <el-select v-model="q.handled" clearable placeholder="请选择处理情况"><el-option v-for="h in ['未处理', '已转优化建议']" :key="h" :label="h" :value="h" /></el-select>
        <el-button type="primary" @click="applied = { ...q }; page = 1">查询</el-button>
        <el-button @click="Object.assign(q, blank()); applied = blank()">重置</el-button>
      </div>
      <div class="uem-toolbar"><AsyncExport name="典型问题与优化点明细" :columns="exportCols" :rows="exportRows" compact /></div>
      <el-table :data="rows">
        <el-table-column type="index" label="编号" width="60" :index="(i) => (page - 1) * 10 + i + 1" />
        <el-table-column prop="text" label="典型问题描述" min-width="170" />
        <el-table-column prop="optimization" label="优化点" min-width="200" />
        <el-table-column prop="product" label="产品名称" width="120" />
        <el-table-column prop="column" label="功能栏目" width="90" />
        <el-table-column prop="action" label="旅程行为" width="110" />
        <el-table-column prop="voices" label="覆盖声音数" width="90" sortable />
        <el-table-column label="对应用户声音举例" min-width="200">
          <template #default="{ row }"><div v-for="(e, i) in row.examples" :key="i" class="example">{{ i + 1 }}.{{ e }}</div></template>
        </el-table-column>
        <el-table-column prop="handled" label="转处理情况" width="100" />
        <el-table-column label="操作" width="108">
          <template #default="{ row }">
            <el-button v-if="row.handled === '未处理'" link type="primary" @click="toSuggestion(row)">转优化建议</el-button>
            <el-button v-else link type="primary" @click="viewSuggestion(row)">查看建议</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next" :page-size="10" :total="filtered.length" />
    </Panel>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Panel from '@/components/Panel.vue'
import AsyncExport from '@/components/AsyncExport.vue'
import KpiRow from './KpiRow.vue'
import { funcMonitor as m, funcProblemRows } from '@/mock/voice'
import { createSuggestion, findSuggestion, detailRoute, impacts } from '@/mock/suggest'
import { productList } from '@/mock/system'

const router = useRouter()
const kpis = [
  { label: '有效用户声音总数', value: m.valid, unit: '条', sub: `较上期 ${m.diff} 条　　有效率 ${m.validRate}%` },
  { label: '用户声音压力指数等级', value: m.pressure, text: true, tip: '综合负面声音占比、情绪强度与声音增速计算', sub: `上期用户声音压力指数等级：${m.lastPressure}` },
  { label: '典型问题总数', value: m.problemTotal, unit: '条', sub: `较上期 ${m.problemDiff} 条` }
]

const blank = () => ({ action: '', keyword: '', handled: '' })
const q = reactive(blank())
const applied = ref(blank())
const page = ref(1)
const filtered = computed(() =>
  funcProblemRows.filter(
    (r) =>
      (!applied.value.action || r.action === applied.value.action) &&
      (!applied.value.keyword || r.text.includes(applied.value.keyword) || r.optimization.includes(applied.value.keyword)) &&
      (!applied.value.handled || r.handled === applied.value.handled)
  )
)
const rows = computed(() => filtered.value.slice((page.value - 1) * 10, page.value * 10))
const exportCols = [
  { prop: 'text', label: '典型问题描述' }, { prop: 'optimization', label: '优化点' }, { prop: 'product', label: '产品名称' }, { prop: 'column', label: '功能栏目' },
  { prop: 'action', label: '旅程行为' }, { prop: 'voices', label: '覆盖声音数' }, { prop: 'exampleText', label: '对应用户声音举例' }, { prop: 'handled', label: '转处理情况' }
]
const exportRows = computed(() => filtered.value.map((r) => ({ ...r, exampleText: r.examples.join('；') })))

// 典型问题 → 优化建议：按产品路由至对应产品线（打通声音分析与问题处理闭环）
// 声音看板产品 → 产品维护中的产品名称及产品使用渠道（映射为推测）
const productAlias = { 融e行基础业务: '个人手机银行基础业务', '融e行-投资理财': '实物贵金属', '融e行-信用卡': '个人信用卡', 云工行: '云网点' }
const channelOf = { 企业手机银行: '手机APP-企业手机银行', 数字人民币: '手机APP-数字货币', 工银e生活: '手机APP-工银e生活', 境外个人手机银行: '手机APP-境外个人手机银行' }
function productOf(name) {
  const usable = (n) => productList.some((p) => p.name === n && p.state !== '已废弃')
  if (usable(name)) return name
  return usable(productAlias[name]) ? productAlias[name] : '个人手机银行基础业务'
}

async function toSuggestion(row) {
  const product = productOf(row.product)
  try {
    await ElMessageBox.confirm(`将典型问题「${row.text}」转为优化建议？提交后按产品「${product}」流转至对应产品线处理。`, '转优化建议', { type: 'info' })
  } catch {
    return
  }
  const s = createSuggestion({
    product,
    channels: [channelOf[product] || '手机APP-个人手机银行'],
    column: `${row.column}-${row.action}`,
    desc: `【现象】${row.text}（覆盖用户声音 ${row.voices} 条）\n【建议】${row.optimization}`,
    source: '客户：app用户反馈',
    category: '功能流程',
    impact: impacts[2]
  })
  row.handled = '已转优化建议'
  row.suggestionSeq = s.seq
  ElMessage.success(`已转为优化建议，当前状态：${s.status}${s.currentHandler ? `，当前处理人：${s.currentHandler}` : ''}`)
}
// 查看建议：进入转出的优化建议详情（来源菜单记为全部列表）
function viewSuggestion(row) {
  const s = row.suggestionSeq && findSuggestion(row.suggestionSeq)
  router.push(s ? detailRoute(s, '全部列表', [s]) : '/optimSuggestions')
}
</script>

<style scoped>
.block { margin-top: 16px; }
.journey-name { font-size: 13px; color: #333; margin-bottom: 12px; font-weight: 600; }
.j-tab { color: var(--uem-red); border-bottom: 2px solid var(--uem-red); padding: 0 8px 4px; margin-left: 8px; font-weight: 400; }
.map-scroll { overflow-x: auto; padding-bottom: 8px; }
.map { display: grid; gap: 8px; min-width: max-content; }
.row-label { display: flex; align-items: center; justify-content: center; font-weight: 600; color: #444; background: #fbf0f0; border-radius: 4px; font-size: 13px; }
.vertical { flex-direction: column; gap: 6px; padding: 8px 0; }
.stage {
  background: #fde2e3; color: #333; font-weight: 600; font-size: 13px; height: 40px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 22px;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%);
}
.stage.first { clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%); background: #f9cfd1; }
.cell { position: relative; background: #fff; border: 1px solid #f3dede; border-right: 3px solid #f08a8f; border-radius: 4px; padding: 26px 10px 8px; font-size: 12px; color: #444; line-height: 1.6; max-height: 210px; overflow-y: auto; }
.cell.opt { padding-top: 8px; border-right-color: #f2a33a; }
.cell ol { margin: 0; padding-left: 16px; }
.count { position: absolute; top: 0; right: 0; background: #fde2e3; color: var(--uem-red); font-size: 11px; padding: 2px 8px; border-radius: 0 0 0 4px; }
.filters { display: grid; grid-template-columns: auto 1fr auto 1fr auto 1fr auto auto; gap: 12px; align-items: center; font-size: 13px; color: #555; margin-bottom: 16px; }
.filters .el-button + .el-button { margin-left: 0; }
.example { font-size: 12px; color: #555; line-height: 1.6; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

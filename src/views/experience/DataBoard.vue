<!-- 优化建议 · 数据看板 #/suggestionDataBoard：概览（按年度）+ 详情（按提交时间：采集 / 分析 / 解决情况） -->
<template>
  <div class="board">
    <!-- 优化建议概览 -->
    <div class="head">
      <span class="head-title">优化建议概览</span>
      <el-select v-model="year" size="small" class="year-pill" aria-label="统计年度" @change="onYear">
        <el-option v-for="y in years" :key="y" :label="`${y}年`" :value="y" />
      </el-select>
    </div>
    <div class="kpis">
      <div class="kpi k-red">
        <div class="k-lbl">优化建议总数</div>
        <div class="k-val">{{ ov.total }}<small>条</small></div>
        <div class="k-sub"><span>已分析{{ ov.analyzed }}条</span><span>待分析{{ ov.toAnalyze }}条</span></div>
        <el-icon class="deco"><Document /></el-icon>
      </div>
      <div class="kpi k-green">
        <div class="k-lbl">优化建议采纳数</div>
        <div class="k-val">{{ ov.adopted }}<small>条</small></div>
        <div class="k-sub"><span>采纳率{{ ov.adoptRate }}%</span></div>
        <el-icon class="deco"><CircleCheck /></el-icon>
      </div>
      <div class="kpi k-blue">
        <div class="k-lbl">优化建议解决数</div>
        <div class="k-val">{{ ov.solved }}<small>条</small></div>
        <div class="k-sub"><span>解决率{{ ov.solveRate }}%</span><span>待解决数{{ ov.unsolved }}条</span></div>
        <el-icon class="deco"><Finished /></el-icon>
      </div>
      <div class="kpi k-orange">
        <div class="k-lbl">中心当前平均处理用时</div>
        <span class="uem-link k-more" role="button" tabindex="0" @click="avgVisible = true" @keyup.enter="avgVisible = true">详情</span>
        <div class="k-val">{{ ov.stage.total }}<small>个工作日</small></div>
        <div class="k-sub">
          <span>分拣{{ ov.stage.sort }}个工作日</span><span>答复{{ ov.stage.reply }}个工作日</span><span>审核{{ ov.stage.audit }}个工作日</span>
        </div>
        <el-icon class="deco"><Timer /></el-icon>
      </div>
    </div>
    <div class="uem-card trend-card">
      <EChart class="trend" :option="submitOpt" />
    </div>

    <!-- 优化建议详情：以下卡片按提交时间范围统计 -->
    <div class="head"><span class="head-title">优化建议详情</span></div>
    <div class="uem-card filter">
      <span class="f-lbl">提交时间</span>
      <el-date-picker
        v-model="range"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false"
        class="range"
      />
      <el-button v-for="q in quicks" :key="q.months" :type="quickActive === q.months ? 'primary' : ''" plain class="quick" @click="applyQuick(q.months)">{{ q.label }}</el-button>
      <el-button link class="reset" @click="reset"><el-icon><RefreshRight /></el-icon>重置</el-button>
      <span class="gap" />
      <el-button type="primary" @click="query">查询</el-button>
      <el-button @click="exportAsync">导出</el-button>
      <el-button @click="exportVisible = true">查看导出结果</el-button>
    </div>

    <div class="sec-head"><span class="sec-title">采集情况</span><span class="sec-sub">采集 <b>{{ rc.total }}</b> 条</span></div>
    <div class="cards c3">
      <div v-for="c in collectCards" :key="c.key" class="chart-card">
        <div class="cc-head">
          <span class="cc-title">{{ c.title }}<span v-if="c.detail" class="uem-link cc-detail" role="button" tabindex="0" @click="rankKey = c.detail" @keyup.enter="rankKey = c.detail">详情</span></span>
          <span class="cc-tools">
            <!-- 右上角两个小图标（推测：切换为表格 / 下载图片） -->
            <el-tooltip :content="tableOn[c.key] ? '切换为图表' : '切换为表格'" :show-after="300">
              <button class="icon-btn" :aria-label="tableOn[c.key] ? '切换为图表' : '切换为表格'" @click="tableOn[c.key] = !tableOn[c.key]"><el-icon><component :is="tableOn[c.key] ? 'Histogram' : 'Grid'" /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="下载图片" :show-after="300">
              <button class="icon-btn" aria-label="下载图片" @click="savePng(c)"><el-icon><Download /></el-icon></button>
            </el-tooltip>
          </span>
        </div>
        <div class="cc-body" :style="{ height: c.height + 'px' }">
          <EChart :ref="(el) => (chartRefs[c.key] = el)" :option="c.option" />
          <div v-if="tableOn[c.key]" class="cc-table">
            <el-table :data="c.table.rows" size="small" height="100%" empty-text="暂无数据">
              <el-table-column v-for="col in c.table.cols" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.width || 80" :align="col.align || 'left'" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <div class="sec-head"><span class="sec-title">分析情况</span><span class="sec-sub">分析 <b>{{ rc.analyzed }}</b> 条　采纳 <b>{{ rc.adopted }}</b> 条</span></div>
    <div class="cards c-wide-left">
      <div v-for="c in analysisCards" :key="c.key" class="chart-card">
        <div class="cc-head">
          <span class="cc-title">{{ c.title }}</span>
          <span class="cc-tools">
            <el-tooltip :content="tableOn[c.key] ? '切换为图表' : '切换为表格'" :show-after="300">
              <button class="icon-btn" :aria-label="tableOn[c.key] ? '切换为图表' : '切换为表格'" @click="tableOn[c.key] = !tableOn[c.key]"><el-icon><component :is="tableOn[c.key] ? 'Histogram' : 'Grid'" /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="下载图片" :show-after="300">
              <button class="icon-btn" aria-label="下载图片" @click="savePng(c)"><el-icon><Download /></el-icon></button>
            </el-tooltip>
          </span>
        </div>
        <div class="cc-body" :style="{ height: c.height + 'px' }">
          <EChart :ref="(el) => (chartRefs[c.key] = el)" :option="c.option" />
          <div v-if="tableOn[c.key]" class="cc-table">
            <el-table :data="c.table.rows" size="small" height="100%" empty-text="暂无数据">
              <el-table-column v-for="col in c.table.cols" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.width || 80" :align="col.align || 'left'" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 解决情况（推测：截图首屏以下未展示，按「解决数 / 待解决数」口径补充） -->
    <div class="sec-head"><span class="sec-title">解决情况</span><span class="sec-sub">解决 <b>{{ rc.solved }}</b> 条　待解决 <b>{{ rc.unsolved }}</b> 条</span></div>
    <div class="cards c-half">
      <div v-for="c in solveCards" :key="c.key" class="chart-card">
        <div class="cc-head">
          <span class="cc-title">{{ c.title }}</span>
          <span class="cc-tools">
            <el-tooltip :content="tableOn[c.key] ? '切换为图表' : '切换为表格'" :show-after="300">
              <button class="icon-btn" :aria-label="tableOn[c.key] ? '切换为图表' : '切换为表格'" @click="tableOn[c.key] = !tableOn[c.key]"><el-icon><component :is="tableOn[c.key] ? 'Histogram' : 'Grid'" /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="下载图片" :show-after="300">
              <button class="icon-btn" aria-label="下载图片" @click="savePng(c)"><el-icon><Download /></el-icon></button>
            </el-tooltip>
          </span>
        </div>
        <div class="cc-body" :style="{ height: c.height + 'px' }">
          <EChart :ref="(el) => (chartRefs[c.key] = el)" :option="c.option" />
          <div v-if="tableOn[c.key]" class="cc-table">
            <el-table :data="c.table.rows" size="small" height="100%" empty-text="暂无数据">
              <el-table-column v-for="col in c.table.cols" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.width || 80" :align="col.align || 'left'" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 中心平均处理用时：按业研部门 -->
    <el-dialog v-model="avgVisible" :title="`中心平均处理用时（${year}年）`" width="800px">
      <div class="dlg-note">口径：分拣 = 进入待分拣 → 指派答复人；答复 = 指派答复人 → 首次答复；审核 = 最后一次答复 → 审核通过；单位为工作日（依据节假日维护），保留一位小数。概览卡片按四舍五入取整显示。</div>
      <el-table v-if="avgVisible" :data="avgRows" :row-class-name="({ row }) => (row.isAll ? 'board-sum-row' : '')" max-height="460">
        <el-table-column prop="dept" label="业研部门" min-width="180" show-overflow-tooltip />
        <el-table-column prop="count" label="建议数（条）" min-width="110" align="center" />
        <el-table-column label="平均分拣用时" min-width="110" align="center"><template #default="{ row }">{{ fix(row.sort) }}</template></el-table-column>
        <el-table-column label="平均答复用时" min-width="110" align="center"><template #default="{ row }">{{ fix(row.reply) }}</template></el-table-column>
        <el-table-column label="平均审核用时" min-width="110" align="center"><template #default="{ row }">{{ fix(row.audit) }}</template></el-table-column>
        <el-table-column label="平均处理用时" min-width="110" align="center"><template #default="{ row }">{{ fix(row.total) }}</template></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 详情：完整排行 -->
    <el-dialog :model-value="!!rankKey" :title="rankMeta.title" width="720px" @update:model-value="(v) => !v && (rankKey = '')">
      <div class="dlg-note">提交时间：{{ applied[0] }} 至 {{ applied[1] }}，共 {{ rc.total }} 条</div>
      <el-table v-if="rankKey" :data="rankMeta.rows" max-height="460" empty-text="暂无数据">
        <el-table-column v-for="col in rankMeta.cols" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.width || 90" :align="col.align || 'left'" />
      </el-table>
    </el-dialog>

    <!-- 导出结果 -->
    <el-dialog v-model="exportVisible" title="导出结果" width="680px">
      <el-table :data="tasks" empty-text="暂无导出任务">
        <el-table-column prop="name" label="文件名称" min-width="200" />
        <el-table-column prop="rangeText" label="提交时间范围" width="190" />
        <el-table-column prop="count" label="记录数" width="70" />
        <el-table-column prop="time" label="提交时间" width="160" />
        <el-table-column label="状态" width="70">
          <template #default="{ row }"><span :class="row.done ? 'ok' : 'wait'">{{ row.done ? '已完成' : '处理中' }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="60">
          <template #default="{ row }"><el-button link type="primary" :disabled="!row.done" @click="download(row)">下载</el-button></template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import EChart from '@/components/EChart.vue'
import { exportCsv } from '@/components/exportCsv'
import { exportTasks } from '@/mock/experiencer'
import { nowText } from '@/mock/qc'
import {
  boardYears, listOfYear, listInRange, yearRange, recentRange, monthsOfYear, monthsBetween,
  overview, counts, monthlySubmit, deptAverages, sourceSplit, orgRanking, productRanking, categorySplit,
  monthlyAdopt, rejectSplit, solutionSplit, monthlySolved, exportColumns, exportRows
} from '@/mock/suggestBoard'

// 截图配色
const C = { red: '#e5575e', teal: '#3fb1a3', blue: '#5b8ff9', lightBlue: '#9cc3f5', amber: '#f6bd16', purple: '#7262fd', orange: '#f08a5d', pink: '#f3a3a6' }

// ===== 年度（概览）=====
const years = computed(() => boardYears())
const year = ref(String(new Date().getFullYear()))
const yearData = computed(() => listOfYear(year.value))
const ov = computed(() => overview(yearData.value))
const monthly = computed(() => monthlySubmit(yearData.value, monthsOfYear(year.value)))

// ===== 提交时间（详情）=====
const range = ref(yearRange(year.value))
const applied = ref([...range.value])
const quicks = [{ months: 3, label: '近三个月' }, { months: 6, label: '近六个月' }, { months: 12, label: '近一年' }]
const same = (a, b) => a?.[0] === b[0] && a?.[1] === b[1]
const quickActive = computed(() => quicks.find((q) => same(range.value, recentRange(q.months)))?.months)
const applyQuick = (n) => {
  range.value = recentRange(n)
  applied.value = [...range.value]
}
const reset = () => {
  range.value = yearRange(year.value)
  applied.value = [...range.value]
}
const query = () => {
  if (!range.value?.length) return ElMessage.warning('请选择提交时间')
  applied.value = [...range.value]
}
// 切换年度：详情的提交时间同步为该年度
const onYear = () => reset()

const rangeData = computed(() => listInRange(applied.value))
const rc = computed(() => counts(rangeData.value))
const rangeMonths = computed(() => monthsBetween(applied.value[0], applied.value[1]))

// ===== 图表通用 =====
const axisColor = { axisLine: { lineStyle: { color: '#dcdfe6' } }, axisTick: { show: false }, axisLabel: { color: '#666', fontSize: 11 } }
const valueAxis = (extra = {}) => ({ type: 'value', minInterval: 1, axisLabel: { color: '#999', fontSize: 11 }, splitLine: { lineStyle: { color: '#f0f2f5' } }, nameTextStyle: { color: '#999', fontSize: 11 }, ...extra })
const rateAxis = { type: 'value', min: 0, max: 100, interval: 20, axisLabel: { color: '#999', fontSize: 11, formatter: '{value}%' }, splitLine: { show: false }, name: '采纳率', nameTextStyle: { color: '#999', fontSize: 11 } }
const legendBase = { top: 0, left: 'center', itemWidth: 12, itemHeight: 8, itemGap: 18, textStyle: { color: '#555', fontSize: 12 } }
const fmtVal = (p) => (p.value == null ? '-' : p.seriesName.includes('率') ? `${p.value}%` : `${p.value} 条`)
const axisTip = (extra) => ({
  trigger: 'axis',
  axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(150,150,150,0.08)' } },
  formatter: (ps) => [ps[0].axisValue, ...ps.map((p) => `${p.marker}${p.seriesName}：${fmtVal(p)}`), ...(extra ? [extra(ps[0].dataIndex)] : [])].join('<br/>')
})
// 月份轴：逐月显示标签，超过 12 个月时倾斜
const monthAxis = (months) => ({ type: 'category', data: months, ...axisColor, axisLabel: { ...axisColor.axisLabel, interval: 0, rotate: months.length > 12 ? 30 : 0 } })
const gridBottom = (months) => (months.length > 12 ? 44 : 28)
const barEnd = [4, 4, 0, 0]
const grad = (top, bottom) => ({ type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: top }, { offset: 1, color: bottom }] })
const rateLine = (data) => ({ name: '采纳率', type: 'line', yAxisIndex: 1, data, symbol: 'circle', symbolSize: 7, connectNulls: false, itemStyle: { color: C.red, borderColor: '#fff', borderWidth: 1.5 }, lineStyle: { width: 2, color: C.red } })

// 概览：各月提交量（总行 / 分行堆叠）+ 采纳率
const submitOpt = computed(() => {
  const rows = monthly.value
  const head = rows.reduce((n, r) => n + r.head, 0)
  const branch = rows.reduce((n, r) => n + r.branch, 0)
  const totals = { 提交总量: head + branch, 总行提交量: head, 分行提交量: branch }
  return {
    tooltip: axisTip((i) => `提交总量：${rows[i].total} 条（采纳 ${rows[i].adopted} / 已分析 ${rows[i].analyzed}）`),
    legend: {
      ...legendBase,
      // 「提交总量」仅作图例展示（推测）
      data: [{ name: '提交总量', icon: 'none' }, '总行提交量', '分行提交量', '采纳率'],
      selectedMode: true,
      formatter: (n) => (n === '采纳率' ? `采纳率${ov.value.adoptRate}%` : `${n}${totals[n]}条`)
    },
    grid: { left: 52, right: 56, top: 48, bottom: gridBottom(rows) },
    xAxis: monthAxis(rows.map((r) => r.month)),
    yAxis: [valueAxis({ name: '提交量（条）' }), rateAxis],
    series: [
      { name: '提交总量', type: 'bar', data: [], tooltip: { show: false } },
      { name: '总行提交量', type: 'bar', stack: 'submit', barMaxWidth: 26, itemStyle: { color: C.amber, borderColor: '#fff', borderWidth: 1 }, data: rows.map((r) => r.head) },
      { name: '分行提交量', type: 'bar', stack: 'submit', barMaxWidth: 26, itemStyle: { color: C.lightBlue, borderColor: '#fff', borderWidth: 1, borderRadius: barEnd }, data: rows.map((r) => r.branch) },
      rateLine(rows.map((r) => r.rate))
    ]
  }
})

// 图例百分比取整：最大余数法，保证合计为 100%
function roundPct(list) {
  const total = list.reduce((n, x) => n + x.value, 0)
  if (!total) return Object.fromEntries(list.map((x) => [x.name, 0]))
  const raw = list.map((x) => ({ name: x.name, v: (x.value / total) * 100 }))
  const out = raw.map((x) => ({ ...x, r: Math.floor(x.v) }))
  let rest = 100 - out.reduce((n, x) => n + x.r, 0)
  for (const x of [...out].sort((a, b) => b.v - b.r - (a.v - a.r))) if (rest-- > 0) x.r++
  return Object.fromEntries(out.map((x) => [x.name, x.r]))
}
// 环形图：图例带百分比；legendAt 为图例位置（right / bottom），cols 为底部图例列数
function donut(list, colors, { legendAt = 'right', cols = 1, nameWidth = 80 } = {}) {
  const pctOf = roundPct(list)
  const legendItem = {
    icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 9,
    formatter: (n) => `{n|${n}}{p|${pctOf[n] ?? 0}%}`,
    textStyle: { rich: { n: { ...(nameWidth ? { width: nameWidth } : {}), color: '#555', fontSize: 12 }, p: { color: '#333', fontSize: 12, fontWeight: 600, padding: [0, 0, 0, 6] } } }
  }
  let legend, center, radius
  if (legendAt === 'bottom') {
    const per = Math.ceil(list.length / cols)
    legend = Array.from({ length: cols }, (_, k) => ({
      ...legendItem, orient: cols > 1 ? 'vertical' : 'horizontal', bottom: 6,
      left: cols > 1 ? `${6 + (k * 88) / cols}%` : 'center',
      data: list.slice(k * per, (k + 1) * per).map((x) => x.name)
    }))
    center = ['50%', cols > 1 ? '35%' : '42%']
    radius = cols > 1 ? ['32%', '50%'] : ['38%', '58%']
  } else {
    // 图例靠右，环形图居左，窄屏时两者不重叠
    legend = { ...legendItem, orient: 'vertical', right: 8, top: 'middle', data: list.map((x) => x.name) }
    center = ['25%', '50%']
    radius = ['38%', '56%']
  }
  return {
    color: colors,
    tooltip: { trigger: 'item', formatter: (p) => `${p.marker}${p.name}<br/>${p.value} 条（${p.data.pct}%）` },
    legend,
    series: [{
      type: 'pie', radius, center, avoidLabelOverlap: true, label: { show: false }, labelLine: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 2 }, emphasis: { scale: true, scaleSize: 4 },
      data: list.map((x) => ({ name: x.name, value: x.value, pct: x.pct }))
    }]
  }
}
const shareCols = (label) => [
  { prop: 'name', label, width: 140 },
  { prop: 'value', label: '数量（条）', align: 'center' },
  { prop: 'pctText', label: '占比', align: 'center' }
]
const withPct = (list) => list.map((x) => ({ ...x, pctText: `${x.pct.toFixed(1)}%` }))

// ===== 采集情况 =====
const sources = computed(() => sourceSplit(rangeData.value))
const products = computed(() => productRanking(rangeData.value))
const cats = computed(() => categorySplit(rangeData.value))
const top5Opt = computed(() => {
  const top = products.value.slice(0, 5)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(150,150,150,0.08)' } }, formatter: (ps) => `${ps[0].name}<br/>${ps[0].marker}采集量：${ps[0].value} 条（${top[ps[0].dataIndex].pct}%）` },
    grid: { left: 34, right: 4, top: 28, bottom: 40 },
    // 产品名称每 5 个字换行
    xAxis: { type: 'category', data: top.map((x) => x.name), ...axisColor, axisLabel: { ...axisColor.axisLabel, fontSize: 10, interval: 0, lineHeight: 13, formatter: (n) => n.match(/.{1,5}/g).join('\n') } },
    yAxis: valueAxis(),
    series: [{
      name: '采集量', type: 'bar', barMaxWidth: 24, data: top.map((x) => x.value),
      itemStyle: { color: grad(C.red, '#f6b7ba'), borderRadius: barEnd },
      label: { show: true, position: 'top', color: '#333', fontSize: 12 }
    }]
  }
})
const collectCards = computed(() => [
  {
    key: 'source', title: '优化建议来源分布(提交机构维度)', detail: 'org', height: 260,
    option: donut(sources.value, [C.blue, C.amber], { legendAt: 'bottom', nameWidth: 0 }),
    table: { cols: shareCols('提交机构类型'), rows: withPct(sources.value) }
  },
  {
    key: 'top5', title: '优化建议采集量涉及产品TOP5', detail: 'product', height: 260,
    option: top5Opt.value,
    table: { cols: [{ prop: 'rank', label: '排名', width: 50, align: 'center' }, { prop: 'name', label: '产品名称', width: 150 }, { prop: 'value', label: '采集量（条）', align: 'center' }], rows: products.value.slice(0, 5) }
  },
  {
    key: 'category', title: '优化建议分类情况', height: 260,
    option: donut(cats.value, [C.red, C.blue, C.amber, C.teal, C.purple, C.orange, C.lightBlue, C.pink], { legendAt: 'bottom', cols: 2, nameWidth: 56 }),
    table: { cols: shareCols('优化建议分类'), rows: withPct(cats.value) }
  }
])

// 详情：完整排行
const rankKey = ref('')
const rankMeta = computed(() => {
  if (rankKey.value === 'org') {
    return {
      title: '优化建议来源分布（提交机构维度）',
      cols: [
        { prop: 'rank', label: '排名', width: 60, align: 'center' }, { prop: 'name', label: '提交机构', width: 200 }, { prop: 'type', label: '机构类型', width: 110 },
        { prop: 'value', label: '提交量（条）', align: 'center' }, { prop: 'pctText', label: '占比', align: 'center' }
      ],
      rows: withPct(orgRanking(rangeData.value))
    }
  }
  if (rankKey.value === 'product') {
    return {
      title: '优化建议采集量涉及产品排行',
      cols: [
        { prop: 'rank', label: '排名', width: 60, align: 'center' }, { prop: 'name', label: '产品名称', width: 180 }, { prop: 'dept', label: '所属业研部门', width: 140 },
        { prop: 'line', label: '所属产品线', width: 130 }, { prop: 'value', label: '采集量（条）', align: 'center' }, { prop: 'pctText', label: '占比', align: 'center' }
      ],
      rows: withPct(productRanking(rangeData.value))
    }
  }
  return { title: '', cols: [], rows: [] }
})

// ===== 分析情况 =====
const adoptRows = computed(() => monthlyAdopt(rangeData.value, rangeMonths.value))
const adoptOpt = computed(() => {
  const rows = adoptRows.value
  const a = rows.reduce((n, r) => n + r.adopted, 0)
  const b = rows.reduce((n, r) => n + r.rejected, 0)
  const names = { 采纳数: `采纳数${a}条`, 未采纳数: `未采纳数${b}条`, 采纳率: `采纳率${rc.value.adoptRate}%` }
  return {
    tooltip: axisTip(),
    legend: { ...legendBase, data: ['采纳数', '未采纳数', '采纳率'], formatter: (n) => names[n] },
    grid: { left: 48, right: 52, top: 48, bottom: gridBottom(rows) },
    xAxis: monthAxis(rows.map((r) => r.month)),
    yAxis: [valueAxis({ name: '数量（条）' }), rateAxis],
    series: [
      { name: '采纳数', type: 'bar', barMaxWidth: 16, barGap: '30%', itemStyle: { color: C.teal, borderRadius: barEnd }, data: rows.map((r) => r.adopted) },
      { name: '未采纳数', type: 'bar', barMaxWidth: 16, itemStyle: { color: C.blue, borderRadius: barEnd }, data: rows.map((r) => r.rejected) },
      rateLine(rows.map((r) => r.rate))
    ]
  }
})
const rejects = computed(() => rejectSplit(rangeData.value))
const analysisCards = computed(() => [
  {
    key: 'adoptTrend', title: '各月采纳变化趋势图', height: 300, option: adoptOpt.value,
    table: {
      cols: [{ prop: 'month', label: '月份' }, { prop: 'adopted', label: '采纳数（条）', align: 'center' }, { prop: 'rejected', label: '未采纳数（条）', align: 'center' }, { prop: 'rateText', label: '采纳率', align: 'center' }],
      rows: adoptRows.value.map((r) => ({ ...r, rateText: r.rate == null ? '-' : `${r.rate}%` }))
    }
  },
  {
    key: 'reject', title: '未采纳原因分布情况', height: 300,
    option: donut(rejects.value, [C.red, C.amber, C.blue, C.teal, C.purple, C.orange, C.lightBlue], { nameWidth: 148 }),
    table: { cols: shareCols('未采纳原因'), rows: withPct(rejects.value) }
  }
])

// ===== 解决情况（推测）=====
const solutionsData = computed(() => solutionSplit(rangeData.value))
const solvedRows = computed(() => monthlySolved(rangeData.value, applied.value))
const solvedOpt = computed(() => {
  const rows = solvedRows.value
  return {
    tooltip: axisTip(),
    grid: { left: 48, right: 20, top: 36, bottom: gridBottom(rows) },
    xAxis: monthAxis(rows.map((r) => r.month)),
    yAxis: valueAxis({ name: '解决数（条）' }),
    series: [{ name: '解决数', type: 'bar', barMaxWidth: 22, itemStyle: { color: grad(C.purple, '#b3aafe'), borderRadius: barEnd }, label: { show: rows.length <= 13, position: 'top', color: '#666', fontSize: 11 }, data: rows.map((r) => r.solved) }]
  }
})
const solveCards = computed(() => [
  {
    key: 'solution', title: '解决方式分布', height: 300,
    option: donut(solutionsData.value, [C.blue, C.amber, C.teal, C.purple, C.orange], { nameWidth: 172 }),
    table: { cols: shareCols('解决方式'), rows: withPct(solutionsData.value) }
  },
  {
    key: 'solvedTrend', title: '各月解决情况（按实际落实时间）', height: 300, option: solvedOpt.value,
    table: { cols: [{ prop: 'month', label: '月份' }, { prop: 'solved', label: '解决数（条）', align: 'center' }], rows: solvedRows.value }
  }
])

// ===== 图表 / 表格切换与下载图片 =====
const tableOn = reactive({})
const chartRefs = {}
function savePng(c) {
  const el = chartRefs[c.key]?.$el
  const inst = el && echarts.getInstanceByDom(el)
  if (!inst) return ElMessage.warning('图表尚未加载完成')
  const a = document.createElement('a')
  a.href = inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
  a.download = `${c.title}_${applied.value[0]}至${applied.value[1]}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// ===== 中心平均处理用时详情 =====
const avgVisible = ref(false)
const avgRows = computed(() => {
  if (!avgVisible.value) return []
  const { rows, all } = deptAverages(yearData.value)
  return [...rows, { ...all, dept: '业务研发中心（合计）', isAll: true }]
})
const fix = (v) => (v ? v.toFixed(1) : '0.0')

// ===== 导出（异步任务，「查看导出结果」中下载）=====
const EXPORT_NAME = '优化建议详情'
const exportVisible = ref(false)
const tasks = computed(() => exportTasks.filter((t) => t.name.startsWith(EXPORT_NAME)))
function exportAsync() {
  const rows = exportRows(rangeData.value)
  if (!rows.length) return ElMessage.warning('当前提交时间范围内暂无优化建议')
  const task = reactive({
    name: `${EXPORT_NAME}_${nowText().replace(/[-: ]/g, '')}`,
    rangeText: `${applied.value[0]} 至 ${applied.value[1]}`,
    count: rows.length,
    time: nowText(),
    done: false,
    rows: markRaw(rows)
  })
  exportTasks.unshift(task)
  setTimeout(() => (task.done = true), 1500)
  ElMessage.success('导出任务已提交，可在「查看导出结果」中下载')
}
const download = (t) => exportCsv(t.name, exportColumns, t.rows)
</script>

<style scoped>
.board { min-width: 0; }
.head { display: flex; justify-content: space-between; align-items: center; margin: 0 0 12px; }
.head + .kpis { margin-top: 0; }
.head-title { font-size: 16px; font-weight: 600; color: #333; padding-left: 10px; border-left: 4px solid #e5575e; line-height: 16px; }

/* 年度：红色胶囊下拉 */
.year-pill { width: 92px; }
.year-pill :deep(.el-select__wrapper) { background: linear-gradient(90deg, #e5575e, #f08a8f); box-shadow: none; border-radius: 14px; min-height: 26px; padding: 2px 12px; }
.year-pill :deep(.el-select__placeholder),
.year-pill :deep(.el-select__selected-item),
.year-pill :deep(.el-select__caret) { color: #fff; }

/* 概览指标卡：浅色渐变 + 右侧装饰图形 */
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.kpi { position: relative; overflow: hidden; border-radius: 6px; padding: 16px 20px 14px; min-height: 124px; background: linear-gradient(120deg, #fff 30%, var(--tint)); }
.kpi::before,
.kpi::after { content: ''; position: absolute; border-radius: 50%; background: var(--accent); pointer-events: none; }
.kpi::before { width: 116px; height: 116px; right: -34px; top: -38px; opacity: 0.08; }
.kpi::after { width: 64px; height: 64px; right: 52px; bottom: -36px; opacity: 0.06; }
.k-red { --tint: #fde1df; --accent: #e5575e; }
.k-green { --tint: #d9f3ea; --accent: #3fb1a3; }
.k-blue { --tint: #dbe7fc; --accent: #5b8ff9; }
.k-orange { --tint: #fbe8cf; --accent: #f08a5d; }
.k-lbl { font-size: 14px; color: #333; font-weight: 600; position: relative; z-index: 1; padding-right: 36px; }
.k-more { position: absolute; top: 16px; right: 18px; font-size: 13px; z-index: 2; }
.k-val { font-size: 30px; font-weight: 700; color: #222; margin: 10px 0 6px; font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif; position: relative; z-index: 1; line-height: 1.1; }
.k-val small { font-size: 13px; font-weight: 400; color: #555; margin-left: 4px; font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.k-sub { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: 12px; color: #777; position: relative; z-index: 1; }
.k-sub span { white-space: nowrap; }
.deco { position: absolute; right: 14px; bottom: 10px; font-size: 64px; color: var(--accent); opacity: 0.16; transform: rotate(-8deg); }

.trend-card { padding: 16px 20px 8px; margin-bottom: 24px; }
.trend { height: 300px; }

/* 提交时间筛选 */
.filter { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 14px 20px; margin-bottom: 20px; }
.filter .el-button + .el-button { margin-left: 0; }
.f-lbl { color: #555; font-size: 14px; }
.range { width: 260px; flex: none; }
.quick { padding: 8px 12px; }
.reset { color: #666; }
.reset .el-icon { margin-right: 2px; }
.gap { flex: 1; }

/* 分组标题 */
.sec-head { display: flex; align-items: baseline; gap: 12px; margin: 4px 0 12px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.sec-sub { font-size: 13px; color: #888; }
.sec-sub b { color: #e5575e; font-size: 16px; margin: 0 2px; font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif; }

.cards { display: grid; gap: 16px; margin-bottom: 20px; }
.c3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.c-wide-left { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
.c-half { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.chart-card { background: #fff; border-radius: 4px; padding: 14px 16px 10px; min-width: 0; }
.cc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
.cc-title { font-size: 14px; font-weight: 600; color: #333; line-height: 20px; min-width: 0; }
.cc-detail { font-size: 13px; font-weight: 400; margin-left: 8px; }
.cc-tools { display: flex; gap: 4px; flex: none; }
.icon-btn { border: 0; background: transparent; padding: 3px; border-radius: 3px; cursor: pointer; color: #999; display: inline-flex; font-size: 14px; }
.icon-btn:hover { color: #e5575e; background: #fdf1f0; }
.icon-btn:focus-visible { outline: 2px solid #e5575e; outline-offset: 1px; }
.cc-body { position: relative; }
.cc-table { position: absolute; inset: 0; background: #fff; z-index: 2; }

.dlg-note { color: #888; font-size: 12px; margin: -6px 0 12px; line-height: 1.6; }
.ok { color: #3c9a5f; }
.wait { color: #e6a23c; }
</style>

<style>
/* 弹窗表格行由 el-table 内部渲染，合计行样式不使用 scoped */
.el-table .board-sum-row td.el-table__cell { background: #fdf6f6; font-weight: 600; }
</style>

// 优化建议 · 管理报表：按业研部门 / 产品线汇总的统计口径与明细清单
// 依据：管理报表截图（「处理进展」页签的表头与合计关系）；其余页签的指标口径为推测
// 统计范围：提交时间在所选区间内的优化建议；部门统计只计入所属业研部门非空的建议（研发一体化问题不计入）
import { markRaw } from 'vue'
import { suggestions, isOverdue, stayDays, averageDurations, stageDurations, slaDays } from './suggest'
import { rdDepts, deptLines } from './system'

export const inSubmitRange = (s, range) => !range?.length || (s.submitTime >= range[0] && s.submitTime <= range[1])
const inScope = (range) => suggestions.filter((s) => rdDepts.includes(s.bizDept) && inSubmitRange(s, range))

// ===== 列定义 =====
// 计数列：test 判断是否计入，by 为个人维度的归属人（handler 当前处理人 / replier 答复人）
// 合计列：sumOf 为参与求和的计数列；计算列：calc(row, items) 返回展示文本
const M = (key, label, test, by = 'replier', width) => ({ key, label, test, by, width })
const G = (label, children) => ({ label, children: children.map((c) => Object.assign(c, { group: label })) })
const S = (key, label, sumOf, width) => ({ key, label, sumOf, width })
const C = (key, label, calc, width) => ({ key, label, calc, width })
const is = (status) => (s) => s.status === status
const doneBy = (track) => (s) => s.status === '已完成' && s.track === track
const late = (status) => (s) => s.status === status && isOverdue(s)
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : '-')

// 平均处理时长：averageDurations 无样本时为 0，此处无样本显示「-」
function durationOf(row, items) {
  if (!row._d) {
    const n = { sort: 0, reply: 0, audit: 0 }
    for (const s of items) {
      const d = stageDurations(s)
      for (const k in n) if (d[k] != null) n[k]++
    }
    row._d = { avg: averageDurations(items), n }
  }
  return row._d
}
const avgText = (k) => (row, items) => {
  const { avg, n } = durationOf(row, items)
  const has = k === 'total' ? n.sort + n.reply + n.audit > 0 : n[k] > 0
  return has ? avg[k].toFixed(1) : '-'
}

const progressCols = [
  G('业务研发中心处理', [
    M('toSort', '待分拣数', is('待分拣'), 'handler', 86),
    M('toReply', '待答复数', is('待答复'), 'handler', 86),
    M('toAudit', '待审核数', is('待审核'), 'handler', 86),
    M('toFollow', '待跟进数', is('待跟进'), 'handler', 86),
    M('centerDone', '已完成数', doneBy('center'), 'replier', 86)
  ]),
  M('brdm', '已纳入需求整合池数', is('已纳入需求整合池'), 'replier', 112),
  M('eqc', '已纳入e企创数', is('已纳入e企创'), 'replier', 100),
  G('转业务部门处理', [
    M('toBiz', '待业务部门答复数', is('待业务部门答复'), 'handler', 112),
    M('bizDone', '已完成数(业务自主解决+业务不采纳)', doneBy('business'), 'replier', 150)
  ]),
  // 待开发中心处理的当前处理人为「软件开发中心」，个人维度按答复人归属（推测）
  G('转开发中心处理', [
    M('toDev', '待开发中心处理数(含待流转)', is('待开发中心处理'), 'replier', 140),
    M('devDone', '开发中心已完成数', doneBy('dev'), 'replier', 112)
  ])
]
progressCols.push(S('total', '合计', leavesOf(progressCols).map((c) => c.key), 80))

// 逾期规则（推测，与 slaDays 一致）
export const overdueRule = `待处理、待分拣超过 ${slaDays.待分拣} 个工作日，待答复超过 ${slaDays.待答复} 个工作日，待审核超过 ${slaDays.待审核} 个工作日，待业务部门答复超过 ${slaDays.待业务部门答复} 个工作日；待跟进超过计划落实时间；工作日按「后台管理 · 节假日」计算`
const overdueCols = [
  M('sortLate', '分拣逾期数', late('待分拣'), 'handler'),
  M('replyLate', '答复逾期数', late('待答复'), 'handler'),
  M('auditLate', '审核逾期数', late('待审核'), 'handler'),
  M('followLate', '跟进逾期数', late('待跟进'), 'handler'),
  M('bizLate', '业务部门答复逾期数', late('待业务部门答复'), 'handler', 120)
]
overdueCols.push(S('total', '合计', overdueCols.map((c) => c.key)))

const adopted = (s) => s.adoptResult === '采纳'
const rated = (v) => (s) => s.status === '已完成' && (v ? s.satisfaction === v : !!s.satisfaction)

// 部门统计类页签（「处理进展」依据截图，其余为推测）
export const deptSpecs = {
  progress: { columns: progressCols },
  reply: {
    columns: [
      M('replied', '答复数', (s) => !!s.adoptResult),
      M('adopted', '采纳数', adopted),
      M('rejected', '不采纳数', (s) => s.adoptResult === '不采纳'),
      C('adoptRate', '采纳率', (r) => pct(r.adopted, r.replied)),
      M('solved', '已解决数', (s) => adopted(s) && s.implemented === '是'),
      C('solveRate', '解决率', (r) => pct(r.solved, r.adopted)),
      M('unsolved', '待解决数', (s) => adopted(s) && s.implemented !== '是')
    ],
    note: '答复数：已答复（明确采纳结果）的优化建议；采纳率 = 采纳数 / 答复数；已解决：采纳且已落实；解决率 = 已解决数 / 采纳数。'
  },
  overdue: { columns: overdueCols, note: '统计提交时间范围内、当前仍处于对应环节且已逾期的优化建议。' },
  duration: {
    columns: [
      C('sort', '分拣平均时长', avgText('sort')),
      C('reply', '答复平均时长', avgText('reply')),
      C('audit', '审核平均时长', avgText('audit')),
      C('total', '平均总时长', avgText('total'))
    ],
    note: '单位：工作日。分拣：进入待分拣 → 指派答复人；答复：指派答复人 → 首次答复；审核：最后一次答复 → 审核通过；平均总时长为三个环节平均时长之和。'
  },
  satisfaction: {
    columns: [
      M('done', '已完成数', is('已完成')),
      M('rated', '已评价数', rated()),
      M('good', '满意', rated('满意')),
      M('fair', '基本满意', rated('基本满意')),
      M('bad', '不满意', rated('不满意')),
      C('rate', '满意率', (r) => pct(r.good + r.fair, r.rated))
    ],
    note: '满意率 =（满意 + 基本满意）/ 已评价数。'
  }
}

function leavesOf(cols) {
  return cols.flatMap((c) => c.children || [c])
}
export const leafColumns = (key) => leavesOf(deptSpecs[key].columns)
export const isDrillable = (c) => !!(c.test || c.sumOf)

// 计数列按 test 收集清单，合计列合并清单，计算列最后求值
function finish(row, leaves, items) {
  for (const c of leaves) if (c.sumOf) row.lists[c.key] = c.sumOf.flatMap((k) => row.lists[k])
  for (const k in row.lists) row[k] = row.lists[k].length
  for (const c of leaves) if (c.calc) row[c.key] = c.calc(row, items)
  return row
}
// lists 标记为非响应式：表格深度监听数据时不遍历其中的优化建议
function aggregate(items, leaves) {
  const row = { lists: markRaw({}) }
  for (const c of leaves) if (c.test) row.lists[c.key] = items.filter(c.test)
  return finish(row, leaves, items)
}

// 部门行（可展开到产品线，推测）+ 合计行；lists 为各计数列对应的优化建议清单，供下钻
export function deptReport(key, range) {
  const leaves = leafColumns(key)
  const scoped = inScope(range)
  const rows = rdDepts.map((dept) => {
    const items = scoped.filter((s) => s.bizDept === dept)
    return {
      ...aggregate(items, leaves),
      id: dept, name: dept, dept, line: '', level: 'dept',
      children: deptLines[dept].map((line) => ({
        ...aggregate(items.filter((s) => s.productLine === line), leaves),
        id: `${dept}/${line}`, name: line, dept, line, level: 'line'
      }))
    }
  })
  rows.push({ ...aggregate(scoped, leaves), id: '合计', name: '合计', dept: '合计', line: '', level: 'total' })
  return rows
}

// ===== 个人维度（推测）=====
// 待办类按当前处理人、办结类按答复人归属；平均处理时长按各环节实际操作人归属
const personOf = (s, by) => (by === 'handler' ? { name: s.currentHandler, id: s.currentHandlerId } : { name: s.replier, id: s.replierId })
const deptOrder = (a, b) => rdDepts.indexOf(a.dept) - rdDepts.indexOf(b.dept) || String(a.name).localeCompare(String(b.name), 'zh')
const personHead = [{ prop: 'dept', label: '所属业研部门' }, { prop: 'name', label: '姓名' }, { prop: 'id', label: '统一认证号' }]
const csvLabel = (c) => (c.group ? `${c.group}-${c.label}` : c.label)

export function personReport(key, range) {
  if (key === 'duration') return durationByPerson(inScope(range))
  const leaves = leafColumns(key)
  const counted = leaves.filter((c) => c.test)
  const map = new Map()
  for (const s of inScope(range)) {
    for (const c of counted) {
      if (!c.test(s)) continue
      const p = personOf(s, c.by)
      const k = `${s.bizDept}|${p.id || p.name}`
      if (!map.has(k)) map.set(k, { dept: s.bizDept, name: p.name || '（未指定）', id: p.id || '', lists: Object.fromEntries(counted.map((x) => [x.key, []])) })
      map.get(k).lists[c.key].push(s)
    }
  }
  const rows = [...map.values()].map((r) => finish(r, leaves, [])).sort(deptOrder)
  return { columns: [...personHead, ...leaves.map((c) => ({ prop: c.key, label: csvLabel(c) }))], rows }
}

// 与 stageDurations 相同的日志选取规则，取各环节的操作人
function stageOperators(s) {
  const logs = [...s.logs].reverse()
  const first = (action, after = '') => logs.find((l) => l.action === action && l.time >= after)
  const enterSort = first('转处理') || first('提交')
  const assign = enterSort && first('指派答复人', enterSort.time)
  const reply = assign && first('答复', assign.time)
  const lastReply = [...logs].reverse().find((l) => l.action === '答复')
  const pass = lastReply && first('通过', lastReply.time)
  return { sort: assign, reply, audit: pass }
}
function durationByPerson(scoped) {
  const map = new Map()
  for (const s of scoped) {
    const d = stageDurations(s)
    const ops = stageOperators(s)
    for (const k of ['sort', 'reply', 'audit']) {
      if (d[k] == null || !ops[k]) continue
      const op = ops[k]
      const id = `${s.bizDept}|${op.operatorId || op.operator}`
      if (!map.has(id)) map.set(id, { dept: s.bizDept, name: op.operator, id: op.operatorId, sum: { sort: 0, reply: 0, audit: 0 }, n: { sort: 0, reply: 0, audit: 0 } })
      const r = map.get(id)
      r.sum[k] += d[k]
      r.n[k]++
    }
  }
  const rows = [...map.values()]
    .map((r) => {
      const out = { dept: r.dept, name: r.name, id: r.id }
      for (const k of ['sort', 'reply', 'audit']) {
        out[`${k}N`] = r.n[k]
        out[k] = r.n[k] ? (r.sum[k] / r.n[k]).toFixed(1) : '-'
      }
      return out
    })
    .sort(deptOrder)
  const columns = [
    ...personHead,
    { prop: 'sortN', label: '分拣数' }, { prop: 'sort', label: '分拣平均时长(工作日)' },
    { prop: 'replyN', label: '答复数' }, { prop: 'reply', label: '答复平均时长(工作日)' },
    { prop: 'auditN', label: '审核数' }, { prop: 'audit', label: '审核平均时长(工作日)' }
  ]
  return { columns, rows }
}

// 部门统计导出列：部门、产品线 + 各指标（分组表头拼接为「分组-指标」）
export const deptCsvColumns = (key) => [{ prop: 'dept', label: '部门' }, { prop: 'line', label: '产品线' }, ...leafColumns(key).map((c) => ({ prop: c.key, label: csvLabel(c) }))]
export const flattenDeptRows = (rows) => rows.flatMap((r) => [r, ...(r.children || [])])

// ===== 明细清单 =====
// 要客问题（推测：要客意见来源或要客提出），按优化建议编号倒序
export const vipList = (range) => suggestions.filter((s) => s.vip && inSubmitRange(s, range))
// 待跟进按计划落实时间升序，逾期的排在前面（推测）
export const followList = (range) =>
  suggestions.filter((s) => s.status === '待跟进' && inSubmitRange(s, range)).sort((a, b) => String(a.planTime).localeCompare(String(b.planTime)) || b.seq - a.seq)
// e键通退回：每次退回一行，按退回时间倒序
export const ekeyReturnList = (range) =>
  suggestions
    .filter((s) => inSubmitRange(s, range))
    .flatMap((s) =>
      s.logs
        .filter((l) => l.action === 'e键通退回')
        .map((l) => ({ key: `${s.seq}-${l.time}`, s, id: s.id, product: s.product, bizDept: s.bizDept, returnTime: l.time, reason: l.remark, status: s.status, currentHandler: s.currentHandler }))
    )
    .sort((a, b) => (a.returnTime < b.returnTime ? 1 : -1))

// 逾期下钻的说明列（推测）
export const overdueText = (s) => (s.status === '待跟进' ? `计划落实时间 ${s.planTime}` : `已停留 ${stayDays(s)} 个工作日`)

// 优化建议 · 数据看板：统计口径与聚合
// 口径依据数据看板截图的算式（1631/5011=33%、871/1631=53%、1631-871=760）：
//   总数 = 所选年度内提交的建议；已分析 = 已有采纳结果；采纳率 = 采纳 / 已分析；
//   解决 = 采纳且已落实；解决率 = 解决 / 采纳；待解决 = 采纳 - 解决
import { suggestions, averageDurations, isBranchOrg, categories, rejectReasons, solutions } from './suggest'
import { rdDepts, productList } from './system'
import { fmtDate } from './holidays'

export const rateOf = (a, b) => (b ? Math.round((a / b) * 100) : 0)
export const isAnalyzed = (s) => !!s.adoptResult
export const isAdopted = (s) => s.adoptResult === '采纳'
export const isRejected = (s) => s.adoptResult === '不采纳'
export const isSolved = (s) => isAdopted(s) && s.implemented === '是'
export const isBranchSubmit = (s) => isBranchOrg(s.submitOrg)
const month = (d) => String(d || '').slice(0, 7)
const pct = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0)

// ===== 时间范围 =====
// 年度选项：数据中出现的年份 + 当前年份，倒序
export function boardYears() {
  const set = new Set(suggestions.map((s) => s.submitTime.slice(0, 4)))
  set.add(String(new Date().getFullYear()))
  return [...set].sort().reverse()
}
export const listOfYear = (year) => suggestions.filter((s) => s.submitTime.startsWith(String(year)))
export const listInRange = ([from, to] = []) => suggestions.filter((s) => (!from || s.submitTime >= from) && (!to || s.submitTime <= to))

// 年度默认范围：年初 → 今天（往年为年初 → 年末）
export function yearRange(year) {
  const today = fmtDate(new Date())
  const end = `${year}-12-31`
  return [`${year}-01-01`, end < today ? end : today]
}
// 近 N 个月：N 个月前的同一天 → 今天
export function recentRange(months) {
  const d = new Date()
  const to = fmtDate(d)
  const from = new Date(d.getFullYear(), d.getMonth() - months, d.getDate())
  // 月末日期溢出（如 8-31 往前 6 个月）时取上月末
  if (from.getDate() !== d.getDate()) from.setDate(0)
  return [fmtDate(from), to]
}

// 月份轴：年度为 1 月 → 当前月（往年至 12 月）
export function monthsOfYear(year) {
  const now = new Date()
  const y = Number(year)
  const last = y < now.getFullYear() ? 12 : y === now.getFullYear() ? now.getMonth() + 1 : 0
  return Array.from({ length: last }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`)
}
export function monthsBetween(from, to) {
  const out = []
  if (!from || !to) return out
  let [y, m] = from.slice(0, 7).split('-').map(Number)
  const end = to.slice(0, 7)
  for (let k = 0; k < 240; k++) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    if (key > end) break
    out.push(key)
    if (++m > 12) { m = 1; y++ }
  }
  return out
}

// ===== 概览 =====
export function counts(list) {
  const total = list.length
  const analyzed = list.filter(isAnalyzed).length
  const adopted = list.filter(isAdopted).length
  const solved = list.filter(isSolved).length
  return {
    total,
    analyzed,
    toAnalyze: total - analyzed,
    adopted,
    rejected: analyzed - adopted,
    adoptRate: rateOf(adopted, analyzed),
    solved,
    solveRate: rateOf(solved, adopted),
    unsolved: adopted - solved
  }
}
// 概览卡片：数量 + 中心平均处理用时（各环节四舍五入取整，合计为三者之和）
export function overview(list) {
  const avg = averageDurations(list)
  const stage = { sort: Math.round(avg.sort), reply: Math.round(avg.reply), audit: Math.round(avg.audit) }
  return { ...counts(list), avg, stage: { ...stage, total: stage.sort + stage.reply + stage.audit } }
}

// 各月提交量（总行 / 分行）与采纳率
export function monthlySubmit(list, months) {
  const rows = months.map((m) => ({ month: m, head: 0, branch: 0, analyzed: 0, adopted: 0 }))
  const at = Object.fromEntries(rows.map((r) => [r.month, r]))
  for (const s of list) {
    const r = at[month(s.submitTime)]
    if (!r) continue
    isBranchSubmit(s) ? r.branch++ : r.head++
    if (isAnalyzed(s)) r.analyzed++
    if (isAdopted(s)) r.adopted++
  }
  return rows.map((r) => ({ ...r, total: r.head + r.branch, rate: r.analyzed ? rateOf(r.adopted, r.analyzed) : null }))
}

// 中心平均处理用时：按业研部门（顺序同管理报表）
export function deptAverages(list) {
  const rows = rdDepts.map((dept) => {
    const sub = list.filter((s) => s.bizDept === dept)
    return { dept, count: sub.length, ...averageDurations(sub) }
  })
  return { rows, all: { dept: '业务研发中心', count: list.filter((s) => s.bizDept).length, ...averageDurations(list) } }
}

// ===== 采集情况 =====
export function sourceSplit(list) {
  const branch = list.filter(isBranchSubmit).length
  return [
    { name: '分行提交', value: branch, pct: pct(branch, list.length) },
    { name: '业务研发中心提交', value: list.length - branch, pct: pct(list.length - branch, list.length) }
  ]
}
// 提交机构排行（来源分布「详情」）
export function orgRanking(list) {
  const m = new Map()
  for (const s of list) {
    const org = s.submitOrg || '未知机构'
    m.set(org, (m.get(org) || 0) + 1)
  }
  return [...m]
    .map(([name, value]) => ({ name, type: isBranchOrg(name) ? '分行' : '业务研发中心', value, pct: pct(value, list.length) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh'))
    .map((r, i) => ({ rank: i + 1, ...r }))
}
// 产品排行（TOP5「详情」）
export function productRanking(list) {
  const m = new Map()
  for (const s of list) m.set(s.product, (m.get(s.product) || 0) + 1)
  return [...m]
    .map(([name, value]) => {
      const p = productList.find((x) => x.name === name)
      return { name, dept: p?.rdDept || p?.outer || '', line: p?.rdLine || '', value, pct: pct(value, list.length) }
    })
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh'))
    .map((r, i) => ({ rank: i + 1, ...r }))
}
// 按固定顺序统计分布（字典中没有的取值追加在后）
function splitBy(list, key, order) {
  const m = new Map(order.map((k) => [k, 0]))
  for (const s of list) {
    const k = s[key]
    if (k) m.set(k, (m.get(k) || 0) + 1)
  }
  const total = [...m.values()].reduce((a, b) => a + b, 0)
  return [...m].map(([name, value]) => ({ name, value, pct: pct(value, total) }))
}
export const categorySplit = (list) => splitBy(list, 'category', categories.map((c) => c.value))

// ===== 分析情况 =====
export function monthlyAdopt(list, months) {
  const rows = months.map((m) => ({ month: m, adopted: 0, rejected: 0 }))
  const at = Object.fromEntries(rows.map((r) => [r.month, r]))
  for (const s of list) {
    const r = at[month(s.submitTime)]
    if (!r) continue
    if (isAdopted(s)) r.adopted++
    else if (isRejected(s)) r.rejected++
  }
  return rows.map((r) => ({ ...r, rate: r.adopted + r.rejected ? rateOf(r.adopted, r.adopted + r.rejected) : null }))
}
export const rejectSplit = (list) => splitBy(list.filter(isRejected), 'rejectReason', rejectReasons)

// ===== 解决情况（推测：截图未展示该部分）=====
export const solutionSplit = (list) => splitBy(list.filter(isAdopted), 'solution', solutions.map((x) => x.value))
// 各月解决数：按实际落实时间所在月份；月份轴覆盖查询范围及全部落实月份，保证合计与「解决」数一致
export function monthlySolved(list, [from, to] = []) {
  const solved = list.filter(isSolved)
  const ms = solved.map((s) => month(s.actualTime)).filter(Boolean)
  const lo = [month(from), ...ms].filter(Boolean).sort()[0]
  const hi = [month(to), ...ms].filter(Boolean).sort().at(-1)
  const rows = monthsBetween(lo, hi).map((m) => ({ month: m, solved: 0 }))
  const at = Object.fromEntries(rows.map((r) => [r.month, r]))
  for (const m of ms) if (at[m]) at[m].solved++
  return rows
}

// ===== 导出（优化建议详情：查询范围内的建议）=====
export const exportColumns = [
  { prop: 'id', label: '优化建议编号' },
  { prop: 'product', label: '产品名称' },
  { prop: 'channelText', label: '产品使用渠道' },
  { prop: 'column', label: '功能栏目' },
  { prop: 'category', label: '优化建议分类' },
  { prop: 'desc', label: '优化建议描述' },
  { prop: 'source', label: '来源' },
  { prop: 'proposer', label: '提出人' },
  { prop: 'proposerId', label: '提出人统一认证号' },
  { prop: 'submitOrg', label: '提交机构' },
  { prop: 'submitType', label: '提交机构类型' },
  { prop: 'submitTime', label: '提交时间' },
  { prop: 'bizDept', label: '所属业研部门' },
  { prop: 'productLine', label: '所属产品线' },
  { prop: 'status', label: '状态' },
  { prop: 'currentHandler', label: '当前处理人' },
  { prop: 'adoptResult', label: '采纳结果' },
  { prop: 'solution', label: '解决方式' },
  { prop: 'rejectReason', label: '未采纳原因' },
  { prop: 'priority', label: '优先级' },
  { prop: 'reqNo', label: '需求项编号' },
  { prop: 'planTime', label: '计划落实时间' },
  { prop: 'implemented', label: '是否已落实' },
  { prop: 'actualTime', label: '实际落实时间' }
]
export const exportRows = (list) =>
  list.map((s) => ({
    ...s,
    channelText: (s.channels || []).join('、'),
    submitType: isBranchSubmit(s) ? '分行' : '业务研发中心',
    desc: (s.desc || '').replace(/\n/g, ' ')
  }))

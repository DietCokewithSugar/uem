// Quartz 风格 cron 表达式：秒 分 时 日 月 周 [年]
// 支持 * ? 数字、区间 a-b（可跨界，如 FRI-MON）、列表 a,b、步长 a/b 与 */b；
// 日字段 L / L-n / nW / LW，周字段 nL / n#m；月份 JAN-DEC，星期 SUN-SAT（1=周日 … 7=周六）
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const WEEKS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const FIELDS = [
  { label: '秒', min: 0, max: 59 },
  { label: '分', min: 0, max: 59 },
  { label: '时', min: 0, max: 23 },
  { label: '日', min: 1, max: 31 },
  { label: '月', min: 1, max: 12, names: MONTHS },
  { label: '周', min: 1, max: 7, names: WEEKS },
  { label: '年', min: 1970, max: 2099 }
]
const DOM = 3
const DOW = 5

const fail = (msg) => {
  throw new Error(msg)
}

function toNum(tok, f) {
  if (f.names) {
    const i = f.names.indexOf(tok.toUpperCase())
    if (i >= 0) return i + 1
  }
  if (!/^\d+$/.test(tok)) fail(`「${f.label}」字段包含无法识别的值「${tok || '空'}」`)
  const n = Number(tok)
  if (n < f.min || n > f.max) fail(`「${f.label}」字段取值 ${n} 超出范围 ${f.min}-${f.max}`)
  return n
}

function parseField(raw, idx) {
  const f = FIELDS[idx]
  const s = raw.toUpperCase()
  const spec = { values: new Set() }
  let m
  if (s === '?') {
    if (idx !== DOM && idx !== DOW) fail(`「${f.label}」字段不支持 ?（仅日、周字段可用）`)
    spec.noSpec = true
    return spec
  }
  if (idx === DOM) {
    if (s === 'L' || s === 'LW') return Object.assign(spec, { last: 0, weekday: s === 'LW' })
    if ((m = /^L-(\d+)$/.exec(s))) {
      if (+m[1] > 30) fail('「日」字段 L-n 的偏移量应在 0-30 之间')
      return Object.assign(spec, { last: +m[1] })
    }
    if ((m = /^(\d+)W$/.exec(s))) return Object.assign(spec, { nearest: toNum(m[1], f) })
  }
  if (idx === DOW) {
    if (s === 'L') return Object.assign(spec, { values: new Set([7]) }) // 单独的 L 表示周六
    if ((m = /^([A-Z0-9]+)L$/.exec(s))) return Object.assign(spec, { lastDow: toNum(m[1], f) })
    if ((m = /^([A-Z0-9]+)#(\d+)$/.exec(s))) {
      if (+m[2] < 1 || +m[2] > 5) fail('「周」字段 # 后的序号应在 1-5 之间')
      return Object.assign(spec, { nthDow: toNum(m[1], f), nth: +m[2] })
    }
  }
  const span = f.max - f.min + 1
  for (const part of raw.split(',')) {
    const segs = part.split('/')
    if (segs.length > 2) fail(`「${f.label}」字段「${part}」格式错误`)
    const [range, step] = segs
    let start, end
    if (range === '*') [start, end] = [f.min, f.max]
    else if (range.includes('-')) {
      const ends = range.split('-')
      if (ends.length !== 2) fail(`「${f.label}」字段区间「${range}」格式错误`)
      start = toNum(ends[0], f)
      end = toNum(ends[1], f)
    } else {
      start = toNum(range, f)
      end = step === undefined ? start : f.max
    }
    let inc = 1
    if (step !== undefined) {
      if (!/^\d+$/.test(step) || +step < 1) fail(`「${f.label}」字段步长「${step || '空'}」应为正整数`)
      if (+step > span) fail(`「${f.label}」字段步长 ${step} 超出范围 1-${span}`)
      inc = +step
    }
    // 结束值小于起始值时按跨界区间处理，如 22-2 点、FRI-MON
    const len = end >= start ? end - start : end + span - start
    for (let k = 0; k <= len; k += inc) spec.values.add(((start - f.min + k) % span) + f.min)
  }
  return spec
}

// 解析失败时抛出带中文说明的 Error
export function parseCron(expr) {
  const parts = String(expr ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) fail('请输入cron表达式')
  if (parts.length < 6 || parts.length > 7) fail(`cron表达式应为 6 或 7 段（秒 分 时 日 月 周 [年]），当前为 ${parts.length} 段`)
  const specs = parts.map(parseField)
  if (specs.length === 6) specs.push(parseField('*', 6))
  if (!!specs[DOM].noSpec === !!specs[DOW].noSpec) fail('「日」和「周」字段必须有且只有一个为 ?')
  for (const sp of specs) sp.list = [...sp.values].sort((a, b) => a - b)
  return specs
}

// 返回错误说明，合法时返回空字符串
export function validateCron(expr) {
  try {
    parseCron(expr)
    return ''
  } catch (e) {
    return e.message
  }
}

const lastDayOf = (y, m) => new Date(y, m, 0).getDate()
// 距 n 日最近的工作日（不跨月）
function nearestWeekday(y, m, n, last) {
  const w = new Date(y, m - 1, n).getDay()
  if (w === 6) return n === 1 ? 3 : n - 1
  if (w === 0) return n === last ? n - 2 : n + 1
  return n
}

function dayMatches(dom, dow, d) {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const date = d.getDate()
  const last = lastDayOf(y, m)
  if (!dom.noSpec) {
    if (dom.last !== undefined) return date === (dom.weekday ? nearestWeekday(y, m, last, last) : last - dom.last)
    if (dom.nearest !== undefined) return dom.nearest <= last && date === nearestWeekday(y, m, dom.nearest, last)
    return dom.values.has(date)
  }
  const wd = d.getDay() + 1
  if (dow.lastDow !== undefined) return wd === dow.lastDow && date + 7 > last
  if (dow.nthDow !== undefined) return wd === dow.nthDow && Math.ceil(date / 7) === dow.nth
  return dow.values.has(wd)
}

const nextIn = (list, v) => list.find((x) => x > v)

// 计算 from 之后（不含）的 count 个触发时间；表达式非法或不再触发时返回空数组 / 不足 count 个
export function nextFireTimes(expr, from = new Date(), count = 5) {
  let specs
  try {
    specs = parseCron(expr)
  } catch {
    return []
  }
  const [sec, min, hour, dom, mon, dow, year] = specs
  const out = []
  let t = new Date(Math.floor(from.getTime() / 1000) * 1000 + 1000)
  for (let guard = 0; out.length < count && guard < 200000; guard++) {
    const y = t.getFullYear()
    const mo = t.getMonth() + 1
    const day = t.getDate()
    const h = t.getHours()
    const mi = t.getMinutes()
    const s = t.getSeconds()
    if (y > 2099) break
    if (!year.values.has(y)) {
      const ny = nextIn(year.list, y)
      if (ny === undefined) break
      t = new Date(ny, 0, 1)
    } else if (!mon.values.has(mo)) {
      const nm = nextIn(mon.list, mo)
      t = nm === undefined ? new Date(y + 1, 0, 1) : new Date(y, nm - 1, 1)
    } else if (!dayMatches(dom, dow, t)) {
      t = new Date(y, mo - 1, day + 1)
    } else if (!hour.values.has(h)) {
      const nh = nextIn(hour.list, h)
      t = nh === undefined ? new Date(y, mo - 1, day + 1) : new Date(y, mo - 1, day, nh)
    } else if (!min.values.has(mi)) {
      const nmi = nextIn(min.list, mi)
      t = nmi === undefined ? new Date(y, mo - 1, day, h + 1) : new Date(y, mo - 1, day, h, nmi)
    } else if (!sec.values.has(s)) {
      const ns = nextIn(sec.list, s)
      t = ns === undefined ? new Date(y, mo - 1, day, h, mi + 1) : new Date(y, mo - 1, day, h, mi, ns)
    } else {
      out.push(t)
      t = new Date(t.getTime() + 1000)
    }
  }
  return out
}

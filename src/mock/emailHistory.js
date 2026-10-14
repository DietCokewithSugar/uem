// 后台管理 · 邮件记录演示数据：定时任务发送的提醒 / 预警邮件流水（收件人均为虚构）
// dealSuggestion：每个工作日 10:00 向待办处理人逐条发送优化建议待办提醒，「节假日」中的非工作日不发送
// activityEmail：每周一 07:00 向创建超过 30 个自然日仍在进行中的体验活动创建人发送提醒，非工作日不发送
// uvsiWarning：实时监测 UVSI 达到中高度压力时向实时监测收件人发送预警（实时监测不区分工作日）
import { shallowReactive } from 'vue'
import { suggestions, activities, productLines } from './index'
import { persons } from './system'
import { alertReceivers } from './voiceTools'
import { realtime } from './voice'
import { isWorkday, fmtDate } from './holidays'
import { nowText } from './qc'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(1014)

const NOW = new Date()
const TODAY = fmtDate(NOW)
const DAY = 864e5
const parseDay = (s) => new Date(`${s}T00:00:00`)
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const PENDING = ['待修改', '待处理', '待分拣', '待答复', '待跟进']

// 优化建议没有处理人字段：按产品线固定分派给一名处理岗人员，同一处理人每天会收到多封
const handlerPool = persons.filter((p) => p.status === '激活' && p.roles.some((r) => r.endsWith('处理岗')))
const handlerOf = (s) => handlerPool[(Math.max(0, productLines.indexOf(s.productLine)) * 6) % handlerPool.length].id

// 体验活动只记录创建人姓名：同名人员取其统一认证号，否则按姓名生成固定的虚构认证号
const creatorIds = new Map()
function creatorId(name) {
  if (!creatorIds.has(name)) {
    const known = persons.find((p) => p.name === name)
    let h = [...name].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 70000, 7)
    const used = new Set(creatorIds.values())
    while (!known && used.has(`0017${30000 + h}`)) h = (h + 1) % 70000
    creatorIds.set(name, known ? known.id : `0017${30000 + h}`)
  }
  return creatorIds.get(name)
}
// 未关闭且创建时间超过 30 个自然日
const overdue = (a, day) => a.status === '进行中' && (parseDay(day) - parseDay(a.submitTime)) / DAY > 30

// 实时监测预警阈值：中高度压力 UVSI 下限
const UVSI_WARN = realtime.thresholds.find(([name]) => name.startsWith('中高度压力'))[1]

let seq = 0
const mail = (type, recipient, created, s, status = '') => ({
  id: ++seq,
  type,
  recipient,
  status,
  suggestionId: s ? s.id : '',
  submitTime: s ? s.submitTime : '',
  created
})
// 创建时间倒序，同一批次按优化建议编号倒序
const byCreated = (a, b) =>
  a.created !== b.created ? (a.created < b.created ? 1 : -1)
    : a.suggestionId !== b.suggestionId ? (a.suggestionId < b.suggestionId ? 1 : -1)
      : a.recipient < b.recipient ? -1 : 1

// 从 from 到今天、已过触发时刻（hms）的日期
function fireDays(from, hms, step = 1) {
  const days = []
  for (let d = parseDay(from); fmtDate(d) <= TODAY; d = addDays(d, step)) {
    const day = fmtDate(d)
    if (new Date(`${day}T${hms}`) <= NOW) days.push(day)
  }
  return days
}

function build() {
  const list = []

  // 优化建议待办提醒：提交次日起至答复日（未答复的至今天），每个工作日一封
  const first = suggestions.reduce((m, s) => (s.submitTime < m ? s.submitTime : m), TODAY)
  const workdays = fireDays(first, '10:00:00').filter((d) => isWorkday(d))
  for (const s of suggestions) {
    const pending = PENDING.includes(s.status)
    // 已关闭的建议最晚提醒到答复日（答复日在今天及以后的视为今天已答复）
    const days = workdays.filter((d) => d > s.submitTime && (pending || (d <= s.replyTime && d < TODAY)))
    // 已答复 / 办结的建议：前约 2/3 为待处理，最后约 1/3 为待答复
    const cut = Math.ceil((days.length * 2) / 3)
    days.forEach((d, i) => list.push(mail('dealSuggestion', handlerOf(s), `${d} 10:00:00`, s, pending ? s.status : i < cut ? '待处理' : '待答复')))
  }

  // 体验活动超期提醒：每周一 07:00
  const firstAct = activities.reduce((m, a) => (a.submitTime < m ? a.submitTime : m), TODAY)
  let monday = parseDay(firstAct)
  monday = addDays(monday, (8 - monday.getDay()) % 7)
  for (const d of fireDays(fmtDate(monday), '07:00:00', 7).filter((x) => isWorkday(x))) {
    for (const a of activities) if (overdue(a, d)) list.push(mail('activityEmail', creatorId(a.creator), `${d} 07:00:00`))
  }

  // 实时监测预警：近 3 日按「声音看板 · 实时监测」的 UVSI 走势（每 3 小时一个点，自 10-10 03:00 起），更早的为每周 0–3 次
  const start = new Date(2026, 9, 10)
  const times = new Set()
  for (let wk = parseDay('2025-11-03'); wk < start; wk = addDays(wk, 7)) {
    const k = Math.floor(rand() * 4)
    for (let j = 0; j < k; j++) {
      const t = addDays(wk, Math.floor(rand() * 7))
      t.setHours([9, 12, 15, 18][Math.floor(rand() * 4)])
      if (t < start) times.add(nowText(t))
    }
  }
  realtime.uvsi.forEach((v, i) => {
    const t = new Date(+start + (i * 3 + 3) * 36e5)
    if (v >= UVSI_WARN && t <= NOW) times.add(nowText(t))
  })
  for (const t of times) for (const r of alertReceivers) list.push(mail('uvsiWarning', r.id, t))

  return list.sort(byCreated)
}

export const emailRecords = shallowReactive(build())

// 某一触发时刻发送的邮件（定时任务执行日志据此统计发送数量）
export const emailsAt = (type, created) => emailRecords.filter((r) => r.type === type && r.created === created)

// 立刻执行：按当前数据发送一批，创建时间为当前时间，插入列表最前
function prepend(list) {
  emailRecords.unshift(...list.sort(byCreated))
  return list
}
export const sendDealSuggestion = (now = new Date()) =>
  prepend(suggestions.filter((s) => PENDING.includes(s.status)).map((s) => mail('dealSuggestion', handlerOf(s), nowText(now), s, s.status)))
export const sendActivityEmail = (now = new Date()) =>
  prepend(activities.filter((a) => overdue(a, fmtDate(now))).map((a) => mail('activityEmail', creatorId(a.creator), nowText(now))))
// 以实时监测最新一期 UVSI 判断是否预警
export const sendUvsiWarning = (now = new Date()) =>
  prepend(realtime.uvsi.at(-1) >= UVSI_WARN ? alertReceivers.map((r) => mail('uvsiWarning', r.id, nowText(now))) : [])

// 后台管理 · 日志管理演示数据：uem-server 服务器上的日志文件（按天滚动；主日志保留 30 天并压缩归档，错误日志、问卷批量日志保留 14 天）
// 文件内容按日期做种子生成，查看与下载一致；只有虚构的定时任务、接口请求记录和 9 位统一认证号
import { nowText } from './qc'
import { persons } from './system'
import { isWorkday } from './holidays'

// 日志列表接口，受「接口权限」控制
export const LOG_API = { uri: '/icbc/uem-server/log', method: 'GET' }

// FNV-1a，相邻日期的种子也能充分打散
const hash = (s) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return h % 233280
}
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rng = (key) => {
  const r = seeded(hash(key))
  r()
  return r
}
const pad = (n, l = 2) => String(n).padStart(l, '0')
const ymd = (d) => nowText(d).slice(0, 10)
const stamp = (t) => `${nowText(t)}.${pad(t.getMilliseconds(), 3)}`
const fmt = (t, level, thread, logger, msg) => `${stamp(t)} ${level.padEnd(5)} [${thread}] ${logger} - ${msg}`

const NOW = new Date()
const dayAgo = (n) => {
  const d = new Date(NOW)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}
const users = persons.filter((p) => p.status === '激活').map((p) => p.id)

// 定时任务（与「定时任务」页已启动任务的 cron 一致）：[服务类.方法, 触发时刻, 耗时区间(ms), 结果模板, {n} 区间, 失败概率, 异常]
const daily = (h, m) => () => [[h, m]]
const monthly = (day, h, m) => (d) => (d.getDate() === day ? [[h, m]] : [])
const lastDay = (h, m) => (d) => (new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() === d.getDate() ? [[h, m]] : [])
const jobs = [
  ['srSurveyProductServiceImpl.synProduct', () => [[0, 0], [12, 0]], [600, 1800], 'synced {n} products', [36, 52]],
  ['experienceActivityServiceImpl.autoFinishActivity', daily(0, 5), [1000, 4000], 'auto finished {n} activities', [0, 5]],
  ['sysUserServiceImpl.synUserInfo', daily(0, 10), [60000, 180000], 'synced {n} users', [1200, 5400]],
  ['qcAgentReportServiceImpl.cleanExpiredReport', daily(0, 30), [800, 3500], 'removed {n} expired reports (keepDays=90)', [0, 9]],
  ['voiceHotWordsServiceImpl.saveVoiceHotWords', monthly(1, 1, 0), [38000, 92000], 'generated {n} voice hot words', [180, 320]],
  ['hotWordsServiceImpl.saveHotWords', monthly(1, 1, 15), [26000, 71000], 'generated {n} suggestion hot words', [150, 260]],
  ['experEvaluationServiceImpl.syncEvaluationData', daily(1, 20), [30000, 120000], 'synced {n} evaluation records', [5000, 21000], 0.1, 'c.i.uem.monitor.EvaluationFileNotReadyException: evaluation data file not arrived, retry next cycle'],
  ['sysUserServiceImpl.synPersonnel', daily(1, 30), [3000, 9000], 'synced {n} experiencer flags', [6, 80]],
  ['voiceClassifyServiceImpl.dailySmartClassify', daily(2, 0), [180000, 560000], 'classified {n} voices', [2400, 7800], 0.15, 'c.i.uem.llm.LlmGatewayTimeoutException: llm gateway timeout after 60000ms'],
  ['suggestionAgvDataServiceImpl.saveAvgSuggestion', daily(2, 30), [2000, 7000], 'averaged durations of {n} suggestions', [9000, 12000]],
  ['suggestionServiceImpl.autoConfirmSuggestion', daily(3, 0), [1500, 6000], 'auto confirmed {n} suggestions (days=15)', [0, 45]],
  ['experiencePersonnelServiceImpl.syncInPersonnelState', lastDay(3, 10), [5000, 15000], 'froze {n} experiencers not on duty', [3, 40]],
  ['cstpTaskServiceImpl.sysCstpTask', daily(3, 30), [8000, 26000], 'synced {n} cstp point records', [300, 2600], 0.1, 'org.springframework.web.client.HttpServerErrorException$ServiceUnavailable: 503 Service Unavailable'],
  ['sysUserServiceImpl.synRankLevel', daily(3, 50), [4000, 12000], 'updated {n} rank levels', [20, 260]],
  ['operationDataServiceImpl.statOperationData', monthly(2, 4, 0), [90000, 260000], 'monthly operation report generated, {n} modules', [9, 9]],
  ['typicalProblemServiceImpl.monthlyExtract', monthly(1, 5, 0), [240000, 720000], 'extracted {n} typical problems', [12, 30]],
  ['journeyBoardServiceImpl.statJourneyBoard', daily(6, 0), [20000, 64000], 'aggregated {n} journeys', [40, 70]],
  ['emailRecipientServiceImpl.activityEmail', (d) => (d.getDay() === 1 ? [[7, 0]] : []), [1200, 5600], 'sent {n} activity reminder mails', [0, 14], 0.1, 'org.springframework.mail.MailSendException: 421 service not available'],
  ['todoRemindServiceImpl.overdueRemindEmail', daily(10, 0), [2000, 9000], 'sent {n} todo reminder mails', [4, 60]],
  ['sysOrgServiceImpl.synOrganization', daily(23, 0), [15000, 45000], 'synced {n} organizations', [9800, 10200]],
  ['realtimeMonitorServiceImpl.calcUvsiAndWarn', () => [0, 3, 6, 9, 12, 15, 18, 21].map((h) => [h, 0]), [9000, 30000], 'uvsi calculated, {n} warnings', [0, 3]]
]
const apis = [
  ['GET', '/icbc/uem-server/suggestion/list', [60, 420]],
  ['GET', '/icbc/uem-server/suggestion/detail', [30, 180]],
  ['POST', '/icbc/uem-server/suggestion/save', [90, 650]],
  ['GET', '/icbc/uem-server/activity/list', [50, 300]],
  ['GET', '/icbc/uem-server/voice/list', [200, 2600]],
  ['POST', '/icbc/uem-server/voice/analysis', [900, 6500]],
  ['GET', '/icbc/uem-server/monitor/uvsi', [80, 900]],
  ['GET', '/icbc/uem-server/journey/board', [120, 1500]],
  ['POST', '/icbc/uem-server/qc/report', [2000, 9500]],
  ['GET', '/icbc/uem-server/sys/dict/list', [20, 90]],
  ['PUT', '/icbc/uem-server/sys/scheduleJob/pause', [30, 120]],
  ['GET', LOG_API.uri, [20, 80]]
]
// 发邮件的任务每天照常触发，「节假日」中的非工作日跳过发送
const workdayOnly = new Set(['emailRecipientServiceImpl.activityEmail', 'todoRemindServiceImpl.overdueRemindEmail'])
const stack = (ex, at) => [ex, ...at.map((s) => `\tat ${s}`)].join('\n')

// 某一天 uem-server 的全部日志事件（按时间排序）；错误日志即其中的 ERROR 事件
const dayCache = new Map()
function dayEvents(d0) {
  const key = ymd(d0)
  if (dayCache.has(key)) return dayCache.get(key)
  const r = rng(key)
  const between = ([a, b]) => Math.round(a + r() * (b - a))
  const pick = (arr) => arr[Math.floor(r() * arr.length)]
  const at = (h, m, s = 0, ms = 0) => new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), h, m, s, ms)
  const ev = []
  const push = (t, level, thread, logger, msg) => ev.push({ t, level, text: fmt(t, level, thread, logger, msg) })
  // 调度线程：同一线程同一时段只执行一个任务，被占用时顺延到下一个线程
  const busy = Array.from({ length: 10 }, () => [])
  const worker = (k, s, e) => {
    while (busy[k].some(([a, b]) => s < b && a < e)) k = (k + 1) % busy.length
    busy[k].push([s, e])
    return `uem-scheduler-${k + 1}`
  }

  jobs.forEach(([name, times, cost, result, nr, failP = 0, ex], i) => {
    const skip = workdayOnly.has(name) && !isWorkday(d0)
    for (const [h, m] of times(d0)) {
      const start = at(h, m, 0, between([2, 60]))
      const end = new Date(+start + between(skip ? [20, 110] : cost))
      const thread = worker(i % 4, +start, +end)
      push(start, 'INFO', thread, 'c.i.uem.job.ScheduleJobRunner', `job start ${name}`)
      if (skip) {
        push(end, 'INFO', thread, 'c.i.uem.job.ScheduleJobRunner', `job finished ${name} cost=${+end - +start}ms result="non-working day, mail sending skipped"`)
      } else if (r() < failP) {
        push(end, 'ERROR', thread, 'c.i.uem.job.ScheduleJobRunner', `job failed ${name} cost=${+end - +start}ms\n${stack(ex, ['c.i.uem.job.ScheduleJobRunner.invoke(ScheduleJobRunner.java:87)', 'org.quartz.core.JobRunShell.run(JobRunShell.java:202)'])}`)
      } else {
        push(end, 'INFO', thread, 'c.i.uem.job.ScheduleJobRunner', `job finished ${name} cost=${+end - +start}ms result="${result.replace('{n}', between(nr))}"`)
      }
    }
  })

  // 接口访问：工作日白天为主，晚间、非工作日零星
  const workday = isWorkday(d0)
  const count = workday ? between([50, 90]) : between([6, 16])
  for (let k = 0; k < count; k++) {
    const night = r() < 0.1
    const sec = night ? between([19 * 3600, 22 * 3600]) : between([8.5 * 3600, 18.5 * 3600])
    const t = at(0, 0, sec, between([0, 999]))
    const [method, uri, costR] = pick(apis)
    const thread = `http-nio-8080-exec-${between([1, 10])}`
    let user = pick(users)
    let status = 200
    let cost = between(costR)
    if (uri === LOG_API.uri) {
      // 日志接口：仅「接口权限」中的允许用户可访问，其他人请求返回 403
      user = r() < 0.6 ? '001700106' : user
      if (user !== '001700106') {
        status = 403
        push(t, 'WARN', thread, 'c.i.uem.auth.ApiPermissionInterceptor', `access denied: ${method} ${uri} user=${user}, not in allow users or roles`)
      }
    } else if (uri === '/icbc/uem-server/voice/list' && r() < 0.04) {
      status = 500
      cost = 30000 + between([0, 400])
      push(new Date(+t + cost), 'ERROR', thread, 'c.i.uem.web.GlobalExceptionHandler', `request failed ${method} ${uri} user=${user}\n${stack('java.net.SocketTimeoutException: Read timed out', ['java.base/java.net.SocketInputStream.socketRead0(Native Method)', 'c.i.uem.voice.VoiceSearchClient.query(VoiceSearchClient.java:134)', 'c.i.uem.voice.VoiceService.list(VoiceService.java:58)'])}`)
    }
    const done = new Date(+t + cost)
    if (cost > 3000 && status === 200) push(done, 'WARN', thread, 'c.i.uem.web.AccessLogFilter', `slow request ${method} ${uri} cost=${cost}ms`)
    push(done, 'INFO', thread, 'c.i.uem.web.AccessLogFilter', `${method} ${uri} user=${user} status=${status} cost=${cost}ms`)
  }
  ev.sort((a, b) => a.t - b.t)
  dayCache.set(key, ev)
  return ev
}

// 问卷批量日志：问卷答卷批量导入、批量推送，单独输出到 survey-batch 文件
function surveyEvents(d0) {
  const key = ymd(d0)
  const r = rng(`survey-batch ${key}`)
  const between = ([a, b]) => Math.round(a + r() * (b - a))
  if (r() > 0.45) return []
  const ev = []
  const L = 'c.i.uem.survey.SurveyBatchService'
  const runs = between([1, 2])
  for (let k = 1; k <= runs; k++) {
    let t = new Date(+d0 + between([9 * 3600, 17 * 3600]) * 1000 + between([0, 999]))
    const step = (ms) => (t = new Date(+t + ms))
    const push = (level, msg) => ev.push({ t, level, text: fmt(t, level, `survey-batch-${k}`, L, msg) })
    const batchNo = `SB${key.replace(/-/g, '')}${pad(k)}`
    const type = r() < 0.6 ? 'import' : 'push'
    const surveys = between([1, 4])
    push('INFO', `batch start batchNo=${batchNo} type=${type} operator=${users[between([1, users.length - 1])]} surveys=${surveys}`)
    let total = 0
    let skipped = 0
    for (let s = 0; s < surveys; s++) {
      const sid = `SV${key.slice(0, 4)}${pad(between([1, 9999]), 4)}`
      const n = between([200, 4800])
      total += n
      step(between([300, 1500]))
      push('INFO', `surveyId=${sid} ${type === 'import' ? 'answers' : 'receivers'} loaded=${n}`)
      for (let off = 0; off < n; off += 1000) {
        step(between([800, 4000]))
        push('INFO', `surveyId=${sid} ${type === 'import' ? 'inserted' : 'pushed'} ${Math.min(off + 1000, n)}/${n}`)
      }
      if (r() < 0.4) {
        const x = between([1, 30])
        skipped += x
        step(between([50, 300]))
        push('WARN', `surveyId=${sid} ${x} ${type === 'import' ? 'answers skipped: duplicate respondent' : 'receivers skipped: no valid mobile channel'}`)
      }
    }
    step(between([200, 900]))
    push('INFO', `batch finished batchNo=${batchNo} total=${total} success=${total - skipped} skipped=${skipped} failed=0`)
  }
  return ev.sort((a, b) => a.t - b.t)
}

// ===== 文件列表 =====
const files = []
const add = (name, status, t, events) => files.push({ name, status, time: nowText(t), events })
const upTo = (ev, end) => ev.filter((e) => e.t <= end)
// 当前文件 uem-server.log：今天截至当前时刻
const current = new Date(+NOW - 3000)
add('uem-server.log', '写入中', current, () => upTo(dayEvents(dayAgo(0)), current))
// 历史文件：零点滚动后压缩为 .log.gz
for (let n = 1; n <= 30; n++) {
  const d0 = dayAgo(n)
  add(`uem-server.${ymd(d0)}.log.gz`, '已归档', new Date(+dayAgo(n - 1) + 1000 + (hash(ymd(d0)) % 5000)), () => dayEvents(d0))
}
for (let n = 0; n < 14; n++) {
  const d0 = dayAgo(n)
  const status = n ? '已归档' : '写入中'
  const errors = upTo(dayEvents(d0), NOW).filter((e) => e.level === 'ERROR')
  if (errors.length) add(`uem-server-error.${ymd(d0)}.log`, status, errors[errors.length - 1].t, () => errors)
  const batch = upTo(surveyEvents(d0), NOW)
  if (batch.length) add(`survey-batch.${ymd(d0)}.log`, status, batch[batch.length - 1].t, () => batch)
}
// 按时间倒序
export const serverLogs = files.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))

// 文件全部内容（按行）
export const logLines = (file) => file.events().flatMap((e) => e.text.split('\n'))
export const logText = (file) => logLines(file).join('\n') + '\n'

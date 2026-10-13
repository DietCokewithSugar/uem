// 后台管理 · 定时任务演示数据：前 10 条与截图一致，其余为平台其他模块的同类任务
// 执行日志按 cron 反推最近几次定时触发；暂停的任务在暂停时间之后不再有定时记录
import { reactive } from 'vue'
import { nextFireTimes } from '@/components/cron'
import { nowText } from './qc'
import { currentUser } from '@/config/user'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(2207)
const between = ([a, b], r = rand) => Math.round(a + r() * (b - a))

// [服务类, 方法名, 方法参数, cron, 描述, 状态, 暂停时间, 耗时区间(ms), 执行说明模板, {n} 区间, 失败说明]
const seed = [
  ['codeTrackInfoUemServiceImpl', 'hiveSynMysql', '', '0 0 4 15 * ?', '问卷同步工银e生活大数据同步到用户体验', '已暂停', '2026-03-20 16:42:18', [420000, 980000], '同步问卷埋点数据 {n} 条', [18000, 46000], '连接大数据平台 Hive 超时，等待下一周期重试'],
  ['srSurveyProductServiceImpl', 'synProduct', '', '0 0 0/12 * * ?', '用户体验平台同步精品产品同步到问卷', '已启动', '', [600, 1800], '同步精品产品 {n} 个', [36, 52]],
  ['voiceHotWordsServiceImpl', 'saveVoiceHotWords', '', '0 0 1 1 * ?', '保存客户声音热词', '已启动', '', [38000, 92000], '生成客户声音热词 {n} 个', [180, 320]],
  ['hotWordsServiceImpl', 'saveHotWords', '', '0 15 1 1 * ?', '保存优化建议热词', '已启动', '', [26000, 71000], '生成优化建议热词 {n} 个', [150, 260]],
  ['emailRecipientServiceImpl', 'activityEmail', '', '0 0 7 ? * MON', '体验活动发邮件（未关闭活动的创建时间>30个自然日的，则给该活动创建人发邮件）', '已启动', '', [1200, 5600], '发送活动超期提醒邮件 {n} 封', [0, 14], '邮件网关返回 421，已记录至邮件记录待重发'],
  ['cstpTaskServiceImpl', 'sysCstpTask', '', '0 30 3 * * ?', '同步众测积分明细同步到用户体验，定时任务增量更新，手动执行先按执行日期更新积分为0再执行 参数示例：2020-11-18 00:00:00', '已启动', '', [8000, 26000], '增量同步众测积分明细 {n} 条', [300, 2600], '众测平台接口返回 503，等待下一周期重试'],
  ['sysUserServiceImpl', 'synPersonnel', '', '0 30 1 * * ?', '用户体验平台向众测同步体验官标识', '已启动', '', [3000, 9000], '同步体验官标识 {n} 人', [6, 80]],
  ['sysUserServiceImpl', 'synRankLevel', '', '0 50 3 * * ?', '众测向用户体验平台同步体验活动人员等级', '已启动', '', [4000, 12000], '更新体验活动人员等级 {n} 人', [20, 260]],
  ['experiencePersonnelServiceImpl', 'syncInPersonnelState', '', '0 10 3 L * ?', '对非在职的体验员（在职状态不是正常）进行冻结', '已启动', '', [5000, 15000], '冻结非在职体验员 {n} 人', [3, 40]],
  ['suggestionAgvDataServiceImpl', 'saveAvgSuggestion', '', '0 30 2 * * ?', '优化建议流程平均时长', '已启动', '', [2000, 7000], '统计优化建议 {n} 条的各环节平均时长', [9000, 12000]],
  ['voiceClassifyServiceImpl', 'dailySmartClassify', '', '0 0 2 * * ?', '用户声音每日智能分类（有效性/情绪/ETS），处理前一自然日新增声音', '已启动', '', [180000, 560000], '智能分类用户声音 {n} 条', [2400, 7800], '大模型服务调用超时，未完成部分顺延至下一周期'],
  ['realtimeMonitorServiceImpl', 'calcUvsiAndWarn', '', '0 0 0/3 * * ?', '实时监测每3小时计算UVSI并向实时监测收件人发送预警邮件', '已启动', '', [9000, 30000], '计算 UVSI 完成，触发预警 {n} 项', [0, 3]],
  ['typicalProblemServiceImpl', 'monthlyExtract', '', '0 0 5 1 * ?', '典型问题月度提炼（按上月优化建议聚类提炼典型问题）', '已启动', '', [240000, 720000], '提炼典型问题 {n} 个', [12, 30]],
  ['qcAgentReportServiceImpl', 'cleanExpiredReport', '90', '0 30 0 * * ?', '质检智能体报告超期清理（参数为报告保留天数）', '已启动', '', [800, 3500], '清理超期质检报告 {n} 份', [0, 9]],
  ['journeyBoardServiceImpl', 'statJourneyBoard', '', '0 0 6 * * ?', '灵犀旅程看板统计（旅程环节体验指标汇总）', '已启动', '', [20000, 64000], '统计旅程 {n} 条', [40, 70]],
  ['experEvaluationServiceImpl', 'syncEvaluationData', '', '0 20 1 * * ?', '体验监测评价数据同步（重点渠道、精品产品评价明细）', '已启动', '', [30000, 120000], '同步评价数据 {n} 条', [5000, 21000], '评价数据文件未到达，等待下一周期重试'],
  ['todoRemindServiceImpl', 'overdueRemindEmail', '', '0 0 9 ? * MON-FRI', '待办超期提醒邮件（工作日向超期待办处理人发送提醒）', '已启动', '', [2000, 9000], '发送待办超期提醒邮件 {n} 封', [4, 60]],
  ['sysOrgServiceImpl', 'synOrganization', '', '0 0 23 * * ?', '用户机构同步（同步行内机构树及机构撤并信息）', '已启动', '', [15000, 45000], '同步机构 {n} 个，其中变更 {m} 个', [9800, 10200]],
  ['sysUserServiceImpl', 'synUserInfo', '', '0 10 0 * * ?', '同步行内人员信息（统一认证号、姓名、所属机构）', '已启动', '', [60000, 180000], '同步人员信息 {n} 人', [1200, 5400]],
  ['suggestionServiceImpl', 'autoConfirmSuggestion', '15', '0 0 3 * * ?', '优化建议答复后超期未确认自动办结（参数为自然日天数）', '已启动', '', [1500, 6000], '自动办结优化建议 {n} 条', [0, 45]],
  ['experienceActivityServiceImpl', 'autoFinishActivity', '', '0 5 0 * * ?', '体验活动到期自动结束并汇总活动积分', '已启动', '', [1000, 4000], '自动结束体验活动 {n} 个', [0, 5]],
  ['operationDataServiceImpl', 'statOperationData', '', '0 0 4 2 * ?', '运营数据月度统计（参数为统计月份，如 2026-09，为空时统计上月）', '已启动', '', [90000, 260000], '生成运营数据月报，涉及 {n} 个模块', [9, 9]],
  ['emailRecordServiceImpl', 'archiveEmailRecord', '180', '0 0 2 ? * SUN', '邮件记录归档（参数为在线保留天数）', '已暂停', '2026-08-09 10:15:32', [5000, 20000], '归档邮件记录 {n} 条', [800, 3600]],
  ['holidayServiceImpl', 'syncHoliday', '', '0 0 1 1 12 ?', '同步次年法定节假日及调休安排', '已暂停', '2025-12-26 14:08:55', [400, 1200], '同步节假日 {n} 天', [28, 32]]
]

const NOW = new Date()
const parseTime = (s) => new Date(s.replace(' ', 'T'))

// 按 cron 取 end 之前最近 count 次触发时间
function lastFires(cron, end, count) {
  let runs = []
  for (const days of [1, 7, 45, 400, 1500]) {
    runs = nextFireTimes(cron, new Date(end - days * 864e5), 400).filter((t) => t < end)
    if (runs.length >= count) break
  }
  return runs.slice(-count)
}

const noteOf = (job, r = rand) => job.note.replace('{n}', between(job.n, r)).replace('{m}', between([0, 12], r))

function seedLogs(job) {
  const end = job.pausedAt ? new Date(Math.min(parseTime(job.pausedAt), NOW)) : NOW
  return lastFires(job.cron, end, 6)
    .map((t) => {
      const failed = job.fail && rand() < 0.1
      const costMs = failed ? Math.round(job.cost[1] * (1.1 + rand() * 0.4)) : between(job.cost)
      return { time: nowText(t), trigger: '定时', result: failed ? '失败' : '成功', costMs, note: failed ? job.fail : noteOf(job) }
    })
    .reverse()
}

export const scheduleJobs = reactive(
  seed.map(([beanName, methodName, params, cron, remark, status, pausedAt, cost, note, n, fail], i) => {
    const job = { id: i + 1, beanName, methodName, params, cron, remark, status, pausedAt, cost, note, n, fail }
    job.logs = seedLogs(job)
    return job
  })
)

// 新增任务的默认执行参数
export const newJob = (data) => ({ ...data, id: Math.max(0, ...scheduleJobs.map((j) => j.id)) + 1, status: '已启动', pausedAt: '', cost: [500, 3000], note: '执行完成', n: [0, 0], fail: '', logs: [] })

// 立刻执行：追加一条手动执行日志（最新在前）
export function runJob(job) {
  const log = {
    time: nowText(),
    trigger: '手动',
    result: '成功',
    costMs: between(job.cost, Math.random),
    note: `${currentUser.name}（${currentUser.id}）手动执行${job.params ? `，参数：${job.params}` : ''}；${noteOf(job, Math.random)}`
  }
  job.logs.unshift(log)
  return log
}

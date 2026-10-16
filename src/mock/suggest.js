// 优化建议（平台核心功能）：字典、演示数据与流程流转
// 依据：优化建议系统流程图、新增页、详情页（含操作日志）、管理报表、数据看板截图；截图中看不到的规则标注「推测」
//
// 流程（非研发一体化问题，业务研发中心产品经理处理）：
//   提交 →（分行员工提交：分行科技审核岗「待处理」，转处理【推测】）→ 产品线分拣岗「待分拣」指派答复人
//   → 产品线处理岗「待答复」答复（明确是否采纳及解决方式）→ 产品线审核岗「待审核」通过 → 按解决方式流转：
//     不采纳 → 已完成
//     科技自主解决 → 待开发中心处理（转 e键通跟进解决，同步问题解决情况）→ 已完成（开发中心）
//     业务科技协同解决（需求整合）→ 已纳入需求整合池（同步 BRDM）
//     业务科技协同解决（需求项）→ 待跟进（跟踪需求编写及需求项投产直至解决闭环）→ 已完成
//     业务科技协同解决（创意需求）→ 已纳入e企创（同步工银e企创）
//     业务自主解决 → 待跟进 → 已完成
//   答复环节可转总行业务部门分析处理：待业务部门答复 → 已完成（业务部门）
// 研发一体化问题（产品由软件开发中心负责）：提交后直接转 e键通，待开发中心处理
import { reactive } from 'vue'
import { persons, productList, branchOrgs } from './system'
import { isWorkday, fmtDate } from './holidays'
import { currentUser } from '@/config/user'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(20261014)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const between = (a, b) => a + Math.floor(rand() * (b - a + 1))
const chance = (p) => rand() < p
function weighted(pairs) {
  const total = pairs.reduce((n, [, w]) => n + w, 0)
  let r = rand() * total
  for (const [v, w] of pairs) if ((r -= w) < 0) return v
  return pairs[pairs.length - 1][0]
}
const pad = (n, len = 2) => String(n).padStart(len, '0')
const timeText = (d) => `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

// ===== 字典 =====

// 来源：客户声音 / 员工心声（流程图左侧）
export const sourceGroups = [
  { label: '客户声音', prefix: '客户', items: ['app用户反馈', '体验活动', '95588工单', '应用商店评论', '第三方测评', '要客意见'] },
  { label: '员工心声', prefix: '员工', items: ['分行优化建议', '工银i服务', '行内调研', '工银众测', '日常走查', '设计还原度走查'] }
]
export const sources = sourceGroups.flatMap((g) => g.items.map((i) => `${g.prefix}：${i}`))

// 产品使用渠道（新增页复选框分组），保存为「分组-渠道」
export const channelGroups = [
  { group: '手机APP', items: ['个人手机银行', '企业手机银行', '工银e生活', '商户之家', '数字货币', '境外个人手机银行', '工银e办公', '兴农通'] },
  { group: '电脑端', items: ['个人网上银行', '企业网上银行', '工银e办公'] },
  { group: '微信', items: ['微信小程序', '微信公众号/服务号'] },
  { group: '线下', items: ['智能柜员机', '柜面', 'POS', 'ATM'] },
  { group: '其他', items: ['短信银行', '电话银行', '第三方渠道', '行内系统/产品'] }
]

// 功能栏目：可下拉选择或手工录入
export const columnOptions = ['转账汇款', '存款', '理财', '账户管理', '登录认证', '查询服务', '贷款申请', '信用卡', '养老金', '生活缴费', '客户服务', '消息通知', '首页', '设置', '业务办理', '审批流程']

// 优化建议分类（顺序与数据看板图例一致；说明为推测）
export const categories = [
  { value: '功能流程', desc: '业务功能缺失，或办理流程繁琐、不合理' },
  { value: '系统性能', desc: '卡顿、加载缓慢、闪退、报错等' },
  { value: '交互设计', desc: '操作方式、页面跳转、控件使用不便' },
  { value: '信息认知', desc: '文案、提示、术语表达不清或难以理解' },
  { value: '视觉设计', desc: '页面布局、配色、图标、字体等视觉问题' },
  { value: '运营服务', desc: '活动、权益、客服等运营与服务问题' },
  { value: '智能化', desc: '智能推荐、智能客服等 AI 能力相关' },
  { value: '安全感知', desc: '安全验证、隐私保护、风险提示相关' }
]

// 影响程度（「小」的说明来自详情页截图，其余为推测）
export const impacts = [
  '大（该问题导致用户无法完成操作，或可能造成资金损失）',
  '中（该问题对用户完成操作造成一定阻碍）',
  '小（该问题对用户操作影响较小，但影响用户使用感受）'
]

// 优先级（「三级」的说明来自详情页截图，其余为推测）
export const priorities = ['一级（常用功能影响大）', '二级（常用功能影响中等或小，或非常用功能影响大）', '三级（非常用功能影响中等或小）']

export const adoptResults = ['采纳', '不采纳']

// 解决方式（流程图「采纳」分支）；next 为审核通过后的状态
export const solutions = [
  { value: '科技自主解决', desc: '转e键通跟进解决，同步问题解决情况', next: '待开发中心处理' },
  { value: '业务科技协同解决（需求整合）', desc: '同步BRDM，纳入需求整合问题管理', next: '已纳入需求整合池' },
  { value: '业务科技协同解决（需求项）', desc: '跟踪需求编写及需求项投产直至解决闭环', next: '待跟进', needReq: true },
  { value: '业务科技协同解决（创意需求）', desc: '同步工银e企创，纳入创意管理', next: '已纳入e企创' },
  { value: '业务自主解决', desc: '支持线上转总行业务部门处理闭环', next: '待跟进' }
]
export const solutionOf = (v) => solutions.find((x) => x.value === v)

// 未采纳原因（数据看板「未采纳原因分布情况」；选项为推测）
export const rejectReasons = ['不符合监管或行内制度要求', '与产品规划不一致', '改造成本高、收益不足', '已有替代方案或功能', '重复建议', '描述不清，无法评估', '其他']

export const satisfactions = ['满意', '基本满意', '不满意']

// 状态：待办阶段 + 终态；track 区分已完成的处理方（center 业务研发中心 / business 总行业务部门 / dev 开发中心）
export const statusList = ['待修改', '待处理', '待分拣', '待答复', '待审核', '待跟进', '待业务部门答复', '待开发中心处理', '已完成', '已纳入需求整合池', '已纳入e企创', '已中止']
export const pendingStatuses = statusList.slice(0, 8)
export const roleOfStatus = {
  待修改: '提交人',
  待处理: '分行科技审核岗',
  待分拣: '产品线分拣岗',
  待答复: '产品线处理岗',
  待审核: '产品线审核岗',
  待跟进: '产品线处理岗',
  待业务部门答复: '总行业务部门处理岗',
  待开发中心处理: '软件开发中心'
}

// 逾期规则（推测）：各环节允许的工作日数；待跟进以计划落实时间为准
export const slaDays = { 待处理: 1, 待分拣: 1, 待答复: 3, 待审核: 1, 待业务部门答复: 5 }

// ===== 工作日（依据「后台管理 · 节假日」）=====
const asDate = (v) => (v instanceof Date ? new Date(v) : new Date(String(v).replace(' ', 'T')))
export function addWorkdays(from, n) {
  const d = asDate(from)
  let k = 0
  while (k < n) {
    d.setDate(d.getDate() + 1)
    if (isWorkday(d)) k++
  }
  return d
}
// (from, to] 之间的工作日数
export function workdaysBetween(from, to = new Date()) {
  const a = asDate(from)
  const b = asDate(to)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  let n = 0
  for (const d = new Date(a); d < b; ) {
    d.setDate(d.getDate() + 1)
    if (isWorkday(d)) n++
  }
  return n
}
export const stayDays = (s) => (pendingStatuses.includes(s.status) ? workdaysBetween(s.stageAt) : 0)
export const isOverdue = (s) =>
  s.status === '待跟进' ? !!s.planTime && s.planTime < fmtDate(new Date()) : slaDays[s.status] != null && stayDays(s) > slaDays[s.status]

// ===== 路由：产品 → 业研部门 / 产品线 → 处理人员（人员维护中的岗位与数据范围）=====
const active = (p) => p && p.status !== '冻结'
const holds = (p, role, key, val) => active(p) && p.roles.includes(role) && (!key || p.scopes?.[role]?.[key] === val)
export function routeOfProduct(name) {
  const p = productList.find((x) => x.name === name)
  return { bizDept: p?.rdDept || '', productLine: p?.rdLine || '', integrated: !!p && !p.rdDept && p.outer === '软件开发中心', headDept: p?.bizDept || '' }
}
export const isBranchOrg = (org) => branchOrgs.includes(org) || /分行|支行/.test(org || '')
export const branchReviewerOf = (org) => persons.find((p) => holds(p, '分行科技审核岗') && p.org === org) || persons.find((p) => p.id === currentUser.id)
export const sorterOf = (line) => persons.find((p) => holds(p, '产品线分拣岗', 'productLine', line))
export const handlersOf = (line) => persons.filter((p) => holds(p, '产品线处理岗', 'productLine', line))
export const auditorOf = (s) =>
  (s.vip && persons.find((p) => holds(p, '产品线审核岗（要客）', 'bizDept', s.bizDept))) || persons.find((p) => holds(p, '产品线审核岗', 'productLine', s.productLine))
export const businessHandlerOf = (headDept) => persons.find((p) => holds(p, '总行业务部门处理岗', 'headDept', headDept))
export const isVipPerson = (id) => !!persons.find((p) => p.id === id)?.vip

// ===== 演示数据 =====
const surnames = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦许何吕施张孔曹严华金魏陶姜'.split('')
const givenChars = '子涵欣怡梓轩浩然宇航思远雨桐嘉怡俊杰诗琪明轩一诺若曦晨阳佳琪志强'.split('')
const fakeName = () => pick(surnames) + pick(givenChars) + (chance(0.6) ? pick(givenChars) : '')

const channelOfProduct = {
  个人手机银行基础业务: ['手机APP-个人手机银行'], 数字人民币: ['手机APP-数字货币'], 工银e生活: ['手机APP-工银e生活'],
  企业网银基础业务: ['电脑端-企业网上银行'], 企业手机银行: ['手机APP-企业手机银行'], 柜面服务: ['线下-柜面'], 柜面通: ['线下-柜面'],
  工银网点通: ['线下-柜面'], 云网点: ['线下-柜面'], 智能柜员机: ['线下-智能柜员机'], 工银e办公: ['手机APP-工银e办公', '电脑端-工银e办公'],
  境外个人手机银行: ['手机APP-境外个人手机银行'], 个人信用卡: ['手机APP-个人手机银行'], 养老金融: ['手机APP-个人手机银行'],
  个人养老金: ['手机APP-个人手机银行'], 个人住房贷款: ['手机APP-个人手机银行'], 实物贵金属: ['手机APP-个人手机银行'], 薪酬通: ['电脑端-企业网上银行']
}
const descTemplates = [
  ['【现象】{p}「{c}」页面在无数据时仅提示"暂无数据"，客户不清楚原因。', '【建议】区分"未开通""无记录"等情形给出明确提示，并提供办理入口。'],
  ['【现象】使用{p}办理{c}时需重复录入客户信息，柜员操作繁琐、耗时较长。', '【建议】支持读取已有客户信息自动带出，减少重复录入。'],
  ['【现象】{p}{c}交易失败时仅显示错误码，客户无法获知原因和下一步操作。', '【建议】将错误码转换为通俗提示，并给出解决方式或客服入口。'],
  ['【现象】{p}{c}页面首次加载较慢，高峰期等待超过 5 秒。', '【建议】优化接口查询性能，增加加载过程提示。'],
  ['【现象】{p}{c}的入口层级较深，客户需多次点击才能找到。', '【建议】在首页或搜索中提供快捷入口。'],
  ['【现象】{p}{c}的提示话术使用专业术语，客户理解困难。', '【建议】调整为通俗易懂的表述，并补充示例说明。'],
  ['【现象】{p}{c}中按钮文字与实际操作不一致，容易误操作。', '【建议】统一按钮文案与操作结果，关键操作增加二次确认。'],
  ['【现象】{p}{c}在大字版模式下部分文字被截断。', '【建议】适配大字版布局，保证信息完整展示。'],
  ['【现象】{p}{c}的短信验证码偶有延迟到达，客户多次重发。', '【建议】排查短信通道，并在页面展示倒计时与重发说明。'],
  ['【现象】{p}{c}的智能客服对"换卡""补卡"等意图识别不准确。', '【建议】补充意图语料，识别失败时转人工服务。'],
  ['【现象】{p}{c}审批流程节点较多，处理时效较长。', '【建议】梳理流程，合并可并行的审批环节。'],
  ['【现象】{p}{c}查询结果不支持按时间段筛选，查找历史记录不便。', '【建议】增加时间范围、金额等筛选条件。'],
  ['【现象】{p}{c}页面配色对比度较低，老年客户阅读困难。', '【建议】提高文字与背景对比度，符合适老化设计规范。'],
  ['【现象】{p}{c}的安全验证方式单一，客户反映流程繁琐。', '【建议】在风险可控前提下支持更多便捷的验证方式。']
]
const productWeights = () => {
  const usable = productList.filter((p) => p.state !== '已废弃' && (p.rdDept || p.outer === '软件开发中心'))
  const heavy = { 个人手机银行基础业务: 18, 柜面服务: 12, 柜面通: 11, 工银e办公: 9, 智能柜员机: 6 }
  return usable.map((p) => [p.name, heavy[p.name] || 2])
}

// 审核通过后的备注（与详情页操作日志格式一致）
const reqNo = (d) => `I${fmtDate(d).replace(/-/g, '')}-${pad(between(1, 999), 4)}`
const ekeyNo = (d) => `E${fmtDate(d).replace(/-/g, '')}${pad(between(1, 9999), 4)}`
function approveRemark(s) {
  if (s.solution === '业务科技协同解决（需求项）') return `需求项编号：${s.reqNo},已联动BRDM。`
  if (s.solution === '业务科技协同解决（需求整合）') return '已同步BRDM，纳入需求整合问题管理。'
  if (s.solution === '业务科技协同解决（创意需求）') return '已同步工银e企创，纳入创意管理。'
  if (s.solution === '科技自主解决') return `已转e键通，单号：${s.ekeyNo}。`
  return ''
}
export function replyRemark(r) {
  if (r.adoptResult === '不采纳') return `采纳结果:不采纳；未采纳原因:${r.rejectReason}；答复意见:${r.replyOpinion}；`
  return [
    '采纳结果:采纳',
    `解决方式:${r.solution}`,
    `答复意见:${r.replyOpinion}`,
    `优先级:${r.priority}`,
    r.reqNo ? `需求项编号:${r.reqNo}` : '',
    r.planTime ? `计划落实时间:${r.planTime}` : ''
  ]
    .filter(Boolean)
    .join('；') + '；'
}

const workTime = (d, h0 = 9, h1 = 17) => {
  const t = new Date(d)
  t.setHours(between(h0, h1), between(0, 59), between(0, 59))
  return t
}
// 下一环节时间：若与上一环节同一天且时刻更早，则顺延到上一环节之后
function nextStep(from, min, max) {
  const t = workTime(addWorkdays(from, between(min, max)))
  return t > from ? t : new Date(asDate(from).getTime() + between(5, 150) * 60000)
}

function blank(seq, submitAt, product, submitter, extra = {}) {
  const route = routeOfProduct(product)
  const tpl = pick(descTemplates)
  const column = chance(0.75) ? pick(columnOptions) : ''
  const c = column || '相关功能'
  const s = {
    seq,
    id: `UEM${fmtDate(submitAt).replace(/-/g, '')}${pad(seq, 9)}`,
    product,
    channels: channelOfProduct[product] || ['其他-行内系统/产品'],
    column,
    attachments: [],
    desc: `${tpl[0]}\n${tpl[1]}`.replace(/\{p\}/g, product).replace(/\{c\}/g, c),
    proposer: submitter.name,
    proposerId: submitter.id,
    proposerOrg: submitter.org,
    proposeTime: fmtDate(submitAt),
    submitter: submitter.name,
    submitterId: submitter.id,
    submitOrg: submitter.org,
    submitTime: fmtDate(submitAt),
    source: '',
    activity: '',
    ...route,
    category: weighted(categories.map((x, i) => [x.value, [56, 13, 9, 8, 5, 3, 3, 1][i]])),
    impact: weighted([[impacts[0], 1], [impacts[1], 3], [impacts[2], 6]]),
    vip: false,
    status: '',
    track: '',
    stageAt: timeText(submitAt),
    currentRole: '',
    currentHandler: '',
    currentHandlerId: '',
    sorter: '', sorterId: '',
    replier: '', replierId: '',
    adoptResult: '', solution: '', replyOpinion: '', priority: '', reqNo: '', ekeyNo: '', rejectReason: '',
    planTime: '', implemented: '', actualTime: '', replyTime: '',
    headDept: route.headDept,
    satisfaction: '', satisfactionNote: '',
    logs: [],
    ...extra
  }
  s.org = s.proposerOrg
  return s
}

const log = (s, at, actor, action, remark = '', centerRole = true) =>
  s.logs.unshift({
    time: typeof at === 'string' ? at : timeText(at),
    operator: actor?.name || actor || '',
    operatorId: actor?.id || '',
    dept: centerRole ? s.bizDept : '',
    line: centerRole ? s.productLine : '',
    action,
    remark
  })
function enter(s, status, at, handler) {
  s.status = status
  s.stageAt = typeof at === 'string' ? at : timeText(at)
  s.currentRole = status in roleOfStatus ? roleOfStatus[status] : ''
  s.currentHandler = handler?.name || (status === '待开发中心处理' ? '软件开发中心' : '')
  s.currentHandlerId = handler?.id || ''
}

// 生成一条演示数据的完整流转（截至 now 未发生的环节保持待办状态）
function simulate(s, now, opt = {}) {
  const at0 = asDate(s.stageAt)
  const submitter = { name: s.submitter, id: s.submitterId }
  log(s, at0, submitter, '提交', '', false)
  if (s.integrated) {
    enter(s, '待开发中心处理', at0)
    s.track = 'dev'
    s.ekeyNo = ekeyNo(at0)
    log(s, at0, '系统', '转e键通', `研发一体化问题，已转e键通，单号：${s.ekeyNo}。`, false)
    const done = nextStep(at0, 5, 30)
    if (done > now || opt.stop === '待开发中心处理') return
    log(s, done, 'e键通', '开发中心处理完成', 'e键通同步：问题已解决并投产。', false)
    s.implemented = '是'
    s.actualTime = fmtDate(done)
    return enter(s, '已完成', done)
  }
  let t = at0
  if (isBranchOrg(s.submitOrg)) {
    const reviewer = opt.branchReviewer || branchReviewerOf(s.submitOrg)
    enter(s, '待处理', t, reviewer)
    if (opt.stop === '待处理') return
    const t1 = nextStep(t, 0, 2)
    if (t1 > now) return
    if (chance(0.02)) {
      log(s, t1, reviewer, '中止', '与本行业务无关', false)
      return enter(s, '已中止', t1)
    }
    log(s, t1, reviewer, '转处理', '', false)
    t = t1
  }
  return sortAndReply(s, t, now, opt)
}

function sortAndReply(s, t, now, opt, round = 0) {
  const sorter = sorterOf(s.productLine)
  enter(s, '待分拣', t, sorter)
  if (opt.stop === '待分拣') return
  const t1 = nextStep(t, 0, 2)
  if (t1 > now) return
  const repliers = handlersOf(s.productLine).filter((p) => opt.replier ? p.id === opt.replier.id : p.id !== currentUser.id)
  const replier = opt.replier || pick(repliers.length ? repliers : handlersOf(s.productLine))
  if (!replier) return
  log(s, t1, sorter, '指派答复人')
  s.sorter = sorter?.name || ''
  s.sorterId = sorter?.id || ''
  enter(s, '待答复', t1, replier)
  if (opt.stop === '待答复') return
  const t2 = nextStep(t1, 1, 3)
  if (t2 > now) return

  // 转总行业务部门（推测比例 2%）
  if (!opt.stop && round === 0 && chance(0.02) && s.headDept && businessHandlerOf(s.headDept)) {
    const bh = businessHandlerOf(s.headDept)
    log(s, t2, replier, '转总行业务部门', `转${s.headDept}分析处理`)
    enter(s, '待业务部门答复', t2, bh)
    s.track = 'business'
    const t3 = nextStep(t2, 2, 8)
    if (t3 > now) return
    Object.assign(s, chance(0.5)
      ? { adoptResult: '采纳', solution: '业务自主解决', replyOpinion: '业务部门采纳，已安排优化', priority: pick(priorities) }
      : { adoptResult: '不采纳', rejectReason: pick(rejectReasons), replyOpinion: '经业务部门分析，暂不采纳' })
    s.replier = bh.name
    s.replierId = bh.id
    s.replyTime = fmtDate(t3)
    log(s, t3, bh, '业务部门答复', replyRemark(s), false)
    if (s.adoptResult === '采纳') { s.implemented = '是'; s.actualTime = fmtDate(t3) }
    return enter(s, '已完成', t3)
  }

  const adopt = opt.adopt ?? chance(0.33)
  if (adopt) {
    const sol = opt.solution || weighted([['业务科技协同解决（需求项）', 35], ['科技自主解决', 25], ['业务科技协同解决（创意需求）', 22], ['业务自主解决', 15], ['业务科技协同解决（需求整合）', 3]])
    Object.assign(s, { adoptResult: '采纳', solution: sol, replyOpinion: '采纳', priority: weighted([[priorities[0], 1], [priorities[1], 3], [priorities[2], 6]]) })
    if (solutionOf(sol).needReq) s.reqNo = reqNo(t2)
    if (sol === '科技自主解决') s.ekeyNo = ekeyNo(t2)
    if (solutionOf(sol).next === '待跟进') s.planTime = fmtDate(addWorkdays(t2, between(3, 45)))
  } else {
    Object.assign(s, { adoptResult: '不采纳', rejectReason: weighted(rejectReasons.map((r, i) => [r, [14, 22, 18, 20, 12, 8, 6][i]])) })
    s.replyOpinion = `经评估暂不采纳：${s.rejectReason}`
  }
  s.replier = replier.name
  s.replierId = replier.id
  s.replyTime = fmtDate(t2)
  log(s, t2, replier, '答复', replyRemark(s))
  const auditor = auditorOf(s)
  enter(s, '待审核', t2, auditor)
  if (opt.stop === '待审核') return
  const t3 = nextStep(t2, 0, chance(0.3) ? 1 : 0)
  if (t3 > now) return
  if (!opt.stop && round === 0 && chance(0.04)) {
    log(s, t3, auditor, '退回', '请补充解决方式说明及计划落实时间')
    enter(s, '待答复', t3, replier)
    const t4 = nextStep(t3, 1, 2)
    if (t4 > now) return
    s.replyTime = fmtDate(t4)
    log(s, t4, replier, '答复', replyRemark(s))
    enter(s, '待审核', t4, auditor)
    const t5 = nextStep(t4, 0, 1)
    if (t5 > now) return
    return approve(s, t5, now, opt, auditor, replier)
  }
  return approve(s, t3, now, opt, auditor, replier)
}

function approve(s, t, now, opt, auditor, replier) {
  log(s, t, auditor, '通过', approveRemark(s))
  if (s.adoptResult === '不采纳') { s.track = 'center'; return enter(s, '已完成', t) }
  const next = solutionOf(s.solution).next
  if (next === '已纳入需求整合池' || next === '已纳入e企创') return enter(s, next, t)
  if (next === '待开发中心处理') {
    s.track = 'dev'
    enter(s, '待开发中心处理', t)
    if (opt.stop) return
    const t1 = nextStep(t, 5, 40)
    if (t1 > now) return
    if (chance(0.05)) {
      log(s, t1, 'e键通', 'e键通退回', '经开发中心评估不属于科技自主解决范围，退回重新分拣', false)
      s.track = ''
      Object.assign(s, { adoptResult: '', solution: '', replyOpinion: '', priority: '', ekeyNo: '', replyTime: '' })
      return sortAndReply(s, t1, now, opt, 1)
    }
    log(s, t1, 'e键通', '开发中心处理完成', `e键通同步：单号 ${s.ekeyNo} 已投产。`, false)
    Object.assign(s, { implemented: '是', actualTime: fmtDate(t1) })
    return enter(s, '已完成', t1)
  }
  // 待跟进：到计划落实时间后由处理岗跟进落实
  s.track = 'center'
  enter(s, '待跟进', t, replier)
  if (opt.stop === '待跟进') return
  const due = workTime(asDate(s.planTime))
  if (due > now || chance(0.15)) return
  log(s, due, replier, '跟进', `是否已落实:是；实际落实时间:${s.planTime}；`)
  Object.assign(s, { implemented: '是', actualTime: s.planTime })
  enter(s, '已完成', due)
  if (chance(0.4)) {
    s.satisfaction = weighted([['满意', 80], ['基本满意', 15], ['不满意', 5]])
    log(s, workTime(addWorkdays(due, between(1, 5))), { name: s.submitter, id: s.submitterId }, '满意度评价', `评价:${s.satisfaction}`, false)
  }
}

function generate() {
  const now = new Date()
  const start = new Date(2025, 9, 9)
  const end = new Date(2026, 9, 14)
  const span = (end - start) / 864e5
  const weights = productWeights()
  const branchStaff = branchOrgs.map((org, i) => Array.from({ length: 4 }, (_, k) => ({ name: fakeName(), id: `0018${pad(2001 + i * 10 + k, 5)}`, org })))
  const centerStaff = persons.filter((p) => p.org.startsWith('业务研发中心') && p.id !== currentUser.id)
  const plans = []
  const N = 2200
  for (let i = 0; i < N; i++) {
    const d = new Date(start.getTime() + Math.pow(rand(), 0.8) * span * 864e5)
    if (!isWorkday(d) && chance(0.85)) d.setDate(d.getDate() + (d.getDay() === 6 ? 2 : 1))
    if (d > end) d.setTime(end.getTime())
    plans.push({ at: workTime(d, 9, 17) })
  }
  // 当前用户的待办（与截图中的数量一致）：待处理 17、待答复 7、待跟进 1
  const me = persons.find((p) => p.id === currentUser.id)
  const uxProducts = ['用户体验管理平台', '工银问卷']
  const forced = [
    ...Array.from({ length: 17 }, (_, k) => ({ at: workTime(addWorkdays(new Date(2026, 9, 1), Math.floor(k / 5)), 9, 17), branch: true, opt: { stop: '待处理', branchReviewer: me } })),
    ...Array.from({ length: 7 }, (_, k) => ({ at: workTime(addWorkdays(new Date(2026, 8, 25), k), 9, 16), product: uxProducts[k % 2], opt: { stop: '待答复', replier: me } })),
    { at: workTime(new Date(2026, 8, 8), 10, 15), product: '用户体验管理平台', opt: { stop: '待跟进', replier: me, adopt: true, solution: '业务科技协同解决（需求项）' } }
  ]
  plans.push(...forced)
  plans.sort((a, b) => a.at - b.at)
  let seq = 419180
  const list = plans.map((p) => {
    seq += between(1, 2)
    let product = p.product || (p.branch ? weighted(weights.filter(([n]) => !routeOfProduct(n).integrated && routeOfProduct(n).productLine !== '用户体验')) : weighted(weights))
    // 用户体验产品线的随机数据只取较早日期，避免占用当前用户的待分拣
    if (!p.product && routeOfProduct(product).productLine === '用户体验' && now - p.at < 30 * 864e5) product = '工银e办公'
    const fromBranch = p.branch || (!p.product && chance(0.66))
    const submitter = fromBranch ? pick(pick(branchStaff)) : p.product ? pick(centerStaff.filter((x) => x.org.includes('用户体验部')).concat(centerStaff.slice(0, 3))) : pick(centerStaff)
    const s = blank(seq, p.at, product, submitter)
    s.source = fromBranch ? weighted([['员工：分行优化建议', 70], ['客户：95588工单', 8], ['客户：app用户反馈', 8], ['员工：工银i服务', 6], ['客户：要客意见', 3], ['员工：行内调研', 5]])
      : weighted([['员工：日常走查', 40], ['员工：设计还原度走查', 12], ['客户：app用户反馈', 14], ['客户：应用商店评论', 8], ['客户：体验活动', 8], ['员工：工银众测', 6], ['客户：第三方测评', 5], ['员工：行内调研', 4], ['客户：要客意见', 3]])
    s.vip = s.source === '客户：要客意见' || isVipPerson(s.proposerId)
    simulate(s, now, p.opt)
    return s
  })
  return list.sort((a, b) => b.seq - a.seq)
}

// 按优化建议编号倒序（最新在前）
export const suggestions = reactive(generate())
export const findSuggestion = (key) => suggestions.find((s) => s.id === key || String(s.seq) === String(key))

// ===== 流程操作（详情页、待办列表调用）=====
// actor：执行人（默认当前用户；演示中「代为处理」时为当前处理人）
const me = () => persons.find((p) => p.id === currentUser.id) || { name: currentUser.name, id: currentUser.id, org: currentUser.dept }
const nowAt = () => timeText(new Date())

export function createSuggestion(form, actor = me()) {
  const t = new Date()
  const seq = Math.max(...suggestions.map((s) => s.seq)) + 1
  const s = blank(seq, t, form.product, { name: actor.name, id: actor.id, org: actor.org })
  Object.assign(s, {
    channels: [...(form.channels || [])], column: form.column || '', attachments: [...(form.attachments || [])], desc: form.desc,
    source: form.source, activity: form.activity || '', category: form.category, impact: form.impact
  })
  s.vip = s.source === '客户：要客意见' || isVipPerson(actor.id)
  log(s, t, actor, '提交', '', false)
  routeAfterSubmit(s, t)
  suggestions.unshift(s)
  return s
}
function routeAfterSubmit(s, t) {
  if (s.integrated) {
    s.track = 'dev'
    s.ekeyNo = ekeyNo(t)
    enter(s, '待开发中心处理', t)
    return log(s, t, '系统', '转e键通', `研发一体化问题，已转e键通，单号：${s.ekeyNo}。`, false)
  }
  if (isBranchOrg(s.submitOrg)) return enter(s, '待处理', t, branchReviewerOf(s.submitOrg))
  enter(s, '待分拣', t, sorterOf(s.productLine))
}

// 待修改 → 修改后重新提交
export function resubmit(s, form, actor = me()) {
  Object.assign(s, {
    channels: [...form.channels], column: form.column || '', attachments: [...(form.attachments || [])], desc: form.desc,
    source: form.source, activity: form.activity || '', category: form.category, impact: form.impact, product: form.product,
    ...routeOfProduct(form.product)
  })
  s.headDept = routeOfProduct(form.product).headDept
  const t = new Date()
  log(s, t, actor, '修改并提交', '', false)
  routeAfterSubmit(s, t)
}
// 待处理（分行科技审核岗）：转处理 → 待分拣
export function transferToSort(s, actor = me()) {
  log(s, nowAt(), actor, '转处理', '', false)
  enter(s, '待分拣', nowAt(), sorterOf(s.productLine))
}
export function returnToSubmitter(s, reason, actor = me()) {
  log(s, nowAt(), actor, '退回提交人', reason || '', s.status !== '待处理')
  enter(s, '待修改', nowAt(), { name: s.submitter, id: s.submitterId })
}
export function abortSuggestion(s, reason, actor = me()) {
  log(s, nowAt(), actor, '中止', reason || '', s.status !== '待处理')
  enter(s, '已中止', nowAt())
}
export function removeSuggestion(s) {
  const i = suggestions.indexOf(s)
  if (i >= 0) suggestions.splice(i, 1)
}
// 待分拣：指派答复人 / 研发一体化问题转 e键通
export function assignReplier(s, replier, actor = me()) {
  log(s, nowAt(), actor, '指派答复人', `答复人：${replier.name}`)
  Object.assign(s, { sorter: actor.name, sorterId: actor.id })
  enter(s, '待答复', nowAt(), replier)
}
export function transferToEkey(s, note, actor = me()) {
  s.track = 'dev'
  s.ekeyNo = ekeyNo(new Date())
  log(s, nowAt(), actor, '转e键通', `研发一体化问题${note ? `：${note}` : ''}，单号：${s.ekeyNo}。`)
  enter(s, '待开发中心处理', nowAt())
}
// 待答复：答复（明确是否采纳及解决方式）→ 待审核
export function replySuggestion(s, r, actor = me()) {
  Object.assign(s, {
    adoptResult: r.adoptResult, solution: r.adoptResult === '采纳' ? r.solution : '', replyOpinion: r.replyOpinion,
    priority: r.adoptResult === '采纳' ? r.priority : '', reqNo: r.reqNo || '', rejectReason: r.adoptResult === '不采纳' ? r.rejectReason : '',
    planTime: r.planTime || '', replier: actor.name, replierId: actor.id, replyTime: fmtDate(new Date())
  })
  if (s.solution === '科技自主解决') s.ekeyNo = ekeyNo(new Date())
  log(s, nowAt(), actor, '答复', replyRemark(s))
  enter(s, '待审核', nowAt(), auditorOf(s))
}
// 待答复：转总行业务部门分析处理
export function transferToBusiness(s, headDept, note, actor = me()) {
  s.headDept = headDept
  s.track = 'business'
  log(s, nowAt(), actor, '转总行业务部门', `转${headDept}分析处理${note ? `：${note}` : ''}`)
  enter(s, '待业务部门答复', nowAt(), businessHandlerOf(headDept))
}
// 待业务部门答复：业务部门答复（业务自主解决 / 业务不采纳）→ 已完成
export function businessReply(s, r, actor = me()) {
  Object.assign(s, {
    adoptResult: r.adoptResult, solution: r.adoptResult === '采纳' ? '业务自主解决' : '', replyOpinion: r.replyOpinion,
    priority: r.adoptResult === '采纳' ? r.priority || '' : '', rejectReason: r.adoptResult === '不采纳' ? r.rejectReason : '',
    replier: actor.name, replierId: actor.id, replyTime: fmtDate(new Date())
  })
  log(s, nowAt(), actor, '业务部门答复', replyRemark(s), false)
  if (s.adoptResult === '采纳') Object.assign(s, { implemented: '是', actualTime: fmtDate(new Date()) })
  enter(s, '已完成', nowAt())
}
// 待审核：通过 → 按解决方式流转；退回 → 待答复
export function auditSuggestion(s, pass, opinion, actor = me()) {
  if (!pass) {
    log(s, nowAt(), actor, '退回', opinion || '')
    return enter(s, '待答复', nowAt(), { name: s.replier, id: s.replierId })
  }
  log(s, nowAt(), actor, '通过', [approveRemark(s), opinion].filter(Boolean).join(''))
  if (s.adoptResult === '不采纳') { s.track = 'center'; return enter(s, '已完成', nowAt()) }
  const next = solutionOf(s.solution).next
  if (next === '待开发中心处理') { s.track = 'dev'; return enter(s, next, nowAt()) }
  if (next === '待跟进') { s.track = 'center'; return enter(s, next, nowAt(), { name: s.replier, id: s.replierId }) }
  enter(s, next, nowAt())
}
// 待跟进：跟进落实（已落实 → 已完成；未落实可更新计划落实时间）
export function followUp(s, f, actor = me()) {
  if (f.implemented === '是') {
    Object.assign(s, { implemented: '是', actualTime: f.actualTime })
    log(s, nowAt(), actor, '跟进', `是否已落实:是；实际落实时间:${f.actualTime}；${f.note ? `说明:${f.note}；` : ''}`)
    return enter(s, '已完成', nowAt())
  }
  s.implemented = '否'
  if (f.planTime) s.planTime = f.planTime
  log(s, nowAt(), actor, '跟进', `是否已落实:否；计划落实时间:${s.planTime}；${f.note ? `说明:${f.note}；` : ''}`)
}
// 已完成：提交人满意度评价（推测）
export function evaluate(s, satisfaction, note, actor = me()) {
  Object.assign(s, { satisfaction, satisfactionNote: note || '' })
  log(s, nowAt(), actor, '满意度评价', `评价:${satisfaction}${note ? `；意见:${note}` : ''}`, false)
}
// 演示：模拟 e键通同步开发中心处理结果
export function ekeyComplete(s) {
  log(s, nowAt(), 'e键通', '开发中心处理完成', `e键通同步：单号 ${s.ekeyNo} 已投产。`, false)
  Object.assign(s, { implemented: '是', actualTime: fmtDate(new Date()) })
  enter(s, '已完成', nowAt())
}
export function ekeyReturn(s, reason) {
  log(s, nowAt(), 'e键通', 'e键通退回', reason || '退回重新分拣', false)
  Object.assign(s, { track: '', adoptResult: '', solution: '', replyOpinion: '', priority: '', ekeyNo: '', replyTime: '' })
  enter(s, '待分拣', nowAt(), sorterOf(s.productLine))
}

// ===== 统计口径（管理报表、数据看板共用）=====
// 各环节处理时长（工作日）：分拣 = 进入待分拣（提交或转处理）→ 指派答复人；答复 = 指派答复人 → 首次答复；审核 = 最后一次答复 → 通过
export function stageDurations(s) {
  const logs = [...s.logs].reverse()
  const first = (action, after = '') => logs.find((l) => l.action === action && l.time >= after)
  const enterSort = first('转处理') || first('提交')
  const assign = enterSort && first('指派答复人', enterSort.time)
  const reply = assign && first('答复', assign.time)
  const lastReply = [...logs].reverse().find((l) => l.action === '答复')
  const pass = lastReply && first('通过', lastReply.time)
  return {
    sort: assign ? workdaysBetween(enterSort.time, assign.time) : null,
    reply: reply ? workdaysBetween(assign.time, reply.time) : null,
    audit: pass ? workdaysBetween(lastReply.time, pass.time) : null
  }
}
export function averageDurations(list) {
  const sum = { sort: [0, 0], reply: [0, 0], audit: [0, 0] }
  for (const s of list) {
    const d = stageDurations(s)
    for (const k of Object.keys(sum)) if (d[k] != null) { sum[k][0] += d[k]; sum[k][1]++ }
  }
  const avg = (k) => (sum[k][1] ? sum[k][0] / sum[k][1] : 0)
  return { sort: avg('sort'), reply: avg('reply'), audit: avg('audit'), total: avg('sort') + avg('reply') + avg('audit') }
}

// 详情页「上一条 / 下一条」：记录进入详情前所在列表（菜单名与筛选后的编号顺序）
export const listContext = reactive({ menu: '', seqs: [] })
export const detailRoute = (s, menu, list) => {
  if (list) Object.assign(listContext, { menu, seqs: list.map((x) => x.seq) })
  return { path: '/optimSuggestDetail', query: { problemId: s.seq, currentMenuName: menu } }
}

// ===== 待办数量（当前用户为当前处理人）=====
const mine = (status) => suggestions.filter((s) => s.status === status && s.currentHandlerId === currentUser.id).length
export const suggestionTodo = {
  get toModify() { return mine('待修改') },
  get toHandle() { return mine('待处理') },
  get toSort() { return mine('待分拣') },
  get toReply() { return mine('待答复') },
  get toAudit() { return mine('待审核') },
  get toFollow() { return mine('待跟进') },
  get toBusiness() { return mine('待业务部门答复') }
}

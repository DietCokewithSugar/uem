// 行外演示数据：全部为虚构数据，人员姓名随机生成，不含任何真实客户/员工信息
// 使用固定随机种子，保证每次刷新数据一致
import { reactive } from 'vue'
import { journeys } from './journey'
import { suggestionTodo } from './suggest'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(20261013)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const pad = (n, len = 2) => String(n).padStart(len, '0')

const surnames = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦许何吕施张孔曹严华金魏陶姜'.split('')
const givenChars = '子涵欣怡梓轩浩然宇航思远雨桐嘉怡俊杰诗琪明轩一诺若曦晨阳佳琪志强'.split('')
const fakeName = () => pick(surnames) + pick(givenChars) + (rand() > 0.4 ? pick(givenChars) : '')

export const products = [
  '云网点', '柜面服务', '项目贷款', '科技金融', '企业手机银行基础业务', '个人手机银行基础业务',
  '全球信贷与代理投资', '商户之家', '个人信用卡', 'e企邮', '工银e办公', '融e行基础业务',
  '数字人民币', '个人养老金', '工银e生活', '企业网上银行', '个人贷款', '薪酬通', '实物贵金属', '柜面通', '工银问卷', '其他'
]

// 提出机构（分行）：与系统管理中的分行列表一致
export { branchOrgs as orgs } from './system'

// 体验问题（研发阶段）的问题提出部门
export const bizDepts = ['业务研发中心-个人业务部', '业务研发中心-对公业务部', '业务研发中心-渠道部', '业务研发中心-运营部']
// 优化建议：数据、字典与流程见 ./suggest（新代码请直接从 @/mock/suggest、@/mock/system 引入）
export { suggestions, sources, adoptResults } from './suggest'
export { rdLines as productLines } from './system'

const columns = ['其他个人业务', '客户服务', '账户管理', '转账汇款', '登录认证', '系统锁屏', '贷款申请', '查询服务', '']

const descTemplates = [
  '【现象】在每天去网点开始工作时，打开网点的电脑并打开{p}，需重复登录多个系统，操作繁琐。【建议】支持统一登录。',
  '【现象】{p}-设置-账户管理无法查看通行证号，客户咨询时无法及时解答。【建议】增加通行证号展示。',
  '建议在{p}电视机里新增AI数字人讲解功能，提升客户等候体验。',
  '关于{p}系统里交易流程优化的建议：减少重复录入字段，自动带出客户信息。',
  '在使用网页版{p}的系统时，部分页面加载缓慢，建议优化查询性能。',
  '在办理个别{p}业务时，部分必填项提示不清晰，客户经理需多次返工。',
  '{p}系统电脑中长假过后，首次登录需要重新绑定设备，建议简化流程。',
  '自2026年3月1日起应用{p}后，客户反馈短信验证码到达延迟，建议排查。',
  '{p}隐私下载时，一直提示"请勿频繁下载"，影响正常使用。',
  '{p}预算录入时，选择消费积分分为是，牵头部门字段无法选择。',
  '{p}授信流程协调机制查询菜单，建议增加机构查询维度。',
  '{p}目前前端设备难以准确显示交易失败原因，用户无法获知下一步操作。',
  '{p}智能客服意图识别不准确，问"换卡"时返回挂失流程。'
]
const desc = (p) => pick(descTemplates).replace('{p}', p)


function dateBetween(start, days) {
  const d = new Date(start)
  d.setDate(d.getDate() + Math.floor(rand() * days))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 体验问题（研发阶段）
export const problems = Array.from({ length: 96 }, (_, i) => {
  const product = pick(products)
  const t = dateBetween('2026-05-01', 70)
  const adopt = rand() > 0.85 ? '采纳' : '未采纳'
  return {
    id: rand() > 0.9 ? `PRDQ${t.replace(/-/g, '')}0000${pad(4000 + i, 6)}` : `A${t.replace(/-/g, '')}00${pad(227 - i * 2 + 300, 3)}`,
    product,
    desc: desc(product),
    dept: pick(bizDepts),
    proposer: fakeName(),
    time: t,
    adoptResult: adopt,
    status: adopt === '采纳' ? '已解决' : pick(['', '处理中', '已解决'])
  }
}).sort((a, b) => (a.time < b.time ? 1 : -1))

// 待办数量随演示操作实时变化；优化建议待办为当前用户作为当前处理人的数量
export const todoCounts = reactive({
  get toModify() { return suggestionTodo.toModify },
  get toHandle() { return suggestionTodo.toHandle },
  get toSort() { return suggestionTodo.toSort },
  get toReply() { return suggestionTodo.toReply },
  get toAudit() { return suggestionTodo.toAudit },
  get toBusiness() { return suggestionTodo.toBusiness },
  get toFollow() { return suggestionTodo.toFollow },
  get activity() { return activities.filter((a) => a.pendingForMe).length },
  get task() { return tasks.filter((t) => t.pendingForMe).length },
  get journeyModify() { return journeys.filter((j) => j.status === '待修改').length },
  get journeyExamine() { return journeys.filter((j) => j.status === '待审核').length }
})

// 首页数据
export const homeData = {
  news: [
    { title: '业务研发中心打造"灵犀用户声音分析智能体"，实现用户声音自动归类与洞察', date: '2026-04-15' },
    { title: '业务研发中心深化全行界面设计规范体系建设', date: '2025-12-09' },
    { title: '业务研发中心积极应用大模型推进智能设计工具建设', date: '2025-11-24' },
    { title: '业务研发中心推出AI运营设计课程赋能分行营销', date: '2025-07-08' },
    { title: '业务研发中心推出工银问卷触客新模式', date: '2024-02-20' },
    { title: '业务研发中心多措并举为手机银行9.0投产上线保驾护航', date: '2023-10-25' },
    { title: '业务研发中心践行"重点产品保障机制"促热点问题快速解决', date: '2023-10-25' },
    { title: '业务研发中心举办"从做功能到做体验"用户体验主题分享', date: '2023-10-25' },
    { title: '业务研发中心派员参加UCAN设计专业论坛', date: '2023-07-06' },
    { title: '业务研发中心开展系列用户研究赋能重点产品体验提升', date: '2023-06-20' }
  ],
  supports: [
    { name: '丹青', icon: 'Brush' },
    { name: '燕儿', icon: 'Promotion' },
    { name: '工银问卷', icon: 'Document' },
    { name: '工银众测', icon: 'User' },
    { name: 'e企创', icon: 'OfficeBuilding' },
    { name: 'i服务', icon: 'Service' }
  ],
  problemStats: { total: 781, solved: 666, pending: 115 },
  suggestionBubbles: [
    { name: '薪酬通', value: 42 }, { name: '柜面通', value: 58 }, { name: '企业手机银行', value: 50 },
    { name: '个人贷款', value: 40 }, { name: '个人养老金', value: 30 }, { name: '工银e办公', value: 48 },
    { name: '工银e生活', value: 36 }, { name: '企业网上银行', value: 46 }, { name: '融e行基础业务', value: 72 },
    { name: '数字人民币', value: 38 }
  ],
  nps: {
    total: 34.84,
    dims: [
      { name: '科技质量', value: 4.04 }, { name: '产品质量', value: 4.0 },
      { name: '服务质量', value: 3.91 }, { name: '渠道质量', value: 4.02 }
    ],
    byAge: [
      { name: '55岁以上', value: 45.02 }, { name: '46-55岁', value: 48.04 }, { name: '36-45岁', value: 32.33 },
      { name: '26-35岁', value: 38.98 }, { name: '25岁及以下', value: 29.7 }
    ]
  }
}

// ===== 体验活动 / 体验任务 =====
export const bizDomains = ['个人业务', '对公业务', '其他']
export const expChannels = ['其他线上渠道', '其他线下渠道', '众测', '实地调研', '手机银行', '网上银行', '网点']
export const expMethods = ['问卷调查', '用户访谈', '可用性评估', '众测', '实地调研', '其他']
export const activityStatuses = ['草稿', '待审核', '进行中', '已完成', '已中止']
export const applyDepts = ['业务研发中心用户体验部', '业务研发中心业务研发一部', '业务研发中心业务研发二部', '业务研发中心业务研发三部']
// 所属板块：截图中为下拉框，选项为推测
export const taskBoards = ['体验问题', '体验活动', '体验监测', '用户声音', '体验资讯', '体验员']
export const taskStatuses = ['未开始', '进行中', '已完成', '已关闭']

const activityNames = [
  ['法人理财改版用户调研', '法人理财', '对公业务', '其他线上渠道', '问卷调查', 300],
  ['星火计划-供应链金融管理体验走查活动', '供应链金融服务平台', '对公业务', '其他线下渠道', '用户访谈', 5],
  ['工银e办公需求编写用户需求验证-2026年9月', '工银e办公', '其他', '其他线下渠道', '用户访谈/可用性评估', 5],
  ['9月版用户体验评估活动', '', '', '其他线上渠道/其他线下渠道', '可用性评估', 20],
  ['星火计划-手机银行智能助手专项众测体验活动二期', '个人手机银行基础业务', '个人业务', '众测', '用户访谈/其他', 3000],
  ['工银e办公需求编写用户需求验证-2026年8月', '工银e办公', '其他', '其他线下渠道', '用户访谈/可用性评估', 5],
  ['企业手机银行经营入口用户调研', '', '', '其他线上渠道/实地调研', '用户访谈/可用性评估', 8],
  ['星火计划-对公营销通体验活动', '', '', '其他线上渠道/实地调研', '用户访谈', 10],
  ['机器人系统岗位工程UI设计与交互规范验证', '机器人流程自动化', '对公业务', '用户体验室', '可用性评估', 6],
  ['个人养老金开户流程可用性测试', '个人养老金', '个人业务', '手机银行', '可用性评估', 12],
  ['数字人民币钱包体验众测', '数字人民币', '个人业务', '众测', '众测', 500],
  ['网点智能柜台适老化体验调研', '柜面服务', '个人业务', '网点', '实地调研', 30]
]
const actDates = ['2026-09-29', '2026-09-29', '2026-09-23', '2026-09-09', '2026-09-07', '2026-09-02', '2026-08-31', '2026-08-21', '2026-08-15', '2026-07-30', '2026-07-12', '2026-06-28']

export const activities = reactive(
  activityNames.map(([name, product, domain, channel, method, people], i) => ({
    id: `ACT${pad(i + 1, 4)}`,
    level: i % 5 === 4 ? '分行' : '总行',
    name,
    product,
    domain,
    channel,
    channelType: channel.includes('线上') ? '线上' : '线下',
    method,
    dept: pick(applyDepts),
    people,
    submitTime: actDates[i],
    status: [5, 6, 9, 11].includes(i) ? '已完成' : '进行中',
    creator: fakeName(),
    pendingForMe: false
  }))
)

// 体验任务：截图中列表为空，新增后写入
export const tasks = reactive([])

// ===== 体验资讯 =====
export const infoTypes = ['方法培训', '体验研究', '体验动态']
export const infoOrgs = ['业务研发中心', '软件开发中心', '数据中心', '总行个人金融部', '总行网络金融部']
export const trainingBoards = ['用户体验', '视觉设计', '交互设计', '用户研究', '前端开发']
export const trainingForms = ['网络', '线下', '直播']
export const fileTypes = ['PDF', 'PPT', 'Word', '视频']
export const reportLevels = ['总行级', '分行级', '部门级']
export const reportTypes = ['用户研究报告', '竞品分析报告', '体验评估报告', '行业洞察报告']
export const sortOptions = ['按发布时间', '按浏览量', '按下载量']

const trainingSeed = [
  ['前端组件库使用与管理工作指引', '视觉设计', '2026-05-27', 15, 4],
  ['业务研发用户体验设计标准化执行动作实践指南', '用户体验', '2024-12-31', 142, 78],
  ['视觉设计方法拓展资料', '视觉设计', '2024-12-09', 45, 16],
  ['交互设计方法拓展资料', '交互设计', '2024-12-09', 28, 7],
  ['页面原型图设计（结构图、流程图、线框图）方法拓展资料', '交互设计', '2024-12-09', 33, 12],
  ['可用性评估（用户&专家）方法拓展资料', '用户研究', '2024-12-05', 51, 20],
  ['优化建议分析方法拓展资料', '用户体验', '2024-12-05', 38, 9],
  ['可用性评估（自查）方法拓展资料', '用户研究', '2024-12-05', 26, 6],
  ['用户访谈方法拓展资料', '用户研究', '2024-11-20', 64, 22],
  ['问卷设计与发放方法拓展资料', '用户研究', '2024-11-20', 47, 18],
  ['用户旅程地图绘制方法拓展资料', '用户体验', '2024-11-12', 59, 25],
  ['适老化与无障碍设计指引', '交互设计', '2024-10-30', 72, 31]
]

export const infos = reactive(
  trainingSeed.map(([name, board, publishTime, views, downloads], i) => ({
    id: `INFO${pad(i + 1, 4)}`,
    name,
    type: '方法培训',
    board,
    org: '业务研发中心',
    author: '',
    publishTime,
    status: '发布',
    form: '网络',
    fileType: i % 3 === 0 ? 'PPT' : 'PDF',
    views,
    downloads,
    cover: i % 4,
    intro: `${name}，面向全行产品经理、设计师与研发人员，介绍相关方法的适用场景、执行步骤与注意事项。`
  }))
)

// ===== 灵犀旅程：见 mock/journey.js =====
export { journeys, journeyStatuses, journeyTypes, journeyScenes, staff } from './journey'

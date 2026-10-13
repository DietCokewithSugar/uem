// 行外演示数据：全部为虚构数据，人员姓名随机生成，不含任何真实客户/员工信息
// 使用固定随机种子，保证每次刷新数据一致
import { reactive } from 'vue'

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
  '数字人民币', '个人养老金', '工银e生活', '企业网上银行', '个人贷款', '薪酬通', '其他'
]

export const orgs = [
  '上海分行营业部', '上海分行金融科技部', '浦东开发区支行', '长宁支行', '闸北支行', '松江支行营业厅',
  '河南分行运行管理部', '江西分行营业部', '江苏分行个人金融部', '广东分行运行管理部', '北京分行营业部',
  '四川分行金融科技部', '浙江分行营业部', '山东分行渠道管理部'
]

export const sources = ['行内员工', '体验员', '客户之声', '体验活动', '舆情监测', '工银问卷']
export const bizDepts = ['业务研发中心-个人业务部', '业务研发中心-对公业务部', '业务研发中心-渠道部', '业务研发中心-运营部']
export const productLines = ['个人金融产品线', '对公金融产品线', '渠道产品线', '运营产品线', '内部管理产品线']
export const adoptResults = ['采纳', '未采纳', '部分采纳', '已采纳待排期']

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

const statuses = ['待修改', '待处理', '待分拣', '待答复', '待跟进', '已答复', '已办结', '已纳入e键通', '已中止']

function dateBetween(start, days) {
  const d = new Date(start)
  d.setDate(d.getDate() + Math.floor(rand() * days))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 优化建议（运营阶段）
export const suggestions = reactive(Array.from({ length: 168 }, (_, i) => {
  const product = pick(products)
  const submitTime = dateBetween('2025-11-01', 345)
  const status = i < 15 ? '待处理' : i < 22 ? '待答复' : i < 23 ? '待跟进' : pick(statuses.slice(5))
  return {
    id: `UEM${submitTime.replace(/-/g, '')}000042${pad(1430 - i, 4)}`,
    product,
    column: pick(columns),
    desc: desc(product),
    org: pick(orgs),
    proposer: fakeName(),
    submitter: fakeName(),
    submitOrg: pick(orgs),
    proposeTime: submitTime,
    submitTime,
    replyTime: status.startsWith('已') ? dateBetween(submitTime, 20) : '',
    status,
    adoptResult: status.startsWith('已') ? pick(adoptResults) : '',
    implemented: status === '已办结' ? (rand() > 0.3 ? '是' : '否') : '',
    source: pick(sources),
    bizDept: pick(bizDepts),
    productLine: pick(productLines),
    stayDays: 1 + Math.floor(rand() * 5)
  }
}).sort((a, b) => (a.submitTime < b.submitTime ? 1 : -1)))

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

const countBy = (status) => suggestions.filter((s) => s.status === status).length
// 待办数量随演示操作（转处理、退回等）实时变化
export const todoCounts = reactive({
  get toModify() { return countBy('待修改') },
  get toHandle() { return countBy('待处理') },
  get toSort() { return countBy('待分拣') },
  get toReply() { return countBy('待答复') },
  get toFollow() { return countBy('待跟进') },
  activity: 0,
  task: 0
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
  todo: { suggestion: 23, activity: 0 },
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

// 体验监测演示数据：2026-01 数值与截图一致，其余月份为随机波动；人员均为虚构
import { reactive } from 'vue'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(3001)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const jitter = (v, d) => Math.round((v + (rand() - 0.5) * d) * 100) / 100

export const months = ['2026-01', '2025-12', '2025-11', '2025-10', '2025-09', '2025-07', '2025-04', '2025-01']

const base = {
  nps: 34.84,
  byAge: [['55岁以上', 45.02], ['46-55岁', 48.04], ['36-45岁', 32.33], ['26-35岁', 38.98], ['25岁及以下', 29.7]],
  image: [['专业', 92], ['可信赖', 78], ['亲和', 76], ['稳健', 70], ['全能', 68], ['现代', 63], ['开放', 58], ['智能化', 56]],
  dims: [
    { name: '工行科技质量满意度', score: 4.04, color: '#e8545c', items: [['信息安全性', 4.2], ['系统响应度', 4.05], ['系统兼容性', 4.0], ['产品迭代速度', 3.9], ['产品成功率', 4.08], ['产品智能化', 3.98]] },
    { name: '工行产品质量满意度', score: 4.0, color: '#6b9ee3', items: [['需求关注度', 4.02], ['创新有用性', 3.96], ['创新感知度', 3.92], ['视觉满意度', 4.05], ['信息满意度', 4.01], ['流程满意度', 3.98], ['功能满意度', 4.06]] },
    { name: '工行服务质量满意度', score: 3.91, color: '#3fa89b', items: [['价格吸引力', 3.7], ['客服满意度', 4.05], ['营销满意度', 3.98]] },
    { name: '工行渠道质量满意度', score: 4.07, color: '#f2a33a', items: [['手机银行', 4.18], ['微信公众号/小程序', 4.0], ['网点智能设备', 4.02], ['网点柜面', 4.1], ['网上银行', 4.05]] }
  ]
}

export const brandData = Object.fromEntries(
  months.map((m, i) => {
    if (!i) return [m, base]
    return [
      m,
      {
        nps: jitter(base.nps, 8),
        byAge: base.byAge.map(([n, v]) => [n, jitter(v, 10)]),
        image: base.image.map(([n, v]) => [n, Math.round(jitter(v, 14))]),
        dims: base.dims.map((d) => ({ ...d, score: jitter(d.score, 0.3), items: d.items.map(([n, v]) => [n, jitter(v, 0.4)]) }))
      }
    ]
  })
)

// ===== 评价数据上传 =====
const ppl = ['周可欣', '林思远', '陈嘉怡', '郑明轩', '许诗琪', '冯浩然', '孙若曦']
const uploadSeed = [
  ['品牌印象', '体验总览', '2026-04-14'],
  ['重点渠道监测', '融e行-个人手机银行', '2024-06-03', true],
  ['重点渠道监测', '工银e生活', '2024-05-24', true],
  ['重点渠道监测', '企业网上银行', '2023-11-08', true],
  ['精品产品评价', '工银e办公', ''],
  ['精品产品评价', '营销通', ''],
  ['精品产品评价', '工银e生活', ''],
  ['精品产品评价', '企业手机银行', '2022-12-23'],
  ['精品产品评价', '柜面通', ''],
  ['精品产品评价', '数字人民币', '2021-12-03'],
  ['精品产品评价', '个人养老金', ''],
  ['精品产品评价', '融e借', '2022-06-15'],
  ['精品产品评价', '薪酬通', ''],
  ['精品产品评价', '工银e支付', '2022-03-11'],
  ['精品产品评价', '云网点', ''],
  ['精品产品评价', '融e行-投资理财', '2023-02-20'],
  ['精品产品评价', '融e行-信用卡', ''],
  ['精品产品评价', '工行普惠', '2022-09-30'],
  ['精品产品评价', '企业网上银行', '']
]
export const evalUploads = reactive(
  uploadSeed.map(([column, product, time, exportAll], i) => ({ id: i + 1, column, product, updater: time ? pick(ppl) : '', updateTime: time, exportAll: !!exportAll, files: [] }))
)
export const premiumProducts = [...new Set(uploadSeed.filter((x) => x[0] === '精品产品评价').map((x) => x[1]))]

// ===== 设计工作情况上传 =====
export const designWorks = reactive([
  ['数字人民币新版方案设计思路', '数字人民币', '林思远'],
  ['精品工程工行普惠线上渠道提升项目', '工行普惠', '陈嘉怡、郑明轩、许诗琪'],
  ['支付团队：设计前探主动赋能', '工银e支付', '冯浩然、孙若曦'],
  ['手机银行——有温度的祝福', '融e行基础业务', '周可欣'],
  ['企业手机银行·跨境汇款', '企业手机银行', '何晨阳、吴雨桐、林思远'],
  ['智理财页签升级', '融e行-投资理财', '陈嘉怡、郑明轩'],
  ['信用卡一键还款设计亮点', '融e行-信用卡', '许诗琪、孙若曦'],
  ['云网点—国风插绘记', '云网点', '冯浩然']
].map(([name, product, author], i) => ({ id: i + 1, name, product, author, publishTime: '2021-12', intro: `${name}：介绍设计背景、用户洞察、方案亮点与上线效果。`, files: [] })))

// ===== 评价数据审核 =====
const auditOrgs = ['业务研发中心/业务研发中心本部/业务研发中心业务研发三部', '业务研发中心/业务研发中心本部/业务研发中心平台研发部']
const surveyNames = ['工银e生活用户满意度调研', '企业网上银行用户满意度调研', '融e行用户满意度调研', '个人养老金开户体验调研']
export const auditRequests = reactive(
  Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2023, 4, 11, 3, 6, 30)
    d.setDate(d.getDate() - Math.floor(i * 1.6))
    const p = (n) => String(n).padStart(2, '0')
    return {
      id: i + 1,
      title: `ETS用户体验评估模型分析结果-${i < 10 ? surveyNames[0] : pick(surveyNames)}`,
      applyTime: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
      applicant: i === 0 ? '周可欣' : pick(ppl),
      org: i === 0 ? auditOrgs[0] : auditOrgs[1],
      status: i < 26 ? '待审批' : pick(['已通过', '已驳回']),
      handler: '',
      handleTime: '',
      comment: ''
    }
  })
)

// ===== 体验度量图片 =====
export const measureProducts = ['工银e生活', '融e行-个人手机银行', '企业网上银行']
const pages = {
  工银e生活: [['消息中心', '消息中心'], ['在线客服', '在线客服'], ['搜索', '搜索'], ['融e借', '融e借'], ['积分', '积分'], ['权益', '权益'], ['任务中心', '任务中心'], ['额度', '调额油表图;调额;调额确认;调额成功'], ['我的钱包', '我的钱包'], ['还款', '还款'], ['首页', '首页'], ['生活缴费', '缴费首页;缴费确认;缴费成功'], ['优惠券', '优惠券列表'], ['外卖', '外卖首页'], ['出行', '打车;火车票']],
  '融e行-个人手机银行': [['登录', '登录页'], ['转账', '转账首页;转账确认;转账成功'], ['账户', '我的账户'], ['理财', '理财首页'], ['基金', '基金首页;基金详情'], ['贵金属', '贵金属行情'], ['信用卡', '信用卡首页'], ['养老金', '养老金开户']],
  企业网上银行: [['登录', 'U盾登录'], ['付款', '付款制单;付款复核'], ['账户查询', '账户明细'], ['代发工资', '代发录入']]
}
export const measureFunctions = [...new Set(Object.values(pages).flat().map((x) => x[0]))]
export const measureImages = reactive(
  Object.entries(pages).flatMap(([product, list]) =>
    list.map(([journey, page], i) => ({ id: `${product}-${i}`, product, journey, page, publishTime: i < 10 ? '2024-02' : '2024-01', kind: product === '企业网上银行' ? 'desktop' : i % 5 === 3 ? 'mobile-fund' : 'mobile-green' }))
  )
)

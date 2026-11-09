// 体验公告：我的体验公告 12 条与截图一致；总行动态供首页「体验动态」使用
// 人员与机构均为虚构。同业观察为演示文案，不引用真实客户数据
import { reactive } from 'vue'
import { SEED_USER } from '@/config/user'

export const noticeStatuses = ['进行中', '已完成', '待审批']

const mine = SEED_USER.name
const org = SEED_USER.dept
const other = '林知夏'

const row = (data) => ({
  image: '',
  files: [],
  pinned: false,
  showOnHome: false,
  pendingForMe: false,
  mailAudit: false,
  mailInput: false,
  branches: [],
  level: '总行',
  creator: mine,
  org,
  ...data
})

export const notices = reactive([
  row({
    id: 'NT20261030',
    name: '【同业观察202610期】意图驱动的手机交互新体验-豆包手机二代真机测评',
    content: '本期同业观察主题为豆包手机二代真机测评，围绕意图驱动的手机交互，观察语音、视觉和快捷指令如何把多步操作收成一句话。演示环境仅作方法示例，不涉及我行客户数据。',
    submitTime: '2026-10-30',
    startTime: '2026-10-16',
    endTime: '2026-10-30',
    status: '已完成'
  }),
  row({
    id: 'NT20260930',
    name: '【同业观察202609期】重力感应交互：在合规约束下探索移动端交互',
    content: '重力感应交互是近年来移动端优化用户体验、助力快捷操作的一种尝试。本期梳理摇一摇、倾斜切卡等手势在支付和查询场景中的适用边界，以及误触、无障碍和安全确认上需要守住的约束。',
    submitTime: '2026-09-30',
    startTime: '2026-09-16',
    endTime: '2026-09-30',
    status: '已完成'
  }),
  row({
    id: 'NT20260831',
    name: '【同业观察202608期】AI支付产品新拆解：微信AI卡与支付宝钱包',
    content: '近期，AI支付逐步走进大众视线，但用户普遍存在“不知道能问什么、问完能否撤销”的顾虑。本期拆解同业 AI 卡和钱包助手的入口、确认步骤和失败提示，供手机银行支付体验对标。',
    submitTime: '2026-08-31',
    startTime: '2026-08-17',
    endTime: '2026-08-31',
    status: '已完成'
  }),
  row({
    id: 'NT20260731',
    name: '【同业观察202607期】微信小微，克制又懂事的社交助手',
    content: '6月20日微信内置AI助手小微灰度上线，依托微信会话做轻量问答和代操作。本期关注它如何控制打扰、如何在动手前再次确认，以及哪些做法不适合搬进金融交易流程。',
    submitTime: '2026-07-31',
    startTime: '2026-07-17',
    endTime: '2026-07-31',
    status: '已完成'
  }),
  row({
    id: 'NT20260630',
    name: '【同业观察202606期】界面瘦身，AI加身——AI版支付宝来了',
    content: '6月16日，AI版支付宝开启内测，从“人找图标”转向“说清楚就办理”。本期记录首页信息减量和助手承接之间的关系，供个人手机银行首页层级讨论参考。',
    submitTime: '2026-06-30',
    startTime: '2026-06-16',
    endTime: '2026-06-30',
    status: '已完成'
  }),
  row({
    id: 'NT20260529',
    name: '【同业观察202605期】小智大能量：手机实况窗玩法升级与落地观察',
    content: '手机实况窗已成为移动端轻量化服务触达、跨场景提醒的常见载体。本期观察进度、取号、出行三类实况在锁屏和通知中心的露出方式，讨论账单、预约和办理进度能否用更短的路径被看见。',
    submitTime: '2026-05-29',
    startTime: '2026-05-15',
    endTime: '2026-05-29',
    status: '已完成'
  }),
  row({
    id: 'NT20260528',
    name: '【同业观察202605期】被“设计”的分享欲——年度账单驱动分享',
    content: '年度账单已成为历年来用户促活、品牌传播的黄金载体。本期从海报层级、隐私默认项和分享路径三条线，看同业如何让用户愿意转发，同时避免把账户信息带出应用。',
    submitTime: '2026-05-28',
    startTime: '2026-05-14',
    endTime: '2026-05-28',
    status: '已完成'
  }),
  row({
    id: 'NT20260527',
    name: '【同业观察202605期】选品也有MBTI？——基金人格化选品',
    content: '随着基金产品类型和数量的不断增加，投资者面临选品成本高、术语难懂的问题。本期观察同业用性格测试做基金推荐的交互，并提示金融场景里人格化表达必须同时给出风险和适用说明。',
    submitTime: '2026-05-27',
    startTime: '2026-05-13',
    endTime: '2026-05-27',
    status: '已完成'
  }),
  row({
    id: 'NT20260415',
    name: '业务研发中心打造“灵犀用户声音分析智能体”，赋能产品体验提升',
    content: '业务研发中心（以下简称“中心”）积极践行以用户为中心的研发方式，上线灵犀用户声音分析智能体，把分散在工单、应用商店和调研中的原话归到产品和旅程上，方便产品经理按周查看典型问题。',
    submitTime: '2026-04-15',
    startTime: '2026-04-15',
    endTime: '2026-12-31',
    status: '进行中',
    showOnHome: true,
    homeOrder: 1
  }),
  row({
    id: 'NT20251209',
    name: '业务研发中心深化全行界面设计规范体系建设',
    content: '为持续强化设计规范对产品体验设计的支撑作用，中心整理界面、文案和组件三套基线，并在手机银行、网上银行和工银e生活的新增页面上试运行。规范文本可在体验资讯中查阅。',
    submitTime: '2025-12-09',
    startTime: '2025-12-09',
    endTime: '2025-12-31',
    status: '已完成',
    showOnHome: true,
    homeOrder: 2
  }),
  row({
    id: 'NT20251124',
    name: '业务研发中心积极应用大模型推进智能设计工具建设',
    content: '中心把大模型用于界面文案草稿、走查问题归类和设计说明生成，设计师仍对最终稿负责。本公告说明试点范围、不能替代的评审环节，以及分行同事如何申请试用。',
    submitTime: '2025-11-24',
    startTime: '2025-11-24',
    endTime: '2025-12-24',
    status: '已完成',
    showOnHome: true,
    homeOrder: 3
  }),
  row({
    id: 'NT20250708',
    name: '业务研发中心推出AI运营设计课程赋能分行营销',
    content: '课程面向分行营销和体验岗位，讲解活动页信息层级、权益表达和可访问性。完成学习后可在体验任务中领取一次联合走查。演示环境不开放真实报名。',
    submitTime: '2025-07-08',
    startTime: '2025-07-08',
    endTime: '2025-08-08',
    status: '已完成',
    showOnHome: true,
    homeOrder: 4
  }),
  row({
    id: 'NT20240220',
    name: '业务研发中心推出工银问卷触客新模式',
    content: '工银问卷支持在关键旅程结束后做短问卷，题目控制在三题以内，避免打断正在办理的业务。本公告介绍适用场景和结果回看入口。',
    submitTime: '2024-02-20',
    startTime: '2024-02-20',
    endTime: '2024-03-20',
    status: '已完成',
    creator: other,
    showOnHome: true,
    homeOrder: 5
  }),
  row({
    id: 'NT20231025A',
    name: '业务研发中心多措并举为手机银行9.0投产上线保驾护航',
    content: '9.0 投产窗口期间，体验团队按日回看应用商店评论和客服工单，把登录、转账、查询三类问题直接同步到产品线。本公告为投产保障纪要。',
    submitTime: '2023-10-25',
    startTime: '2023-10-18',
    endTime: '2023-10-25',
    status: '已完成',
    creator: other,
    showOnHome: true,
    homeOrder: 6
  }),
  row({
    id: 'NT20231025B',
    name: '业务研发中心践行“重点产品保障机制”促热点问题快速解决',
    content: '重点产品保障机制约定：同一问题单日新增超过阈值即升级到产品负责人和体验负责人。本公告说明触发条件和当日关闭的要求。',
    submitTime: '2023-10-25',
    startTime: '2023-10-25',
    endTime: '2023-11-25',
    status: '已完成',
    creator: other,
    showOnHome: true,
    homeOrder: 7
  }),
  row({
    id: 'NT20231025C',
    name: '业务研发中心举办“从做功能到做体验”用户体验主题分享',
    content: '分享会用三个已上线功能说明：功能做完不等于体验完成，还要看用户能否在下一步知道发生了什么。材料已放入方法培训。',
    submitTime: '2023-10-25',
    startTime: '2023-10-25',
    endTime: '2023-10-27',
    status: '已完成',
    creator: other,
    showOnHome: true,
    homeOrder: 8
  }),
  row({
    id: 'NT20230706',
    name: '业务研发中心派员参加UCAN设计专业论坛',
    content: '论坛讨论集中在复杂业务的信息降噪和适老化。参会纪要将在体验研究中归档，供不能到场的同事查阅。',
    submitTime: '2023-07-06',
    startTime: '2023-07-06',
    endTime: '2023-07-20',
    status: '已完成',
    creator: other,
    showOnHome: true,
    homeOrder: 9
  }),
  row({
    id: 'NT20230620',
    name: '业务研发中心开展系列用户研究赋能重点产品体验提升',
    content: '系列研究覆盖开户、转账和信用卡账单三个任务，每期给出可执行的界面修改建议，并回到优化建议里跟踪是否落地。',
    submitTime: '2023-06-20',
    startTime: '2023-06-20',
    endTime: '2023-07-20',
    status: '已完成',
    creator: other,
    showOnHome: true,
    homeOrder: 10
  }),
  row({
    id: 'NTB20261012',
    name: '上海分行个人手机银行适老化走查周报',
    content: '本周走查了字号、验证码和语音播报三处。字号调节后部分表单仍被遮挡，已整理成体验问题提交总行。',
    submitTime: '2026-10-12',
    startTime: '2026-10-12',
    endTime: '2026-10-19',
    status: '已完成',
    level: '分行',
    creator: '陈予安',
    org: '上海分行金融科技部'
  }),
  row({
    id: 'NTB20260918',
    name: '广东分行企业网银对公开户体验问题通报',
    content: '对公开户材料清单在第 3 步才完整出现，企业客户往返补充的情况较多。分行建议把清单提前到入口页。',
    submitTime: '2026-09-18',
    startTime: '2026-09-18',
    endTime: '2026-10-18',
    status: '进行中',
    level: '分行',
    creator: '周晓宁',
    org: '广东分行运行管理部'
  }),
  row({
    id: 'NTB20260802',
    name: '浙江分行网点厅堂体验月报',
    content: '厅堂取号后的等待说明不够具体，客户反复询问“还要多久”。月报建议在叫号屏上补充前方人数和预计等待。',
    submitTime: '2026-08-02',
    startTime: '2026-08-01',
    endTime: '2026-08-31',
    status: '已完成',
    level: '分行',
    creator: '周晓宁',
    org: '浙江分行营业部'
  }),
  row({
    id: 'NTB20260621',
    name: '北京分行信用卡账单页体验建议征集',
    content: '征集网点柜员和客户对账单页“最低还款”说明的修改意见，截止日前收到 26 条，已挑选 8 条进入体验问题。',
    submitTime: '2026-06-21',
    startTime: '2026-06-21',
    endTime: '2026-07-05',
    status: '已完成',
    level: '分行',
    creator: '陈予安',
    org: '北京分行营业部'
  })
])

export const homeNotices = () =>
  notices
    .filter((n) => n.showOnHome && n.level === '总行')
    .slice()
    .sort((a, b) => (a.submitTime === b.submitTime ? (a.homeOrder || 0) - (b.homeOrder || 0) : a.submitTime < b.submitTime ? 1 : -1))

// 体验质检智能体演示数据
// 报告内容由前端模板拼装，用于展示形态；正式环境由大模型按「提示词管理」中的提示词生成
import { reactive } from 'vue'
import { currentUser } from '@/config/user'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(1013)
const pick = (arr, r = rand) => arr[Math.floor(r() * arr.length)]
const pad = (n) => String(n).padStart(2, '0')
export const nowText = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

// ===== 角色 =====
const personaSeed = [
  [2, '学生用户陈同学', '20 岁在校大学生，熟悉各类 App，追求操作快捷，对繁琐验证和广告弹窗容忍度低。'],
  [106, '长辈用户王阿姨', '65 岁退休教师，视力下降，偏好大字号和明确的文字指引，担心误操作和诈骗。'],
  [3, '宝妈孙女士', '32 岁全职妈妈，碎片化时间使用手机银行，关注教育储蓄和家庭理财，常单手操作。'],
  [6, '代发用户小李', '25 岁制造业员工，工资代发到卡，主要查询余额、转账，对金融术语不熟悉。'],
  [12, '私银用户张总', '50 岁企业主，资产规模大，重视专属服务与隐私保护，期望一键直达客户经理。'],
  [5, '县域用户老赵', '45 岁县域个体户，网络条件一般，习惯到网点办理，对线上操作信心不足。'],
  [8, '理财新手白先生', '28 岁白领，刚开始接触理财，需要通俗的产品说明和风险提示。'],
  [9, '资深理财用户林先生', '40 岁金融从业者，关注收益数据和对比工具，要求信息密度高、操作高效。'],
  [10, '稳健型投资者周女士', '38 岁公务员，风险偏好低，关注本金安全与到期提醒。'],
  [11, '激进型投资者吴先生', '35 岁互联网从业者，偏好基金和贵金属，关注行情实时性与交易速度。'],
  [13, '跨境用户钱女士', '30 岁外企员工，常办理结售汇和跨境汇款，关注汇率与到账时间。'],
  [14, '小微企业主郑先生', '42 岁餐饮店老板，使用企业手机银行收款对账，希望流程简洁。'],
  [15, '视障用户冯先生', '36 岁视障人士，依赖读屏软件，要求控件可读、焦点顺序合理。'],
  [16, '新市民刘女士', '27 岁外来务工人员，初次办理社保卡和账户，需要清晰的办理指引。'],
  [17, '海外留学生何同学', '22 岁留学生，跨时区使用，关注境外登录与安全验证体验。']
]
const expertSeed = [
  [1, '用户体验专家', '从用户目标、任务流程、信息认知与情感体验等方面评估界面整体可用性。'],
  [4, '设计质控专家', '依据行内界面设计规范，检查视觉层级、组件一致性、品牌风格与文案规范。'],
  [7, '交互设计专家', '关注操作路径、交互反馈、异常处理与状态提示的完整性。'],
  [18, '无障碍专家', '依据适老化与无障碍标准，检查字号、对比度、读屏支持与操作容错。'],
  [19, '合规风控专家', '关注敏感操作的风险提示、二次确认、隐私授权与信息披露是否合规。'],
  [20, '内容文案专家', '评估文案的准确性、通俗性和一致性，识别专业术语与歧义表述。'],
  [21, '性能体验专家', '从加载速度、弱网表现与动效流畅度评估感知性能。'],
  [22, '品牌视觉专家', '评估色彩、插画、图标与品牌调性的一致性。'],
  [23, '服务设计专家', '从线上线下全渠道视角评估服务衔接与人工兜底。'],
  [24, '数据分析专家', '结合埋点与行为数据给出量化洞察与改进优先级。']
]
export const qcRoles = reactive([
  ...personaSeed.map(([id, name, desc]) => ({ id, name, type: '用户画像', desc, updateTime: '2026-09-16', updater: '周可欣' })),
  ...expertSeed.map(([id, name, desc]) => ({ id, name, type: '专家角色', desc, updateTime: '2026-09-16', updater: '周可欣' }))
])

// ===== 提示词 =====
export const qcPrompts = reactive([
  {
    id: 1, name: '质检工具（文件分析）', updateTime: '2026-10-13', updater: currentUser.name, limit: 10000,
    content: '你是一名资深的银行数字渠道体验评估师。请仔细识别用户上传的界面截图或设计稿，逐页提取：页面名称、核心功能入口、主要信息模块、关键操作按钮及其文案、状态提示与异常提示。输出结构化的页面清单，作为后续多角色评估的输入。不得臆测截图中不存在的内容。'
  },
  {
    id: 2, name: '质检工具（ETS维度）', updateTime: '2026-07-28', updater: currentUser.name, limit: 10000,
    content: '请依据体验评估维度（功能流程、信息认知、交互反馈、视觉规范、品牌一致、安全感知）对界面进行评分，每个维度 1-5 分，并给出评分依据。评分需引用截图中的具体元素，避免空泛描述。'
  },
  {
    id: 3, name: '质检工具（设计质控专家）', updateTime: '2026-07-28', updater: currentUser.name, limit: 10000,
    content: '你是设计质控专家，请依据全行界面设计规范，检查：字号与字重层级、主次按钮样式、间距栅格、图标风格、品牌色使用、文案标点与术语。对每个问题给出「问题描述、所在位置、违反的规范条目、修改建议、严重程度（高/中/低）」。'
  },
  {
    id: 4, name: '质检工具（角色生成）', updateTime: '2026-05-29', updater: '', limit: 3500,
    content: '请根据输入的产品名称与目标客群，生成 3-5 个典型用户画像。每个画像包含：称呼、年龄与职业、使用场景、核心诉求、主要顾虑、数字化熟练度。画像需贴近真实银行客群，避免刻板印象。'
  },
  {
    id: 5, name: '质检工具（场景-摘要）', updateTime: '2026-08-21', updater: '许诗琪', limit: 20000,
    content: '综合各角色的评估结果，生成执行摘要：说明参与评估的角色数量与名称、整体体验结论、表现较好的维度、主要待优化点（不超过 5 个）。随后提炼用户的根本诉求，并给出 3-5 个体验关键词。语言简洁、面向产品经理。'
  },
  {
    id: 6, name: '质检工具（场景-维度）', updateTime: '2026-08-21', updater: '', limit: 20000,
    content: '针对每个评估维度输出详细解读：现状描述、对用户的影响、优化建议。按维度得分从低到高排序，优先展示问题最突出的维度。'
  }
])

// ===== 报告生成（模板） =====
export const dimensions = ['功能流程', '信息认知', '交互反馈', '视觉规范', '品牌一致', '安全感知']
const dimTexts = {
  功能流程: ['核心功能入口可见但操作路径较长，缺乏明确的流程引导提示，用户在复杂任务中容易迷失方向，需优化关键步骤的视觉引导以形成闭环。', '主流程步骤清晰，入口位置符合用户预期，但中断后无法续办，需补充进度保存能力。'],
  信息认知: ['信息层级划分不够清晰，关键数据与次要信息视觉权重差异不明显，文案存在专业术语，增加了用户理解成本，需提升可读性与完整性。', '信息分组合理，重点数据突出，个别字段命名与用户习惯不一致。'],
  交互反馈: ['操作后缺少明确的状态反馈，加载与成功状态区分度不足，用户难以确认操作结果。', '按钮点击态与加载态完整，异常提示可理解，但缺少撤销入口。'],
  视觉规范: ['整体遵循界面设计规范，局部存在按钮样式不统一、间距不一致的问题。', '视觉层级清晰，配色与字号符合规范要求。'],
  品牌一致: ['个别运营位配色偏离品牌主色，插画风格不统一，需按品牌规范调整。', '品牌色与插画风格统一，整体调性与品牌保持一致。'],
  安全感知: ['敏感操作环节缺失风险预警与二次确认机制，存在安全隐患。', '安全提示位置明显，验证方式清晰，用户安全感较强。']
}
const demandPool = [
  ['能够自主、便捷地掌握名下账户的完整信息与状态，并对账户进行安全、灵活的管理与配置。', ['信息清晰', '操作可控', '变更及时', '安全自主']],
  ['在最少的步骤内完成转账汇款，并能随时确认资金去向与到账状态。', ['快捷高效', '结果确定', '资金安全']],
  ['快速找到适合自己风险偏好的理财产品，并理解收益与风险。', ['通俗易懂', '对比清晰', '风险透明']],
  ['在手机上便捷地查询与办理贵金属业务，及时获取行情变化。', ['行情实时', '下单便捷', '持仓清晰']]
]

export function generateReport({ title, roleIds, materials, scene = '' }, r = Math.random) {
  const roles = roleIds.map((id) => qcRoles.find((x) => x.id === id)).filter(Boolean)
  const dims = dimensions.map((name) => {
    const score = Math.round((2.6 + r() * 2.2) * 10) / 10
    return { name, score, text: dimTexts[name][score < 3.8 ? 0 : 1] }
  })
  const weak = [...dims].sort((a, b) => a.score - b.score).slice(0, 3)
  const good = [...dims].sort((a, b) => b.score - a.score).slice(0, 2)
  const [demand, keywords] = pick(demandPool, r)
  const issueTitles = {
    功能流程: '核心业务操作环节缺乏明确的状态反馈与流程指引导致用户迷失',
    信息认知: '关键数据与次要信息视觉层级混淆增加认知负荷',
    交互反馈: '操作结果反馈不明确，用户无法确认是否成功',
    视觉规范: '按钮与间距样式不统一，影响界面整洁度',
    品牌一致: '运营位配色偏离品牌主色',
    安全感知: '敏感操作环节缺失风险预警与二次确认机制存在安全隐患'
  }
  const suggestions = {
    功能流程: '在关键步骤增加进度指示与下一步引导，支持中断后续办',
    信息认知: '重新梳理信息层级，突出关键数据，专业术语增加释义',
    交互反馈: '补齐加载、成功、失败三态反馈，并提供撤销入口',
    视觉规范: '按组件库统一按钮样式与间距栅格',
    品牌一致: '运营位配色与插画按品牌规范统一审核',
    安全感知: '敏感操作前增加风险提示与二次确认'
  }
  const issues = weak.map((d, i) => ({
    title: issueTitles[d.name],
    dimension: d.name,
    severity: ['高', '中', '中'][i],
    suggestion: suggestions[d.name]
  }))
  const roleViews = Object.fromEntries(
    roles.map((role) => {
      const score = Math.round((weak.reduce((n, d) => n + d.score, 0) / 3 + r() * 0.8) * 10) / 10
      return [
        role.id,
        {
          score,
          summary: `评估视角：${role.desc} 综合来看，当前界面在${weak[0].name}与${weak[1].name}方面与该角色预期存在差距。`,
          findings: weak.map((d) => ({ dimension: d.name, text: d.text })),
          suggestions: issues.map((x) => x.suggestion)
        }
      ]
    })
  )
  const summary = [
    `本次共选择了${roles.length}个角色进行评估，包括${roles.map((x) => x.name).join('、')}等${roles.length}个角色。`,
    `综合各角色的评估结果，整体表现${dims.reduce((n, d) => n + d.score, 0) / dims.length >= 3.8 ? '良好' : '基础功能可用但体验欠佳'}，在${good.map((d) => d.name).join('与')}维度上表现较好，但在${weak.map((d) => d.name).join('、')}维度上有待提升。主要的待优化点有 ${issues.length} 个，分别是：${issues.map((x) => x.title).join('、')}。`
  ]
  return { id: `QC${Date.now()}${Math.floor(r() * 1000)}`, title, createTime: nowText(), materials, roleIds, scene, summary, demand, keywords, dimensions: dims, issues, roleViews }
}

// 44 份历史报告
const thumbKinds = ['desktop', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-fund']
export const qcReports = reactive(
  Array.from({ length: 44 }, (_, i) => {
    const d = new Date(2026, 9, 13, 9, 40)
    d.setHours(d.getHours() - Math.floor(i * 30 + rand() * 20))
    const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    const rpt = generateReport({ title: `体验质检智能体报告${date}`, roleIds: [1, 4], materials: [{ kind: thumbKinds[i % 8] }] }, rand)
    return { ...rpt, id: `QC${1000 + i}`, createTime: nowText(d), creator: i % 3 ? '周可欣' : currentUser.name }
  })
)

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
// 分组与画像对齐新建评测第 3 步。已有角色的 id 不变，避免历史报告对不上。
export const userRoleGroups = ['基础型', '投资理财型', '信贷融资型', '权益消费型', '对公用户']
const personaSeed = [
  { id: 2, name: '学生用户陈同学', group: '基础型', roleClass: '普通用户', desc: '在校学生，手机重度用户，各类 App 使用熟练。银行卡主要用于生活费、扫码支付和转账。', portrait: [['人生阶段', '校园求学'], ['核心功能', '转账支付、生活缴费'], ['理财接受度', '高']], traits: [['价值敏感度', '敏感'], ['学习适应力', '快速上手'], ['安全敏感度', '便利优先']] },
  { id: 106, name: '长辈用户王阿姨', group: '基础型', roleClass: '普通用户', desc: '已退休，手机使用多限于微信和基本通话。手机银行步骤一多就容易犹豫，通常只在办理固定业务时打开。', portrait: [['人生阶段', '退休养老'], ['功能使用广度', '低（1-2项）'], ['功能探索深度', '浅']], traits: [['学习适应力', '缓慢适应'], ['安全敏感度', '高度敏感']] },
  { id: 3, name: '宝妈孙女士', group: '基础型', roleClass: '普通用户', desc: '育有子女，核心关注教育储蓄和少儿相关的金融产品。持有宝宝卡，常在碎片时间查看收益和账户进出。', portrait: [['人生阶段', '家庭育儿'], ['家庭结构', '三口之家'], ['核心功能', '账户管理、收益查询、生活缴费']], traits: [['功能使用广度', '中'], ['价格敏感度', '敏感'], ['活跃时段', '碎片时间']] },
  { id: 6, name: '代发用户小李', group: '基础型', roleClass: '普通用户', desc: '工资卡由单位统一办理。每月到账后按需要转出一部分，看完余额就离开，对金融术语不熟悉。', portrait: [['人生阶段', '初入社会'], ['核心功能', '转账支付'], ['功能使用广度', '低'], ['下载渠道', '单位统一办理']], traits: [['价格敏感度', '适度敏感']] },
  { id: 5, name: '县域用户老赵', group: '基础型', roleClass: '普通用户', desc: '县域个体户，网络条件一般，习惯到网点办理，对线上操作信心不足，看不懂的数字不会继续点。', portrait: [['人生阶段', '稳定经营'], ['核心功能', '转账、余额查询'], ['功能使用广度', '低']], traits: [['学习适应力', '需要引导'], ['安全敏感度', '敏感']] },
  { id: 16, name: '新市民刘女士', group: '基础型', roleClass: '普通用户', desc: '外来务工人员，初次办理社保卡和账户，需要逐步、可回退的办理指引。', portrait: [['人生阶段', '新市民'], ['核心功能', '开户、社保卡'], ['功能探索深度', '浅']], traits: [['学习适应力', '按步骤操作'], ['安全敏感度', '敏感']] },
  { id: 17, name: '海外留学生何同学', group: '基础型', roleClass: '普通用户', desc: '跨时区使用，关注境外登录、安全验证和到账时间，不希望验证失败后不知道原因。', portrait: [['人生阶段', '校园求学'], ['核心功能', '跨境汇款、登录验证'], ['理财接受度', '低']], traits: [['安全敏感度', '敏感'], ['使用环境', '境外网络']] },
  { id: 15, name: '视障用户冯先生', group: '基础型', roleClass: '普通用户', desc: '依赖读屏软件完成查询和转账，要求控件有可读名称，焦点顺序和视觉顺序一致。', portrait: [['核心功能', '余额查询、转账'], ['辅助方式', '读屏软件'], ['功能使用广度', '中']], traits: [['安全敏感度', '高度敏感']] },
  { id: 8, name: '理财新手白先生', group: '投资理财型', roleClass: '普通用户', desc: '刚开始接触理财，需要通俗的产品说明和风险提示，不敢在看不懂收益口径时确认购买。', portrait: [['人生阶段', '职场新人'], ['核心功能', '理财浏览、风险测评'], ['理财接受度', '尝试中']], traits: [['价格敏感度', '敏感'], ['学习适应力', '需要解释']] },
  { id: 9, name: '资深理财用户林先生', group: '投资理财型', roleClass: '普通用户', desc: '金融从业者，关注收益数据和对比，要求信息密度高、路径短，不希望营销挡住行情和持仓。', portrait: [['人生阶段', '专业投资者'], ['核心功能', '收益对比、持仓'], ['理财接受度', '高']], traits: [['学习适应力', '快速上手'], ['信息密度偏好', '高']] },
  { id: 10, name: '稳健型投资者周女士', group: '投资理财型', roleClass: '普通用户', desc: '风险偏好低，关注本金是否安全、何时到期、到期后钱回到哪里。', portrait: [['人生阶段', '家庭积累'], ['核心功能', '稳健理财、到期提醒'], ['理财接受度', '稳健']], traits: [['价格敏感度', '敏感'], ['安全敏感度', '高度敏感']] },
  { id: 11, name: '激进型投资者吴先生', group: '投资理财型', roleClass: '普通用户', desc: '偏好基金和贵金属，关注行情是否及时、买卖步骤是否短，反感下单前被无关活动打断。', portrait: [['人生阶段', '积极投资'], ['核心功能', '基金、贵金属'], ['理财接受度', '高']], traits: [['学习适应力', '快速上手'], ['价格敏感度', '低']] },
  { id: 12, name: '私银用户张总', group: '投资理财型', roleClass: '普通用户', desc: '企业主，资产规模大，重视专属服务与隐私，不希望余额和卡号默认露出，也不希望无关推荐占着账户页。', portrait: [['人生阶段', '企业主'], ['核心功能', '资产总览、客户经理'], ['理财接受度', '高']], traits: [['安全敏感度', '高度敏感'], ['价格敏感度', '低']] },
  { id: 25, name: '房贷用户陈先生', group: '信贷融资型', roleClass: '普通用户', desc: '按揭还款中，每月打开贷款页确认扣款金额、日期和剩余本金，担心扣款失败却没有说清楚。', portrait: [['人生阶段', '供房'], ['核心功能', '查还款、提前还款'], ['功能使用广度', '低']], traits: [['安全敏感度', '高度敏感'], ['活跃时段', '还款日前']] },
  { id: 26, name: '经营贷用户马老板', group: '信贷融资型', roleClass: '普通用户', desc: '餐饮店主，贷款用于周转。关注额度、利率和还款日，常在打烊后用手机处理，没有时间研究术语。', portrait: [['人生阶段', '小微经营'], ['核心功能', '额度、还款'], ['功能使用广度', '低']], traits: [['学习适应力', '需要引导'], ['价格敏感度', '敏感']] },
  { id: 27, name: '信用卡分期用户小周', group: '信贷融资型', roleClass: '普通用户', desc: '把大额消费做成分期，在意每期还多少、手续费是多少，不希望这些数字藏在协议末尾。', portrait: [['人生阶段', '职场'], ['核心功能', '账单分期'], ['价格敏感度', '敏感']], traits: [['学习适应力', '快速上手']] },
  { id: 28, name: '普惠贷款用户老周', group: '信贷融资型', roleClass: '普通用户', desc: '县域小店店主，第一次在线上申请经营贷款，需要逐步指引，对征信授权尤其谨慎。', portrait: [['人生阶段', '县域经营'], ['核心功能', '贷款申请、授权'], ['功能探索深度', '浅']], traits: [['学习适应力', '缓慢适应'], ['安全敏感度', '高度敏感']] },
  { id: 13, name: '跨境用户钱女士', group: '权益消费型', roleClass: '普通用户', desc: '外企员工，常办理结售汇和跨境汇款，关注汇率、手续费和到账时间是否写在确认之前。', portrait: [['人生阶段', '跨境工作'], ['核心功能', '结售汇、跨境汇款'], ['功能使用广度', '中']], traits: [['价格敏感度', '敏感'], ['安全敏感度', '敏感']] },
  { id: 29, name: '信用卡用户赵女士', group: '权益消费型', roleClass: '普通用户', desc: '日常用信用卡消费，先看账单、可用额度和还款入口，权益活动只有和自己有关时才愿意看。', portrait: [['人生阶段', '日常消费'], ['核心功能', '账单、还款、额度'], ['功能使用广度', '中']], traits: [['价格敏感度', '适度敏感']] },
  { id: 30, name: '积分权益用户小陈', group: '权益消费型', roleClass: '普通用户', desc: '习惯用积分抵现和兑换权益，在意积分有效期、兑换结果是否一次说清。', portrait: [['人生阶段', '权益敏感'], ['核心功能', '积分兑换'], ['功能使用广度', '中']], traits: [['价格敏感度', '敏感'], ['学习适应力', '快速上手']] },
  { id: 14, name: '小微企业主郑先生', group: '对公用户', roleClass: '普通用户', desc: '餐饮店老板，用企业手机银行收款、对账，希望流程短，凭证要能马上找到。', portrait: [['人生阶段', '小微经营'], ['核心功能', '收款、对账'], ['功能使用广度', '中']], traits: [['学习适应力', '按步骤操作'], ['活跃时段', '营业结束后']] },
  { id: 31, name: '企业财务李会计', group: '对公用户', roleClass: '普通用户', desc: '负责企业网银对账和付款复核，流程不能跳步，金额、收款人和用途必须同时看得见。', portrait: [['人生阶段', '企业财务'], ['核心功能', '对账、付款复核'], ['功能使用广度', '高']], traits: [['安全敏感度', '高度敏感'], ['信息密度偏好', '高']] },
  { id: 32, name: '企业网银用户王经理', group: '对公用户', roleClass: '普通用户', desc: '审批付款。看不清收款人和金额时不会点通过，退回原因也要能转给经办。', portrait: [['人生阶段', '企业管理'], ['核心功能', '付款审批'], ['功能使用广度', '中']], traits: [['安全敏感度', '高度敏感']] }
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
  ...personaSeed.map((p) => ({ ...p, type: '用户画像', mine: false, updateTime: '2026-09-16', updater: '周可欣' })),
  ...expertSeed.map(([id, name, desc]) => ({ id, name, type: '专家角色', group: '专家角色', roleClass: '专家', desc, portrait: [], traits: [], mine: false, updateTime: '2026-09-16', updater: '周可欣' }))
])

// ===== ETS 八维度细则 =====
// AB 测试的「维度差异」按细则编号定位差异，提示词中也引用同一份细则。
export const ETS = [
  ['功能流程', [
    ['1.1', '功能完善性', '功能完善、流程闭环，可以满足使用需求；功能设计简洁、简单易理解，无冗余感；功能异常或错误时，流程完整闭环。'],
    ['1.2', '功能有效性', '功能入口可以快速方便找到并正常使用。'],
    ['1.3', '功能逻辑性', '功能流程的进展状态可视、可追踪；业务操作流程顺序合理，符合习惯；同类业务操作流程逻辑顺序一致。'],
    ['1.4', '功能辅助性', '关键步骤信息具有操作辅助提示；功能设计可减少重复输入信息。']
  ]],
  ['信息认知', [
    ['2.1', '信息完整性', '信息主题呈现完整详细，无缺失或表述不全；信息内容真实准确，与实际相符。'],
    ['2.2', '信息可读性', '文案清晰无歧义，文字符合认知，易理解；相同文案信息在不同页面呈现一致。'],
    ['2.3', '信息协同性', '个人信息在不同渠道、app间协同一致。']
  ]],
  ['交互设计', [
    ['3.1', '状态可见性', '操作时，系统或页面可以即时给出反馈；图标控件不同状态明显、可区分，易于识别和操作。'],
    ['3.2', '布局合理性', '导航栏分类合理清晰，可轻松通过导航定位目标功能；功能菜单分类合理，符合逻辑和使用习惯。'],
    ['3.3', '操作便捷性', '具有简化、快捷操作方式，如一键查询；可通过批量、允许跳过等方式，减少用户非必要操作步骤。'],
    ['3.4', '操作安全性', '可事先提示，预防用户产生错误操作；出现错误操作后，系统给出提示并允许用户修正。'],
    ['3.5', '操作一致性', '操作中各步骤的操作方式、系统反馈方式前后一致；操作方式与同业相关产品操作习惯一致。']
  ]],
  ['系统性能', [
    ['4.1', '系统稳定性', '系统稳定不易崩溃，使用可靠；系统兼容性好，适配不同硬件设备。'],
    ['4.2', '系统响应性', '产品运行流畅，不会出现明显卡顿或等待时间过长；键盘、触摸屏幕等反应灵敏，不会出现需要点击多次的情况。']
  ]],
  ['信息安全', [
    ['5.1', '信息安全性', '在登录、使用中，对个人隐私信息具有充分保护。'],
    ['5.2', '交易安全性', '在交易过程中具备充分的安全保障措施和提示。'],
    ['5.3', '风险预警性', '对紧急情况的发生具有预防和呼救措施，如密码多次失误锁定；对于具备风险的操作行为可以及时予以提示。']
  ]],
  ['视觉设计', [
    ['6.1', '视觉布局合理性', '页面基础元素能快速传达含义，让用户理解如何操作；页面设计视觉清晰干净、层次简单易读、无干扰元素。'],
    ['6.2', '风格统一性', '不同页面中图标、控件、按钮等视觉元素的样式与颜色统一；页面整体视觉风格前后保持统一。'],
    ['6.3', '视觉美观性', '视觉上亲切亲和、舒适美观，体现工行特色。']
  ]],
  ['智能化', [
    ['7.1', '用户洞察', '可准确理解用户偏好，对用户进行差异化服务或推送。'],
    ['7.2', '指令识别', '智能助手能够准确理解并识别用户发出的指令。'],
    ['7.3', '情感连接', '流程、业务、设计等途径的创新让用户有惊喜感；产品具备情感维系机制，能让用户感受到温暖。']
  ]],
  ['运营服务', [
    ['8.1', '内容运营有效性', '内容运营有明确的计划、规划，内容更新及时；运营内容对用户具有很强的吸引力。'],
    ['8.2', '用户服务专业性', '客服对用户问题的回答专业有效，能有效解决；客服对用户的提问能够及时快速响应；客服回答的态度友好、语气温和亲切。'],
    ['8.3', '价格合理性', '产品服务的价格或收益对用户定位合理，用户接受度高。']
  ]]
].map(([name, items], i) => ({ code: String(i + 1), name, items: items.map(([code, itemName, desc]) => ({ code, name: itemName, desc })) }))

const etsIndex = Object.fromEntries(ETS.flatMap((dim) => dim.items.map((item) => [item.code, { ...item, dimension: dim.name }])))
export const etsItem = (code) => etsIndex[code] || null
export const etsLabel = (code) => (etsIndex[code] ? `${code} ${etsIndex[code].name}` : code || '')
const etsCriteriaText = ETS.map((dim) => `${dim.code}.${dim.name}\n${dim.items.map((item) => `${item.code} ${item.name}：${item.desc}`).join('\n')}`).join('\n')

// ===== 提示词 =====
export const qcPrompts = reactive([
  {
    id: 1, name: '质检工具（文件分析）', updateTime: '2026-10-23', updater: currentUser.name, limit: 10000,
    // 生产环境步骤二「使用AI提炼场景」使用的提示词。%s 替换为本次素材说明。
    content: `你是资深体验研究员，请根据我输入的UI设计素材提炼业务场景。从UI设计图中提取UI设计图可能的产品分类，评测目标，关键任务流，用户痛点以及成功标准。

业务场景截图及对应的业务场景及说明： %s
如果素材分别标注为A方案和B方案：两者是同一业务场景下的两套UI设计，是并列的备选方案，不是修改前和修改后。请把两套素材合在一起，提炼它们共用的一个业务场景，不要比较两套方案的优劣，也不要把任何一套当作基线。
现有产品类型字典：["Web网站","移动App","小程序","桌面应用","其他"]
对应字段：category
匹配规则：
识别输入内容后，仅返回匹配到的产品类型字典中文结果
如果信息不足，请给出合理假设并保持保守。
输出要求：所有字段必须使用简体中文，不得输出英文句子（品牌名/产品名可保留原文）。

请只返回标准合法json格式,不要多余文字,不要标点符号,不要\`\`\`这类符号,纯json结构,语法严格正确,无需多余符号：
{
"category":"",
"businessgoal": "",
"keytasks": "",
"painpoints": "",
"successcriteria":"",
"constraints":""
}`
  },
  {
    id: 2, name: '质检工具（ETS维度）', updateTime: '2026-07-28', updater: currentUser.name, limit: 10000,
    content: '请依据八个体验维度（功能流程、信息认知、交互设计、系统性能、信息安全、视觉设计、智能化、运营服务）输出维度解读。系统性能需说明静态截图无法评估真实性能。问题严重级别使用一级问题、二级问题、三级问题，并写清位置、问题描述、优化建议和站在用户视角的原因。'
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
  },
  {
    id: 7, name: '质检工具（AB测试-方案解析）', updateTime: '2026-10-23', updater: currentUser.name, limit: 10000,
    // 生成 AB 报告前，A方案、B方案各调用一次。%s 替换为步骤二确认的共用业务场景与目标。
    content: `你是资深体验研究员。A方案和B方案是同一业务场景下的两套UI设计，二者共用同一个业务需求，是并列的备选方案，不是修改前和修改后，也不存在先后或基线关系。
本次只解析其中一套方案的设计图，方案标记只能是A方案或B方案。

共用业务场景与目标：%s

请对照共用的评测目标和关键任务流，逐张记录：页面名称、画面上能确认的任务步骤、关键元素及其位置、主要信息与文案、敏感信息的展示方式、运营内容的位置和大小。
只描述画面上看得到的内容，看不全的流程不要编造；不要评价好坏，也不要和另一套方案比较。
输出要求：所有字段使用简体中文。

请只返回标准合法json格式，不要多余文字：
{
"plan":"A方案",
"pages":[{"pagename":"","steps":[],"elements":[{"location":"","content":""}]}]
}`
  },
  {
    id: 8, name: '质检工具（AB测试-角色评估）', updateTime: '2026-10-23', updater: currentUser.name, limit: 20000,
    // 每个评测角色调用一次。%s 依次替换为角色设定、共用业务场景、A方案和B方案的解析结果。
    content: `你是用户体验评测师，请代入以下评测角色：%s

A方案和B方案是同一业务场景下的两套UI设计，共用同一个业务需求，是并列的备选方案，不是修改前和修改后。请不要使用“修改前”“修改后”“改版”“提升”“下降”等表述，也不要输出问题清单和问题严重级别。
共用业务场景与目标：%s
A方案解析结果：%s
B方案解析结果：%s

请站在该角色的立场，对照共用的评测目标和关键任务流完成以下内容：
1. 选择：该角色最终会选择A方案还是B方案，只能二选一。
2. 执行摘要：用2-3句话说明该角色完成任务时两套方案的主要区别，以及最终选择。
3. 视角分析：用该角色的第一人称口吻，说明会选哪一套方案、为什么。
4. 可见差异：逐条列出两套方案在画面上看得到的差异。每条写清差异位置、A方案是怎样的、B方案是怎样的、该角色看A方案的感受（A方案用户视角）、看B方案的感受（B方案用户视角）、在这一处会选哪一套方案以及原因。单处差异的选择可以与最终选择不同。
5. 维度差异：基于下方ETS八维度细则分析。只输出两套方案存在差异的维度，没有差异的维度不要罗列；每个维度要落到具体细则编号，说明A方案、B方案在该细则上的表现，以及哪一套方案更符合细则。系统性能基于静态设计图无法比较，不输出。
6. 优化建议：只针对上面的差异提出优化建议，写清对应的差异位置和ETS细则编号。可以建议保留某一套方案的做法，或融合两套方案的优点。

ETS八维度细则：
${etsCriteriaText}

请只返回标准合法json格式，不要多余文字：
{
"choice":"A方案或B方案",
"summary":"",
"perspective":"",
"differences":[{"location":"","a":"","b":"","aview":"","bview":"","choice":"A方案或B方案","reason":""}],
"dimensiondiffs":[{"dimension":"","items":[{"code":"","a":"","b":"","better":"A方案或B方案"}]}],
"suggestions":[{"location":"","code":"","suggestion":"","reason":""}]
}`
  },
  {
    id: 9, name: '质检工具（AB测试-综合报告）', updateTime: '2026-10-23', updater: currentUser.name, limit: 20000,
    // 所有角色评估完成后调用一次。%s 替换为各角色「AB测试-角色评估」的 JSON 结果数组。
    content: `你是用户体验评测师。以下是多个评测角色对同一业务场景下A方案、B方案两套UI设计的评估结果：%s

A方案和B方案是并列的备选方案，不是修改前和修改后。请做总结归纳，不要逐条复述各角色原文，不要输出问题清单和问题严重级别：
1. 总结：统计选择A方案、选择B方案的角色数量和名称，用一段话综述两类角色各自看重什么，不超过150字。
2. 可见差异：合并各角色提到的同一处差异。每处写清差异位置、A方案是怎样的、B方案是怎样的、倾向A方案和倾向B方案的角色数，并归纳角色选择背后的共性原因。
3. 维度差异：基于下方ETS八维度细则，先列出存在差异的维度名称，再逐个维度归纳到具体细则编号，说明A方案、B方案的表现和更符合细则的方案。没有差异的维度不展开，只列在samedimensions中。
4. 优化建议：按ETS维度分组，归纳针对差异的优化建议，合并相同建议并注明涉及的角色。

ETS八维度细则：
${etsCriteriaText}

请只返回标准合法json格式，不要多余文字：
{
"votes":{"A":[],"B":[]},
"summary":"",
"differences":[{"location":"","a":"","b":"","choosea":0,"chooseb":0,"conclusion":""}],
"dimensiondiffs":[{"dimension":"","items":[{"code":"","a":"","b":"","better":"A方案或B方案"}],"conclusion":""}],
"samedimensions":[],
"suggestions":[{"dimension":"","items":[{"location":"","code":"","suggestion":"","roles":[]}]}]
}`
  }
])

// ===== 报告生成（模板） =====
export const dimensions = ['功能流程', '信息认知', '交互设计', '系统性能', '信息安全', '视觉设计', '智能化', '运营服务']
export const PERF_TEXT = '基于静态截图无法真实评估系统加载速度与运行流畅度。需待后续支持视频输入后，结合实际响应数据进行客观评测。'

const dimTexts = {
  功能流程: ['核心浏览与交互路径清晰，但部分次要功能入口隐藏过深，用户寻找特定操作时需要多次跳转，流程闭环性有待加强。', '主流程步骤清楚，高频入口位置符合预期，中断后仍可回到当前步骤继续办理。'],
  信息认知: ['关键信息与辅助说明的层级接近，部分说明文字字号偏小，专业表述较多，用户需要反复阅读才能确认含义。', '标题、金额和说明的层级分明，文案能直接对应下一步操作，个别注释仍偏长。'],
  交互设计: ['主要按钮尺寸尚可点击，但操作后缺少明确状态反馈，用户难以确认当前选中项或操作是否已经生效。', '按钮状态和结果提示清楚，误触后可以返回修改，批量操作入口还不够显眼。'],
  信息安全: ['隐私政策入口可见，但分享、展示卡号或余额时缺少自动打码和泄露风险提示，存在无意暴露个人数据的可能。', '敏感信息默认掩码，查看前有明确操作，风险提示位于提交之前，用户能先确认再继续。'],
  视觉设计: ['整体配色和谐，但图标风格不统一，局部装饰元素抢过正文，页面视觉一致性不足，影响扫读。', '页面干净，图标和按钮样式统一，重点信息突出，没有多余装饰干扰操作。'],
  智能化: ['内容推荐机制单一，未能按浏览或办理习惯区分人群，用户感受不到被理解，也缺少可预期的智能辅助。', '常用功能会根据最近办理记录靠前展示，推荐理由可见，用户可以忽略且不影响主任务。'],
  运营服务: ['活动内容更新及时，但优惠标识不明确，价格或权益敏感的用户难以判断和自己是否相关。', '运营内容与当前任务相关，权益对象写清楚，用户可以关闭推荐后继续办理。']
}
const issueBank = {
  功能流程: { location: '首页次要功能入口', description: '部分常用功能入口隐藏过深，用户在寻找特定操作时需要多次返回和跳转，主路径虽然能走通，但闭环不顺畅。', recommendation: '把高频下一步固定在当前页面底部，并补充当前步骤进度，减少来回寻找。', reason: '用户知道自己要办什么，却要在多层入口里试。任务最终能完成，但中途反复受挫，办理效率下降。' },
  信息认知: { location: '详情页辅助说明', description: '辅助说明文字字号偏小，标题和正文的对比不足以支撑快速阅读，强光或小屏下用户要凑近才能看清限制条件。', recommendation: '辅助说明至少与正文保持可读字号，限制条件和结果用单独一行写清。', reason: '看不清说明时，用户会停下来猜测，或者直接跳过。操作还能继续，但判断成本变高。' },
  交互设计: { location: '图文列表页及详情页', description: '收藏、分享或切换选项后，界面没有即时的视觉反馈，用户无法确认当前选中项，也不确定操作是否成功。', recommendation: '操作成功后给出轻提示，并用图标状态变化标出当前结果，避免用户重复点击。', reason: '这是常用动作。没有反馈时，习惯快速操作的用户会怀疑没点上，于是再点一次，造成受挫和重复操作。' },
  信息安全: { location: '分享面板', description: '分享功能没有提示哪些个人信息会被带出，也没有对手机号、卡号等敏感内容做自动打码，用户可能在无意中把数据发出去。', recommendation: '分享前展示即将送出的内容，对手机号和卡号自动打码，并允许用户取消。', reason: '用户只是想把页面转给家人，如果因此露出账户或联系方式，会直接损害自己的信息安全。' },
  视觉设计: { location: '页面图标与运营色块', description: '同一页面的图标风格不统一，局部色块比正文更抢眼，用户扫读时会先看到装饰，再找到真正要办的内容。', recommendation: '图标回到同一套组件样式，运营色块减弱对比，把视觉重点留给标题和主按钮。', reason: '视觉干扰不会让任务失败，但会让页面显得乱，增加找到目标的时间。' },
  智能化: { location: '推荐信息流', description: '推荐内容与当前用户的办理习惯关系不大，也没有说明推荐原因，用户无法判断哪些信息值得处理。', recommendation: '按最近办理和常用功能调整排序，并在推荐旁写明推荐理由，允许关闭。', reason: '推荐不准时，用户要自己从中筛选，花费时间却得不到帮助，对产品的贴心感下降。' },
  运营服务: { location: '活动优惠标识', description: '活动信息更新及时，但没有标明适用人群和优惠条件，在意价格或权益的用户无法快速判断与自己是否相关。', recommendation: '在活动标题旁标明适用对象和关键权益，不相关的内容不要占首屏。', reason: '用户愿意看和自己有关的优惠。看不懂适用条件时，只会觉得内容吵，不会因此完成任务。' }
}
const demandPool = [
  ['在浏览和办理当前页面任务时，能看清关键信息、找到下一步，并在操作完成后立刻知道结果。', ['内容清楚', '反馈明确', '查找省力', '隐私可控']],
  ['能够自主、便捷地掌握名下账户的完整信息与状态，并对账户进行安全、灵活的管理与配置。', ['信息清晰', '操作可控', '变更及时', '安全自主']],
  ['在最少的步骤内完成转账汇款，并能随时确认资金去向与到账状态。', ['快捷高效', '结果确定', '资金安全']],
  ['快速找到适合自己风险偏好的理财产品，并理解收益与风险。', ['通俗易懂', '对比清晰', '风险透明']]
]

export function averageScore(dims = []) {
  const nums = dims.map((d) => d.score).filter((n) => typeof n === 'number')
  if (!nums.length) return null
  return Math.round((nums.reduce((sum, n) => sum + n, 0) / nums.length) * 10) / 10
}

function severityOf(score) {
  if (score < 3.2) return '一级问题'
  if (score < 4) return '二级问题'
  return '三级问题'
}

export function generateReport({ title, roleIds, materials, scene = '', business = null }, r = Math.random) {
  const roles = roleIds.map((id) => qcRoles.find((x) => x.id === id)).filter(Boolean)
  const dims = dimensions.map((name) => {
    if (name === '系统性能') return { name, score: null, text: PERF_TEXT }
    const score = Math.round((2.6 + r() * 2.2) * 10) / 10
    return { name, score, text: dimTexts[name][score < 3.8 ? 0 : 1] }
  })
  const ranked = dims.filter((d) => typeof d.score === 'number').sort((a, b) => a.score - b.score)
  const weak = ranked.slice(0, 3)
  const good = [...ranked].reverse().slice(0, 2)
  const [demand, keywords] = pick(demandPool, r)
  const issues = weak.map((d, i) => {
    const role = roles[i % Math.max(roles.length, 1)]
    return { ...issueBank[d.name], severity: severityOf(d.score), roleId: role?.id, roleName: role?.name || '综合' }
  })
  const roleViews = Object.fromEntries(
    roles.map((role) => {
      const mine = issues.filter((x) => x.roleId === role.id)
      const focus = mine[0]?.location || weak[0].name
      return [role.id, {
        score: averageScore(dims),
        summary: `${role.name}关注的是：${role.desc}对照当前页面，${weak[0].name}和${weak[1].name}与该角色预期差距较大，${good[0].name}基本可用。需要优先处理「${focus}」。`,
        perspective: `作为${role.name}，我希望把眼前这件事办完。现在的问题是${weak[0].text}`,
        dimensions: dims,
        issues: mine.length ? mine : issues.slice(0, 1)
      }]
    })
  )
  const summary = [
    `本次共选择了${roles.length}个角色进行评估，包括${roles.map((x) => x.name).join('、')}。`,
    `综合各角色的评估结果，整体表现${(averageScore(dims) || 0) >= 3.8 ? '较好' : '中等偏下'}。在${good.map((d) => d.name).join('与')}上相对完整，但在${weak.map((d) => d.name).join('、')}上仍有差距。主要的待优化点有 ${issues.length} 个，分别是：${issues.map((x) => x.description).join('；')}。`
  ]
  if (business?.businessgoal) summary.unshift(`本次评测目标：${business.businessgoal}。关键任务：${business.keytasks}。`)
  else if (scene) summary.unshift(`本次评估场景：${scene}`)
  return {
    id: `QC${Date.now()}${Math.floor(r() * 1000)}`, type: 'standard', title, createTime: nowText(), materials, roleIds, scene,
    summary, demand, keywords, dimensions: dims, issues, roleViews, business: business || null
  }
}

const showDims = [
  ['功能流程', '核心浏览与交互路径清晰，但部分次要功能入口隐藏过深，导致用户在寻找特定操作时需多次跳转，流程闭环性有待加强。', 3.6],
  ['信息认知', '关键图文信息层级分明，标题与正文对比度良好，但部分辅助说明文字字号过小，在强光环境下阅读存在一定困难。', 3.8],
  ['交互设计', '主要操作按钮尺寸中等易于点击，但缺乏明确的操作状态反馈，用户在快速滑动时难以确认当前选中项的具体状态。', 3.2],
  ['系统性能', PERF_TEXT, null],
  ['信息安全', '隐私政策入口明显，但在分享功能中缺乏对敏感信息自动打码的提示，存在用户无意泄露个人数据的潜在风险。', 3.4],
  ['视觉设计', '整体风格清新符合学生审美，色彩搭配和谐，但部分图标风格不统一，导致页面视觉一致性略有缺失，影响美观度。', 3.7],
  ['智能化', '内容推荐机制较为单一，未能根据学生用户的浏览习惯进行差异化推送，缺乏惊喜感与情感化的互动设计元素。', 3.1],
  ['运营服务', '活动内容更新及时且贴近校园生活，但缺乏针对学生群体的专属优惠标识，价格敏感度高的用户难以快速识别价值。', 3.5]
].map(([name, text, score]) => ({ name, text, score }))

const showIssues = [
  { roleId: 2, roleName: '学生用户陈同学', severity: '二级问题', location: '图文列表页及详情页', description: '关键操作如收藏或分享后，界面缺乏即时的视觉反馈，导致用户不确定操作是否成功。', recommendation: '增加操作成功后的轻提示或图标状态变化，确保用户能即时感知操作结果。', reason: '常用功能缺少反馈时，习惯快速操作的用户会产生疑虑。任务不会因此失败，但会造成重复点击和操作受挫，办理效率下降。' },
  { roleId: 106, roleName: '长辈用户王阿姨', severity: '二级问题', location: '活动详情页辅助说明', description: '辅助说明文字字号过小，标题虽然清楚，限制条件和时间需要凑近才能看清。', recommendation: '将辅助说明调整到可阅读字号，时间、地点和限制条件单独成行。', reason: '王阿姨视力下降，看不清说明就不敢确认自己有没有看对。操作还能继续，但每一步都要停留辨认。' },
  { roleId: 3, roleName: '宝妈孙女士', severity: '二级问题', location: '分享面板', description: '分享时没有提示会带出哪些个人信息，也没有对敏感内容自动打码。', recommendation: '分享前展示即将送出的内容范围，手机号和账户信息自动打码，并允许取消。', reason: '孙女士常把活动转给家人。若因此露出不该分享的个人信息，会直接造成隐私损失。' },
  { roleId: 5, roleName: '县域用户老赵', severity: '二级问题', location: '首页功能入口', description: '收藏、筛选等次要但会用到的入口隐藏过深，返回后不容易再找到。', recommendation: '在列表页保留筛选和收藏入口，并在进入详情后提供返回原位置的路径。', reason: '老赵对线上路径不熟，入口套得深时会以为没有这个功能，来回试几次后容易放弃继续浏览。' },
  { roleId: 6, roleName: '代发用户小李', severity: '三级问题', location: '推荐信息流', description: '推荐内容与小李要处理的通知关系不大，也没有说明为什么推给他。', recommendation: '把待处理通知排在活动推荐之前，并写明推荐理由。', reason: '推荐不准主要影响使用感受，小李仍能沿主路径浏览，只是要多滑一段时间才能找到相关内容。' },
  { roleId: 12, roleName: '私银用户张总', severity: '三级问题', location: '页面图标', description: '同一页面图标风格不统一，个别装饰色块比正文更抢眼。', recommendation: '统一图标样式，减弱装饰色块，把视觉重点留给标题和主操作。', reason: '图标不统一不会阻断浏览，但会让页面显得不够严谨，影响张总对信息可信度的感受。' }
]

const showRoleCopy = {
  2: ['该应用在图文浏览基础体验上表现良好，视觉风格受学生群体青睐，但在操作反馈、信息层级细节与智能化推荐方面存在优化空间，需重点解决操作状态不明与个性化不足的问题。', '作为陈同学，我觉得界面挺好看，但有时候找不到想要的功能，而且推荐的内容都不太懂我，要是能更聪明一点、操作有提示感就好了。'],
  106: ['活动大意能够看懂，主按钮也够大。辅助说明字号偏小，收藏和分享之后没有清楚结果，王阿姨不敢确认自己有没有点对，也不敢把页面转给家人。', '我看小字费劲。按钮点下去如果没有任何变化，我就不知道是没点上，还是已经成功了。希望字再大一点，点完用一句话告诉我结果。'],
  3: ['单手浏览活动列表基本顺畅，收藏和分享是会用到的功能。分享前没有说明哪些信息会一起发出去，碎片时间里来不及逐项检查。', '我经常一只手刷活动，收藏之后没有动静，我会再点一次。分享给家人时，我希望先看到会露出哪些内容，确认后再发出去。'],
  6: ['小李想尽快找到和自己相关的通知。当前推荐比较泛，入口名称偏活动运营，和确认信息、看结果的习惯不太一致。', '这些活动文案我不太会看，推荐的内容跟我关系不大。我更想一眼知道哪些要处理，点完要有明确结果，不要让我猜。'],
  12: ['页面完整，视觉也较干净，但推荐方式偏大众活动，分享范围和隐私边界不够明确。张总对默认分享和个人信息展示更谨慎。', '界面看着整齐，推荐却太泛。涉及个人状态的内容，我不希望被默认带出去。操作是否成功也要马上看得见，避免误发。'],
  5: ['主路径可以完成浏览。筛选和收藏藏得较深，老赵在不熟悉线上操作时，容易在返回和寻找入口之间来回试。', '我就想把要看的内容找到并看完。入口套得太深，我会以为没有这个功能；点了没有提示，我也不敢再点第二次。']
}

function standardShowcase() {
  const roleIds = [2, 106, 3, 6, 12, 5]
  const roleViews = Object.fromEntries(roleIds.map((id) => {
    const [summary, perspective] = showRoleCopy[id]
    const issues = showIssues.filter((x) => x.roleId === id)
    return [id, { score: averageScore(showDims), summary, perspective, dimensions: showDims, issues }]
  }))
  return {
    id: 'QCSHOW20261014', type: 'standard', title: '体验质检智能体报告20261014', createTime: '2026-10-14 17:23:40',
    creator: '周可欣', materials: [{ kind: 'mobile-green' }], roleIds, scene: '校园活动与图文资讯浏览',
    summary: [
      '本次共选择了6个角色进行评估，包括学生用户陈同学、长辈用户王阿姨、宝妈孙女士、代发用户小李、私银用户张总、县域用户老赵。',
      '综合各角色的评估结果，整体表现中等偏下。在功能流程的主路径和信息认知的标题层级上表现较好，但在交互反馈、适老阅读、分享隐私和智能化推荐上有待提升。主要的待优化点有 6 个，分别是：收藏与分享缺少结果反馈、辅助说明字号偏小、分享前未提示敏感信息处理、次要功能入口过深、推荐与用户要处理的事项不相关、图标风格不统一。'
    ],
    demand: '在浏览活动和图文资讯时，能看清内容、找到收藏和分享，并在操作完成后立刻知道结果，同时避免无意泄露个人信息。',
    keywords: ['内容清楚', '反馈明确', '字号可读', '分享可控'],
    dimensions: showDims, issues: showIssues, roleViews
  }
}

function hashText(text) {
  let h = 2166136261
  for (const ch of String(text)) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ===== AB 测试 =====
// A方案、B方案是同一业务场景下的两套 UI 设计，共用一份业务需求，是并列的备选方案，不是修改前后的先后关系。
// 每个角色在两套方案中二选一；报告只展示存在差异的 ETS 维度和细则，并给出针对差异的优化建议。
export const PLAN_KEYS = ['A', 'B']
export const planLabel = (key) => `${key}方案`

export function abVotes(report) {
  const votes = { A: [], B: [] }
  ;(report?.roleIds || []).forEach((id) => {
    const choice = report.roleViews?.[id]?.choice
    if (votes[choice]) votes[choice].push(id)
  })
  return votes
}
export function abVoteText(report) {
  const { A, B } = abVotes(report)
  return `A方案 ${A.length}人 · B方案 ${B.length}人`
}

const byCode = (x, y) => x.code.localeCompare(y.code, undefined, { numeric: true })

// codes：涉及的细则编号；criteria：{ 编号: { a, b, better } }。按 ETS 维度顺序分组，只保留有差异的维度。
function groupDimDiffs(codes, criteria) {
  const byDim = new Map()
  ;[...new Set(codes)].forEach((code) => {
    const item = etsItem(code)
    if (!item || !criteria[code]) return
    if (!byDim.has(item.dimension)) byDim.set(item.dimension, [])
    byDim.get(item.dimension).push({ code, name: item.name, desc: item.desc, ...criteria[code] })
  })
  return ETS.filter((dim) => byDim.has(dim.name)).map((dim) => ({ code: dim.code, name: dim.name, items: byDim.get(dim.name).sort(byCode) }))
}

function diffConclusion(votes, better, reason) {
  const total = votes.A + votes.B
  if (!total) return `各角色未重点提及这一处。按 ETS 细则判断，${better}方案更合适。`
  if (votes.A === votes.B) return `提及这一处的角色意见分散，倾向A方案和B方案的各 ${votes.A} 人。`
  const lead = votes.A > votes.B ? 'A' : 'B'
  const all = votes[lead === 'A' ? 'B' : 'A'] === 0
  return `提及这一处的 ${total} 个角色中，${all ? '全部' : `${votes[lead]} 人`}倾向${lead}方案。${reason || ''}`
}

function dimConclusion(dim) {
  const sides = [...new Set(dim.items.map((item) => item.better))]
  const list = dim.items.map((item) => `${item.code}${item.name}${item.better}方案更符合细则`).join('；')
  return sides.length === 1
    ? `${dim.name}有 ${dim.items.length} 条细则存在差异：${list}。该维度整体${sides[0]}方案更合适。`
    : `${dim.name}有 ${dim.items.length} 条细则存在差异：${list}。两套方案各有长处，可融合各自更合适的做法。`
}

function mergeSuggestions(roles, roleViews) {
  const groups = new Map()
  roles.forEach((role) => (roleViews[role.id]?.suggestions || []).forEach((s) => {
    const dim = etsItem(s.code)?.dimension
    if (!dim) return
    if (!groups.has(dim)) groups.set(dim, new Map())
    const key = `${s.location}|${s.code}`
    const group = groups.get(dim)
    if (!group.has(key)) group.set(key, { location: s.location, code: s.code, text: s.text, roles: [] })
    group.get(key).roles.push(role.name)
  }))
  return ETS.filter((dim) => groups.has(dim.name)).map((dim) => ({ dimension: dim.name, items: [...groups.get(dim.name).values()].sort(byCode) }))
}

// diffs：两套方案的可见差异；specs：各角色的选择与视角；其余为综合页的归纳文字（缺省时自动生成）。
function assembleAb({ roles, diffs, criteria, specs, conclusions = {}, dimConclusions = {}, suggestions, summary }) {
  const diffMap = Object.fromEntries(diffs.map((d) => [d.key, d]))
  const roleViews = Object.fromEntries(roles.filter((role) => specs[role.id]).map((role) => {
    const spec = specs[role.id]
    const differences = spec.views.filter((v) => diffMap[v.key]).map((v) => {
      const d = diffMap[v.key]
      return { key: v.key, location: d.location, a: d.a, b: d.b, aview: v.aview, bview: v.bview, choice: v.choice, reason: v.reason }
    })
    return [role.id, {
      choice: spec.choice,
      summary: spec.summary,
      perspective: spec.perspective,
      differences,
      dimensionDiffs: groupDimDiffs(differences.flatMap((v) => diffMap[v.key].codes), criteria),
      suggestions: spec.suggestions.map((s) => ({ location: diffMap[s.key]?.location || s.location, code: s.code, text: s.text, reason: s.reason }))
    }]
  }))
  const views = Object.values(roleViews)
  const differences = diffs.map((d) => {
    const votes = { A: 0, B: 0 }
    views.forEach((v) => v.differences.forEach((x) => { if (x.key === d.key) votes[x.choice] += 1 }))
    return { key: d.key, location: d.location, a: d.a, b: d.b, codes: d.codes, votes, conclusion: conclusions[d.key] || diffConclusion(votes, d.better, d.reason) }
  })
  const dimensionDiffs = groupDimDiffs(diffs.flatMap((d) => d.codes), criteria).map((dim) => ({
    ...dim,
    roles: views.filter((v) => v.dimensionDiffs.some((x) => x.name === dim.name)).length,
    conclusion: dimConclusions[dim.name] || dimConclusion(dim)
  }))
  const sameDimensions = ETS.map((dim) => dim.name).filter((name) => !dimensionDiffs.some((dim) => dim.name === name))
  return {
    roleIds: roles.map((role) => role.id),
    roleViews,
    differences,
    dimensionDiffs,
    sameDimensions,
    suggestions: suggestions || mergeSuggestions(roles, roleViews),
    summary: summary || abSummary(roles, roleViews)
  }
}

function abSummary(roles, roleViews) {
  const reasons = (side) => {
    const list = []
    roles.forEach((role) => {
      const view = roleViews[role.id]
      if (view?.choice !== side) return
      view.differences.forEach((d) => { if (d.choice === side && !list.includes(d.location)) list.push(d.location) })
    })
    return list.slice(0, 3)
  }
  const parts = PLAN_KEYS.map((side) => {
    const count = roles.filter((role) => roleViews[role.id]?.choice === side).length
    if (!count) return `没有角色选择${side}方案`
    const why = reasons(side)
    return `选择${side}方案的角色主要看重${why.length ? `${side}方案在${why.join('、')}上的做法` : `${side}方案整体更顺手`}`
  })
  return `${parts.join('；')}。两套方案的具体差异和各自更合适的地方，见下方可见差异和维度差异。`
}

// ----- 演示报告：个人手机银行「我的账户」页的 A/B 两套设计 -----
const showAbBusiness = {
  category: '移动App',
  businessgoal: '验证用户能否看清名下资金，并继续完成转账或查看明细',
  keytasks: '查看余额或总资产；找到转账入口；打开明细核对最近一笔变动',
  painpoints: '余额、卡号若默认完整露出，旁边有人时不放心；常用下一步若藏在菜单里，查完还要再找一层',
  successcriteria: '查账和常用下一步能在首屏识别；敏感数字默认不是完整露出',
  constraints: 'A、B方案服务于同一业务场景，共用以上目标和任务，只比较两套设计在画面上可见的差异。不推测限额、到账时间等未出现的规则',
  fromPrompt: true,
  promptName: '质检工具（文件分析）'
}

const showAbDiffs = [
  { key: 'asset', location: '页头资产区', a: '没有总资产汇总，进入页面直接是单张卡片列表', b: '顶部增加总资产和昨日收益，放在账户列表上方', codes: ['2.1', '2.2'] },
  { key: 'balance', location: '余额展示', a: '余额数字默认完整显示', b: '余额默认显示为星号，点击眼睛图标后才显示', codes: ['3.1', '5.1'] },
  { key: 'cardno', location: '卡号展示', a: '卡号完整展示', b: '卡号中间四位以星号代替', codes: ['5.1'] },
  { key: 'quick', location: '常用功能入口', a: '转账、明细收在卡片右上角的“更多”菜单里', b: '转账、收支明细、银行卡三个入口固定在首屏', codes: ['1.2', '3.3'] },
  { key: 'banner', location: '运营位', a: '首屏没有推荐内容', b: '底部增加理财推荐横幅，约占首屏四分之一，不能关闭', codes: ['6.1', '8.1'] }
]

const showAbCriteria = {
  '1.2': { a: '转账、明细要先打开卡片的“更多”菜单才能看到。', b: '三个常用入口固定在首屏，进入页面即可点击。', better: 'B' },
  '2.1': { a: '只有单卡余额，用户要自己把各卡余额相加。', b: '提供总资产汇总，名下资金一眼可见。', better: 'B' },
  '2.2': { a: '只展示余额数字，含义直接，没有需要解释的词。', b: '新增“昨日收益”，没有说明统计的是利息、理财浮动还是全部资金。', better: 'A' },
  '3.1': { a: '余额始终可见，不需要判断显示状态。', b: '用无文字的眼睛图标切换余额显隐，打开和关闭两种状态区别不明显。', better: 'A' },
  '3.3': { a: '查完余额再转账，需要多点一次菜单。', b: '首屏一步进入转账或明细。', better: 'B' },
  '5.1': { a: '余额和完整卡号默认露出，旁边有人时容易被看到。', b: '余额默认掩码、卡号中间四位掩码，查看需要用户主动操作。', better: 'B' },
  '6.1': { a: '卡片列表整齐，层次简单，没有干扰元素。', b: '理财横幅颜色抢眼，与账户信息争夺注意力。', better: 'A' },
  '8.1': { a: '首屏不放运营内容，查账过程不被打扰。', b: '理财横幅固定在首屏，看不出与用户是否相关，也不能关闭，对只想查账的用户缺少吸引力。', better: 'A' }
}

const showAbSpecs = {
  2: {
    choice: 'B',
    summary: '陈同学最常做的是查完余额顺手转账。B方案把转账固定在首屏，余额和卡号默认遮挡，在宿舍、食堂这类有人的场合更放心；A方案信息直接，但每次转账都要多点一层菜单。底部理财横幅是B方案唯一让他不满的地方。综合判断，陈同学选择B方案。',
    perspective: '我选B方案。我打开账户基本就是看一眼余额然后转账，B方案转账就在首屏，一下就点到了；余额默认藏起来，同学在旁边也看不到。下面那块理财广告有点占地方，要是能关掉就更好了。',
    views: [
      { key: 'quick', aview: '查完余额还要点开“更多”才能转账，每次都多一步，有点烦。', bview: '转账就在首屏，点一下就进去，跟我常用的支付App习惯一样。', choice: 'B', reason: '转账是他最高频的下一步，B方案少一次点击。' },
      { key: 'balance', aview: '余额一直亮着，在食堂排队时打开手机，别人也能看到。', bview: '默认是星号，想看时点一下眼睛就行，这个图标我认识。', choice: 'B', reason: '他熟悉眼睛图标，掩码没有增加理解成本，却能保护隐私。' },
      { key: 'banner', aview: '页面很干净，打开就是我的卡。', bview: '底部一大块理财广告，我只是想看余额，还要先划过它。', choice: 'A', reason: '横幅和查账无关，占了首屏位置。' }
    ],
    suggestions: [
      { key: 'banner', code: '8.1', text: '理财横幅增加关闭按钮，或移到全部账户列表之后，首屏只保留总资产和常用入口。', reason: '保留B方案的首屏效率，同时去掉与查账无关的干扰。' },
      { key: 'quick', code: '3.3', text: '保留B方案首屏固定的转账、收支明细入口，并支持用户自定义一个常用功能。', reason: '高频用户希望一步直达，自定义可以覆盖更多习惯。' }
    ]
  },
  106: {
    choice: 'A',
    summary: '王阿姨打开账户页只想确认钱在不在、有多少。A方案余额直接显示，她一眼就能看懂；B方案余额变成星号，她不认识眼睛图标，会以为余额没加载出来，理财横幅也让她分心。卡号掩码她认可，但不足以抵消看不懂的部分。王阿姨选择A方案。',
    perspective: '我选A方案。我就是想看看卡里有多少钱，A方案数字直接摆在那儿，我放心。B方案一进去全是星号，那个小眼睛我不认识，也不敢乱点；下面的广告颜色那么亮，我还以为是要我买东西。卡号藏起几位倒是好的。',
    views: [
      { key: 'balance', aview: '余额直接写着，我一看就知道有多少钱。', bview: '一排星号，我以为钱没显示出来，小眼睛也不知道能点。', choice: 'A', reason: '图标没有文字说明，她无法自己找到查看余额的方法。' },
      { key: 'asset', aview: '一张卡一张卡地看，跟存折差不多，我看得懂。', bview: '上面多了总资产和昨日收益，收益是什么钱我不清楚。', choice: 'A', reason: '“昨日收益”没有解释，让她担心钱发生了变化。' },
      { key: 'cardno', aview: '卡号全露着，我平时常让孙子帮我看手机，有点不放心。', bview: '卡号中间藏起来了，别人看不全，这个好。', choice: 'B', reason: '她对安全敏感，卡号掩码不影响她要办的事。' },
      { key: 'banner', aview: '没有广告，页面清清楚楚。', bview: '下面那块颜色很亮，我第一眼先看到它，还以为要我买理财。', choice: 'A', reason: '横幅颜色比账户信息更醒目，分散她的注意力。' }
    ],
    suggestions: [
      { key: 'balance', code: '3.1', text: '若采用余额掩码，在眼睛图标旁加上“显示余额 / 隐藏余额”文字，并让两种状态样式明显不同；长辈版可默认显示余额。', reason: '保留B方案的隐私保护，同时消除不会操作图标的顾虑。' },
      { key: 'asset', code: '2.2', text: '“昨日收益”旁用一句话写明统计范围，如“理财产品昨日收益，不含存款利息”。', reason: '看不懂的数字会让长辈怀疑资金出了问题。' },
      { key: 'banner', code: '6.1', text: '理财横幅降低色彩饱和度，放到账户列表之后。', reason: '把视觉重点还给余额和卡片。' }
    ]
  },
  3: {
    choice: 'B',
    summary: '孙女士常在碎片时间单手查看宝宝卡和工资卡。B方案的总资产让她一眼掌握家里的钱，转账固定在首屏，也省得单手找菜单；A方案要展开卡片菜单，单手操作不方便。她希望B方案的横幅往后放，但整体仍选择B方案。',
    perspective: '我选B方案。我经常一只手抱孩子一只手看手机，B方案上面就有总资产，几张卡加起来多少钱一下就知道，转账也不用再点“更多”。就是下面那个推荐可以放后面一点，我想先把每张卡看完。',
    views: [
      { key: 'asset', aview: '要一张张看，再自己算加起来是多少。', bview: '总资产直接写着，家里的钱一眼就清楚。', choice: 'B', reason: '她管理多张卡，总资产汇总省去心算。' },
      { key: 'quick', aview: '单手要先点卡片右上角的“更多”，大拇指不太够得着。', bview: '转账、明细就在中间，单手也能点到。', choice: 'B', reason: '首屏入口更适合单手、碎片化的操作。' },
      { key: 'banner', aview: '卡片列表一屏就能看完。', bview: '横幅挤占了位置，要多滑一下才能看到最后一张卡。', choice: 'A', reason: '横幅把账户列表挤到了下一屏。' }
    ],
    suggestions: [
      { key: 'quick', code: '1.2', text: '保留B方案的首屏常用入口，并放在单手拇指容易触达的区域。', reason: '兼顾效率和单手操作。' },
      { key: 'banner', code: '8.1', text: '名下有多张卡的用户，把理财横幅移到账户列表之后。', reason: '先让用户看全自己的账户，再展示推荐。' }
    ]
  },
  6: {
    choice: 'A',
    summary: '小李打开账户页主要是确认工资到没到账。A方案进入后直接是工资卡余额，最快得到答案；B方案先出现总资产、昨日收益和理财推荐，余额还要点开眼睛才能看到。B方案把明细放在首屏是加分项，但没有改变他的选择。小李选择A方案。',
    perspective: '我选A方案。我就想知道工资到了没有，A方案一打开就是我那张卡的余额，看完就走。B方案又是总资产又是收益，还要点小眼睛才能看到数字，这些我不太懂，也不想看。不过B方案明细放在外面，这点挺方便。',
    views: [
      { key: 'balance', aview: '一打开就能看到工资卡余额，到没到账马上知道。', bview: '余额是星号，还要再点一下才能看到。', choice: 'A', reason: '确认到账是他唯一的目的，多一步就是多余。' },
      { key: 'asset', aview: '只有自己的卡，没有不懂的词。', bview: '“总资产”“昨日收益”这些词我不太熟，不知道和工资有什么关系。', choice: 'A', reason: '理财术语对他没有帮助，反而增加理解成本。' },
      { key: 'quick', aview: '想看明细得点“更多”，我经常找不到。', bview: '收支明细就在首屏，想核对哪一笔都很方便。', choice: 'B', reason: '首屏明细入口方便核对工资入账记录。' }
    ],
    suggestions: [
      { key: 'quick', code: '1.2', text: '采用B方案首屏的收支明细入口，同时在卡片上直接显示“最近一笔入账”。', reason: '代发用户最关心到账，最近入账比总资产更有用。' },
      { key: 'asset', code: '2.2', text: '未持有理财的用户不展示“昨日收益”。', reason: '减少与用户无关的金融术语。' }
    ]
  },
  12: {
    choice: 'B',
    summary: '张总重视隐私和整体资产掌控。B方案余额和卡号默认掩码，符合他的要求；A方案把余额和完整卡号直接露出，在会议室、车上打开手机都不合适。他不满意B方案的理财横幅与自己的资产情况无关。张总选择B方案。',
    perspective: '我选B方案。余额和卡号不应该默认露出来，B方案这点做对了。那个理财横幅推的是大众产品，跟我没什么关系，占着账户页的位置不合适，最好按我的情况推，或者干脆别放在这里。',
    views: [
      { key: 'balance', aview: '余额直接显示，在会议室或车上打开手机不合适。', bview: '默认隐藏，我需要时再看，这才对。', choice: 'B', reason: '他对隐私高度敏感，余额默认掩码是基本要求。' },
      { key: 'cardno', aview: '完整卡号露在外面，截屏发给助理都要小心。', bview: '中间四位遮住了，截屏也不担心。', choice: 'B', reason: '卡号掩码降低截屏和旁人窥见的风险。' },
      { key: 'banner', aview: '账户页只有账户，干净利落。', bview: '推荐的是大众理财，和我的资产配置无关。', choice: 'A', reason: '推荐内容缺少针对性，对他没有吸引力。' }
    ],
    suggestions: [
      { key: 'banner', code: '8.1', text: '理财推荐按用户资产情况区分，高净值客户展示专属客户经理入口，不展示大众产品横幅。', reason: '运营内容与用户相关时才有吸引力。' },
      { key: 'cardno', code: '5.1', text: '保留B方案的余额、卡号掩码，并增加“截屏时自动隐藏敏感信息”的设置。', reason: '进一步降低截屏外传的风险。' }
    ]
  },
  5: {
    choice: 'B',
    summary: '老赵对线上操作信心不足，A方案的“更多”菜单他常常找不到，B方案把转账、明细摆在首屏，他能自己办完。B方案的“昨日收益”他看不懂，余额星号也让他犹豫，需要补上文字说明。权衡之后，老赵选择B方案。',
    perspective: '我选B方案，转账和明细能直接看到，我自己就能办，不用找人帮忙。不过上面那个收益数字我看不懂，不知道是利息还是别的钱；余额是星号，我也是试了好几下才知道要点那个眼睛。要是写上字就好了。',
    views: [
      { key: 'quick', aview: '“更多”里面藏着转账，我找了半天才找到。', bview: '转账、明细就摆在上面，一眼就看到了。', choice: 'B', reason: '入口外露，对不熟悉线上操作的用户帮助最大。' },
      { key: 'asset', aview: '没有多余的数字，我看得明白。', bview: '“昨日收益”我看不懂，不知道我的钱是不是变了。', choice: 'A', reason: '没有解释的数字让他不敢确认资金状态。' },
      { key: 'balance', aview: '余额直接看得见。', bview: '星号加个小眼睛，我点了好几次才明白。', choice: 'A', reason: '图标缺少文字，他需要反复尝试才能理解。' }
    ],
    suggestions: [
      { key: 'asset', code: '2.2', text: '“昨日收益”旁增加说明入口，点开后用一句话解释统计范围。', reason: '看懂数字才敢确认资金状态。' },
      { key: 'balance', code: '3.1', text: '眼睛图标旁增加“显示余额”文字。', reason: '文字比图标更容易理解。' }
    ]
  }
}

const showAbConclusions = {
  asset: '总资产汇总对管理多张卡的用户有用，但“昨日收益”没有说明统计范围，长辈、代发和县域用户看不懂，反而担心资金变动，因此多数角色在这一处倾向A方案。',
  balance: '熟悉图标、重视隐私的角色认可B方案的余额掩码；不认识眼睛图标的角色更信任A方案直接显示余额。分歧不在掩码本身，而在于图标没有文字说明。',
  cardno: '卡号掩码不影响任何任务，提及这一处的角色全部倾向B方案。',
  quick: '首屏常用入口是B方案最受认可的差异，提及这一处的角色全部倾向B方案，对单手操作和不熟悉线上操作的用户帮助最大。',
  banner: '理财横幅与查账任务无关，且不能关闭，提及这一处的角色全部倾向A方案不放运营内容的首屏。'
}

const showAbDimConclusions = {
  功能流程: 'B方案把常用入口固定在首屏，更符合“功能入口可以快速方便找到”的要求，是B方案最主要的长处。',
  信息认知: 'B方案的总资产让信息更完整，但“昨日收益”缺少口径说明，可读性不如A方案。两条细则各有长处，关键是补上说明。',
  交互设计: 'B方案操作更便捷，但眼睛图标的状态不够明显；A方案没有显隐切换，理解成本更低。',
  信息安全: 'B方案默认掩码余额和卡号，对个人隐私的保护更充分。在余额展示上倾向A方案的角色，原因是看不懂眼睛图标，并不是不需要隐私保护；卡号掩码则无人反对。',
  视觉设计: 'A方案层次简单、无干扰；B方案的理财横幅颜色抢眼，削弱了账户信息的视觉重点。',
  运营服务: 'B方案的运营内容与查账任务无关，也不能关闭，对用户缺少吸引力；在本场景中A方案不放运营内容更合适。'
}

const showAbSuggestions = [
  { dimension: '功能流程', items: [
    { location: '常用功能入口', code: '1.2', text: '采用B方案首屏固定的转账、收支明细入口，并放在单手拇指容易触达的区域；代发用户可在卡片上直接看到“最近一笔入账”。', roles: ['宝妈孙女士', '代发用户小李'] }
  ] },
  { dimension: '信息认知', items: [
    { location: '页头资产区', code: '2.2', text: '“昨日收益”旁用一句话写明统计范围，并提供说明入口；未持有理财的用户不展示该数字。', roles: ['长辈用户王阿姨', '代发用户小李', '县域用户老赵'] }
  ] },
  { dimension: '交互设计', items: [
    { location: '余额展示', code: '3.1', text: '保留余额掩码，在眼睛图标旁增加“显示余额 / 隐藏余额”文字，两种状态样式明显区分；长辈版可默认显示余额。', roles: ['长辈用户王阿姨', '县域用户老赵'] },
    { location: '常用功能入口', code: '3.3', text: '在B方案首屏入口的基础上，支持用户自定义一个常用功能。', roles: ['学生用户陈同学'] }
  ] },
  { dimension: '信息安全', items: [
    { location: '卡号展示', code: '5.1', text: '保留B方案的余额、卡号掩码，并增加“截屏时自动隐藏敏感信息”的设置。', roles: ['私银用户张总'] }
  ] },
  { dimension: '视觉设计', items: [
    { location: '运营位', code: '6.1', text: '理财横幅降低色彩饱和度，把视觉重点留给余额和账户卡片。', roles: ['长辈用户王阿姨'] }
  ] },
  { dimension: '运营服务', items: [
    { location: '运营位', code: '8.1', text: '理财横幅增加关闭按钮并移到账户列表之后；按用户资产情况区分推荐内容，高净值客户展示专属服务入口。', roles: ['学生用户陈同学', '宝妈孙女士', '私银用户张总'] }
  ] }
]

function abShowcase() {
  const roles = [2, 106, 3, 6, 12, 5].map((id) => qcRoles.find((x) => x.id === id)).filter(Boolean)
  const body = assembleAb({
    roles,
    diffs: showAbDiffs,
    criteria: showAbCriteria,
    specs: showAbSpecs,
    conclusions: showAbConclusions,
    dimConclusions: showAbDimConclusions,
    suggestions: showAbSuggestions,
    summary: '选择B方案的角色主要看重首屏常用入口和余额、卡号掩码：查完余额能直接转账，在有人的场合也更放心。选择A方案的角色看重余额直接可见、没有看不懂的数字和图标。无论选择哪套方案，提及理财横幅的角色都不认可它出现在首屏。'
  })
  return {
    id: 'QCSHOW20261016', type: 'ab', title: '体验质检智能体报告20261016', createTime: '2026-10-16 09:30:00', creator: '周可欣',
    materials: [{ kind: 'mobile-green', version: 'A方案' }, { kind: 'mobile-fund', version: 'B方案' }],
    scene: '个人手机银行「我的账户」页', business: showAbBusiness,
    ...body
  }
}

// ----- 新建 AB 报告：按步骤二确认的共用业务场景生成演示内容（正式环境由「AB测试」提示词生成） -----
const abDiffPool = [
  {
    location: '「{step}」入口', codes: ['1.2', '3.3'],
    good: '「{step}」的入口放在首屏主区域，进入页面即可点击', weak: '「{step}」的入口收在二级菜单里，需要展开后才能看到',
    goodView: '要办的事一眼就能找到，点一下就进去了。', weakView: '得先打开菜单才找得到，第一次用会犹豫是不是没有这个功能。',
    reason: '入口直接可见，减少寻找和试错。', tip: '采用{better}的首屏入口做法，同时在菜单中保留备用入口，照顾已经养成习惯的用户。'
  },
  {
    location: '「{step}」后的结果反馈', codes: ['3.1'],
    good: '操作后有明确的结果提示，按钮状态随之变化', weak: '操作后页面没有明显变化',
    goodView: '点完马上知道成了没有，心里踏实。', weakView: '点完没动静，我不确定是不是成功了，可能会再点一次。',
    reason: '结果可见，避免重复操作和猜测。', tip: '统一采用{better}的结果提示方式，并让按钮的已完成和未完成状态明显区分。'
  },
  {
    location: '关键信息与说明文案', codes: ['2.2'],
    good: '关键信息用一句话写清，标题与说明层级分明', weak: '说明文字字号小、术语多，关键信息和辅助说明混在一起',
    goodView: '看一遍就明白要做什么。', weakView: '小字和术语太多，要反复读才敢往下点。',
    reason: '文案易懂，判断成本更低。', tip: '参照{better}的文案写法，把关键信息放在第一行，术语换成用户能直接理解的说法。'
  },
  {
    location: '敏感信息展示', codes: ['5.1'],
    good: '金额、卡号等敏感信息默认掩码，主动点击后才显示，开关旁有文字说明', weak: '金额、卡号等敏感信息默认完整展示',
    goodView: '旁边有人也不怕被看到，想看时点一下就行。', weakView: '数字全露在外面，在公共场合打开不太放心。',
    reason: '隐私保护更充分，查看方式也说得清楚。', tip: '采用{better}的默认掩码做法，并在显隐开关旁写明“显示 / 隐藏”。'
  },
  {
    location: '「{step}」提交前确认', codes: ['3.4', '5.3'],
    good: '提交前集中展示关键要素，并在确认按钮前给出风险提示', weak: '关键要素分散在多屏，风险提示放在页面底部',
    goodView: '确认前能把要素再核对一遍，不怕点错。', weakView: '要来回翻才能核对，提示在最下面很容易漏看。',
    reason: '事前提示能预防误操作。', tip: '沿用{better}的集中确认做法，把风险提示放在确认按钮正上方。'
  },
  {
    location: '页面视觉重点', codes: ['6.1'],
    good: '页面干净，视觉重点落在主任务信息和主按钮上', weak: '装饰色块和运营图片比主任务信息更醒目',
    goodView: '一打开就知道该看哪里。', weakView: '先被花哨的色块吸引，再回头找自己要办的事。',
    reason: '层次简单、无干扰元素。', tip: '以{better}的视觉层级为基准，降低装饰元素的对比度，把视觉重点留给主任务。'
  },
  {
    location: '运营推荐位', codes: ['8.1'],
    good: '运营内容放在主任务之后，与当前任务相关，可以关闭', weak: '推荐内容占据首屏显著位置，与当前任务关系不大',
    goodView: '推荐不挡路，和我有关的我才会看。', weakView: '还没办正事就先看到广告，跟我要做的事没关系。',
    reason: '运营内容不打断主任务，相关性更高。', tip: '运营位参照{better}的位置和关闭方式，并按用户办理习惯区分推荐内容。'
  },
  {
    location: '「{step}」流程进度', codes: ['1.3'],
    good: '多步流程顶部有步骤条，标明当前第几步、共几步', weak: '多步流程没有进度提示',
    goodView: '知道还剩几步，心里有底。', weakView: '不知道还要填多久，容易半途放弃。',
    reason: '进展可视、可追踪。', tip: '采用{better}的步骤条，并在每一步标题中写明本步要完成的事。'
  },
  {
    location: '「{step}」信息填写', codes: ['1.4'],
    good: '常用信息自动带出，关键输入项有示例提示', weak: '需要手动重复填写已有信息，输入项没有示例',
    goodView: '不用重复输入，看示例就知道怎么填。', weakView: '同样的信息要再敲一遍，还担心格式填错。',
    reason: '减少重复输入，降低出错。', tip: '沿用{better}的自动带出和示例提示，覆盖所有关键输入项。'
  }
]

function shuffled(list, r) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildSceneAbReport({ title, roleIds, materials, scene = '', business }) {
  const biz = {
    ...business,
    businessgoal: business?.businessgoal || '完成当前页面的主要任务',
    keytasks: business?.keytasks || '画面上的主要任务'
  }
  const roles = roleIds.map((rid) => qcRoles.find((x) => x.id === rid)).filter(Boolean)
  const shots = materials?.length ? materials : [{ kind: 'mobile-green', version: 'A方案' }, { kind: 'mobile-fund', version: 'B方案' }]
  const seed = hashText(`${biz.businessgoal}|${biz.keytasks}|${shots.map((m) => `${m.version}:${m.name || ''}`).join(',')}`)
  const r = seeded(seed % 233280)
  const steps = String(biz.keytasks).split(/[；;]\s*/).map((s) => s.trim()).filter(Boolean)
  const picked = shuffled(abDiffPool, r).slice(0, 4)
  const diffs = picked.map((tpl, i) => {
    const step = steps[i % steps.length] || '当前任务'
    const fill = (s) => s.replaceAll('{step}', step)
    const better = r() < 0.5 ? 'A' : 'B'
    return { key: `d${i + 1}`, location: fill(tpl.location), codes: tpl.codes, better, tpl, fill }
  })
  // 两套方案各有长处时，角色的选择才有分歧
  if (diffs.length > 1 && diffs.every((d) => d.better === diffs[0].better)) diffs[diffs.length - 1].better = diffs[0].better === 'A' ? 'B' : 'A'
  diffs.forEach((d) => {
    const good = d.fill(d.tpl.good)
    const weak = d.fill(d.tpl.weak)
    d.a = d.better === 'A' ? good : weak
    d.b = d.better === 'B' ? good : weak
    d.reason = `${d.better}方案${d.tpl.reason}`
  })
  const criteria = {}
  diffs.forEach((d) => d.codes.forEach((code) => { criteria[code] = { a: `${d.a}。`, b: `${d.b}。`, better: d.better } }))
  const specs = Object.fromEntries(roles.map((role) => {
    const rr = seeded(hashText(`${seed}|${role.id}`) % 233280)
    const count = Math.min(diffs.length, 2 + Math.floor(rr() * Math.max(diffs.length - 1, 1)))
    const mine = shuffled(diffs, rr).slice(0, count).sort((x, y) => diffs.indexOf(x) - diffs.indexOf(y))
    const tally = { A: 0, B: 0 }
    mine.forEach((d) => { tally[d.better] += 1 })
    const choice = tally.A === tally.B ? (rr() < 0.5 ? 'A' : 'B') : (tally.A > tally.B ? 'A' : 'B')
    const other = choice === 'A' ? 'B' : 'A'
    const favored = mine.filter((d) => d.better === choice)
    const rest = mine.filter((d) => d.better !== choice)
    const summary = `${role.name}围绕「${biz.businessgoal}」对比两套方案。${choice}方案在${favored.map((d) => d.location).join('、')}上更符合该角色的习惯${rest.length ? `；${other}方案在${rest.map((d) => d.location).join('、')}上更好` : ''}。综合判断，${role.name}选择${choice}方案。`
    const perspective = `作为${role.name}，我选${choice}方案。${favored[0].location}这一处，${favored[0].tpl.goodView}${rest.length ? `不过${other}方案的${rest[0].location}更好，${rest[0].tpl.goodView}` : ''}`
    return [role.id, {
      choice,
      summary,
      perspective,
      views: mine.map((d) => ({
        key: d.key,
        aview: d.better === 'A' ? d.tpl.goodView : d.tpl.weakView,
        bview: d.better === 'B' ? d.tpl.goodView : d.tpl.weakView,
        choice: d.better,
        reason: d.reason
      })),
      suggestions: mine.map((d) => ({ key: d.key, code: d.codes[0], text: d.fill(d.tpl.tip).replaceAll('{better}', `${d.better}方案`), reason: d.tpl.reason }))
    }]
  }))
  const body = assembleAb({ roles, diffs, criteria, specs })
  return {
    id: `QCAB${Date.now()}`, type: 'ab', title, createTime: nowText(),
    materials: shots, scene, business: business || null,
    ...body
  }
}

export function generateAbReport({ title, roleIds, scene = '', materials, business }) {
  return buildSceneAbReport({ title, roleIds, materials, scene, business })
}

const thumbKinds = ['desktop', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-green', 'mobile-fund']
const history = Array.from({ length: 42 }, (_, i) => {
  const d = new Date(2026, 9, 13, 9, 40)
  d.setHours(d.getHours() - Math.floor(i * 30 + rand() * 20))
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const rpt = generateReport({ title: `体验质检智能体报告${date}`, roleIds: [1, 4], materials: [{ kind: thumbKinds[i % 8] }] }, rand)
  return { ...rpt, id: `QC${1000 + i}`, createTime: nowText(d), creator: i % 3 ? '周可欣' : currentUser.name }
})

export const qcReports = reactive([standardShowcase(), abShowcase(), ...history])

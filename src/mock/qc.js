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

// ===== 提示词 =====
export const qcPrompts = reactive([
  {
    id: 1, name: '质检工具（文件分析）', updateTime: '2026-10-23', updater: currentUser.name, limit: 10000,
    // 生产环境步骤二「使用AI提炼场景」使用的提示词。%s 替换为本次素材说明。
    content: `你是资深体验研究员，请根据我输入的UI设计素材提炼业务场景。从UI设计图中提取UI设计图可能的产品分类，评测目标，关键任务流，用户痛点以及成功标准。

业务场景截图及对应的业务场景及说明： %s
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
    id: 7, name: '质检工具（AB对比-单图场景）', updateTime: '2026-10-16', updater: currentUser.name, limit: 10000,
    content: '你是资深体验研究员。本次只分析一张UI设计图。版本标记只能是修改前或修改后。请提取产品类型、页面名称、评测目标、画面上能确认的任务步骤、关键元素、痛点和成功标准。看不全的流程不要编造。只返回JSON。'
  },
  {
    id: 8, name: '质检工具（AB对比-对比报告）', updateTime: '2026-10-16', updater: currentUser.name, limit: 20000,
    content: '你是用户体验评测师。对照修改前、修改后两份单图场景，判断是否为同一页面的同一任务。按功能流程、信息认知、交互设计、系统性能、信息安全、视觉设计、智能化、运营服务比较提升、持平、下降或无法判断。系统性能固定为无法判断。输出采纳结论、可见差异、改版改善和问题清单。问题严重级别使用一级问题、二级问题、三级问题，变化类型使用改版新引入、改版后退步、改版后仍存在。只返回JSON。'
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

const abDims = [
  { name: '功能流程', change: '提升', beforescore: 3, afterscore: 4, score: 4, text: '修改前转账和明细收在卡片内的更多菜单里，查完账户后还要再找一层。修改后把转账、收支明细和银行卡固定在首屏，常用路径更短。账户备注的入口在修改后画面里看不到了，补充备注仍需绕路。' },
  { name: '信息认知', change: '下降', beforescore: 4, afterscore: 3, score: 3, text: '修改前单卡余额和卡号可以直接阅读，信息完整但敏感信息暴露。修改后总资产汇总让整体资金更好理解，卡号掩码也减少了无关数字。首屏理财横幅和昨日收益挤在一起，查余额的主题被冲淡，收益口径没有说明。' },
  { name: '交互设计', change: '提升', beforescore: 3, afterscore: 4, score: 4, text: '修改前主要依赖列表点击，进入明细前缺少明确预示。修改后快捷入口固定，眼睛图标可以切换余额显示，操作状态比修改前清楚。眼睛图标没有配套文字，第一次使用时不容易发现余额可以点开。' },
  { name: '系统性能', change: '无法判断', beforescore: null, afterscore: null, score: null, text: '两版都是静态设计图，无法评估加载速度、滑动卡顿和点击是否要重复触发。系统性能需待后续支持视频或真机操作后再做对比。' },
  { name: '信息安全', change: '提升', beforescore: 2, afterscore: 4, score: 4, text: '修改前余额和完整卡号默认露出，旁边有人时容易被看到。修改后余额默认掩码、卡号中间掩码，查看前需要用户主动点击，隐私保护明显加强。两版都没有看到分享或截屏后的再次风险提示。' },
  { name: '视觉设计', change: '下降', beforescore: 4, afterscore: 3, score: 3, text: '修改前列表整齐，层级简单，没有多余色块。修改后总资产区域仍然清楚，但理财横幅色彩更抢，和账户信息争夺注意力，页面不如修改前干净。图标样式本身前后保持统一。' },
  { name: '智能化', change: '持平', beforescore: 3, afterscore: 3, score: 3, text: '两版都没有看到按用户区分的账户排序或到账提醒。修改后的理财推荐是固定横幅，不能说明系统已经理解用户偏好。对用户来说，智能程度在修改前后没有明显差别。' },
  { name: '运营服务', change: '下降', beforescore: 3, afterscore: 2, score: 2, text: '修改前几乎没有运营内容，查账过程不被打扰。修改后推荐横幅占据首屏显著位置，活动信息抢在账户信息之前，只想确认余额的用户无法关闭，也看不出推荐和自己是否相关。' }
]

const abDiffs = [
  { location: '页头资产区', before: '没有总资产汇总，进入页面后直接是单张卡片列表。', after: '增加总资产和昨日收益，放在账户列表上方。', usereffect: '用户可以先掌握整体资金，再决定看哪一张卡。' },
  { location: '余额展示', before: '余额数字默认完整展示。', after: '余额默认掩码，点击眼睛图标后显示。', usereffect: '降低旁边有人时被看到余额的风险，查看时需要多一步。' },
  { location: '卡号展示', before: '卡号完整展示。', after: '卡号中间四位掩码。', usereffect: '降低截屏或旁人窥见完整卡号的可能。' },
  { location: '常用功能', before: '转账、明细收在卡片里的更多菜单中。', after: '转账、收支明细、银行卡固定在首屏。', usereffect: '查账之后继续转账或看明细的步数减少。' },
  { location: '运营位', before: '首屏没有推荐内容。', after: '页面底部增加理财推荐横幅，约占首屏四分之一。', usereffect: '资产信息被挤到下一屏，只想查账的用户被推荐打断。' }
]

const abImprovements = [
  { location: '余额与卡号', description: '余额改为默认掩码，卡号中间四位不再完整展示，用户主动点击后才看到具体数字。', uservalue: '在通勤、网点排队等旁边有人的场景里，账户信息不容易被直接看到。' },
  { location: '首屏快捷入口', description: '转账、收支明细、银行卡从卡片菜单提到首屏，成为固定入口。', uservalue: '查完账户后不用再打开更多菜单，常用下一步更容易找到。' },
  { location: '总资产汇总', description: '页面顶部增加总资产，用户不必把每张卡的余额心算相加。', uservalue: '先看整体、再看单卡，确认名下资金状态的路径更符合习惯。' }
]

const abIssues = [
  { roleId: 2, roleName: '学生用户陈同学', severity: '二级问题', changetype: '改版新引入', location: '我的账户页底部', description: '理财推荐横幅约占首屏四分之一，总资产和账户列表被挤到首屏下沿，查账时要先滑过广告。', recommendation: '推荐改为可关闭，或放到全部账户列表之后，首屏只保留总资产和常用入口。', reason: '陈同学打开页面是为了看余额和转账。横幅不会让任务失败，但每次都要多滑一屏，常用操作变慢。' },
  { roleId: 106, roleName: '长辈用户王阿姨', severity: '二级问题', changetype: '改版新引入', location: '总资产右侧眼睛图标', description: '余额改为掩码后，只有一个眼睛图标，没有「显示余额」文字，图标当前状态也不容易区分。', recommendation: '在图标旁增加「显示余额 / 隐藏余额」文字，并让打开和关闭的样式明显不同。', reason: '王阿姨不熟悉图标含义时，会以为余额丢失或页面出错，需要别人协助才敢点击，查账过程受挫。' },
  { roleId: 6, roleName: '代发用户小李', severity: '二级问题', changetype: '改版后退步', location: '首屏信息区', description: '昨日收益和理财横幅排在工资入账信息之前，小李不能先看到代发是否到账。', recommendation: '有代发记录时，把最近入账放在总资产下方，营销内容不要挡在入账信息前面。', reason: '小李打开账户页主要是确认工资。找不到到账信息时任务仍能靠明细完成，但要多走一步，效率下降。' },
  { roleId: 5, roleName: '县域用户老赵', severity: '二级问题', changetype: '改版新引入', location: '昨日收益数字', description: '昨日收益没有说明统计的是存款利息、理财浮动还是全部资金，数字含义无法从画面确认。', recommendation: '在数字旁用一句话写明统计范围，并提供进入明细的文字入口。', reason: '看不懂数字时，老赵不敢确认自己的钱是否变动，会反复进出页面，产生不确定感。' },
  { roleId: 3, roleName: '宝妈孙女士', severity: '三级问题', changetype: '改版后仍存在', location: '账户卡片与快捷按钮', description: '单手握持时，卡片主体和转账按钮距离近，滑动列表时容易碰到转账。', recommendation: '加大快捷按钮与卡片内容的间距，转账继续保留进入前的确认。', reason: '误触会让孙女士紧张，但还没有直接造成转出失败，主要影响单手使用时的安心感。' },
  { roleId: 12, roleName: '私银用户张总', severity: '三级问题', changetype: '改版后仍存在', location: '账户列表', description: '修改后仍然不能隐藏某一张卡，家庭成员一起看手机时，全部账户都会出现在列表中。', recommendation: '增加单卡隐藏，隐藏后默认不出现在首屏列表。', reason: '张总在意隐私掌控。不能隐藏卡片不会导致查询失败，但会降低他在他人面前使用手机银行的意愿。' }
]

const abRoleCopy = {
  2: ['修改后查余额和找转账都更快，掩码也让公共场合更安心。理财横幅占掉一块首屏，陈同学仍能完成任务，但每次都要先滑过推荐。', '作为陈同学，改完之后找转账更容易了，卡号不完整露出来我也放心些。就是下面那块理财广告有点挡，我只是想看余额，不想每次都先划走广告。'],
  106: ['总资产对王阿姨有帮助，但余额变成星号后，她不知道眼睛图标可以点。横幅的颜色也比余额更抢眼，她会先被广告吸引，再回头找自己的钱。', '我看到星号还以为余额没加载出来。那个小眼睛我不认识，也不敢乱点。上面的字如果再大一点，广告不要挡着钱，我就敢自己看。'],
  3: ['孙女士认可首屏就能转账，单手来回找菜单的情况变少。卡片和转账按钮仍挨得近，横幅也让她要多滑一下才能看全账户。', '一只手看账户时，我怕滑着滑着点到转账。总资产我能看懂，下面的推荐可以放到后面，我先把每张卡看完就好。'],
  6: ['快捷入口对确认明细有帮助，但首屏先出现收益和理财，小李最关心的工资到账没有单独露出，还要再进明细。', '我主要是看工资到了没有。现在一进来先看到收益和广告，我还得再找明细。转账按钮放出来这点是好的，广告不要挡在前面。'],
  12: ['掩码和总资产符合张总对隐私和全局资金的要求。列表仍展示全部卡片，推荐也没有按他的资产情况区分，掌控感只完成了一半。', '余额和卡号不要默认露出来，这点改对了。我还希望某张卡可以自己隐藏。推荐如果和我无关，就不要占看账户的位置。'],
  5: ['常用功能外露后，老赵少走了一层菜单。昨日收益没有解释，他不确定这是不是自己的钱发生了变化，需要别人帮忙看。', '转账和明细能直接看到，这个我喜欢。上面那个收益数字我看不懂，不知道是利息还是别的钱。看不懂我就不敢确认，还得再点进去。']
}

function buildAbReport({ title, roleIds, before, after, scene = '', id, createTime, creator }) {
  const roles = roleIds.map((id) => qcRoles.find((x) => x.id === id)).filter(Boolean)
  const knownIssues = abIssues.filter((x) => roles.some((r) => r.id === x.roleId))
  const issues = knownIssues.length ? knownIssues : abIssues.slice(0, Math.min(3, Math.max(roles.length, 1))).map((x, i) => ({
    ...x, roleId: roles[i]?.id, roleName: roles[i]?.name || x.roleName
  }))
  const roleViews = Object.fromEntries(roles.map((role) => {
    const preset = abRoleCopy[role.id]
    const mine = issues.filter((x) => x.roleId === role.id)
    return [role.id, {
      score: averageScore(abDims),
      summary: preset?.[0] || `从${role.name}的角度对照两版设计，信息掩码和首屏快捷入口是有效改进，首屏推荐和缺少说明的地方会让一部分用户更难完成查账。${role.desc}`,
      perspective: preset?.[1] || `${role.desc}我会保留修改后里更安全、更好找的部分，同时要求拿掉挡住主任务的推荐。`,
      dimensions: abDims,
      issues: mine.length ? mine : issues
    }]
  }))
  const names = roles.map((x) => x.name).join('、')
  const sceneLine = scene ? `业务场景说明：${scene}。` : '业务场景为个人手机银行「我的账户」页改版。'
  return {
    id: id || `QCAB${Date.now()}`, type: 'ab', title, createTime: createTime || nowText(), creator,
    materials: [
      { ...before, version: '修改前' },
      { ...after, version: '修改后' }
    ],
    roleIds: roles.map((x) => x.id), scene,
    verdict: '建议局部采纳',
    verdictreason: '掩码、总资产和首屏快捷入口值得保留。理财横幅和缺少文字说明的余额开关，会让一部分用户更难完成查账。建议保留安全和效率上的改动，把推荐移出首屏或做成可关闭。',
    summary: [
      `本次对比个人手机银行「我的账户」页的修改前、修改后两张设计图，参与角色包括${names}。`,
      '修改后在信息安全和常用入口上有提升，总资产也更容易看懂。首屏新增的理财推荐使信息认知、视觉设计和运营服务下降，余额眼睛图标对部分用户不够明白。综合判断为建议局部采纳修改后方案。'
    ],
    scenariosummary: `${sceneLine}两张图对应同一任务：查看名下账户，并继续转账或查看明细。修改前是单卡列表，余额和完整卡号直接展示，转账与明细藏在卡片菜单中。修改后增加总资产和昨日收益，余额与卡号改为掩码，常用功能提到首屏，并在底部增加理财推荐横幅。`,
    differences: abDiffs,
    improvements: abImprovements,
    dimensions: abDims,
    issues,
    roleViews
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

// 新建 AB 报告：按步骤二提炼出的目标组织对比，不再套用「我的账户」示例。
function buildSceneAbReport({ title, roleIds, before, after, materials, scene = '', business, id, createTime, creator }) {
  const roles = roleIds.map((rid) => qcRoles.find((x) => x.id === rid)).filter(Boolean)
  const shots = materials?.length
    ? materials
    : [
        { ...(before || { kind: 'mobile-green' }), version: '修改前' },
        { ...(after || { kind: 'mobile-fund' }), version: '修改后' }
      ]
  const seed = `${business.businessgoal}|${business.keytasks}|${shots.map((m) => m.name || m.version || '').join(',')}`
  const task = business.keytasks || '画面上的主要任务'
  const dims = dimensions.map((name) => {
    if (name === '系统性能') {
      return { name, change: '无法判断', beforescore: null, afterscore: null, score: null, text: '两版都是静态设计图，无法评估加载速度、滑动和点击后的真实反馈。系统性能需待后续支持视频或真机操作后再做对比。' }
    }
    const n = hashText(seed + name) % 10
    const change = n < 4 ? '提升' : n < 7 ? '持平' : '下降'
    const scoreMap = { 提升: [3, 4], 持平: [3, 3], 下降: [4, 3] }
    const [beforescore, afterscore] = scoreMap[change]
    const pain = business.painpoints ? `修改前较突出的感受是：${business.painpoints}。` : ''
    const text = change === '提升'
      ? `对照关键任务「${task}」，修改后在${name}上比修改前更容易完成。${pain}`
      : change === '下降'
        ? `对照关键任务「${task}」，修改后在${name}上不如修改前直接，用户要多确认一次才知道自己有没有做对。`
        : `对照关键任务「${task}」，修改前后在${name}上没有看得出的差别。`
    return { name, change, beforescore, afterscore, score: afterscore, text }
  })
  const down = dims.filter((d) => d.change === '下降')
  const up = dims.filter((d) => d.change === '提升')
  const issues = down.map((d, i) => {
    const role = roles[i % Math.max(roles.length, 1)]
    return {
      roleId: role?.id, roleName: role?.name || '综合', severity: '二级问题', changetype: '改版后退步', location: d.name,
      description: `修改后在${d.name}上不如修改前，关键任务「${task}」更难一次完成。`,
      recommendation: `把与「${task}」直接相关的信息和主按钮留在修改后的主路径上，不要新增会挡住任务的内容。`,
      reason: business.painpoints || '用户是来完成当前任务的。这一步变难时，任务不一定失败，但会多一次犹豫。'
    }
  })
  if (business.painpoints) {
    const role = roles[issues.length % Math.max(roles.length, 1)]
    issues.push({
      roleId: role?.id, roleName: role?.name || '综合', severity: '三级问题', changetype: '改版后仍存在', location: '已知痛点',
      description: business.painpoints,
      recommendation: business.successcriteria ? `用成功标准核对修改后是否还要用户自己猜：${business.successcriteria}` : '对照修改后画面，看这个痛点是否还在。',
      reason: '这是提炼场景时记下的痛点。修改后如果仍然如此，用户会重复遇到原来的阻碍。'
    })
  }
  const improvements = up.slice(0, 3).map((d) => ({
    location: d.name,
    description: `修改后在${d.name}上更接近本次目标：${business.businessgoal}`,
    uservalue: business.successcriteria || '用户更快完成同一任务，并更容易确认结果。'
  }))
  const differences = [
    { location: '关键任务', before: `修改前需要完成：${task}`, after: `修改后仍对照同一任务：${task}`, usereffect: '两版按同一任务比较，画面里看不到的步骤不算进结果。' },
    { location: '用户痛点', before: business.painpoints || '修改前痛点需结合画面确认', after: '见修改后素材中同一位置是否还在', usereffect: business.businessgoal },
    { location: '成功标准', before: '作为改版前的对照基线', after: business.successcriteria || '未填写成功标准', usereffect: '用来判断修改后是保留、局部采纳，还是退回修改前。' }
  ]
  let verdict = '建议局部采纳'
  if (!down.length && up.length >= 3) verdict = '建议采纳修改后'
  else if (down.length >= 3 && up.length <= 1) verdict = '建议保留修改前'
  const verdictreason = `${verdict}。本次目标是：${business.businessgoal}。修改后有 ${up.length} 个维度提升、${down.length} 个维度下降。${business.successcriteria ? `成功标准：${business.successcriteria}。` : ''}`
  const names = roles.map((x) => x.name).join('、') || '未选择角色'
  const roleViews = Object.fromEntries(roles.map((role) => {
    const mine = issues.filter((x) => x.roleId === role.id)
    return [role.id, {
      score: averageScore(dims),
      summary: `${role.name}对照两版完成「${task}」。${role.desc}`,
      perspective: `作为${role.name}，我关心的是能不能把「${business.businessgoal}」这件事做完。${business.painpoints ? `让我犹豫的是：${business.painpoints}` : ''}`,
      dimensions: dims,
      issues: mine.length ? mine : issues.slice(0, 1)
    }]
  }))
  const constraints = business.constraints ? `约束：${business.constraints}。` : ''
  return {
    id: id || `QCAB${Date.now()}`, type: 'ab', title, createTime: createTime || nowText(), creator,
    materials: shots, roleIds: roles.map((x) => x.id), scene, business,
    verdict, verdictreason,
    summary: [
      `本次对比修改前、修改后设计图，参与角色包括${names}。`,
      `评测目标：${business.businessgoal}。关键任务：${task}。综合判断为${verdict}。`
    ],
    scenariosummary: `评测目标：${business.businessgoal}。关键任务：${task}。${business.painpoints ? `修改前痛点：${business.painpoints}。` : ''}${constraints}`,
    differences, improvements, dimensions: dims, issues, roleViews
  }
}

export function generateAbReport({ title, roleIds, before, after, scene = '', materials, business }) {
  if (business?.businessgoal) return buildSceneAbReport({ title, roleIds, before, after, materials, scene, business })
  return buildAbReport({
    title, roleIds, scene,
    before: before || { kind: 'mobile-green' },
    after: after || { kind: 'mobile-fund' }
  })
}

function abShowcase() {
  return buildAbReport({
    id: 'QCSHOW20261016',
    title: '体验质检智能体报告20261016',
    createTime: '2026-10-16 09:30:00',
    creator: '周可欣',
    roleIds: [2, 106, 3, 6, 12, 5],
    scene: '个人手机银行「我的账户」页改版',
    before: { kind: 'mobile-green' },
    after: { kind: 'mobile-fund' }
  })
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

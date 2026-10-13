// 用户声音 · 分析工具 / 旅程结构 / 模型提示词 演示数据与处理逻辑
// 分析工具在浏览器内用规则模拟大模型处理；正式环境按「模型提示词管理」中的提示词调用大模型
import { reactive } from 'vue'
import { classifyVoice } from '@/views/voice/classifyVoice'
import { voiceProducts } from './voice'

// ===== 旅程结构管理 =====
export const journeyStructures = reactive([
  { id: 5, product: '工银问卷', scene: '问卷编辑发布', name: '工银问卷编辑发布', creator: '孙若曦', actions: ['建立新问卷', '编辑题目与选项', '问卷发布设置', '获取问卷填答地址'], time: '2026-06-16', status: '启用' },
  { id: 9, product: '个人手机银行基础业务', scene: '信用卡', name: '', creator: '', actions: ['了解信用卡特征及办卡条件', '申请办卡', '用卡消费', '还款', '查询及使用卡片权益', '卡片管理'], time: '2025-05-23', status: '启用' },
  { id: 12, product: '个人手机银行基础业务', scene: '基金', name: '', creator: '', actions: ['了解基金产品', '挑选基金产品', '风险测评', '购买基金产品', '基金持仓管理', '赎回基金产品', '基金定投'], time: '2025-05-23', status: '启用' },
  { id: 11, product: '个人手机银行基础业务', scene: '个人养老金', name: '', creator: '', actions: ['了解养老金', '个人养老金开户', '养老金缴存', '养老金融产品购买', '养老金融产品持仓管理', '养老金融产品赎回', '个人养老金提取'], time: '2025-05-23', status: '启用' },
  { id: 10, product: '个人手机银行基础业务', scene: '转账汇款', name: '', creator: '', actions: ['明确转账目的', '收款人管理', '确认资金条件', '填选转账信息', '转账限额调整', '转账认证', '确认转账结果', '通知收款方', '查询或打印转账明细'], time: '2025-05-23', status: '启用' },
  { id: 13, product: '个人手机银行基础业务', scene: '理财', name: '', creator: '', actions: ['了解理财产品', '挑选理财产品', '风险测评', '购买理财产品', '理财持仓管理', '赎回理财产品', '理财定投'], time: '2025-05-23', status: '启用' },
  { id: 7, product: '个人手机银行基础业务', scene: '贷款', name: '线上个人住房贷款', creator: '周可欣', actions: ['客户了解贷款', '客户贷前准备', '客户填写基本信息', '客户上传影像资料', '客户经理审核客户贷款申请', '银行审核客户贷款申请', '客户签订合同', '银行放款', '客户每月按时还款', '客户提前还款'], time: '2026-09-23', status: '启用' },
  { id: 2, product: '工银问卷', scene: '问卷数据统计', name: '工银问卷数据分析旅程', creator: '孙若曦', actions: ['进入问卷统计页面', '选择统计方式', '数据分析结果查看'], time: '2026-07-22', status: '启用' },
  { id: 14, product: '个人手机银行基础业务', scene: '贷款', name: '', creator: '', actions: ['客户了解贷款', '客户贷前准备', '客户填写及上传资料', '银行及第三方评估', '银行审批贷款申请', '签订贷款合同', '提款及放款', '客户查询贷款合同', '客户每月按时还款', '客户提前还款', '续贷'], time: '2025-07-14', status: '启用' },
  { id: 1, product: '个人手机银行基础业务', scene: '转账汇款', name: '测试', creator: '孙若曦', actions: ['行为1', '行为2', '行为3', '行为4'], time: '2025-07-02', status: '冻结' },
  { id: 3, product: '企业手机银行', scene: '银企对账', name: '', creator: '', actions: ['查看对账单', '核对余额', '确认对账结果', '下载对账回单'], time: '2025-06-10', status: '启用' },
  { id: 4, product: '企业手机银行', scene: '转账汇款', name: '', creator: '', actions: ['录入付款信息', '提交复核', '授权审批', '查询付款结果'], time: '2025-06-10', status: '启用' }
])

// ===== 模型提示词管理 =====
const P = (id, name, time, updater, limit, content) => ({ id, name, time, updater, limit, content })
export const voicePrompts = reactive([
  P(1, '有效性判断', '2026-09-21', '冯浩然', 2000, `##角色：你是银行用户反馈问题分析的专家，尤其擅长判断用户反馈的内容是否有效。
##任务：我正在处理工行手机银行的用户反馈问题。这些问题中会存在一些和工行手机银行内功能栏目、服务等无关的内容，甚至是表述不清楚、单纯发泄情绪的内容。现在需要你对附件中的用户反馈问题进行甄别筛选，对符合以下条件的用户反馈内容标记为"无效"，其余的则为"有效"。
##判断标准：
1.如与工商银行、工行手机银行下各类功能栏目、服务、活动、信息等均无关，则为无效；
2.如单纯发泄表达情绪，则为无效；
3.如仅使用数字、符号等，导致无法理解具体含义，则为无效；
4.如果字数少于10个字，导致表达的意思极为有限，则为无效；
5.如果文字内容无法表达任何语义，则为无效。
##补充要求：
1.需要对每一条用户反馈问题均进行判断。
2.需保障判断的准确性。`),
  P(2, '产品分类', '2026-06-22', '孙若曦', 3000, '##角色：你是银行产品体系专家。\n##任务：根据「产品领域管理」中维护的产品清单，判断每条用户声音所属的产品，仅可从清单中选择一个最相关的产品；无法判断时输出「其他」。'),
  P(3, '功能栏目分类', '2026-09-21', '冯浩然', 2000, '##任务：在已确定所属产品的前提下，从该产品的功能栏目清单中选择与用户声音最相关的一个功能栏目。若声音涉及多个栏目，选择用户主要诉求所在的栏目。'),
  P(4, '旅程行为分类', '2026-09-21', '冯浩然', 2000, '##任务：根据「旅程结构管理」中该产品、该功能栏目对应的旅程行为列表，判断用户声音发生在哪一个旅程行为中；若无法对应任何行为，输出空值。'),
  P(5, 'ETS维度分类', '2026-07-28', '系统管理员', 3000, '##任务：基于ETS主维度，将用户声音归入以下维度之一：功能流程、运营服务、信息认知、安全感知、系统性能、交互设计、视觉设计、智能化。\n##要求：仅输出一个主维度，并给出不超过20字的判断依据。'),
  P(6, '情绪指数', '2026-09-21', '冯浩然', 2000, '##任务：对用户声音所传达的情绪强度进行打分，分数范围为-10～10，负数代表负面情绪，正数代表正面情绪，0为中性。\n##参考：投诉、威胁销户等为-9～-10；明确不满为-5～-8；轻微抱怨为-1～-4。'),
  P(7, '典型问题提炼', '2025-08-11', '吴雨桐', 4000, '##任务：对同一产品、同一功能栏目下的用户声音进行语义聚类，提炼出具有代表性的典型问题。每个典型问题用一句话描述（不超过40字），并统计覆盖的声音条数，按覆盖数从高到低排列。'),
  P(8, '优化建议生成', '2026-06-23', '孙若曦', 3000, '##任务：针对每个典型问题，结合产品现有功能，提出1-3条可落地的优化点。优化点需具体到页面或交互，避免空泛表述。'),
  P(9, '典型问题提炼2.0_S1', '2026-05-26', '孙若曦', 3000, '##第一阶段：对输入的用户声音逐条提取「问题对象 + 问题现象」，输出结构化短句，为后续聚类做准备。'),
  P(10, '典型问题提炼2.0_S2', '2026-05-26', '孙若曦', 3000, '##第二阶段：对第一阶段输出的短句进行合并归纳，合并语义相同的问题，生成典型问题并给出覆盖声音数与代表性声音举例（最多3条）。'),
  P(11, '典型问题提炼2.0_S3', '2026-05-26', '孙若曦', 3000, '##第三阶段：将典型问题映射到旅程行为上，生成「旅程阶段 × 典型问题」矩阵，供功能监测页面展示。'),
  P(12, '文本拆分', '2026-04-18', '冯浩然', 2000, '##任务：根据文本所表达的语义内容进行拆分，一段文本中包含多个诉求时拆分为多条，并使用规范化语言转述，过滤无效信息。'),
  P(13, '压力指数解读', '2026-04-18', '冯浩然', 2000, '##任务：根据本期用户声音压力指数（UVSI）及其变化，生成不超过100字的解读，说明压力变化的主要原因与需关注的产品。'),
  P(14, '实时典型问题', '2026-08-02', '孙若曦', 3000, '##任务：对最近3小时内的有效用户声音进行快速聚类，输出覆盖声音数≥1的实时典型问题，用于实时监测预警。'),
  P(15, '集中维度判断', '2026-08-02', '孙若曦', 2000, '##任务：统计本期用户声音在各ETS维度的分布，输出声音最集中的维度及其占比。')
])
export const promptOf = (name) => voicePrompts.find((p) => p.name === name)

// ===== 分析工具 =====
export const toolDefs = [
  { key: 'valid', name: '有效性判断', desc: '对用户声音逐条进行有效性标记，辅助用户去除噪声。', icon: 'CircleCheck', theme: 'green', prompt: '有效性判断' },
  { key: 'problem1', name: '典型问题提炼（1.0）', desc: '对上传的用户声音根据语义内容进行概括提炼，生成新的典型问题。', icon: 'MagicStick', theme: 'teal', prompt: '典型问题提炼' },
  { key: 'ets', name: 'ETS主维度分类', desc: '基于ETS主维度，将用户声音分为"功能流程、信息认知、安全感知、系统性能、交互设计、视觉设计"等维度。', icon: 'Histogram', theme: 'blue', prompt: 'ETS维度分类' },
  { key: 'emotion', name: '情绪指数', desc: '基于用户声音传达的情绪强度进行打分，分数范围为-10～10。', icon: 'DataLine', theme: 'purple', prompt: '情绪指数' },
  { key: 'product', name: '产品分类', desc: '使用大模型对用户声音进行产品分类。', icon: 'Box', theme: 'red', prompt: '产品分类' },
  { key: 'column', name: '功能分类', desc: '使用大模型对用户声音进行功能分类。', icon: 'Files', theme: 'green', prompt: '功能栏目分类' },
  { key: 'journey', name: '旅程行为分类', desc: '基于灵犀旅程，将用户声音自动分至相应的旅程行为下。', icon: 'Guide', theme: 'orange', prompt: '旅程行为分类' },
  { key: 'problem2', name: '典型问题提炼', desc: '对上传的用户声音根据语义内容进行概括提炼，生成新的典型问题。', icon: 'MagicStick', theme: 'teal', prompt: '典型问题提炼2.0_S2' },
  { key: 'split', name: '文本拆分', desc: '根据上传文本所表达的语义内容进行拆分，并使用规范化语言转述、过滤无效信息。', icon: 'Files', theme: 'green', prompt: '文本拆分' }
]

// 敏感信息脱敏：手机号、身份证号、银行卡号
export const desensitize = (t = '') =>
  t.replace(/\b1[3-9]\d{9}\b/g, (m) => m.slice(0, 3) + '****' + m.slice(-4))
    .replace(/\b\d{17}[\dXx]\b/g, (m) => m.slice(0, 4) + '**********' + m.slice(-4))
    .replace(/\b\d{16,19}\b/g, (m) => m.slice(0, 4) + '*'.repeat(m.length - 8) + m.slice(-4))

const isValid = (t) => {
  const s = t.replace(/[\s\d\p{P}\p{S}]/gu, '')
  if (s.length < 10) return [false, '有效字数少于10个字']
  if (/^(垃圾|差评|气死|烦死|无语|呵呵|哈哈)+/.test(s) && s.length < 16) return [false, '单纯发泄情绪']
  if (!/[银行卡账户转登录密码付款贷款理财基金信用存取钱额度短信验证页面功能客服网点扣费利息app]/i.test(t)) return [false, '与银行业务无关']
  return [true, '']
}
const emotionScore = (t) => {
  const { emotion } = classifyVoice(t)
  return { 正面: 6, 中性: 0, 轻度负面: -3, 中度负面: -7, 高度负面: -9 }[emotion]
}
const productRules = [
  [/信用卡|账单|分期|还款日/, '融e行-信用卡'], [/基金|理财|贵金属|收益/, '融e行-投资理财'], [/数字人民币|钱包|数币/, '数字人民币'],
  [/企业|对公|U盾|回单|对账|代发/, '企业手机银行'], [/经营快贷|普惠|小微/, '工行普惠'], [/e支付|快捷支付|无卡支付/, '工银e支付'], [/云网点|视频客服|预约/, '云工行']
]
const productOf = (t) => productRules.find(([re]) => re.test(t))?.[1] || '融e行基础业务'
const columnOf = (t, product) => {
  const cols = voiceProducts.find((p) => p.name === product)?.columns || []
  return cols.find((c) => t.includes(c.slice(0, 2))) || cols[0] || '其他'
}
// 旅程行为匹配：场景命中 +3；完整行为名命中 +4，行为首尾两字命中 +2；取最高分
const actionKeys = (a) => {
  const core = a.replace(/^(客户|银行|了解|查询或|查询及)/, '')
  return [...new Set([core, core.slice(-2), core.slice(0, 2)])].filter((k) => k.length >= 2)
}
const journeyOf = (t) => {
  let best = { score: 0, scene: '', action: '' }
  for (const js of journeyStructures.filter((j) => j.status === '启用')) {
    const sceneHit = t.includes(js.scene) || t.includes(js.scene.slice(0, 2)) ? 3 : 0
    for (const a of js.actions) {
      const keys = actionKeys(a)
      // 完整行为名命中优先于部分关键词命中
      const hit = t.includes(keys[0]) ? 4 : keys.slice(1).some((k) => t.includes(k)) ? 2 : 0
      if (hit && sceneHit + hit > best.score) best = { score: sceneHit + hit, scene: js.scene, action: a }
    }
  }
  return best
}
// 典型问题：按 ETS 维度 + 关键名词聚类
const problemsOf = (rows) => {
  const groups = {}
  rows.forEach((r) => {
    const { dim } = classifyVoice(r.text)
    const noun = (r.text.match(/(限额|转账|登录|验证码|催收短信|额度|还款|扣款|年费|扣费|页面|客服|理财|基金|信用卡|密码|U盾|明细|余额)/) || ['其他'])[0]
    const k = `${noun}|${dim}`
    ;(groups[k] ||= { noun, dim, rows: [] }).rows.push(r)
  })
  return Object.values(groups)
    .sort((a, b) => b.rows.length - a.rows.length)
    .map((g, i) => ({
      编号: i + 1,
      典型问题: `${g.noun === '其他' ? '相关功能' : g.noun}存在${{ 功能流程: '流程不畅或功能受限', 运营服务: '服务或收费问题', 信息认知: '信息展示不清晰', 安全感知: '安全验证体验问题', 系统性能: '加载缓慢或报错', 交互设计: '交互操作不便', 视觉设计: '视觉展示问题', 智能化: '智能服务不足' }[g.dim]}`,
      ETS维度: g.dim,
      覆盖声音数: g.rows.length,
      声音举例: g.rows.slice(0, 3).map((r, j) => `${j + 1}.${r.text.slice(0, 40)}`).join(' ')
    }))
}

// 逐条处理：输入 [{ id, text }]，输出结果行
export function runTool(key, rows) {
  if (key === 'problem1' || key === 'problem2') return problemsOf(rows.filter((r) => isValid(r.text)[0] && classifyVoice(r.text).emotion !== '正面'))
  if (key === 'split')
    return rows.flatMap((r) =>
      r.text.split(/[。！？!?；;\n]+/).map((s) => s.trim()).filter((s) => isValid(s)[0]).map((s, i) => ({ 文本编号: `${r.id}-${i + 1}`, 原文编号: r.id, 拆分内容: s }))
    )
  return rows.map((r) => {
    const base = { 文本编号: r.id, 文本内容: r.text }
    if (key === 'valid') {
      const [ok, reason] = isValid(r.text)
      return { ...base, 有效性: ok ? '有效' : '无效', 判断依据: reason }
    }
    if (key === 'ets') return { ...base, ETS维度: classifyVoice(r.text).dim }
    if (key === 'emotion') return { ...base, 情绪指数: emotionScore(r.text) }
    if (key === 'product') return { ...base, 产品: productOf(r.text) }
    if (key === 'column') {
      const product = r.product || productOf(r.text)
      return { ...base, 产品: product, 功能栏目: columnOf(r.text, product) }
    }
    if (key === 'journey') {
      const j = journeyOf(r.text)
      return { ...base, 功能栏目或旅程场景: j.scene, 旅程行为: j.action }
    }
    return base
  })
}

// 示例原始数据（用户未上传文件时使用「示例数据」演示）
export const sampleRows = [
  '转账限额太低了，一次只能转五万，线上也没法调整，太不方便了',
  '垃圾',
  '登录的时候人脸识别一直失败，换了好几个光线都不行',
  '信用卡已经还款了还一直发短信催，能不能别发了',
  '基金页面加载很慢，收益曲线半天出不来',
  '12345',
  '手机号13812345678收不到验证码，转账卡住了',
  '理财产品的风险说明看不懂，希望写得通俗一点。另外赎回到账时间也没写清楚',
  '今天天气真好',
  '企业网银U盾驱动装不上，对账做不了',
  '这个新版本挺好用的，转账比以前快多了，点赞',
  '莫名其妙被扣了年费，也没有提前通知，我要投诉'
].map((text, i) => ({ id: `T${String(i + 1).padStart(4, '0')}`, text }))

export const toolTasks = reactive([
  { tool: 'valid', name: '20250915_085531_有效分析结果.xlsx', status: '处理完成', time: '2025-09-15 08:53:38', rows: [], source: [] }
])

// ===== 看板图表数据管理 =====
export const boardCharts = reactive([
  { id: 1, column: '用户声音总览', name: '主要竞品行用户声音数量比较', updater: '', time: '', exportAll: true },
  { id: 2, column: '声音看板', name: '声音总览用户声音情绪指数等级', updater: '', time: '' },
  { id: 3, column: '声音看板', name: '声音总览用户声音压力指数', updater: '', time: '' },
  { id: 4, column: '声音看板', name: '声音总览重要典型问题', updater: '', time: '' }
])

// ===== 用户声音上传记录 =====
export const voiceUploads = reactive([
  { id: 2, time: '2026-04-29 16:06:42', uploader: '冯浩然', count: 1, status: '处理完成' },
  { id: 1, time: '2026-03-30 09:27:21', uploader: '孙若曦', count: 20, status: '处理完成' }
])

// ===== 产品领域管理 =====
export const productDomains = reactive([
  { id: 1, name: '信用卡', products: ['个人手机银行基础业务', '个人信用卡'] },
  { id: 2, name: '网络金融', products: ['企业手机基础业务', '个人网上银行', '个人手机银行基础业务', '企业网银基础业务', '企业微信'] },
  {
    id: 3,
    name: '全领域',
    products: [
      '工银网点通', '个人养老金', '智能柜员机', '企业手机基础业务', '云网点', '身份认证与集中授权', '数字人民币个人钱包', '柜面服务', '个人网上银行', '个人存款',
      '个人客户管理', '工银e企付', '个人消费贷款', '智能外呼', 'API开放平台', '个人基金', '用户体验管理平台', '财富社区', '工银e支付', '工银e生活',
      '全球信贷与代理投资管理系统', '客户经理工作室', 'ATM', '个人住房贷款', '个人工银信使', '电子签约系统', '银企服务', '融e慧', '工银e办公', '柜面通',
      '个人手机银行基础业务', '个人借记卡', '工行普惠（渠道）', '个人信用卡', '个人经营快贷', '工银e缴费', '融e借', '个人保险', '实物贵金属', '转账汇款',
      '私人银行', '境内资产托管', '企业网银基础业务', '个人理财', '营销通（对公）', '营销通（个人）', '商户之家', '工银兴农通APP', '个人网贷通', '法人经营快贷',
      '业务集中平台', '资产管理投资与风控系统', '聚合支付收单', '积存金', '法人网贷通', '反洗钱客户分类管理系统', '金融市场交易管理平台', '营销通（机构）', 'ETC', '信用卡分期管理'
    ]
  }
])

// ===== 实时监测收件人 =====
export const alertReceivers = reactive([
  { id: '001700106', name: '孙若曦', org: '业务研发中心用户体验部' },
  { id: '001700107', name: '何晨阳', org: '业务研发中心用户体验部' },
  { id: '001700102', name: '周可欣', org: '业务研发中心用户体验部' },
  { id: '001700001', name: '系统管理员', org: '业务研发中心用户体验部' },
  { id: '001700109', name: '冯浩然', org: '业务研发中心用户体验部' }
])

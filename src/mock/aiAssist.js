// AI 辅助（演示版用规则模拟；正式环境由行内大模型平台按「智能体管理」中的提示词完成）
// 原则：AI 只给出建议并注明依据，由人确认后才写入流程；日志中记为「AI 建议 · 人工确认」
import { productList } from './system'
import { suggestions, channelOfProduct, columnOptions, impacts, handlersOf, workdaysBetween } from './suggest'
import { classifyVoice } from '@/views/voice/classifyVoice'
import { textSimilarity } from './problemFeatures'

// ===== 隐私信息识别与脱敏：手机号、身份证号、银行卡号 =====
const PII = [
  { type: '手机号', re: /(?<!\d)(1[3-9]\d)(\d{4})(\d{4})(?!\d)/g, mask: (m, a, b, c) => `${a}****${c}` },
  { type: '证件号', re: /(?<![\dA-Za-z])(\d{6})(\d{8})(\d{3}[\dXx])(?!\d)/g, mask: (m, a, b, c) => `${a}********${c}` },
  { type: '银行卡号', re: /(?<![\dA-Za-z])(\d{12,15})(\d{4})(?!\d)/g, mask: (m, a, b) => `${'*'.repeat(a.length)}${b}` }
]
export function maskPII(text = '') {
  const hits = []
  let out = String(text)
  for (const p of PII) {
    out = out.replace(p.re, (...args) => {
      hits.push(p.type)
      return p.mask(...args)
    })
  }
  return { text: out, hits }
}

// ===== 产品、功能栏目识别 =====
const PRODUCT_WORDS = [
  [/企业手机银行|企业网银|企业网上银行|对公/, '企业网银基础业务'],
  [/信用卡|账单|分期|还款/, '个人信用卡'],
  [/数字人民币|数币|钱包/, '数字人民币'],
  [/e办公|工银e办公/, '工银e办公'],
  [/e生活|工银e生活/, '工银e生活'],
  [/养老金/, '个人养老金'],
  [/贵金属|黄金/, '实物贵金属'],
  [/房贷|住房贷款/, '个人住房贷款'],
  [/智能柜员机|自助设备|ATM/i, '智能柜员机'],
  [/柜面通/, '柜面通'],
  [/柜面|柜员|网点柜台/, '柜面服务'],
  [/排队|叫号/, '网点排队叫号'],
  [/远程银行|视频客服/, '远程银行'],
  [/问卷/, '工银问卷'],
  [/手机银行|app|App|APP|转账|登录/, '个人手机银行基础业务']
]
const COLUMN_WORDS = [
  [/转账|汇款|限额|额度/, '转账汇款'], [/登录|验证码|人脸|密码/, '登录认证'], [/明细|查询|对账/, '查询服务'], [/理财|基金/, '理财'],
  [/贷款|借款/, '贷款申请'], [/信用卡|账单|分期/, '信用卡'], [/存款|定期|利率/, '存款'], [/缴费/, '生活缴费'], [/客服|人工/, '客户服务'],
  [/消息|通知|推送|短信/, '消息通知'], [/首页/, '首页'], [/设置/, '设置'], [/审批/, '审批流程'], [/养老金/, '养老金'], [/账户/, '账户管理']
]
const inUse = (name) => productList.some((p) => p.name === name && p.status !== '冻结' && p.state !== '已废弃')
function detectProduct(text) {
  const hit = PRODUCT_WORDS.find(([re, name]) => re.test(text) && inUse(name))
  return hit ? { value: hit[1], confidence: 0.92 } : { value: '个人手机银行基础业务', confidence: 0.45 }
}
const detectColumn = (text) => {
  const hit = COLUMN_WORDS.find(([re]) => re.test(text))
  return hit && columnOptions.includes(hit[1]) ? { value: hit[1], confidence: 0.86 } : { value: '', confidence: 0 }
}
function detectImpact(text) {
  if (/无法|失败|不能|资金|损失|扣款|冻结/.test(text)) return { value: impacts[0], confidence: 0.78 }
  if (/麻烦|繁琐|找不到|只能|慢|卡顿|反复|多次/.test(text)) return { value: impacts[1], confidence: 0.8 }
  return { value: impacts[2], confidence: 0.7 }
}
function detectSource(text, branch) {
  if (/应用商店|评论|评分/.test(text)) return '客户：应用商店评论'
  if (/客户.*(来电|反映|投诉|反馈)|来电/.test(text)) return '客户：95588工单'
  if (/走查/.test(text)) return '员工：日常走查'
  return branch ? '员工：分行优化建议' : '员工：日常走查'
}

// ===== 整理【现象】【建议】=====
const SUGGEST_RULES = [
  [/只能(去|到)?网点|到网点办理/, '支持在手机银行等线上渠道直接办理，并做好身份核验，减少客户往返网点。'],
  [/找不到|入口(太)?深|层级/, '在首页或搜索中提供明显入口，缩短操作路径。'],
  [/慢|卡顿|加载|等待/, '优化查询与加载性能，并在等待时展示进度提示。'],
  [/看不懂|术语|提示不清|不清楚/, '调整为通俗易懂的表述，并补充示例说明。'],
  [/验证码|短信/, '排查短信通道时效，在页面展示倒计时与重发说明。'],
  [/重复录入|多次输入|反复填写/, '支持读取已有信息自动带出，减少重复录入。'],
  [/报错|错误码|失败/, '将错误码转换为通俗提示，并给出解决方式或客服入口。']
]
// 现象：去掉联系方式等与问题无关的信息；建议：优先按问题类型给出规范表述，其次沿用原话中的期望
const clean = (t) =>
  t
    .replace(/\s+/g, ' ')
    .replace(/(联系电话|联系方式|电话|手机号?)[：:\s]*[\d*]{7,}[，,]?/g, '')
    .replace(/^(客户|用户)?(来电)?(反映|反馈|说|表示)[：:，,]?/, '客户反映')
    .trim()
export function draftSuggestion(raw, { branch = false } = {}) {
  const { text, hits } = maskPII(raw)
  const want = text.match(/(希望|建议|最好|能否|应该)([^。！!？?]*)/)
  const body = clean(want ? text.slice(0, want.index) : text).replace(/[，,。\s]+$/, '')
  const rule = SUGGEST_RULES.find(([re]) => re.test(text))
  const wish = want?.[2].replace(/^[，,：:\s]+/, '').trim()
  const suggestion = rule ? rule[1] : wish ? `建议${wish}。` : ''
  const product = detectProduct(text)
  const { dim } = classifyVoice(text)
  return {
    phenomenon: `${body}。`,
    suggestion,
    masked: hits,
    fields: {
      product,
      channels: { value: channelOfProduct[product.value] || ['手机APP-个人手机银行'], confidence: product.confidence },
      column: detectColumn(text),
      category: { value: dim, confidence: 0.82 },
      impact: detectImpact(text),
      source: { value: detectSource(text, branch), confidence: 0.75 }
    }
  }
}
export const draftText = (d) => `【现象】${d.phenomenon}\n【建议】${d.suggestion || '（请补充你期望的改进方式）'}`

// ===== 按语义查找相似建议：同义词归一后比对，产品与功能相同时加权 =====
const SYNONYMS = [
  [/额度/g, '限额'], [/入口|按钮|菜单/g, '入口'], [/找不到|不好找|难找/g, '找不到'], [/卡顿|很慢|缓慢|加载慢/g, '慢'],
  [/报错|错误码|出错/g, '报错'], [/客户|用户/g, '客户'], [/手机银行|app|APP/g, '手机银行'], [/看不懂|不清楚|不清晰/g, '不清楚']
]
const norm = (t) => SYNONYMS.reduce((s, [re, to]) => s.replace(re, to), String(t))
export function similarSuggestions(text, list = suggestions, { product = '', column = '', limit = 3, threshold = 0.22 } = {}) {
  const base = norm(text)
  return list
    .map((item) => {
      let score = textSimilarity(base, norm(item.desc))
      if (product && item.product === product) score += 0.08
      if (column && item.column === column) score += 0.06
      return { item, score: Math.min(score, 0.99) }
    })
    .filter((x) => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// ===== 分拣：推荐答复人（同产品、同功能栏目的答复量与平均答复用时）=====
export function recommendReplier(s) {
  const handlers = handlersOf(s.productLine)
  if (!handlers.length) return null
  const stats = handlers.map((p) => {
    const done = suggestions.filter((x) => x !== s && x.replierId === p.id && x.replyTime)
    const same = done.filter((x) => x.product === s.product || (s.column && x.column === s.column))
    const days = done.slice(0, 30).map((x) => {
      const assign = x.logs.find((l) => l.action === '指派答复人')
      return assign ? workdaysBetween(assign.time, x.replyTime) : null
    }).filter((d) => d != null)
    const busy = suggestions.filter((x) => x.currentHandlerId === p.id && x.status === '待答复').length
    return { person: p, same: same.length, total: done.length, avg: days.length ? days.reduce((a, b) => a + b, 0) / days.length : null, busy }
  })
  stats.sort((a, b) => b.same - a.same || a.busy - b.busy)
  const best = stats[0]
  const parts = [`同产品或同功能已答复 ${best.same} 条`]
  if (best.avg != null) parts.push(`平均答复用时 ${best.avg.toFixed(1)} 个工作日`)
  parts.push(`当前待答复 ${best.busy} 条`)
  return { ...best, reason: parts.join('，') }
}

// ===== 答复：参考历史相似建议的答复给出草稿 =====
export function replyDraft(s) {
  const answered = suggestions.filter((x) => x !== s && x.adoptResult && x.replyOpinion)
  const refs = similarSuggestions(s.desc, answered, { product: s.product, column: s.column, limit: 3, threshold: 0.12 })
  const pool = refs.length ? refs.map((r) => r.item) : answered.filter((x) => x.product === s.product).slice(0, 3)
  if (!pool.length) return null
  const adopt = pool.filter((x) => x.adoptResult === '采纳').length >= Math.ceil(pool.length / 2)
  const pickMost = (key) => {
    const count = {}
    for (const x of pool) if (x[key]) count[x[key]] = (count[x[key]] || 0) + 1
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  }
  return adopt
    ? {
        adoptResult: '采纳',
        solution: pickMost('solution') || '业务科技协同解决（需求项）',
        priority: pickMost('priority'),
        replyOpinion: `采纳。${s.product}「${s.column || '相关功能'}」的问题已有同类建议在推进，将合并纳入后续版本优化。`,
        basis: pool.map((x) => ({ id: x.id, seq: x.seq, text: `${x.adoptResult} · ${x.solution || x.rejectReason || ''}`, status: x.status }))
      }
    : {
        adoptResult: '不采纳',
        rejectReason: pickMost('rejectReason') || '已有替代方案或功能',
        replyOpinion: '经评估暂不采纳，原因见未采纳原因；如有新的使用场景可补充后重新提交。',
        basis: pool.map((x) => ({ id: x.id, seq: x.seq, text: `${x.adoptResult} · ${x.rejectReason || x.solution || ''}`, status: x.status }))
      }
}

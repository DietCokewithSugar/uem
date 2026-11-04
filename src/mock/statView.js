// 体验问题 · 统计视图（整体视图 / 产品维度）
// 两张截图的默认查询条件返回与截图一致的汇总数；其他条件按区间和产品做演示推算
// 体验问题（研发阶段）与优化建议（运营阶段）在这里是汇总口径，不逐条对应列表里的记录

export const PRODUCT_SHOWCASE = '个人手机银行基础业务'
export const PRODUCT_RANGE = ['2026-01-01', '2026-11-02']
export const ALL_RANGE = ['2026-10-01', '2026-10-27']

// 采纳率 / 解决率：截图为截断到两位小数（263/284 → 92.60%，不是四舍五入的 92.61%）
export const truncRate = (part, total) => (total ? (Math.floor((part / total) * 10000) / 100).toFixed(2) : '0.00')

const sum = (list) => list.reduce((n, x) => n + x.value, 0)

const productShowcase = {
  problem: {
    total: 284,
    adopted: 263,
    solved: 257,
    levels: [
      { name: '一级', value: 0 },
      { name: '二级', value: 2 },
      { name: '三级', value: 282 }
    ],
    stages: [
      { name: '需求阶段', value: 50 },
      { name: '测试阶段', value: 234 }
    ],
    versions: [
      { name: '10.1', value: 42 }, { name: '10.0', value: 38 }, { name: '9.1', value: 36 }, { name: '9.0', value: 34 },
      { name: '8.1', value: 28 }, { name: '8.0', value: 24 }, { name: '7.5', value: 22 }, { name: '7.0', value: 20 },
      { name: '6.0', value: 18 }, { name: '其他', value: 22 }
    ],
    products: [],
    rejectReasons: [
      { name: '与产品规划不一致', value: 8 },
      { name: '改造成本高、收益不足', value: 5 },
      { name: '已有替代方案或功能', value: 4 },
      { name: '不符合监管或行内制度要求', value: 2 },
      { name: '描述不清，无法评估', value: 2 }
    ],
    unsolvedReasons: [
      { name: '未纳入当前版本计划', value: 12 },
      { name: '依赖关联系统改造', value: 8 },
      { name: '方案仍在确认', value: 4 },
      { name: '研发资源未到位', value: 3 }
    ]
  },
  suggestion: {
    total: 968,
    adopted: 382,
    sources: [
      { name: '客户：app用户反馈', value: 186 },
      { name: '客户：体验活动', value: 124 },
      { name: '客户：95588工单', value: 98 },
      { name: '客户：应用商店评论', value: 72 },
      { name: '员工：分行优化建议', value: 168 },
      { name: '员工：工银服务', value: 86 },
      { name: '员工：行内调研', value: 64 },
      { name: '员工：日常走查', value: 54 },
      { name: '员工：设计还原度走查', value: 48 },
      { name: '客户：用户声音智能体', value: 36 },
      { name: '员工：灵犀旅程', value: 32 }
    ],
    products: [],
    words: [],
    rejectReasons: [
      { name: '与产品规划不一致', value: 168 },
      { name: '改造成本高、收益不足', value: 142 },
      { name: '重复建议', value: 96 },
      { name: '已有替代方案或功能', value: 88 },
      { name: '不符合监管或行内制度要求', value: 52 },
      { name: '描述不清，无法评估', value: 40 }
    ]
  }
}

const overallShowcase = {
  problem: {
    total: 141,
    adopted: 93,
    solved: 93,
    levels: [
      { name: '一级', value: 3 },
      { name: '二级', value: 0 },
      { name: '三级', value: 138 }
    ],
    stages: [
      { name: '需求阶段', value: 37 },
      { name: '测试阶段', value: 104 }
    ],
    versions: [
      { name: '9.0', value: 92 }, { name: '8.1', value: 16 }, { name: '8.0', value: 11 },
      { name: '7.0', value: 8 }, { name: '6.5', value: 7 }, { name: '其他', value: 7 }
    ],
    products: [
      { name: '个人手机银行', value: 32 }, { name: '工银e生活', value: 28 }, { name: '企业手机银行', value: 16 },
      { name: '个人网银', value: 12 }, { name: '个人养老金', value: 10 }, { name: '企业网银', value: 8 },
      { name: '工银e办公', value: 7 }, { name: '个人信用卡', value: 6 }, { name: '数字人民币', value: 5 },
      { name: '个人贷款', value: 5 }, { name: '融e行', value: 4 }, { name: '商户之家', value: 4 }, { name: '柜面服务', value: 4 }
    ],
    rejectReasons: [
      { name: '与产品规划不一致', value: 18 },
      { name: '改造成本高、收益不足', value: 12 },
      { name: '已有替代方案或功能', value: 8 },
      { name: '重复问题', value: 6 },
      { name: '描述不清，无法评估', value: 4 }
    ],
    unsolvedReasons: [
      { name: '未纳入当前版本计划', value: 18 },
      { name: '依赖关联系统改造', value: 12 },
      { name: '方案仍在确认', value: 10 },
      { name: '研发资源未到位', value: 8 }
    ]
  },
  suggestion: {
    total: 319,
    adopted: 51,
    sources: [
      { name: '客户：app用户反馈', value: 58 },
      { name: '客户：体验活动', value: 42 },
      { name: '客户：95588工单', value: 28 },
      { name: '客户：应用商店评论', value: 22 },
      { name: '客户：第三方测评', value: 12 },
      { name: '客户：要客意见', value: 8 },
      { name: '员工：设计还原度走查', value: 36 },
      { name: '员工：日常走查', value: 31 },
      { name: '员工：工银众测', value: 24 },
      { name: '员工：工银服务', value: 20 },
      { name: '员工：分行优化建议', value: 16 },
      { name: '员工：行内调研', value: 14 },
      { name: '员工：灵犀旅程', value: 8 }
    ],
    products: [
      { name: '个人手机银行', value: 62 }, { name: '企业手机银行', value: 48 }, { name: '个人养老金', value: 36 },
      { name: '工银e生活', value: 34 }, { name: '个人网银', value: 28 }, { name: '企业网银', value: 24 },
      { name: '工银e办公', value: 22 }, { name: '个人信用卡', value: 18 }, { name: '数字人民币', value: 16 },
      { name: '个人贷款', value: 14 }, { name: '实物贵金属', value: 10 }, { name: '柜面服务', value: 7 }
    ],
    words: [
      { name: '登录', value: 228 }, { name: '支持', value: 176 }, { name: '提示', value: 151 }, { name: '信息', value: 133 },
      { name: '查询', value: 118 }, { name: '优化', value: 104 }, { name: '用户', value: 92 }, { name: '网点', value: 81 },
      { name: '点击', value: 74 }, { name: '账户', value: 68 }
    ],
    rejectReasons: [
      { name: '与产品规划不一致', value: 72 },
      { name: '改造成本高、收益不足', value: 64 },
      { name: '重复建议', value: 48 },
      { name: '已有替代方案或功能', value: 42 },
      { name: '不符合监管或行内制度要求', value: 26 },
      { name: '描述不清，无法评估', value: 16 }
    ]
  }
}

function hash(text) {
  let h = 2166136261
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}
function rng(seed) {
  let s = seed || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}
function daysInclusive(from, to) {
  const a = new Date(`${from}T00:00:00`)
  const b = new Date(`${to}T00:00:00`)
  if (Number.isNaN(+a) || Number.isNaN(+b)) return 1
  return Math.max(1, Math.round((b - a) / 86400000) + 1)
}

// 按目标合计重分配分项，保证各项之和等于合计
function scaleParts(parts, total) {
  const base = parts.filter((p) => p.value > 0)
  if (!base.length || total <= 0) return []
  const origin = sum(base)
  const raw = base.map((p) => ({ name: p.name, value: Math.floor((p.value / origin) * total) }))
  let rest = total - sum(raw)
  const order = raw.map((p, i) => i).sort((a, b) => base[b].value - base[a].value)
  let i = 0
  while (rest > 0) {
    raw[order[i % order.length]].value += 1
    rest -= 1
    i += 1
  }
  return raw.filter((p) => p.value > 0)
}

function synthesize({ mode, products, from, to }) {
  const seed = hash([mode, [...products].sort().join('|'), from, to].join('~'))
  const rand = rng(seed)
  const base = mode === 'product' ? productShowcase : overallShowcase
  const days = daysInclusive(from, to)
  const span = mode === 'product' ? 306 : 27
  const productFactor = mode === 'product' ? Math.max(products.length, 1) * (0.45 + rand() * 0.5) : 1
  const scale = Math.max(0.12, (days / span) * productFactor * (0.82 + rand() * 0.36))
  const problemTotal = Math.max(1, Math.round(base.problem.total * scale))
  const suggestionTotal = Math.max(1, Math.round(base.suggestion.total * scale))
  const adoptRate = Math.min(0.97, Math.max(0.08, base.problem.adopted / base.problem.total * (0.72 + rand() * 0.45)))
  const solveRate = Math.min(adoptRate, Math.max(0.05, base.problem.solved / base.problem.total * (0.72 + rand() * 0.45)))
  const sugAdoptRate = Math.min(0.95, Math.max(0.06, base.suggestion.adopted / base.suggestion.total * (0.7 + rand() * 0.5)))
  const adopted = Math.round(problemTotal * adoptRate)
  const solved = Math.min(adopted, Math.round(problemTotal * solveRate))
  const sugAdopted = Math.round(suggestionTotal * sugAdoptRate)
  const words = ['登录', '支持', '提示', '信息', '查询', '优化', '用户', '网点', '点击', '账户', '转账', '密码', '限额', '理财', '短信']
    .map((name) => ({ name, value: rand() }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((w, i) => ({ name: w.name, value: Math.max(8, Math.round(suggestionTotal * (0.72 - i * 0.055) * (0.7 + rand() * 0.2))) }))
  return {
    problem: {
      total: problemTotal,
      adopted,
      solved,
      levels: scaleParts(base.problem.levels, problemTotal),
      stages: scaleParts(base.problem.stages, problemTotal),
      versions: scaleParts(base.problem.versions, problemTotal),
      products: scaleParts(base.problem.products.length ? base.problem.products : overallShowcase.problem.products, problemTotal),
      rejectReasons: scaleParts(base.problem.rejectReasons, problemTotal - adopted),
      unsolvedReasons: scaleParts(base.problem.unsolvedReasons, problemTotal - solved)
    },
    suggestion: {
      total: suggestionTotal,
      adopted: sugAdopted,
      sources: scaleParts(base.suggestion.sources, suggestionTotal),
      products: scaleParts(base.suggestion.products.length ? base.suggestion.products : overallShowcase.suggestion.products, suggestionTotal),
      words,
      rejectReasons: scaleParts(base.suggestion.rejectReasons, suggestionTotal - sugAdopted)
    }
  }
}

export function snapshot({ mode, products = [], from, to }) {
  if (mode === 'product' && products.length === 1 && products[0] === PRODUCT_SHOWCASE && from === PRODUCT_RANGE[0] && to === PRODUCT_RANGE[1]) return productShowcase
  if (mode === 'all' && from === ALL_RANGE[0] && to === ALL_RANGE[1]) return overallShowcase
  return synthesize({ mode, products, from, to })
}

function check(data, label) {
  const p = data.problem
  const s = data.suggestion
  const eq = (list, total, what) => {
    if (sum(list) !== total) throw new Error(`${label} ${what} ${sum(list)} !== ${total}`)
  }
  eq(p.levels, p.total, '分级')
  eq(p.stages, p.total, '阶段')
  eq(p.versions, p.total, '版本')
  if (p.products.length) eq(p.products, p.total, '问题产品')
  eq(p.rejectReasons, p.total - p.adopted, '问题未采纳')
  eq(p.unsolvedReasons, p.total - p.solved, '问题未解决')
  eq(s.sources, s.total, '来源')
  if (s.products.length) eq(s.products, s.total, '建议产品')
  eq(s.rejectReasons, s.total - s.adopted, '建议未采纳')
  if (p.solved > p.adopted) throw new Error(`${label} 解决数大于采纳数`)
}
check(productShowcase, '产品维度')
check(overallShowcase, '整体视图')

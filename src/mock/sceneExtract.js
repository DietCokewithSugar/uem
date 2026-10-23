// 步骤二「使用AI提炼场景」
// 正式环境把「质检工具（文件分析）」中的 %s 换成素材说明后发给模型，并只解析 JSON。
// 演示环境没有大模型，按同一份提示词的字段和产品类型字典做保守推断。
import { qcPrompts } from './qc'

export const DEFAULT_CATEGORIES = ['Web网站', '移动App', '小程序', '桌面应用', '其他']
const SCENE_FIELDS = ['category', 'businessgoal', 'keytasks', 'painpoints', 'successcriteria', 'constraints']

export function fileAnalysisPrompt() {
  return qcPrompts.find((p) => p.name === '质检工具（文件分析）') || qcPrompts[0]
}

export function categoriesFromPrompt(content = fileAnalysisPrompt()?.content || '') {
  const matched = String(content).match(/产品类型字典[:：]\s*(\[[^\]]+\])/)
  if (!matched) return [...DEFAULT_CATEGORIES]
  try {
    const list = JSON.parse(matched[1])
    if (Array.isArray(list) && list.length && list.every((item) => typeof item === 'string' && item.trim())) {
      return list.map((item) => item.trim())
    }
  } catch {
    /* 字典写坏时回退到生产环境的五类 */
  }
  return [...DEFAULT_CATEGORIES]
}

export function materialNote(files = []) {
  if (!files.length) return '（尚未上传素材）'
  return files.map((file) => {
    const version = file.version ? `${file.version}：` : ''
    const size = file.width && file.height ? `，${file.width}×${file.height}` : ''
    return `${version}${file.name || '未命名图片'}${size}`
  }).join('；')
}

export function buildFileAnalysisPrompt(note) {
  const prompt = fileAnalysisPrompt()
  const text = note || '（尚未上传素材）'
  let content = prompt?.content || ''
  if (content.includes('%s')) content = content.replaceAll('%s', text)
  else content = `${content}\n\n业务场景截图及对应的业务场景及说明： ${text}`
  return { name: prompt?.name || '质检工具（文件分析）', content }
}

const SCENE_HINTS = [
  {
    words: ['账户', '余额', '卡号', '总资产', 'account'],
    fields: {
      businessgoal: '验证用户能否看清名下资金，并继续完成转账或查看明细',
      keytasks: '查看余额或总资产；找到转账入口；打开明细核对最近一笔变动',
      painpoints: '余额、卡号若默认完整露出，旁边有人时不放心；常用下一步若藏在菜单里，查完还要再找一层',
      successcriteria: '查账和常用下一步能在首屏识别；敏感数字默认不是完整露出',
      constraints: '只根据账户相关画面判断，不推测限额、到账时间等未出现的规则'
    }
  },
  {
    words: ['转账', '汇款', '收款人', 'transfer'],
    fields: {
      businessgoal: '验证用户能否在较少步骤内完成一笔转账，并确认资金去向',
      keytasks: '选择或填写收款人；输入金额；确认到账提示或回单',
      painpoints: '收款人、金额和到账提示若分开不明确，用户不敢点最后的确认',
      successcriteria: '提交前能核对收款人和金额；提交后能看到成功或失败，而不是没有反馈',
      constraints: '静态画面不能证明实际扣款是否成功，只评价信息是否足够让用户做判断'
    }
  },
  {
    words: ['理财', '基金', '收益', '持仓', '存款'],
    fields: {
      businessgoal: '验证用户能否理解产品收益和风险，并完成一次购买或查看持仓',
      keytasks: '看懂收益展示和风险提示；找到购买或定投入口；确认持仓或交易结果',
      painpoints: '收益数字若没有口径说明，用户无法判断这是浮动还是已经到账',
      successcriteria: '风险提示出现在确认之前；收益口径用一句话能看懂',
      constraints: '不评价产品收益本身是否合适，只评价用户能否看懂并完成操作'
    }
  },
  {
    words: ['贷款', '借款', '还款', '房贷', '征信'],
    fields: {
      businessgoal: '验证用户能否看清贷款进度、应还金额和下一步，而不误触提前还款或授权',
      keytasks: '查看应还金额和日期；找到还款入口；确认授权或合同前能看清关键条款',
      painpoints: '条款和金额若挤在一起，用户会在不确定时直接点同意',
      successcriteria: '应还金额和日期先于营销信息；授权按钮前能看到金额和期限',
      constraints: '不判断审批是否通过，只根据画面上可见的信息'
    }
  },
  {
    words: ['信用卡', '账单', '分期', '积分'],
    fields: {
      businessgoal: '验证用户能否看清账单、可用额度和还款入口',
      keytasks: '查看本期应还；找到还款；识别积分或权益是否和自己有关',
      painpoints: '账单金额和营销权益若放在一起，用户分不清哪些必须处理',
      successcriteria: '应还金额比活动更醒目；还款入口在账单同一屏可以找到',
      constraints: '不推测未展示的分期费率和积分规则'
    }
  },
  {
    words: ['登录', '注册', '密码', '验证码', 'login'],
    fields: {
      businessgoal: '验证新用户能否完成登录或注册，并进入随后的主流程',
      keytasks: '填写账号；完成验证；看到登录成功或明确的失败原因',
      painpoints: '验证失败时若只提示出错、不说明怎么改，用户会重复尝试后离开',
      successcriteria: '失败原因能对应到要修改的那一项；成功后能进入主流程',
      constraints: '静态图不能验证验证码是否送达，只看提示是否足够'
    }
  },
  {
    words: ['企业', '对公', '网银', '复核', '审批'],
    fields: {
      businessgoal: '验证经办或审批人员能否核对收款信息并完成提交或复核',
      keytasks: '录入或核对付款要素；提交复核；查看审批结果',
      painpoints: '金额和收款人若不够醒目，审批时容易在没核对清楚时点通过',
      successcriteria: '金额、收款人、用途在确认前集中可见；通过和退回都有明确结果',
      constraints: '不评价后台权限配置，只评价当前画面的核对信息是否完整'
    }
  }
]

function categoryFromFile(file, categories) {
  const name = (file.name || '').toLowerCase()
  const named = [
    [['小程序'], '小程序'],
    [['桌面', '客户端', 'desktop'], '桌面应用'],
    [['网页', '官网', '网站', 'web'], 'Web网站'],
    [['手机', '移动', 'app'], '移动App']
  ]
  for (const [words, category] of named) {
    if (words.some((word) => name.includes(word)) && categories.includes(category)) return category
  }
  const w = file.width || 0
  const h = file.height || 0
  let guess = '其他'
  if (w && h) {
    if (h > w * 1.15) guess = '移动App'
    else if (w > h * 1.5) guess = 'Web网站'
    else if (Math.abs(w - h) / Math.max(w, h) < 0.15 && Math.max(w, h) < 900) guess = '小程序'
    else guess = '桌面应用'
  }
  if (categories.includes(guess)) return guess
  if (categories.includes('其他')) return '其他'
  return categories[0] || ''
}

function voteCategory(files, categories) {
  if (!files.length) return categories.includes('其他') ? '其他' : (categories[0] || '')
  const counts = new Map()
  files.forEach((file) => {
    const category = categoryFromFile(file, categories)
    counts.set(category, (counts.get(category) || 0) + 1)
  })
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function bestHint(files) {
  const names = files.map((file) => file.name || '').join(' ').toLowerCase()
  let best = null
  let score = 0
  SCENE_HINTS.forEach((hint) => {
    const hits = hint.words.filter((word) => names.includes(word.toLowerCase())).length
    if (hits > score) {
      score = hits
      best = hint
    }
  })
  return best
}

function conservative(category, fileCount) {
  return {
    category,
    businessgoal: '验证用户能否看清当前画面上的主信息，并完成最显眼的一项操作',
    keytasks: '识别页面上的主信息；找到主按钮并完成一次操作；结果不清楚时知道如何返回',
    painpoints: '主信息和辅助说明的层级接近，用户需要停下来确认自己有没有看对',
    successcriteria: '核心操作在当前画面能找到；主按钮文案能对应下一步；操作后能看出是否成功',
    constraints: `共 ${fileCount} 张静态素材。画面中看不全的流程不补充，系统性能不纳入判断`
  }
}

function inferOne(files, categories) {
  const category = voteCategory(files, categories)
  const hint = bestHint(files)
  if (!hint) return conservative(category, files.length)
  return { category, ...hint.fields, constraints: `${hint.fields.constraints}。本次识别到 ${files.length} 张素材` }
}

function mergeAb(before, after) {
  const same = before.category && before.category === after.category
  const categoryNote = same
    ? `两版都按「${after.category}」理解`
    : `修改前判断为「${before.category || '未识别'}」，修改后判断为「${after.category || '未识别'}」，请确认是不是同一产品`
  const extra = before.constraints === after.constraints
    ? before.constraints
    : `修改前：${before.constraints}。修改后：${after.constraints}`
  return {
    category: after.category || before.category,
    businessgoal: `对比修改前与修改后，验证是否更利于完成：${after.businessgoal || before.businessgoal}`,
    keytasks: after.keytasks || before.keytasks,
    painpoints: before.painpoints,
    successcriteria: after.successcriteria || before.successcriteria,
    constraints: [categoryNote, '只比较画面上看得到的差异，不编造中间页', extra].filter(Boolean).join('。')
  }
}

function asSceneJson(obj, categories) {
  const text = JSON.stringify(Object.fromEntries(SCENE_FIELDS.map((key) => [key, String(obj[key] ?? '')])))
  const parsed = JSON.parse(text)
  if (!categories.includes(parsed.category)) {
    parsed.category = categories.includes('其他') ? '其他' : (categories[0] || '')
  }
  return parsed
}

export function extractBusinessScene({ files = [], mode = 'standard' } = {}) {
  const categories = categoriesFromPrompt()
  if (mode === 'ab') {
    const before = files.filter((file) => file.version === '修改前')
    const after = files.filter((file) => file.version === '修改后')
    if (!before.length || !after.length) {
      const single = inferOne(files, categories)
      single.constraints = `${single.constraints}。AB 对比需要修改前和修改后都有素材`.replace(/。。/g, '。')
      return asSceneJson(single, categories)
    }
    return asSceneJson(mergeAb(inferOne(before, categories), inferOne(after, categories)), categories)
  }
  return asSceneJson(inferOne(files, categories), categories)
}

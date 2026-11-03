// 首页卡片：每张卡片声明所需功能（config/access.js），能否看到由岗位决定，看到哪些数据由岗位的数据范围决定。
// 默认展示哪些卡片由「系统管理 · 首页卡片配置」按岗位设置（defaultsByRole）；
// 每个人可以在自己有权限的卡片里隐藏、调整顺序（保存在浏览器本地）。
import { reactive, computed } from 'vue'
import { can, me } from '@/config/access'
import { currentUser } from '@/config/user'

// span：在 12 栏网格中的默认宽度；排版时自动补满每一行
export const homeCards = [
  { key: 'todo', title: '我的待办', desc: '按岗位显示：领导审批，业务人员分拣、答复与跟进，分行员工修改被退回的建议', span: 8 },
  { key: 'quickSubmit', title: '提交优化建议', desc: '一句话描述问题，进入新增页由 AI 整理成规范的描述并识别字段', span: 4 },
  { key: 'mySubmit', title: '我的提交进度', desc: '本人提交的优化建议当前在哪个环节、由谁处理', span: 8 },
  { key: 'suggestStats', title: '优化建议概览', desc: '本年建议数、采纳率、解决率与平均处理用时', span: 8, feature: ['suggest.stat', 'suggest.board'] },
  { key: 'deptProgress', title: '部门处理进展', desc: '本部门各环节在办数量与逾期情况（管理报表口径）', span: 4, feature: 'suggest.report' },
  { key: 'voiceAlert', title: '声音异动', desc: '按岗位的产品领域显示有效声音、压力等级与典型问题；全领域即全量看板', span: 4, feature: 'voice.board' },
  { key: 'nps', title: '品牌 NPS', desc: '工行整体净推荐值与四个维度满意度', span: 4, feature: 'monitor.view' },
  { key: 'journeys', title: '灵犀旅程', desc: '旅程维护人员看待办，其他人看已发布的旅程看板', span: 4 },
  { key: 'activities', title: '体验活动', desc: '进行中的体验活动与公告', span: 4 },
  { key: 'qc', title: '体验质检智能体', desc: '最近的质检报告与新建入口', span: 4, feature: 'qc.use' },
  { key: 'voiceTool', title: '声音分析智能工具', desc: '上传用户声音文件，批量识别有效性、情绪与典型问题', span: 4 },
  { key: 'skills', title: 'AI 技能', desc: '帮你研、伴你想', span: 4 },
  { key: 'news', title: '体验动态', desc: '总行、分行的体验公告', span: 4 },
  { key: 'training', title: '方法培训', desc: '最新的体验方法课程与资料', span: 4 },
  { key: 'system', title: '系统运行概况', desc: '人员、产品、定时任务与邮件提醒的运行情况', span: 8, feature: 'system' },
  { key: 'banner', title: '首页横幅', desc: '「轮播图维护」中展示中的横幅', span: 12 }
]
export const cardOf = (key) => homeCards.find((c) => c.key === key)

// 默认展示：「所有人」对所有人生效；「未持有岗位的员工」对没有任何岗位的员工生效（如分行员工）；其余按岗位名
export const EVERYONE = '所有人'
export const NO_ROLE = '未持有岗位的员工'
export const defaultsByRole = reactive({
  [EVERYONE]: ['todo', 'news', 'training'],
  [NO_ROLE]: ['quickSubmit', 'mySubmit', 'voiceTool'],
  分行科技审核岗: ['quickSubmit', 'mySubmit'],
  产品线分拣岗: ['voiceAlert', 'journeys'],
  产品线处理岗: ['voiceAlert', 'journeys', 'mySubmit'],
  产品线审核岗: ['suggestStats', 'deptProgress'],
  '产品线审核岗（要客）': ['suggestStats'],
  总行业务部门处理岗: ['mySubmit'],
  统计视图查看权限: ['suggestStats'],
  管理报表查看权限: ['deptProgress'],
  优化建议数据看板: ['suggestStats'],
  智能分析查看岗: ['voiceAlert'],
  体验监测白名单: ['nps'],
  灵犀旅程管理岗: ['journeys'],
  总行体验活动录入岗: ['activities'],
  总行体验活动审批岗: ['activities'],
  质检智能体使用岗: ['qc', 'skills'],
  质检智能体管理岗: ['qc', 'skills'],
  体验资讯录入岗: ['skills'],
  系统管理员: ['system']
})

// 展示顺序：待办在前，其后为岗位相关卡片，通用卡片在后
const ORDER = ['todo', 'quickSubmit', 'suggestStats', 'deptProgress', 'voiceAlert', 'nps', 'mySubmit', 'journeys', 'activities', 'qc', 'voiceTool', 'skills', 'news', 'training', 'system', 'banner']
const byOrder = (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)

export const permittedCards = computed(() => homeCards.filter((c) => can(c.feature)))
export function defaultKeys() {
  const roles = me.value.roles || []
  const keys = new Set([...(defaultsByRole[EVERYONE] || []), ...(roles.length ? [] : defaultsByRole[NO_ROLE] || []), ...roles.flatMap((r) => defaultsByRole[r] || [])])
  return [...keys].filter((k) => cardOf(k) && can(cardOf(k).feature)).sort(byOrder)
}

// ===== 个人调整（按人员保存在浏览器本地）=====
const storeKey = () => `uem.home.${currentUser.id}`
export function loadPrefs() {
  try {
    const v = JSON.parse(localStorage.getItem(storeKey()) || 'null')
    return v && Array.isArray(v.order) ? v : null
  } catch {
    return null
  }
}
export function savePrefs(prefs) {
  try {
    if (prefs) localStorage.setItem(storeKey(), JSON.stringify(prefs))
    else localStorage.removeItem(storeKey())
  } catch {}
}
// 当前展示的卡片：有个人调整时按个人顺序（新获得权限的默认卡片追加在后），否则按默认
export function activeKeys(prefs = loadPrefs()) {
  const allowed = new Set(permittedCards.value.map((c) => c.key))
  const defaults = defaultKeys()
  if (!prefs) return defaults
  const order = prefs.order.filter((k) => allowed.has(k))
  for (const k of defaults) if (!order.includes(k) && !(prefs.hidden || []).includes(k)) order.push(k)
  return order.filter((k) => !(prefs.hidden || []).includes(k))
}

// 排版：按顺序放入 12 栏网格，一行放不下时把该行最后一张卡片拉宽补满，不留空洞
export function layout(keys) {
  const rows = []
  let row = []
  let used = 0
  for (const key of keys) {
    const span = cardOf(key).span
    if (used + span > 12 && row.length) {
      row[row.length - 1].span += 12 - used
      rows.push(row)
      row = []
      used = 0
    }
    row.push({ key, span })
    used += span
  }
  if (row.length) {
    row[row.length - 1].span += 12 - used
    rows.push(row)
  }
  return rows.flat()
}

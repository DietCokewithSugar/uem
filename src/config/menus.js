// 导航：一级板块（左侧导航第一层）+ 各板块的菜单（分组或页面）
// 分组无 children 而有 path 时直接跳转页面；feature 为所需功能（见 config/access.js），未写则所有人可见；
// 分组上的 feature 作用于组内全部菜单。countKey 对应 mock/index.js 中 todoCounts 的字段，用于显示待办数量。
// 页面路由与行内地址保持一致（如 #/optimPending?type=&suggestStatus=2），改版只调整菜单归属与名称。

import { reactive, computed } from 'vue'
import { voiceProducts } from '@/mock/voice'
import { can } from '@/config/access'

const voiceProductMenus = voiceProducts.map((p) => ({ title: p.name, path: '/cusSupreme', query: { productId: p.id } }))
const pending = (title, code, countKey, feature) => ({ title, path: '/optimPending', query: { type: '', suggestStatus: code }, countKey, feature })

// 一级板块：sort 为排序，frozen 为冻结（不在导航显示）；由「系统管理 · 菜单维护」维护
export const topNav = reactive([
  { key: 'home', title: '首页', icon: 'House', path: '/mainIndex', sort: 0 },
  { key: 'suggest', title: '优化建议', icon: 'EditPen', sort: 1 },
  { key: 'voice', title: '用户声音', icon: 'ChatLineSquare', sort: 2 },
  { key: 'journey', title: '灵犀旅程', icon: 'Guide', sort: 3 },
  { key: 'activity', title: '体验活动', icon: 'Flag', sort: 4 },
  { key: 'ai', title: 'AI 工具', icon: 'MagicStick', sort: 5 },
  { key: 'monitor', title: '体验监测', icon: 'TrendCharts', sort: 6 },
  { key: 'knowledge', title: '知识中心', icon: 'Reading', sort: 7 },
  { key: 'tools', title: '平台工具', icon: 'Tools', path: '/tools', sort: 8, frozen: true },
  { key: 'system', title: '系统管理', icon: 'Setting', sort: 9 }
])

export const sideMenus = {
  suggest: [
    { title: '提交优化建议', path: '/optimSuggestAdd' },
    {
      title: '我的待办',
      children: [
        pending('待修改', '1', 'toModify'),
        pending('待审批', '2', 'toApprove', 'suggest.approve'),
        pending('待分拣', '3', 'toSort', 'suggest.sort'),
        pending('待答复', '4', 'toReply', 'suggest.reply'),
        pending('待审核', '6', 'toAudit', 'suggest.audit'),
        pending('待业务部门答复', '7', 'toBusiness', 'suggest.business'),
        pending('待跟进', '5', 'toFollow', 'suggest.reply')
      ]
    },
    { title: '我的提交', path: '/mySubmit' },
    { title: '我已处理', path: '/myHandled', feature: 'suggest.handled' },
    { title: '全部优化建议', path: '/optimSuggestions', query: { type: '1', suggestStatus: '' } },
    { title: '研发阶段体验问题', path: '/experienceProblems', query: { type: '1', suggestStatus: '' } },
    {
      title: '统计视图',
      feature: 'suggest.stat',
      children: [
        { title: '整体视图', path: '/allView' },
        { title: '产品维度', path: '/productView' }
      ]
    },
    { title: '管理报表', path: '/manageExcel', feature: 'suggest.report' },
    { title: '数据看板', path: '/suggestionDataBoard', feature: 'suggest.board' }
  ],
  voice: [
    { title: '声音看板', path: '/journeyVoiceAnalyze', feature: 'voice.board' },
    { title: '客户声音', feature: 'voice.view', children: [{ title: '全部声音', path: '/cusAllVoice' }, ...voiceProductMenus] },
    { title: '员工心声', path: '/empAspirrations' },
    {
      title: '数据管理',
      feature: 'voice.data',
      children: [
        { title: '旅程结构管理', path: '/jouranalyManage' },
        { title: '看板图表数据管理', path: '/boardManage' },
        { title: '统计报表', path: '/statisticsManage' },
        { title: '用户声音上传', path: '/customerSoundUpload' },
        { title: '产品领域管理', path: '/productField' },
        { title: '实时监测收件人管理', path: '/emailManage' }
      ]
    }
  ],
  journey: [
    { title: '灵犀旅程看板', path: '/journeysBoardConfig' },
    { title: '灵犀旅程维护', path: '/myJourney', feature: 'journey.manage' },
    { title: '灵犀旅程管理', path: '/userJourneyManagementNew', feature: 'journey.manage' },
    {
      title: '待办工作',
      feature: 'journey.manage',
      children: [
        { title: '待修改旅程', path: '/journeyModify', countKey: 'journeyModify' },
        { title: '待审核旅程', path: '/journeyExamine', countKey: 'journeyExamine' }
      ]
    }
  ],
  activity: [
    {
      title: '待办工作',
      children: [
        { title: '体验活动', path: '/activityPending', countKey: 'activity', feature: 'activity.approve' },
        { title: '体验公告', path: '/noticePending', countKey: 'notice', feature: 'notice.approve' },
        { title: '体验任务', path: '/taskPending', countKey: 'task' }
      ]
    },
    {
      title: '体验活动',
      children: [
        { title: '总行体验活动', path: '/headOfficeAllActivity' },
        { title: '分行体验活动', path: '/branchAllActivity' },
        { title: '我的体验活动', path: '/myAllActivity' }
      ]
    },
    {
      title: '体验任务',
      children: [
        { title: '体验管理任务', path: '/experTaskManage', feature: 'task.manage' },
        { title: '我的体验任务', path: '/myExperTask' }
      ]
    },
    {
      title: '体验公告',
      children: [
        { title: '总行体验公告', path: '/headOfficeAllNotice' },
        { title: '分行体验公告', path: '/branchAllNotice' },
        { title: '我的体验公告', path: '/myAllNotice' }
      ]
    },
    {
      title: '体验官',
      children: [
        { title: '总行行内体验官', path: '/headInsideExperManage', feature: 'experiencer.head' },
        { title: '总行行外体验官', path: '/headOfficeExperManage', feature: 'experiencer.head' },
        { title: '分行行内体验官', path: '/branchInsideExperManage', feature: ['experiencer.head', 'experiencer.branch'] },
        { title: '分行行外体验官', path: '/branchExperManage', feature: ['experiencer.head', 'experiencer.branch'] },
        { title: '非在库人员', path: '/nonStoredExperManage', feature: 'experiencer.head' }
      ]
    }
  ],
  ai: [
    { title: '声音分析智能工具', path: '/analyticsTools' },
    { title: '体验质检智能体', path: '/agentFirst', feature: 'qc.use' },
    { title: '技能', path: '/skills' },
    {
      title: '智能体管理',
      children: [
        { title: '质检智能体角色管理', path: '/roleManagement', feature: 'qc.manage' },
        { title: '质检智能体提示词管理', path: '/agentTips', feature: 'qc.manage' },
        { title: '质检智能体统计', path: '/agentStatistic', feature: 'qc.manage' },
        { title: '声音模型提示词管理', path: '/tipsManage', feature: 'voice.prompt' }
      ]
    }
  ],
  monitor: [
    { title: '品牌印象', feature: 'monitor.view', children: [{ title: '工行品牌', path: '/experEvaluationIndex' }] },
    {
      title: '数据管理',
      feature: 'monitor.maintain',
      children: [
        { title: '评价数据上传', path: '/experEvalDataUpLoad' },
        { title: '设计工作情况上传', path: '/experEvalDesignUpLoad' },
        { title: '评价数据审核', path: '/experEvalDataAudit' },
        { title: '体验度量图片', path: '/productMeasureImg' }
      ]
    }
  ],
  knowledge: [
    { title: '方法培训', path: '/methodTraining' },
    { title: '体验研究', path: '/excellentReport' },
    { title: '资讯管理', path: '/experInformation', feature: 'info.manage' }
  ],
  system: [
    { title: '人员维护', path: '/personMaintenance', feature: 'system' },
    { title: '产品维护', path: '/productMaintenance', feature: 'system' },
    {
      title: '首页维护',
      feature: 'system',
      children: [
        { title: '首页卡片配置', path: '/homeCardConfig' },
        { title: '轮播图维护', path: '/carouseMaintenanceList' }
      ]
    },
    { title: '运营数据', path: '/sysOperation', feature: 'system' },
    { title: '要客数据', path: '/majorClient', feature: 'system' },
    { title: '体验监测维护', path: '/experEvaluationMaintenance', feature: 'system' },
    { title: '菜单维护', path: '/menuMaintenance', feature: 'system' },
    { title: '体验问题维护', path: '/experienceProblemsMaintenance', feature: 'system' },
    {
      title: '后台管理',
      feature: 'admin',
      children: [
        { title: '定时任务', path: '/scheduleJobList' },
        { title: '字典维护', path: '/genDictList' },
        { title: '邮件记录', path: '/emailHistoryList' },
        { title: '节假日', path: '/holidayList' },
        { title: '接口权限', path: '/interfaceList' },
        { title: '日志管理', path: '/log' }
      ]
    }
  ]
}

// 待办状态码 → 名称（与行内地址 suggestStatus 一致；2 原为「待处理」，现为分行员工提交后的「待审批」）
export const pendingStatus = {
  1: '待修改',
  2: '待审批',
  3: '待分拣',
  4: '待答复',
  5: '待跟进',
  6: '待审核',
  7: '待业务部门答复'
}

// ===== 按当前身份过滤后的菜单 =====
const itemVisible = (item, groupFeature) => can(groupFeature) && can(item.feature)
export function visibleMenus(section) {
  return (sideMenus[section] || [])
    .map((g) => {
      if (!g.children) return itemVisible(g) ? g : null
      const children = g.children.filter((c) => itemVisible(c, g.feature))
      return children.length ? { ...g, children } : null
    })
    .filter(Boolean)
}
const firstLeaf = (section) => {
  const g = visibleMenus(section)[0]
  return g ? (g.children ? g.children[0] : g) : null
}
// 一级板块的入口：板块自身的 path，或当前身份可见的第一个菜单
export function sectionEntry(n) {
  if (n.path) return { path: n.path }
  const leaf = firstLeaf(n.key)
  return leaf ? { path: leaf.path, query: leaf.query } : null
}
export const visibleNav = computed(() =>
  topNav
    .filter((n) => !n.frozen && (n.key === 'home' || n.path || visibleMenus(n.key).length))
    .sort((a, b) => a.sort - b.sort)
)

// 旧菜单名 → 新菜单名（详情页地址中的 currentMenuName 可能来自改版前的链接）
const MENU_ALIASES = { 全部列表: '全部优化建议', 待处理: '待审批', 体验问题: '研发阶段体验问题' }

// 按菜单名称取页面地址（含查询参数），供详情页「返回」和面包屑定位来源菜单
export function menuPathOf(section, title) {
  const name = MENU_ALIASES[title] || title
  for (const g of sideMenus[section] || []) {
    for (const item of g.children || [g]) {
      if (item.title !== name || !item.path) continue
      const q = new URLSearchParams(item.query || {}).toString()
      return q ? `${item.path}?${q}` : item.path
    }
  }
  return ''
}
export const menuTitleOf = (title) => MENU_ALIASES[title] || title

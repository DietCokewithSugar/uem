// 顶部主导航 + 各板块左侧菜单配置
// 分组无 children 而有 path 时，作为一级菜单直接跳转（如「方法培训」）
// countKey 对应 mock/index.js 中 todoCounts 的字段，用于显示待办数量

import { reactive, computed } from 'vue'
import { voiceProducts } from '@/mock/voice'

const voiceProductMenus = voiceProducts.map((p) => ({ title: p.name, path: '/cusSupreme', query: { productId: p.id } }))

// 一级菜单：sort 为排序，frozen 为冻结（不在顶部导航显示）；由「系统管理 · 菜单维护」维护
export const topNav = reactive([
  { key: 'home', title: '首页', path: '/mainIndex', sort: 0 },
  { key: 'experience', title: '体验问题', path: '/optimPending', query: { type: '', suggestStatus: '2' }, sort: 1 },
  { key: 'activity', title: '体验活动', path: '/activityPending', sort: 2 },
  { key: 'info', title: '体验资讯', path: '/journeyModify', sort: 3 },
  { key: 'experiencer', title: '体验员', path: '/headInsideExperManage', sort: 4 },
  { key: 'tools', title: '平台工具', path: '/tools', sort: 5, frozen: true },
  { key: 'monitor', title: '体验监测', path: '/experEvaluationIndex', sort: 6 },
  { key: 'voice', title: '用户声音', path: '/empAspirrations', sort: 7 },
  { key: 'system', title: '系统管理', path: '/personMaintenance', sort: 8 },
  { key: 'admin', title: '后台管理', path: '/scheduleJobList', sort: 9 }
])
export const visibleNav = computed(() => topNav.filter((n) => !n.frozen).sort((a, b) => a.sort - b.sort))

export const sideMenus = {
  experience: [
    {
      title: '待办工作',
      children: [
        { title: '待修改', path: '/optimPending', query: { type: '', suggestStatus: '1' }, countKey: 'toModify' },
        { title: '待处理', path: '/optimPending', query: { type: '', suggestStatus: '2' }, countKey: 'toHandle' },
        { title: '待分拣', path: '/optimPending', query: { type: '', suggestStatus: '3' }, countKey: 'toSort' },
        { title: '待答复', path: '/optimPending', query: { type: '', suggestStatus: '4' }, countKey: 'toReply' },
        { title: '待跟进', path: '/optimPending', query: { type: '', suggestStatus: '5' }, countKey: 'toFollow' }
      ]
    },
    {
      title: '体验问题',
      children: [{ title: '体验问题', path: '/experienceProblems', query: { type: '1', suggestStatus: '' } }]
    },
    {
      title: '优化建议',
      children: [
        { title: '全部列表', path: '/optimSuggestions', query: { type: '1', suggestStatus: '' } },
        { title: '我的提交', path: '/mySubmit' },
        { title: '我已处理', path: '/myHandled' },
        { title: '管理报表', path: '/manageReport' },
        { title: '数据看板', path: '/dataBoard' }
      ]
    }
  ],
  activity: [
    {
      title: '待办工作',
      children: [
        { title: '体验活动', path: '/activityPending', countKey: 'activity' },
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
        { title: '体验管理任务', path: '/experTaskManage' },
        { title: '我的体验任务', path: '/myExperTask' }
      ]
    }
  ],
  info: [
    {
      title: '待办工作',
      children: [
        { title: '待修改旅程', path: '/journeyModify', countKey: 'journeyModify' },
        { title: '待审核旅程', path: '/journeyExamine', countKey: 'journeyExamine' }
      ]
    },
    { title: '方法培训', path: '/methodTraining' },
    { title: '体验研究', path: '/excellentReport' },
    { title: '数据管理', path: '/experInformation' },
    {
      title: '灵犀旅程',
      children: [
        { title: '灵犀旅程管理', path: '/userJourneyManagementNew' },
        { title: '灵犀旅程维护', path: '/myJourney' },
        { title: '灵犀旅程看板', path: '/journeysBoardConfig' }
      ]
    },
    {
      title: '体验质检',
      children: [
        { title: '体验质检智能体', path: '/agentFirst' },
        { title: '质检智能体角色管理', path: '/roleManagement' },
        { title: '质检智能体提示词管理', path: '/agentTips' },
        { title: '质检智能体统计', path: '/agentStatistic' }
      ]
    }
  ],
  experiencer: [
    {
      title: '总行体验员管理',
      children: [
        { title: '行内体验员管理', path: '/headInsideExperManage' },
        { title: '行外体验员管理', path: '/headOfficeExperManage' }
      ]
    },
    {
      title: '分行体验员管理',
      children: [
        { title: '行内体验员管理', path: '/branchInsideExperManage' },
        { title: '行外体验员管理', path: '/branchExperManage' }
      ]
    },
    { title: '非在库人员管理', path: '/nonStoredExperManage' }
  ],
  monitor: [
    { title: '品牌印象', children: [{ title: '工行品牌', path: '/experEvaluationIndex' }] },
    {
      title: '数据管理',
      children: [
        { title: '评价数据上传', path: '/experEvalDataUpLoad' },
        { title: '设计工作情况上传', path: '/experEvalDesignUpLoad' },
        { title: '评价数据审核', path: '/experEvalDataAudit' },
        { title: '体验度量图片', path: '/productMeasureImg' }
      ]
    }
  ],
  voice: [
    { title: '员工心声', path: '/empAspirrations' },
    {
      title: '客户声音',
      children: [
        { title: '全部声音', path: '/cusAllVoice' },
        ...voiceProductMenus
      ]
    },
    {
      title: '智能分析',
      children: [
        { title: '声音看板', path: '/journeyVoiceAnalyze' },
        { title: '分析工具', path: '/analyticsTools' }
      ]
    },
    {
      title: '数据管理',
      children: [
        { title: '旅程结构管理', path: '/jouranalyManage' },
        { title: '模型提示词管理', path: '/tipsManage' },
        { title: '看板图表数据管理', path: '/boardManage' },
        { title: '统计报表', path: '/statisticsManage' },
        { title: '用户声音上传', path: '/customerSoundUpload' },
        { title: '产品领域管理', path: '/productField' },
        { title: '实时监测收件人管理', path: '/emailManage' }
      ]
    }
  ],
  system: [
    { title: '人员维护', path: '/personMaintenance' },
    { title: '产品维护', path: '/productMaintenance' },
    { title: '首页维护', children: [{ title: '轮播图维护', path: '/carouseMaintenanceList' }] },
    { title: '运营数据', path: '/sysOperation' },
    { title: '要客数据', path: '/majorClient' },
    { title: '体验监测维护', path: '/experEvaluationMaintenance' },
    { title: '菜单维护', path: '/menuMaintenance' },
    { title: '体验问题维护', path: '/experienceProblemsMaintenance' }
  ],
  admin: [
    { title: '定时任务', path: '/scheduleJobList' },
    // 以下页面待截图补充；路由为推测
    { title: '字典维护', path: '/dictMaintenance' },
    { title: '邮件记录', path: '/emailRecord' },
    { title: '节假日', path: '/holiday' },
    { title: '接口权限', path: '/apiPermission' },
    { title: '日志管理', path: '/logManage' }
  ]
}

// 待办状态码 → 名称
export const pendingStatus = {
  1: '待修改',
  2: '待处理',
  3: '待分拣',
  4: '待答复',
  5: '待跟进'
}

// 顶部主导航 + 各板块左侧菜单配置
// 分组无 children 而有 path 时，作为一级菜单直接跳转（如「方法培训」）
// countKey 对应 mock/index.js 中 todoCounts 的字段，用于显示待办数量

export const topNav = [
  { key: 'home', title: '首页', path: '/mainIndex' },
  { key: 'experience', title: '体验问题', path: '/optimPending', query: { type: '', suggestStatus: '2' } },
  { key: 'activity', title: '体验活动', path: '/activityPending' },
  { key: 'info', title: '体验资讯', path: '/journeyModify' },
  { key: 'experiencer', title: '体验员', path: '/headInsideExperManage' },
  { key: 'monitor', title: '体验监测', path: '/experEvaluationIndex' },
  { key: 'voice', title: '用户声音', path: '/voice' },
  { key: 'system', title: '系统管理', path: '/system' },
  { key: 'admin', title: '后台管理', path: '/admin' }
]

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

// 顶部主导航 + 各板块左侧菜单配置
// countKey 对应 mock/index.js 中 todoCounts 的字段，用于显示待办数量
// inferred: true 表示截图中仅看到分组标题、子菜单为推测，待后续截图确认

export const topNav = [
  { key: 'home', title: '首页', path: '/mainIndex' },
  { key: 'experience', title: '体验问题', path: '/optimPending', query: { type: '', suggestStatus: '2' } },
  { key: 'activity', title: '体验活动', path: '/activityPending' },
  { key: 'info', title: '体验资讯', path: '/info' },
  { key: 'experiencer', title: '体验员', path: '/experiencer' },
  { key: 'monitor', title: '体验监测', path: '/monitor' },
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
      inferred: true,
      children: [
        { title: '活动申请', path: '/activityApply' },
        { title: '活动列表', path: '/activityList' }
      ]
    },
    {
      title: '体验任务',
      inferred: true,
      children: [{ title: '任务列表', path: '/taskList' }]
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

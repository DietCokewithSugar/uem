import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import SectionLayout from '@/layouts/SectionLayout.vue'

const section = (key, children) => ({
  path: '',
  component: SectionLayout,
  props: { section: key },
  children: children.map((c) => ({ ...c, meta: { ...c.meta, section: key } }))
})

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/mainIndex',
    children: [
      { path: 'mainIndex', component: () => import('@/views/home/HomeIndex.vue'), meta: { section: 'home', title: '首页' } },

      section('experience', [
        { path: 'optimPending', component: () => import('@/views/experience/OptimPending.vue'), meta: { group: '待办工作' } },
        { path: 'experienceProblems', component: () => import('@/views/experience/ExperienceProblems.vue'), meta: { group: '体验问题', title: '体验问题' } },
        { path: 'optimSuggestions', component: () => import('@/views/experience/OptimSuggestions.vue'), meta: { group: '优化建议', title: '全部列表' } },
        { path: 'mySubmit', component: () => import('@/views/experience/OptimSuggestions.vue'), props: { mode: 'mine' }, meta: { group: '优化建议', title: '我的提交' } },
        { path: 'myHandled', component: () => import('@/views/experience/OptimSuggestions.vue'), props: { mode: 'handled' }, meta: { group: '优化建议', title: '我已处理' } },
        { path: 'manageReport', component: () => import('@/views/experience/ManageReport.vue'), meta: { group: '优化建议', title: '管理报表' } },
        { path: 'dataBoard', component: () => import('@/views/experience/DataBoard.vue'), meta: { group: '优化建议', title: '数据看板' } }
      ]),

      section('activity', [
        { path: 'activityPending', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'pending' }, meta: { group: '待办工作', title: '体验活动' } },
        { path: 'taskPending', component: () => import('@/views/activity/TaskList.vue'), props: { scope: 'pending' }, meta: { group: '待办工作', title: '体验任务' } },
        { path: 'headOfficeAllActivity', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'head' }, meta: { group: '体验活动', title: '总行体验活动' } },
        { path: 'branchAllActivity', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'branch' }, meta: { group: '体验活动', title: '分行体验活动' } },
        { path: 'myAllActivity', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'mine' }, meta: { group: '体验活动', title: '我的体验活动' } },
        { path: 'experTaskManage', component: () => import('@/views/activity/TaskList.vue'), props: { scope: 'manage' }, meta: { group: '体验任务', title: '体验管理任务' } },
        { path: 'myExperTask', component: () => import('@/views/activity/TaskList.vue'), props: { scope: 'mine' }, meta: { group: '体验任务', title: '我的体验任务' } },
        {
          path: 'taskAdd',
          component: () => import('@/views/activity/TaskAdd.vue'),
          // 子页面：面包屑为「分组 / 来源列表 / 新增」，左侧高亮来源列表
          meta: {
            group: '体验任务',
            title: '新增',
            parent: (r) => (r.query.taskListType === '1' ? '/experTaskManage' : '/myExperTask')
          }
        },
        {
          path: 'activityAdd',
          component: () => import('@/views/activity/ActivityAdd.vue'),
          meta: { group: '体验活动', title: '新增', parent: (r) => r.query.from || '/myAllActivity' }
        }
      ]),

      section('info', [
        { path: 'journeyModify', component: () => import('@/views/info/JourneyPending.vue'), props: { mode: 'modify' }, meta: { group: '待办工作', title: '待修改' } },
        { path: 'journeyExamine', component: () => import('@/views/info/JourneyPending.vue'), props: { mode: 'examine' }, meta: { group: '待办工作', title: '待审核' } },
        { path: 'methodTraining', component: () => import('@/views/info/MethodTraining.vue'), meta: { title: '方法培训' } },
        { path: 'excellentReport', component: () => import('@/views/info/ExcellentReport.vue'), meta: { title: '体验研究' } },
        { path: 'experInformation', component: () => import('@/views/info/InfoManage.vue'), meta: { title: '数据管理' } },
        {
          path: 'userJourneyManagementNew',
          component: () => import('@/views/info/journey/JourneyManage.vue'),
          meta: {
            group: '灵犀旅程',
            title: '灵犀旅程管理',
            titleTabs: [{ key: 'basic', label: '旅程基本情况管理' }, { key: 'problems', label: '典型问题管理' }]
          }
        },
        { path: 'myJourney', component: () => import('@/views/info/journey/MyJourney.vue'), meta: { group: '灵犀旅程', title: '灵犀旅程维护' } },
        { path: 'journeysBoardConfig', component: () => import('@/views/info/journey/JourneyBoard.vue'), meta: { group: '灵犀旅程', title: '灵犀旅程看板', hideTitle: true } },
        {
          path: 'myjourneyAdd',
          component: () => import('@/views/info/journey/JourneyEditor.vue'),
          meta: {
            group: '灵犀旅程',
            title: '编辑',
            hideTitle: true,
            crumbsWithSection: true,
            parent: (r) => (r.query.status === 'view' ? '/userJourneyManagementNew' : '/myJourney')
          }
        },
        { path: 'agentFirst', component: () => import('@/views/info/qc/AgentList.vue'), meta: { group: '体验质检', title: '体验质检智能体' } },
        {
          path: 'agentDetail',
          component: () => import('@/views/info/qc/AgentDetail.vue'),
          meta: { group: '体验质检', title: '体验质检智能体', crumbsWithSection: true, parent: () => '/agentFirst' }
        },
        { path: 'roleManagement', component: () => import('@/views/info/qc/RoleManage.vue'), meta: { group: '体验质检', title: '质检智能体角色管理' } },
        { path: 'agentTips', component: () => import('@/views/info/qc/PromptManage.vue'), meta: { group: '体验质检', title: '质检智能体提示词管理' } },
        { path: 'agentStatistic', component: () => import('@/views/info/qc/AgentStats.vue'), meta: { group: '体验质检', title: '质检智能体统计' } }
      ]),

      section('experiencer', [
        { path: 'headInsideExperManage', component: () => import('@/views/experiencer/ExperiencerList.vue'), props: { kind: 'inside', level: 'head' }, meta: { group: '总行体验员管理', title: '行内体验员管理' } },
        { path: 'headOfficeExperManage', component: () => import('@/views/experiencer/ExperiencerList.vue'), props: { kind: 'outside', level: 'head' }, meta: { group: '总行体验员管理', title: '行外体验员管理' } },
        { path: 'branchInsideExperManage', component: () => import('@/views/experiencer/ExperiencerList.vue'), props: { kind: 'inside', level: 'branch' }, meta: { group: '分行体验员管理', title: '行内体验员管理' } },
        { path: 'branchExperManage', component: () => import('@/views/experiencer/ExperiencerList.vue'), props: { kind: 'outside', level: 'branch' }, meta: { group: '分行体验员管理', title: '行外体验员管理' } },
        { path: 'nonStoredExperManage', component: () => import('@/views/experiencer/NonStored.vue'), meta: { title: '非在库人员管理' } }
      ]),

      section('monitor', [
        { path: 'experEvaluationIndex', component: () => import('@/views/monitor/BrandIndex.vue'), meta: { group: '品牌印象', title: '工行品牌', bare: true } },
        { path: 'experEvalDataUpLoad', component: () => import('@/views/monitor/EvalUpload.vue'), meta: { group: '数据管理', title: '评价数据上传' } },
        { path: 'experEvalDesignUpLoad', component: () => import('@/views/monitor/DesignUpload.vue'), meta: { group: '数据管理', title: '设计工作情况上传' } },
        { path: 'experEvalDataAudit', component: () => import('@/views/monitor/EvalAudit.vue'), meta: { group: '数据管理', title: '评价数据审核' } },
        { path: 'productMeasureImg', component: () => import('@/views/monitor/MeasureImages.vue'), meta: { group: '数据管理', title: '体验度量图片' } }
      ]),

      section('voice', [
        { path: 'empAspirrations', component: () => import('@/views/voice/EmpVoice.vue'), meta: { title: '员工心声', bare: true } },
        { path: 'cusAllVoice', component: () => import('@/views/voice/CusAllVoice.vue'), meta: { group: '客户声音', title: '全部声音' } },
        { path: 'cusSupreme', component: () => import('@/views/voice/CusProduct.vue'), meta: { group: '客户声音', title: '产品声音', dynamicTitle: true } },
        { path: 'journeyVoiceAnalyze', component: () => import('@/views/voice/VoiceBoard.vue'), meta: { group: '智能分析', title: '声音看板', bare: true } },
        ...[
          ['voiceAnalyzeTool', '智能分析', '分析工具'], ['voiceJourneyStructure', '数据管理', '旅程结构管理'], ['voiceModelPrompt', '数据管理', '模型提示词管理'],
          ['voiceBoardData', '数据管理', '看板图表数据管理'], ['voiceReport', '数据管理', '统计报表'], ['voiceUpload', '数据管理', '用户声音上传'],
          ['voiceProductDomain', '数据管理', '产品领域管理'], ['voiceAlertReceiver', '数据管理', '实时监测收件人管理']
        ].map(([path, group, title]) => ({ path, component: () => import('@/views/common/Placeholder.vue'), meta: { group, title } }))
      ]),

      ...['system', 'admin'].map((key) => ({
        path: key,
        component: () => import('@/views/common/Placeholder.vue'),
        meta: { section: key }
      }))
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/mainIndex' }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

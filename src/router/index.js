import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import SectionLayout from '@/layouts/SectionLayout.vue'
import { persons } from '@/mock/system'
import { recordVisit } from '@/mock/vipVisits'
import { menuPathOf } from '@/config/menus'
import { currentUser } from '@/config/user'

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
        { path: 'manageExcel', component: () => import('@/views/experience/ManageReport.vue'), meta: { group: '优化建议', title: '管理报表' } },
        { path: 'suggestionDataBoard', component: () => import('@/views/experience/DataBoard.vue'), meta: { group: '优化建议', title: '数据看板' } },
        // 新增优化建议（路由为推测）；带 problemId 时为「待修改」的修改并重新提交
        {
          path: 'optimSuggestAdd',
          component: () => import('@/views/experience/SuggestAdd.vue'),
          meta: { title: '新增', parent: () => '/optimSuggestions', crumbs: (r) => ['体验问题', '优化建议', r.query.problemId ? '修改' : '新增'], dynamicTitle: false, pageTitle: (r) => (r.query.problemId ? '修改' : '新增') }
        },
        // 优化建议详情：problemId 为编号末 9 位流水号，currentMenuName 为来源菜单
        {
          path: 'optimSuggestDetail',
          component: () => import('@/views/experience/SuggestDetail.vue'),
          meta: { title: '详情', parent: (r) => menuPathOf('experience', r.query.currentMenuName || '全部列表'), crumbs: (r) => ['体验问题', r.query.currentMenuName || '全部列表', '详情'] }
        }
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
          path: 'agentTools',
          component: () => import('@/views/info/qc/AgentCreate.vue'),
          meta: { group: '体验质检', title: '质检智能体', crumbsWithSection: true, parent: () => '/agentFirst' }
        },
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
        { path: 'analyticsTools', component: () => import('@/views/voice/AnalyticsTools.vue'), meta: { group: '智能分析', title: '分析工具' } },
        { path: 'jouranalyManage', component: () => import('@/views/voice/JourneyStructure.vue'), meta: { group: '数据管理', title: '旅程结构管理' } },
        { path: 'tipsManage', component: () => import('@/views/voice/VoicePromptManage.vue'), meta: { group: '数据管理', title: '模型提示词管理' } },
        ...[
          ['boardManage', 'BoardChartData', '看板图表数据管理'], ['statisticsManage', 'StatReport', '统计报表'], ['customerSoundUpload', 'VoiceUpload', '用户声音上传'],
          ['productField', 'ProductDomain', '产品领域管理'], ['emailManage', 'AlertReceivers', '实时监测收件人管理']
        ].map(([path, comp, title]) => ({ path, component: () => import(`@/views/voice/data/${comp}.vue`), meta: { group: '数据管理', title } }))
      ]),

      section('system', [
        { path: 'personMaintenance', component: () => import('@/views/system/PersonList.vue'), meta: { title: '人员维护' } },
        {
          path: 'personMaintenanceAdd',
          component: () => import('@/views/system/PersonEdit.vue'),
          meta: { title: '新增', crumbsWithSection: true, parent: () => '/personMaintenance', dynamicEditTitle: true }
        },
        { path: 'productMaintenance', component: () => import('@/views/system/ProductMaintain.vue'), meta: { title: '产品维护' } },
        { path: 'carouseMaintenanceList', component: () => import('@/views/system/CarouselList.vue'), meta: { group: '首页维护', title: '轮播图维护' } },
        { path: 'sysOperation', component: () => import('@/views/system/SysOperation.vue'), meta: { title: '运营数据' } },
        { path: 'majorClient', component: () => import('@/views/system/VipData.vue'), meta: { title: '要客数据' } },
        {
          path: 'experEvaluationMaintenance',
          component: () => import('@/views/system/MonitorMaintain.vue'),
          meta: { title: '体验监测维护', titleTabs: [{ key: 'channel', label: '重点渠道' }, { key: 'product', label: '精品产品' }] }
        },
        { path: 'menuMaintenance', component: () => import('@/views/system/MenuMaintain.vue'), meta: { title: '菜单维护' } },
        { path: 'experienceProblemsMaintenance', component: () => import('@/views/system/ProblemMaintain.vue'), meta: { title: '体验问题维护' } }
      ]),

      section('admin', [
        { path: 'scheduleJobList', component: () => import('@/views/admin/ScheduleJobs.vue'), meta: { title: '定时任务' } },
        { path: 'genDictList', component: () => import('@/views/admin/DictList.vue'), meta: { title: '字典维护' } },
        { path: 'emailHistoryList', component: () => import('@/views/admin/EmailHistory.vue'), meta: { title: '邮件记录' } },
        { path: 'holidayList', component: () => import('@/views/admin/HolidayList.vue'), meta: { title: '节假日' } },
        { path: 'interfaceList', component: () => import('@/views/admin/InterfaceList.vue'), meta: { title: '接口权限' } },
        { path: 'log', component: () => import('@/views/admin/LogList.vue'), meta: { title: '日志管理' } }
      ]),

      // 「平台工具」一级菜单当前为冻结状态（菜单维护中可激活），截图未提供页面
      ...['tools'].map((key) => ({
        path: key,
        component: () => import('@/views/common/Placeholder.vue'),
        meta: { section: key }
      }))
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/mainIndex' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 要客访问记录：当前用户在「人员维护」中被标记为要客时记录访问
router.afterEach((to) => {
  const me = persons.find((p) => p.id === currentUser.id)
  if (me?.vip) recordVisit(me, to)
})

export default router

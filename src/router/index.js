import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import MainLayout from '@/layouts/MainLayout.vue'
import SectionLayout from '@/layouts/SectionLayout.vue'
import { persons } from '@/mock/system'
import { recordVisit } from '@/mock/vipVisits'
import { menuPathOf, menuTitleOf, pendingStatus } from '@/config/menus'
import { currentUser } from '@/config/user'
import { can } from '@/config/access'

// 板块：页面归属的一级板块（决定左侧导航高亮与面包屑）；路径与行内地址保持一致
const section = (key, children) => ({
  path: '',
  component: SectionLayout,
  props: { section: key },
  children: children.map((c) => ({ ...c, meta: { ...c.meta, section: key } }))
})

// 待办列表按状态需要不同岗位：2 待审批、3 待分拣、4/5 待答复与待跟进、6 待审核、7 待业务部门答复
const pendingFeature = (r) => ({ 2: 'suggest.approve', 3: 'suggest.sort', 4: 'suggest.reply', 5: 'suggest.reply', 6: 'suggest.audit', 7: 'suggest.business' })[r.query.suggestStatus]
const voiceData = (path, comp, title) => ({ path, component: () => import(`@/views/voice/data/${comp}.vue`), meta: { group: '数据管理', title, feature: 'voice.data' } })
const experiencer = (path, props, title, feature) => ({ path, component: () => import('@/views/experiencer/ExperiencerList.vue'), props, meta: { group: '体验官', title, feature } })

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/mainIndex',
    children: [
      { path: 'mainIndex', component: () => import('@/views/home/HomeIndex.vue'), meta: { section: 'home', title: '首页' } },

      section('suggest', [
        { path: 'optimSuggestAdd', component: () => import('@/views/experience/SuggestAdd.vue'), meta: { title: '提交优化建议', pageTitle: (r) => (r.query.problemId ? '修改优化建议' : '提交优化建议') } },
        { path: 'optimPending', component: () => import('@/views/experience/OptimPending.vue'), meta: { group: '我的待办', feature: pendingFeature, pageTitle: (r) => pendingStatus[r.query.suggestStatus] || '待审批' } },
        { path: 'mySubmit', component: () => import('@/views/experience/OptimSuggestions.vue'), props: { mode: 'mine' }, meta: { title: '我的提交' } },
        { path: 'myHandled', component: () => import('@/views/experience/OptimSuggestions.vue'), props: { mode: 'handled' }, meta: { title: '我已处理', feature: 'suggest.handled' } },
        { path: 'optimSuggestions', component: () => import('@/views/experience/OptimSuggestions.vue'), meta: { title: '全部优化建议' } },
        { path: 'experienceProblems', component: () => import('@/views/experience/ExperienceProblems.vue'), meta: { title: '研发阶段体验问题' } },
        { path: 'allView', component: () => import('@/views/experience/StatView.vue'), props: { mode: 'all' }, meta: { group: '统计视图', title: '整体视图', feature: 'suggest.stat' } },
        { path: 'productView', component: () => import('@/views/experience/StatView.vue'), props: { mode: 'product' }, meta: { group: '统计视图', title: '产品维度', feature: 'suggest.stat' } },
        { path: 'manageExcel', component: () => import('@/views/experience/ManageReport.vue'), meta: { title: '管理报表', feature: 'suggest.report' } },
        { path: 'suggestionDataBoard', component: () => import('@/views/experience/DataBoard.vue'), meta: { title: '数据看板', feature: 'suggest.board' } },
        // 优化建议详情：problemId 为编号末 9 位流水号，currentMenuName 为来源菜单
        {
          path: 'optimSuggestDetail',
          component: () => import('@/views/experience/SuggestDetail.vue'),
          meta: {
            title: '详情',
            parent: (r) => menuPathOf('suggest', r.query.currentMenuName || '全部优化建议'),
            crumbs: (r) => ['优化建议', menuTitleOf(r.query.currentMenuName || '全部优化建议'), '详情']
          }
        }
      ]),

      section('voice', [
        { path: 'journeyVoiceAnalyze', component: () => import('@/views/voice/VoiceBoard.vue'), meta: { title: '声音看板', feature: 'voice.board' } },
        { path: 'cusAllVoice', component: () => import('@/views/voice/CusAllVoice.vue'), meta: { group: '客户声音', title: '全部声音', feature: 'voice.view' } },
        { path: 'cusSupreme', component: () => import('@/views/voice/CusProduct.vue'), meta: { group: '客户声音', title: '产品声音', dynamicTitle: true, feature: 'voice.view' } },
        { path: 'empAspirrations', component: () => import('@/views/voice/EmpVoice.vue'), meta: { title: '员工心声' } },
        { path: 'jouranalyManage', component: () => import('@/views/voice/JourneyStructure.vue'), meta: { group: '数据管理', title: '旅程结构管理', feature: 'voice.data' } },
        voiceData('boardManage', 'BoardChartData', '看板图表数据管理'),
        voiceData('statisticsManage', 'StatReport', '统计报表'),
        voiceData('customerSoundUpload', 'VoiceUpload', '用户声音上传'),
        voiceData('productField', 'ProductDomain', '产品领域管理'),
        voiceData('emailManage', 'AlertReceivers', '实时监测收件人管理')
      ]),

      section('journey', [
        { path: 'journeysBoardConfig', component: () => import('@/views/info/journey/JourneyBoard.vue'), meta: { title: '灵犀旅程看板' } },
        { path: 'myJourney', component: () => import('@/views/info/journey/MyJourney.vue'), meta: { title: '灵犀旅程维护', feature: 'journey.manage' } },
        {
          path: 'userJourneyManagementNew',
          component: () => import('@/views/info/journey/JourneyManage.vue'),
          meta: {
            title: '灵犀旅程管理',
            feature: 'journey.manage',
            titleTabs: [{ key: 'basic', label: '旅程基本情况管理' }, { key: 'problems', label: '典型问题管理' }]
          }
        },
        { path: 'journeyModify', component: () => import('@/views/info/JourneyPending.vue'), props: { mode: 'modify' }, meta: { group: '待办工作', title: '待修改旅程', feature: 'journey.manage' } },
        { path: 'journeyExamine', component: () => import('@/views/info/JourneyPending.vue'), props: { mode: 'examine' }, meta: { group: '待办工作', title: '待审核旅程', feature: 'journey.manage' } },
        {
          path: 'myjourneyAdd',
          component: () => import('@/views/info/journey/JourneyEditor.vue'),
          meta: {
            title: '编辑旅程',
            feature: 'journey.manage',
            full: true,
            parent: (r) => (r.query.status === 'view' ? '/userJourneyManagementNew' : '/myJourney')
          }
        }
      ]),

      section('activity', [
        { path: 'activityPending', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'pending' }, meta: { group: '待办工作', title: '体验活动', feature: 'activity.approve' } },
        { path: 'noticePending', component: () => import('@/views/activity/NoticeList.vue'), props: { scope: 'pending' }, meta: { group: '待办工作', title: '体验公告', feature: 'notice.approve' } },
        { path: 'taskPending', component: () => import('@/views/activity/TaskList.vue'), props: { scope: 'pending' }, meta: { group: '待办工作', title: '体验任务' } },
        { path: 'headOfficeAllActivity', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'head' }, meta: { group: '体验活动', title: '总行体验活动' } },
        { path: 'branchAllActivity', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'branch' }, meta: { group: '体验活动', title: '分行体验活动' } },
        { path: 'myAllActivity', component: () => import('@/views/activity/ActivityList.vue'), props: { scope: 'mine' }, meta: { group: '体验活动', title: '我的体验活动' } },
        {
          path: 'activityAdd',
          component: () => import('@/views/activity/ActivityAdd.vue'),
          meta: { group: '体验活动', title: '新增体验活动', feature: 'activity.edit', parent: (r) => r.query.from || '/myAllActivity' }
        },
        { path: 'experTaskManage', component: () => import('@/views/activity/TaskList.vue'), props: { scope: 'manage' }, meta: { group: '体验任务', title: '体验管理任务', feature: 'task.manage' } },
        { path: 'myExperTask', component: () => import('@/views/activity/TaskList.vue'), props: { scope: 'mine' }, meta: { group: '体验任务', title: '我的体验任务' } },
        {
          path: 'taskAdd',
          component: () => import('@/views/activity/TaskAdd.vue'),
          // 子页面：面包屑为「分组 / 来源列表 / 新增」，左侧高亮来源列表
          meta: {
            group: '体验任务',
            title: '新增体验任务',
            feature: 'task.manage',
            parent: (r) => (r.query.taskListType === '1' ? '/experTaskManage' : '/myExperTask')
          }
        },
        { path: 'headOfficeAllNotice', component: () => import('@/views/activity/NoticeList.vue'), props: { scope: 'head' }, meta: { group: '体验公告', title: '总行体验公告' } },
        { path: 'branchAllNotice', component: () => import('@/views/activity/NoticeList.vue'), props: { scope: 'branch' }, meta: { group: '体验公告', title: '分行体验公告' } },
        { path: 'myAllNotice', component: () => import('@/views/activity/NoticeList.vue'), props: { scope: 'mine' }, meta: { group: '体验公告', title: '我的体验公告' } },
        {
          path: 'noticeAdd',
          component: () => import('@/views/activity/NoticeAdd.vue'),
          meta: {
            group: '体验公告',
            title: '新增体验公告',
            feature: 'notice.edit',
            pageTitle: (r) => (r.query.id ? '修改体验公告' : '新增体验公告'),
            parent: (r) => ({ 1: '/headOfficeAllNotice', 2: '/branchAllNotice' })[r.query.routeType] || '/myAllNotice'
          }
        },
        experiencer('headInsideExperManage', { kind: 'inside', level: 'head' }, '总行行内体验官', 'experiencer.head'),
        experiencer('headOfficeExperManage', { kind: 'outside', level: 'head' }, '总行行外体验官', 'experiencer.head'),
        experiencer('branchInsideExperManage', { kind: 'inside', level: 'branch' }, '分行行内体验官', ['experiencer.head', 'experiencer.branch']),
        experiencer('branchExperManage', { kind: 'outside', level: 'branch' }, '分行行外体验官', ['experiencer.head', 'experiencer.branch']),
        { path: 'nonStoredExperManage', component: () => import('@/views/experiencer/NonStored.vue'), meta: { group: '体验官', title: '非在库人员', feature: 'experiencer.head' } }
      ]),

      section('ai', [
        { path: 'analyticsTools', component: () => import('@/views/voice/AnalyticsTools.vue'), meta: { title: '声音分析智能工具' } },
        { path: 'agentFirst', component: () => import('@/views/info/qc/AgentList.vue'), meta: { title: '体验质检智能体', feature: 'qc.use' } },
        {
          path: 'agentTools',
          component: () => import('@/views/info/qc/AgentCreate.vue'),
          meta: { title: '新建质检', feature: 'qc.use', parent: () => '/agentFirst' }
        },
        {
          path: 'agentDetail',
          component: () => import('@/views/info/qc/AgentDetail.vue'),
          meta: { title: '质检报告', feature: 'qc.use', parent: () => '/agentFirst' }
        },
        { path: 'skills', component: () => import('@/views/ai/SkillList.vue'), meta: { title: '技能' } },
        { path: 'skillDetail', component: () => import('@/views/ai/SkillDetail.vue'), meta: { title: '技能详情', parent: () => '/skills', pageTitle: (r) => ({ bnx: '伴你想', bny: '帮你研' })[r.query.id] || '技能详情' } },
        { path: 'roleManagement', component: () => import('@/views/info/qc/RoleManage.vue'), meta: { group: '智能体管理', title: '质检智能体角色管理', feature: 'qc.manage' } },
        { path: 'agentTips', component: () => import('@/views/info/qc/PromptManage.vue'), meta: { group: '智能体管理', title: '质检智能体提示词管理', feature: 'qc.manage' } },
        { path: 'agentStatistic', component: () => import('@/views/info/qc/AgentStats.vue'), meta: { group: '智能体管理', title: '质检智能体统计', feature: 'qc.manage' } },
        { path: 'tipsManage', component: () => import('@/views/voice/VoicePromptManage.vue'), meta: { group: '智能体管理', title: '声音模型提示词管理', feature: 'voice.prompt' } }
      ]),

      section('monitor', [
        { path: 'experEvaluationIndex', component: () => import('@/views/monitor/BrandIndex.vue'), meta: { group: '品牌印象', title: '工行品牌', feature: 'monitor.view' } },
        { path: 'experEvalDataUpLoad', component: () => import('@/views/monitor/EvalUpload.vue'), meta: { group: '数据管理', title: '评价数据上传', feature: 'monitor.maintain' } },
        { path: 'experEvalDesignUpLoad', component: () => import('@/views/monitor/DesignUpload.vue'), meta: { group: '数据管理', title: '设计工作情况上传', feature: 'monitor.maintain' } },
        { path: 'experEvalDataAudit', component: () => import('@/views/monitor/EvalAudit.vue'), meta: { group: '数据管理', title: '评价数据审核', feature: 'monitor.maintain' } },
        { path: 'productMeasureImg', component: () => import('@/views/monitor/MeasureImages.vue'), meta: { group: '数据管理', title: '体验度量图片', feature: 'monitor.maintain' } }
      ]),

      section('knowledge', [
        { path: 'methodTraining', component: () => import('@/views/info/MethodTraining.vue'), meta: { title: '方法培训' } },
        { path: 'excellentReport', component: () => import('@/views/info/ExcellentReport.vue'), meta: { title: '体验研究' } },
        { path: 'experInformation', component: () => import('@/views/info/InfoManage.vue'), meta: { title: '资讯管理', feature: 'info.manage' } },
        {
          path: 'experInformationAdd',
          component: () => import('@/views/info/InfoAdd.vue'),
          meta: { title: '新增资讯', feature: 'info.manage', pageTitle: (r) => (r.query.id ? '修改资讯' : '新增资讯'), parent: () => '/experInformation' }
        }
      ]),

      section('system', [
        { path: 'personMaintenance', component: () => import('@/views/system/PersonList.vue'), meta: { title: '人员维护', feature: 'system' } },
        {
          path: 'personMaintenanceAdd',
          component: () => import('@/views/system/PersonEdit.vue'),
          meta: { title: '新增人员', feature: 'system', pageTitle: (r) => (r.query.id ? '修改人员' : '新增人员'), parent: () => '/personMaintenance' }
        },
        { path: 'productMaintenance', component: () => import('@/views/system/ProductMaintain.vue'), meta: { title: '产品维护', feature: 'system' } },
        { path: 'homeCardConfig', component: () => import('@/views/system/HomeCardConfig.vue'), meta: { group: '首页维护', title: '首页卡片配置', feature: 'system' } },
        { path: 'carouseMaintenanceList', component: () => import('@/views/system/CarouselList.vue'), meta: { group: '首页维护', title: '轮播图维护', feature: 'system' } },
        { path: 'sysOperation', component: () => import('@/views/system/SysOperation.vue'), meta: { title: '运营数据', feature: 'system' } },
        { path: 'majorClient', component: () => import('@/views/system/VipData.vue'), meta: { title: '要客数据', feature: 'system' } },
        {
          path: 'experEvaluationMaintenance',
          component: () => import('@/views/system/MonitorMaintain.vue'),
          meta: { title: '体验监测维护', feature: 'system', titleTabs: [{ key: 'channel', label: '重点渠道' }, { key: 'product', label: '精品产品' }] }
        },
        { path: 'menuMaintenance', component: () => import('@/views/system/MenuMaintain.vue'), meta: { title: '菜单维护', feature: 'system' } },
        { path: 'experienceProblemsMaintenance', component: () => import('@/views/system/ProblemMaintain.vue'), meta: { title: '体验问题维护', feature: 'system' } },
        { path: 'scheduleJobList', component: () => import('@/views/admin/ScheduleJobs.vue'), meta: { group: '后台管理', title: '定时任务', feature: 'admin' } },
        { path: 'genDictList', component: () => import('@/views/admin/DictList.vue'), meta: { group: '后台管理', title: '字典维护', feature: 'admin' } },
        { path: 'emailHistoryList', component: () => import('@/views/admin/EmailHistory.vue'), meta: { group: '后台管理', title: '邮件记录', feature: 'admin' } },
        { path: 'holidayList', component: () => import('@/views/admin/HolidayList.vue'), meta: { group: '后台管理', title: '节假日', feature: 'admin' } },
        { path: 'interfaceList', component: () => import('@/views/admin/InterfaceList.vue'), meta: { group: '后台管理', title: '接口权限', feature: 'admin' } },
        { path: 'log', component: () => import('@/views/admin/LogList.vue'), meta: { group: '后台管理', title: '日志管理', feature: 'admin' } }
      ]),

      // 「平台工具」一级菜单当前为冻结状态（菜单维护中可激活），截图未提供页面
      { path: 'tools', component: () => import('@/views/common/Placeholder.vue'), meta: { section: 'tools', title: '平台工具' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/mainIndex' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 权限：页面所需功能由岗位决定（config/access.js）；无权限时提示并回到首页
const featureOf = (r) => (typeof r.meta.feature === 'function' ? r.meta.feature(r) : r.meta.feature)
router.beforeEach((to) => {
  if (can(featureOf(to))) return true
  const name = (to.meta.pageTitle ? to.meta.pageTitle(to) : to.meta.title) || '该页面'
  ElMessage.warning(`当前身份没有「${name}」的使用权限，已返回首页`)
  return { path: '/mainIndex' }
})

// 要客访问记录：当前用户在「人员维护」中被标记为要客时记录访问
router.afterEach((to) => {
  const me = persons.find((p) => p.id === currentUser.id)
  if (me?.vip) recordVisit(me, to)
})

export default router

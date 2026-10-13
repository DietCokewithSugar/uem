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
        { path: 'journeyList', component: () => import('@/views/common/Placeholder.vue'), meta: { group: '灵犀旅程', title: '灵犀旅程' } },
        { path: 'qualityCheck', component: () => import('@/views/common/Placeholder.vue'), meta: { group: '体验质检', title: '体验质检' } }
      ]),

      ...['experiencer', 'monitor', 'voice', 'system', 'admin'].map((key) => ({
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

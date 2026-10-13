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
        { path: 'activityPending', component: () => import('@/views/activity/ActivityTable.vue'), props: { kind: 'activity' }, meta: { group: '待办工作', title: '体验活动' } },
        { path: 'taskPending', component: () => import('@/views/activity/ActivityTable.vue'), props: { kind: 'task' }, meta: { group: '待办工作', title: '体验任务' } },
        { path: 'activityApply', component: () => import('@/views/common/Placeholder.vue'), meta: { group: '体验活动', title: '活动申请' } },
        { path: 'activityList', component: () => import('@/views/activity/ActivityTable.vue'), props: { kind: 'activity' }, meta: { group: '体验活动', title: '活动列表' } },
        { path: 'taskList', component: () => import('@/views/activity/ActivityTable.vue'), props: { kind: 'task' }, meta: { group: '体验任务', title: '任务列表' } }
      ]),

      ...['info', 'experiencer', 'monitor', 'voice', 'system', 'admin'].map((key) => ({
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

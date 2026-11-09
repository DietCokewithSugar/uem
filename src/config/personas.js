// 演示身份：顶栏「切换演示身份」中可选的人员。每个身份对应「系统管理 · 人员维护」中的一名人员，
// 能看到的菜单、首页卡片和数据范围都由该人员的岗位决定（在人员维护中修改岗位后立即生效）。
// 本文件只放纯数据，供应用和路由巡检脚本（tests/e2e/smoke.mjs）共同读取。
export const personas = [
  { key: 'admin', personId: '001700001', title: '系统管理员', desc: '维护人员、产品、菜单等平台配置，演示环境中可查看全部功能' },
  { key: 'leader', personId: '001700110', title: '领导', desc: '业务研发四部负责人：审核答复，查看统计视图、管理报表和全量声音看板' },
  { key: 'business', personId: '001700101', title: '业务人员', desc: '个人手机银行产品线：分拣、答复和跟进优化建议，关注本领域的声音异动' },
  { key: 'branch', personId: '001820001', title: '分行用户', desc: '上海分行营业部员工：提交优化建议，查看资讯和方法培训，偶尔使用声音分析智能工具' },
  { key: 'branchApprover', personId: '001801001', title: '分行审批岗', desc: '上海分行营业部分行科技审核岗：审批本行员工提交的优化建议' },
  { key: 'ux', personId: '001700107', title: '体验管理岗', desc: '用户体验部：维护灵犀旅程、体验活动和资讯，分拣未分类产品的优化建议' }
]

export const DEFAULT_PERSONA = 'admin'
export const PERSONA_STORAGE_KEY = 'uem.persona'

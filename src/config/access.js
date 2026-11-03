// 权限：岗位决定功能是否可见，岗位上的数据范围决定看到哪些数据。
// 规则：功能在 FEATURES 中列出岗位的，需持有其中任一岗位；未列出的功能所有人可用。
// 岗位全集见「系统管理 · 人员维护」（mock/system.js 的 roleCatalog）。演示环境中「系统管理员」可查看全部功能。
import { computed } from 'vue'
import { persons } from '@/mock/system'
import { currentUser } from '@/config/user'

// 当前人员（人员维护中的记录）；不在人员目录中的用户视为无岗位的普通员工
export const me = computed(
  () => persons.find((p) => p.id === currentUser.id) || { id: currentUser.id, name: currentUser.name, org: currentUser.dept, roles: [], scopes: {}, status: '激活' }
)
export const hasRole = (...roles) => !!me.value.roles?.some((r) => roles.includes(r))
// 岗位上的数据范围，如 scopeOf('产品线处理岗', 'productLine') → '个人手机银行'
export const scopeOf = (role, key) => (hasRole(role) ? me.value.scopes?.[role]?.[key] || '' : '')
export const isAdmin = () => hasRole('系统管理员')

const HANDLERS = ['分行科技审核岗', '产品线分拣岗', '产品线处理岗', '产品线审核岗', '产品线审核岗（要客）', '总行业务部门处理岗']

// 功能 → 可使用的岗位（任一即可）
export const FEATURES = {
  // 优化建议：提交、我的提交、全部列表、方法与资讯对所有人开放
  'suggest.approve': ['分行科技审核岗'],
  'suggest.sort': ['产品线分拣岗'],
  'suggest.reply': ['产品线处理岗'],
  'suggest.audit': ['产品线审核岗', '产品线审核岗（要客）'],
  'suggest.business': ['总行业务部门处理岗'],
  'suggest.handled': HANDLERS,
  'suggest.export': ['优化建议批量导出权限'],
  'suggest.similarExport': ['相似优化建议导出权限'],
  'suggest.stat': ['统计视图查看权限'],
  'suggest.report': ['管理报表查看权限'],
  'suggest.board': ['优化建议数据看板'],
  'problem.export': ['体验问题批量导出权限'],
  // 用户声音：声音分析智能工具对所有人开放；全量声音数据与看板单独授权
  'voice.board': ['智能分析查看岗'],
  'voice.view': ['智能分析查看岗', '客户声音维护岗', '智能分析关键维护岗', '智能分析一般维护岗'],
  'voice.data': ['智能分析关键维护岗', '智能分析一般维护岗', '客户声音维护岗'],
  'voice.prompt': ['智能分析关键维护岗'],
  // 灵犀旅程：看板所有人可看
  'journey.manage': ['灵犀旅程管理岗'],
  // 体验活动：列表所有人可看，录入与审批按岗位
  'activity.edit': ['总行体验活动录入岗', '分行体验活动录入岗'],
  'activity.approve': ['总行体验活动审批岗', '分行体验活动审批岗'],
  'task.manage': ['体验任务录入岗', '体验任务审核岗'],
  'notice.edit': ['总行体验公告录入岗', '分行体验公告录入岗'],
  'notice.approve': ['总行体验公告审批岗', '分行体验公告审批岗'],
  'experiencer.head': ['总行体验员录入岗'],
  'experiencer.branch': ['分行体验员录入岗'],
  // 知识中心：方法培训、体验研究所有人可看
  'info.manage': ['体验资讯录入岗', '体验资讯审批岗'],
  // 体验监测
  'monitor.view': ['体验监测白名单', '体验评价维护岗'],
  'monitor.maintain': ['体验评价维护岗'],
  // AI 工具
  'qc.use': ['质检智能体使用岗', '质检智能体管理岗'],
  'qc.manage': ['质检智能体管理岗'],
  // 系统管理（含原后台管理）
  system: ['系统管理员'],
  admin: ['后台管理员']
}

export function can(feature) {
  if (!feature) return true
  const list = Array.isArray(feature) ? feature : [feature]
  if (isAdmin()) return true
  // 多个功能：任一可用即可
  return list.some((f) => {
    const roles = FEATURES[f]
    return !roles || hasRole(...roles)
  })
}

// 功能所需岗位的说明（无权限提示、首页卡片配置中展示）
export const rolesOf = (feature) => (Array.isArray(feature) ? feature : [feature]).flatMap((f) => FEATURES[f] || [])

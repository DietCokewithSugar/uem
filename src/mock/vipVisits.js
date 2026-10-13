// 要客访问记录：被标记为「要客」的人员访问平台页面时记录（一级 / 二级 / 三级菜单）
import { reactive } from 'vue'
import { topNav } from '@/config/menus'

const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

const seedPages = [
  ['首页', '', ''], ['用户声音', '智能分析', '分析工具'], ['体验监测', '品牌印象', '工行品牌'], ['体验问题', '待办工作', '待修改'],
  ['体验资讯', '灵犀旅程', '灵犀旅程看板'], ['体验资讯', '方法培训', ''], ['用户声音', '智能分析', '声音看板'], ['体验问题', '优化建议', '数据看板']
]
const seedPeople = [
  { id: '888801072', name: '冯志强', org: '业务研发中心总经理室' },
  { id: '888804729', name: '任雨平', org: '业务研发中心平台研发部' },
  { id: '888802315', name: '邵明远', org: '业务研发中心用户体验部' }
]
// 演示数据：近两个月的访问记录
export const vipVisits = reactive(
  Array.from({ length: 46 }, (_, i) => {
    const d = new Date(2026, 8, 21, 9, 3, 38)
    d.setMinutes(d.getMinutes() - i * 397 - (i % 7) * 13)
    const p = seedPeople[i === 0 ? 0 : i % 5 === 0 ? 2 : 1]
    const [l1, l2, l3] = seedPages[i === 0 ? 0 : i % seedPages.length]
    return { ...p, time: fmt(d), l1, l2, l3 }
  })
)

// 由路由信息推导菜单层级：一级=顶部板块；二级=分组（无分组时为页面）；三级=分组下的页面
export function menuLevels(route) {
  const l1 = topNav.find((n) => n.key === route.meta.section)?.title || ''
  if (!l1) return null
  if (route.meta.section === 'home') return ['首页', '', '']
  const title = route.meta.title || ''
  return route.meta.group ? [l1, route.meta.group, title] : [l1, title, '']
}

export function recordVisit(person, route) {
  const levels = menuLevels(route)
  if (!person || !levels) return
  const [l1, l2, l3] = levels
  const last = vipVisits[0]
  // 同一页面短时间内重复进入只记一次
  if (last && last.id === person.id && last.l1 === l1 && last.l2 === l2 && last.l3 === l3) return
  vipVisits.unshift({ id: person.id, name: person.name, org: person.org, time: fmt(new Date()), l1, l2, l3 })
}

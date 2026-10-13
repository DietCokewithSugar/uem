// 要客访问记录：被标记为「要客」的人员访问平台页面时记录（一级 / 二级 / 三级菜单）
import { reactive } from 'vue'
import { topNav, sideMenus } from '@/config/menus'
import { persons } from '@/mock/system'

const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

const seedPages = [
  ['首页', '', ''], ['用户声音', '智能分析', '分析工具'], ['体验监测', '品牌印象', '工行品牌'], ['体验问题', '待办工作', '待修改'],
  ['体验资讯', '灵犀旅程', '灵犀旅程看板'], ['体验资讯', '方法培训', ''], ['用户声音', '智能分析', '声音看板'], ['体验问题', '优化建议', '数据看板']
]
// 演示数据：取「人员维护」中已勾选要客标记的人员，生成近两个月的访问记录
const seedPeople = persons.filter((p) => p.vip).slice(0, 3)
export const vipVisits = reactive(
  seedPeople.length
    ? Array.from({ length: 46 }, (_, i) => {
        const d = new Date(2026, 8, 21, 9, 3, 38)
        d.setMinutes(d.getMinutes() - i * 397 - (i % 7) * 13)
        const p = seedPeople[i === 0 ? 0 : i % 5 === 0 ? 2 % seedPeople.length : 1 % seedPeople.length]
        const [l1, l2, l3] = seedPages[i === 0 ? 0 : i % seedPages.length]
        return { id: p.id, name: p.name, org: p.org, time: fmt(d), l1, l2, l3 }
      })
    : []
)

// 在左侧菜单中查找当前页面对应的菜单项：路径一致，且菜单项的 query 参数全部吻合；
// 参数不吻合时取同路径的第一个菜单项（如产品声音缺省 productId）
function findMenuItem(section, path, query) {
  const hits = []
  for (const g of sideMenus[section] || []) {
    if (g.path === path) hits.push({ group: null, item: g })
    for (const c of g.children || []) if (c.path === path) hits.push({ group: g, item: c })
  }
  const exact = hits.find(({ item }) => Object.entries(item.query || {}).every(([k, v]) => String(query[k] ?? '') === String(v)))
  return exact || hits[0]
}

// 由路由信息推导菜单层级：一级=顶部板块；二级=分组（无分组时为页面）；三级=分组下的页面
// 子页面（如人员新增）记在其所属的菜单项下
export function menuLevels(route) {
  const l1 = topNav.find((n) => n.key === route.meta.section)?.title || ''
  if (!l1) return null
  if (route.meta.section === 'home') return ['首页', '', '']
  const path = route.meta.parent ? route.meta.parent(route) : route.path
  const hit = findMenuItem(route.meta.section, path, route.meta.parent ? {} : route.query)
  if (hit) return hit.group ? [l1, hit.group.title, hit.item.title] : [l1, hit.item.title, '']
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

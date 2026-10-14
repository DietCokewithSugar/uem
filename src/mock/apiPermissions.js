// 后台管理 · 接口权限演示数据：按「请求URI + 请求方法」控制后端接口的访问；前 2 条与截图一致，人员均为虚构
// allowUsers / denyUsers 为统一认证号列表，roles 为角色名称（取自人员维护的角色目录）
import { reactive } from 'vue'

export const apiMethods = ['GET', 'POST', 'PUT', 'DELETE']

let seq = 0
const R = (uri, desc, method, allowUsers, denyUsers, roles, status) => ({ id: `api${++seq}`, uri, desc, method, allowUsers, denyUsers, roles, status })
export const apiPermissions = reactive([
  R('/icbc/uem-server/log', '接口', 'GET', ['001700106'], [], [], '开启'),
  R('/icbc/uem-server/log', '问卷批量日志', 'GET', ['001700107'], [], [], '关闭')
])

export const newApiPermission = (data) => ({ id: `api${Date.now().toString(36)}${++seq}`, ...data })

// 访问校验：取 URI、方法一致且开启的规则；无规则则放行。
// 命中任一规则的禁止用户则拒绝；命中任一规则的允许用户，或拥有任一规则所列权限（角色）则放行；其余拒绝
export function canAccess(uri, method, user) {
  const rules = apiPermissions.filter((r) => r.status === '开启' && r.uri === uri && r.method === method)
  if (!rules.length) return true
  if (rules.some((r) => r.denyUsers.includes(user.id))) return false
  return rules.some((r) => r.allowUsers.includes(user.id) || r.roles.some((x) => (user.roles || []).includes(x)))
}

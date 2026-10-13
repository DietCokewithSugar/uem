// 体验问题维护：体验问题模块功能开关及应用范围；「相似度」供优化建议新增时检测相似建议
import { reactive } from 'vue'
import { currentUser } from '@/config/user'
import { persons } from './system'
import { orgs } from './index'

// scopeType：'' 无应用范围；'org-role-person' 机构 / 岗位 / 人员；'product' 产品
// desc 为功能说明（推测，原系统截图未展示）
const F = (name, on, desc, scopeType = '', scope = {}) => ({ id: name, name, on, desc, scopeType, scope })
export const problemFeatures = reactive([
  F('手机号录入行外体验员', false, '开启后录入行外体验员时可使用手机号作为唯一标识，无需统一认证号'),
  F('相似度', true, '提交优化建议时自动检索相似建议并提示提交人，减少重复提交', 'org-role-person', {
    orgs: [],
    roles: [],
    persons: [currentUser.id, '001700106', '001700107']
  }),
  F('溯源分析', true, '对应用范围内产品的优化建议进行问题溯源分析', 'product', {
    products: ['个人手机银行基础业务', '工银e生活', '企业网上银行']
  }),
  F('沟通业务部门', true, '处理优化建议时可发起与总行业务部门的线上沟通'),
  F('FTP上传', false, '附件通过 FTP 服务器上传与存储，关闭时使用平台文件服务'),
  F('新系统登录', true, '用户通过新统一认证系统登录平台'),
  F('用户机构同步-数据库', false, '定时从人力资源数据库同步用户及机构信息')
])

// 白名单用户列表：该功能暂未启用，保持为空
export const whitelistUsers = reactive([])

// 机构下拉：人员所属机构 + 提出机构
export const scopeOrgs = [...new Set([...persons.map((p) => p.org), ...orgs])]

export const getFeature = (name) => problemFeatures.find((f) => f.name === name)

// 应用范围文本，如「机构:未选 岗位:未选 人员:系统管理员,孙若曦」
const joinOr = (list) => (list?.length ? list.join(',') : '未选')
export function scopeText(f) {
  const s = f.scope || {}
  if (f.scopeType === 'org-role-person') {
    const names = (s.persons || []).map((id) => persons.find((p) => p.id === id)?.name || id)
    return `机构:${joinOr(s.orgs)} 岗位:${joinOr(s.roles)} 人员:${joinOr(names)}`
  }
  if (f.scopeType === 'product') return `产品:${joinOr(s.products)}`
  return ''
}

// 用户是否在应用范围内：三项均未选 = 全部用户；否则任一项命中即可
export function inScope(f, user = currentUser) {
  if (f.scopeType !== 'org-role-person') return true
  const { orgs: o = [], roles = [], persons: ids = [] } = f.scope || {}
  if (!o.length && !roles.length && !ids.length) return true
  const p = persons.find((x) => x.id === user.id)
  const org = p?.org || user.dept
  return ids.includes(user.id) || o.includes(org) || (p?.roles || []).some((r) => roles.includes(r))
}

// 功能对当前用户是否生效
export const featureActive = (name, user = currentUser) => {
  const f = getFeature(name)
  return !!f && f.on && inScope(f, user)
}

// ===== 文本相似度：字符二元组 Jaccard =====
const normalize = (t) => String(t ?? '').replace(/【[^】]{1,4}】/g, '').replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase()
function grams(t) {
  const s = normalize(t)
  if (s.length < 2) return new Set(s ? [s] : [])
  const set = new Set()
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2))
  return set
}
const jaccard = (A, B) => {
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const g of A) if (B.has(g)) inter++
  return inter / (A.size + B.size - inter)
}
export const textSimilarity = (a, b) => jaccard(grams(a), grams(b))

export const SIMILAR_THRESHOLD = 0.35
// 返回最相似的若干条 [{ item, score }]，同分时优先同一产品
export function findSimilar(text, list, { product = '', threshold = SIMILAR_THRESHOLD, limit = 3 } = {}) {
  const A = grams(text)
  if (!A.size) return []
  return list
    .map((item) => ({ item, score: jaccard(A, grams(item.desc)) }))
    .filter((x) => x.score >= threshold)
    .sort((x, y) => y.score - x.score || (y.item.product === product) - (x.item.product === product))
    .slice(0, limit)
}

// 体验监测维护：重点渠道 / 精品产品字典，变更同步至「评价数据上传」
import { reactive } from 'vue'
import { evalUploads, premiumProducts } from './monitor'

export const maintTabs = {
  channel: { label: '重点渠道', column: '重点渠道监测', exportAll: true },
  product: { label: '精品产品', column: '精品产品评价', exportAll: false }
}
const tabOfColumn = Object.fromEntries(Object.entries(maintTabs).map(([k, v]) => [v.column, k]))

// 精品产品 → 产品维护中的对应产品，无合适项留空
const premiumProductMap = {
  工银e办公: '工银e办公',
  工银e生活: '工银e生活',
  企业手机银行: '企业手机银行基础业务',
  柜面通: '柜面通',
  数字人民币: '数字人民币',
  个人养老金: '个人养老金',
  融e借: '个人贷款',
  薪酬通: '薪酬通',
  云网点: '云网点',
  '融e行-投资理财': '个人手机银行基础业务',
  '融e行-信用卡': '个人信用卡',
  企业网上银行: '企业网银基础业务'
}

const item = (tab, name, product, i) => ({ id: `${tab}-${i + 1}`, name, product, homeRank: false, status: '激活', sort: i + 1 })
export const monitorItems = reactive({
  channel: [
    ['融e行-个人手机银行', '个人手机银行基础业务'],
    ['工银e生活', '工银e生活'],
    ['企业网上银行', '企业网银基础业务']
  ].map(([n, p], i) => item('channel', n, p, i)),
  product: premiumProducts.map((n, i) => item('product', n, premiumProductMap[n] || '', i))
})

export const sortedItems = (tab) => [...monitorItems[tab]].sort((a, b) => a.sort - b.sort)
const uploadRow = (tab, name) => evalUploads.find((r) => r.column === maintTabs[tab].column && r.product === name)

// 评价数据上传：冻结的重点渠道 / 精品产品不再展示
export function isUploadVisible(row) {
  const tab = tabOfColumn[row.column]
  return !tab || !monitorItems[tab].some((i) => i.name === row.product && i.status === '冻结')
}

// 同步顺序：上传表中同栏目的行按维护排序重排；精品产品下拉只保留激活项
function sync(tab) {
  const { column } = maintTabs[tab]
  const order = sortedItems(tab).map((i) => i.name)
  const idx = evalUploads.reduce((acc, r, i) => (r.column === column ? [...acc, i] : acc), [])
  const rank = (r) => (order.includes(r.product) ? order.indexOf(r.product) : order.length)
  idx.map((i) => evalUploads[i]).sort((a, b) => rank(a) - rank(b)).forEach((r, k) => (evalUploads[idx[k]] = r))
  if (tab === 'product') premiumProducts.splice(0, premiumProducts.length, ...sortedItems('product').filter((i) => i.status === '激活').map((i) => i.name))
}

export function addItem(tab, data) {
  const list = monitorItems[tab]
  const row = { ...data, id: `${tab}-${Date.now()}`, status: '激活', sort: Math.max(0, ...list.map((i) => i.sort)) + 1 }
  list.push(row)
  if (!uploadRow(tab, row.name)) {
    const { column, exportAll } = maintTabs[tab]
    // 插在同栏目最后一行之后
    const last = evalUploads.reduce((acc, r, i) => (r.column === column ? i : acc), -1)
    const upload = { id: Math.max(0, ...evalUploads.map((r) => r.id)) + 1, column, product: row.name, updater: '', updateTime: '', exportAll, files: [] }
    evalUploads.splice(last < 0 ? evalUploads.length : last + 1, 0, upload)
  }
  sync(tab)
  return row
}

export function updateItem(tab, row, data) {
  if (data.name !== row.name) {
    const upload = uploadRow(tab, row.name)
    if (upload) upload.product = data.name
  }
  Object.assign(row, data)
  sync(tab)
}

export function toggleItem(tab, row) {
  row.status = row.status === '冻结' ? '激活' : '冻结'
  sync(tab)
}

// 与相邻行交换排序号
export function swapItems(tab, a, b) {
  const s = a.sort
  a.sort = b.sort
  b.sort = s
  sync(tab)
}

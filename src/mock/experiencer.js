// 体验员演示数据：姓名、统一认证号均为虚构
import { reactive } from 'vue'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seeded(2026)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (a, b) => a + Math.floor(rand() * (b - a + 1))

const surnames = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦许何吕施张孔曹严华金魏陶姜'.split('')
const given = '博伟鑫灿钧文一川思远雨桐嘉怡俊杰诗琪明轩若曦晨阳佳琪志强宏涛德生'.split('')
const fakeName = () => pick(surnames) + pick(given) + (rand() > 0.4 ? pick(given) : '')

export const regionTree = [
  { label: '上海', children: [{ label: '上海市', children: ['徐汇区', '普陀区', '长宁区', '松江区', '浦东新区', '静安区'].map((label) => ({ label })) }] },
  { label: '北京', children: [{ label: '北京市', children: ['海淀区', '朝阳区', '西城区', '东城区'].map((label) => ({ label })) }] },
  { label: '浙江', children: [{ label: '杭州市', children: ['西湖区', '上城区', '滨江区'].map((label) => ({ label })) }, { label: '宁波市', children: ['海曙区', '鄞州区'].map((label) => ({ label })) }] },
  { label: '江苏', children: [{ label: '南京市', children: ['鼓楼区', '玄武区'].map((label) => ({ label })) }, { label: '苏州市', children: ['姑苏区', '工业园区'].map((label) => ({ label })) }] },
  { label: '广东', children: [{ label: '广州市', children: ['天河区', '越秀区'].map((label) => ({ label })) }, { label: '深圳市', children: ['福田区', '南山区'].map((label) => ({ label })) }] }
]
export const orgTree = [
  { label: '上海分行', children: [
    { label: '长宁支行', children: ['中山广场支行', '新华路支行', '天山路支行'].map((label) => ({ label })) },
    { label: '松江支行', children: ['广富林路支行', '新松江路支行'].map((label) => ({ label })) },
    { label: '浦东开发区支行', children: ['北蔡支行', '张江支行'].map((label) => ({ label })) }
  ] },
  { label: '北京分行', children: [{ label: '海淀支行', children: ['中关村支行', '学院路支行'].map((label) => ({ label })) }] },
  { label: '浙江分行', children: [{ label: '杭州西湖支行', children: ['文三路支行', '黄龙支行'].map((label) => ({ label })) }] },
  { label: '江苏分行', children: [{ label: '南京鼓楼支行', children: ['湖南路支行'].map((label) => ({ label })) }] },
  { label: '业务研发中心', children: [{ label: '用户体验部', children: [] }, { label: '业务研发一部', children: [] }] }
]
const pickPath = (tree, depth = 3) => {
  const path = []
  let nodes = tree
  for (let i = 0; i < depth && nodes?.length; i++) {
    const n = pick(nodes)
    path.push(n.label)
    nodes = n.children
  }
  return path
}

export const genders = ['男', '女']
export const jobLevels = ['个人客户经理助理', '对公客户经理（一级）', '对公客户经理（二级）', '助理客服经理', '客服经理', '网点负责人', '产品经理', '业务经理']
export const yesNo = ['是', '否']
export const bankChannels = ['个人手机银行', '企业手机银行', '个人网上银行', '企业网上银行', '工银e生活', '智能柜台', '柜面']
export const bankBusinesses = ['存款', '贷款', '理财', '基金', '贵金属', '信用卡', '外汇', '养老金', '代发工资', '对公结算']
export const peerBanks = ['建设银行', '农业银行', '中国银行', '交通银行', '招商银行', '其他']
export const officerLevels = ['初级', '中级', '高级']
export const personStatus = ['在库', '冻结', '退出']
export const educations = ['高中及以下', '大专', '本科', '硕士', '博士']
export const industries = ['金融', '互联网', '制造业', '教育', '医疗', '政府机关', '个体经营', '学生', '退休']
export const outsideAttrs = ['个人客户', '对公客户', '潜在客户']
export const outsideTypes = ['普通体验员', '专项体验员']
export const stars = ['一星', '二星', '三星', '四星', '五星']
export const ratings = ['A', 'B', 'C', 'D']

const code9 = () => String(int(1000000, 1999999)).padStart(9, '0')
const ym = (y0, y1) => `${int(y0, y1)}-${String(int(1, 12)).padStart(2, '0')}`

// 体验员活动记录（详情抽屉展示）
const activityNames = ['手机银行搜索体验走查', '个人养老金开户可用性测试', '企业手机银行经营入口调研', '贵金属购买流程众测', '适老化专区体验评估']
const makeActivities = (n) =>
  Array.from({ length: n }, () => ({ name: pick(activityNames), time: `2026-${String(int(1, 9)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`, score: int(60, 100) }))

const insideRow = (level) => {
  const acts = rand() > 0.6 ? makeActivities(int(1, 4)) : []
  const region = ['上海', '上海市', pick(['徐汇区', '普陀区', '长宁区', '松江区', '浦东新区'])]
  const org = pickPath(orgTree.slice(0, 1))
  return {
    id: code9(),
    kind: '行内',
    level,
    name: fakeName(),
    gender: pick(genders),
    age: int(22, 50),
    region,
    org,
    jobLevel: pick(jobLevels),
    workTime: ym(2015, 2025),
    isOutlet: rand() > 0.3 ? '是' : '否',
    channels: [pick(bankChannels)],
    businesses: [...new Set([pick(bankBusinesses), pick(bankBusinesses)])],
    peer: pick(peerBanks),
    officerLevel: acts.length > 2 ? '中级' : '初级',
    status: '在库',
    activities: acts
  }
}

// 截图中：总行行内/行外、分行行外为空；分行行内有数据
export const insideExperiencers = reactive(Array.from({ length: 36 }, () => insideRow('分行')).sort((a, b) => b.workTime.localeCompare(a.workTime)))
export const outsideExperiencers = reactive([])

// 非在库人员：曾参与活动但未入库
export const nonStored = reactive(
  Array.from({ length: 28 }, () => {
    const acts = int(1, 26)
    return {
      kind: rand() > 0.15 ? '行内' : '行外',
      name: fakeName(),
      id: code9(),
      gender: rand() > 0.1 ? pick(genders) : '',
      age: rand() > 0.15 ? int(24, 56) : '',
      org: pick(['浙江分行', '山西分行', '业务研发中心', '黑龙江分行', '江西分行', '河北分行', '安徽分行', '上海分行', '江苏分行']),
      activityCount: acts,
      totalScore: acts * int(5, 45),
      lastTime: `2026-${String(int(1, 9)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`
    }
  })
)

// 异步导出任务（「查看结果」）
export const exportTasks = reactive([])

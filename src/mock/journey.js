// 灵犀旅程（用户旅程地图）演示数据：人员均为虚构
import { reactive } from 'vue'
import { currentUser } from '@/config/user'

// 状态流转：待编辑旅程结构 →(提交) 待审核 →(通过) 已发布旅程结构 / (退回) 待修改 →(再提交) 待审核
export const journeyStatuses = ['待编辑旅程结构', '待审核', '待修改', '已发布旅程结构']
// 以下选项为推测
export const journeyTypes = ['用户旅程', '员工旅程', '业务流程旅程']
export const journeyScenes = ['其他', '销售贵金属产品', '问卷数据统计', '登录认证', '转账汇款', '开户', '查询服务', '签到签退', '贷款申请']

// 人员目录（用于旅程管理员 / 维护员搜索）
export const staff = [
  { id: currentUser.id, name: currentUser.name, dept: currentUser.dept },
  { id: 'demo0101', name: '林思远', dept: '业务研发中心业务研发四部' },
  { id: 'demo0102', name: '周可欣', dept: '业务研发中心业务研发四部' },
  { id: 'demo0103', name: '陈嘉怡', dept: '业务研发中心业务研发六部' },
  { id: 'demo0104', name: '吴雨桐', dept: '业务研发中心业务研发六部' },
  { id: 'demo0105', name: '郑明轩', dept: '业务研发中心业务研发一部' },
  { id: 'demo0106', name: '孙若曦', dept: '业务研发中心用户体验部' },
  { id: 'demo0107', name: '何晨阳', dept: '业务研发中心用户体验部' },
  { id: 'demo0108', name: '许诗琪', dept: '业务研发中心业务研发二部' },
  { id: 'demo0109', name: '冯浩然', dept: '业务研发中心业务研发三部' }
]
const person = (id) => staff.find((s) => s.id === id)

let seq = 0
export const uid = (p = 'b') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`

// 空白旅程地图
export function createEmptyMap() {
  const b = uid()
  return {
    arrow: 'chevron',
    behaviors: [{ id: b, name: '' }],
    touchpoints: [{ role: '用户', cells: {} }],
    drivers: [],
    metrics: [
      { category: '主观态度', rows: [{ cells: {} }] },
      { category: '行为交易', rows: [{ cells: {} }] },
      { category: '声音问题', rows: [{ cells: {} }] }
    ],
    problems: {},
    optimizations: []
  }
}

// 示例：已发布的「工银问卷数据分析旅程」
function sampleSurveyMap() {
  const ids = ['s1', 's2', 's3', 's4', 's5']
  const names = ['登录问卷平台', '选择问卷项目', '查看回收数据', '交叉分析', '导出报告']
  const cells = (arr) => Object.fromEntries(ids.map((id, i) => [id, arr[i]]))
  const metric = (arr) => Object.fromEntries(ids.map((id, i) => [id, arr[i]]))
  return {
    arrow: 'chevron',
    behaviors: ids.map((id, i) => ({ id, name: names[i] })),
    touchpoints: [
      { role: '用户', cells: cells(['统一认证登录页', '项目列表', '数据概览页', '分析配置页', '报告下载']) },
      { role: '系统', cells: cells(['工银问卷平台', '工银问卷平台', '数据服务', '分析引擎', '文件服务']) }
    ],
    drivers: [
      { label: '业务诉求', cells: cells(['定期查看问卷结果', '定位目标项目', '掌握回收进度', '挖掘人群差异', '向领导汇报']) }
    ],
    metrics: [
      { category: '主观态度', rows: [{ cells: metric([{ name: '满意度', value: '4.2', unit: '分' }, { name: '满意度', value: '4.0', unit: '分' }, { name: '满意度', value: '3.6', unit: '分' }, { name: '满意度', value: '3.1', unit: '分' }, { name: '满意度', value: '3.8', unit: '分' }]) }] },
      { category: '行为交易', rows: [{ cells: metric([{ name: '成功率', value: '98', unit: '%' }, { name: '平均耗时', value: '25', unit: '秒' }, { name: '访问量', value: '1.2万', unit: '次' }, { name: '完成率', value: '62', unit: '%' }, { name: '导出量', value: '3400', unit: '次' }]) }] },
      { category: '声音问题', rows: [{ cells: metric([{ name: '声音数', value: '6', unit: '条' }, { name: '声音数', value: '9', unit: '条' }, { name: '声音数', value: '14', unit: '条' }, { name: '声音数', value: '27', unit: '条' }, { name: '声音数', value: '11', unit: '条' }]) }] }
    ],
    problems: {
      s2: [{ id: 'p1', text: '项目较多时难以检索，缺少按创建人筛选', voices: 9, status: '已处理' }],
      s3: [{ id: 'p2', text: '回收数据刷新不及时，需手动刷新', voices: 8, status: '待处理' }],
      s4: [
        { id: 'p3', text: '交叉分析配置步骤多，非专业人员难以上手', voices: 19, status: '待处理' },
        { id: 'p4', text: '分析结果图表无法自定义配色', voices: 5, status: '待处理' }
      ],
      s5: [{ id: 'p5', text: '导出报告格式固定，无法直接用于汇报', voices: 11, status: '待处理' }]
    },
    optimizations: [
      { label: '优化方向', cells: cells(['', '增加多维筛选', '数据实时推送', '提供分析模板与 AI 解读', '支持自定义报告模板']) }
    ]
  }
}

const mk = (code, name, product, scene, adminId, maintainerIds, status, createTime, map) => {
  const admin = person(adminId)
  return {
    id: code,
    name,
    product,
    scene,
    type: '用户旅程',
    adminId,
    maintainerIds,
    adminDept: admin.dept,
    status,
    createTime,
    updateTime: status === '已发布旅程结构' ? createTime : '',
    reviewer: status === '已发布旅程结构' ? admin.name : '',
    reviewComment: '',
    creatorId: maintainerIds[0],
    map: map || createEmptyMap()
  }
}

export const journeys = reactive([
  mk('2104467969531289601', '个人手机银行搜索旅程', '个人手机银行基础业务', '其他', 'demo0101', ['demo0102'], '待编辑旅程结构', '2026-09-28'),
  mk('2103023019161657346', '实物贵金属手机银行购买贵金属产品', '实物贵金属', '销售贵金属产品', 'demo0103', ['demo0103', 'demo0104'], '待编辑旅程结构', '2026-09-24'),
  mk('2101865474380374017', '柜面通柜员签到签退', '柜面通', '其他', 'demo0105', ['demo0105'], '待编辑旅程结构', '2026-09-21'),
  mk('2079025728441643010', '工银问卷数据分析旅程', '工银问卷', '问卷数据统计', 'demo0106', ['demo0106', 'demo0107'], '已发布旅程结构', '2026-07-20', sampleSurveyMap())
])

// 旅程群组人员展示：管理员（管理员）、维护员…
export const memberText = (j) => {
  const admin = person(j.adminId)
  const rest = j.maintainerIds.map((id) => person(id)?.name).filter(Boolean)
  return [admin ? `${admin.name}（管理员）` : '', ...rest].filter(Boolean).join('、')
}
export const personName = (id) => person(id)?.name || ''
export const creatorName = (j) => personName(j.creatorId)

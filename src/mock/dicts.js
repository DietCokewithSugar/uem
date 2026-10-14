// 后台管理 · 字典维护：平台下拉框、单选项等枚举值的统一来源
// 字典类型 + 字典编码唯一；页面通过 dictOptions(type) 取「开启」的字典值，按排序升序
// 已接入：XB（体验员新增/修改的性别）、EXPER_CHANNEL / EXPER_METHOD / WORK_LINK（新增体验活动）
// 其余类型由各模块的枚举生成，与页面选项保持一致，暂停后暂不影响页面
import { reactive, computed } from 'vue'
import { expChannels, expMethods, bizDomains, activityStatuses, sources, adoptResults, taskStatuses, infoTypes, trainingForms, reportTypes, reportLevels, journeyTypes } from './index'
import { educations, industries, personStatus, jobLevels, yesNo } from './experiencer'
import { voiceSources, emotions } from './voice'
import { emailTypes } from './emailTypes'
import { apiMethods } from './apiPermissions'
import { holidayTypes } from './holidays'

// [字典类型, 字典描述, 字典编码, 字典值, 字典默认值, 备注, 排序, 状态]（与截图首页一致）
const seed = [
  ['XB', '性别', '0', '男', '', '性别', 0, '开启'],
  ['XB', '性别', '1', '女', '', '性别', 1, '开启'],
  ['WORK_LINK', '活动阶段', '1', '配合细化立项方案', '配合细化立项方案', '创意阶段', 1, '开启'],
  ['WORK_LINK', '活动阶段', '2', '立项可行性评估', '立项可行性评估', '立项阶段', 2, '开启'],
  ['WORK_LINK', '活动阶段', '3', '需求方案编写', '需求方案编写', '需求阶段', 3, '开启'],
  ['WORK_LINK', '活动阶段', '4', '需求编写', '需求编写', '需求阶段', 4, '开启'],
  // 推测补全：截图中字典值被截断为「常态化用户体验资…」
  ['WORK_LINK', '活动阶段', '5', '常态化用户体验资讯报送', '常态化用户体验资讯报送', '日常工作', 5, '关闭'],
  // 推测补全：截图中字典值被截断为「开发中心组织开展…」
  ['WORK_LINK', '活动阶段', '6', '开发中心组织开展体验走查', '开发中心组织开展体验走查', '开发阶段', 6, '开启'],
  ['WORK_LINK', '活动阶段', '7', '验收及适应性测试', '验收及适应性测试', '测试阶段', 7, '开启'],
  ['WORK_LINK', '活动阶段', '8', '运营阶段', '运营阶段', '运营阶段', 8, '开启']
]

// 由枚举数组生成一组字典：编码默认为 1 起的流水号，默认值同字典值（withDefault: false 时为空）
const group = (type, desc, values, remark, { codes, withDefault = true } = {}) =>
  values.map((value, i) => [type, desc, codes ? codes[i] : String(i + 1), value, withDefault ? value : '', remark, i + 1, '开启'])

const more = [
  ...group('EXPER_CHANNEL', '体验渠道', expChannels, '体验活动'),
  ...group('EXPER_METHOD', '体验方法', expMethods, '体验活动'),
  ...group('BIZ_DOMAIN', '业务领域', bizDomains, '体验活动'),
  ...group('ACTIVITY_STATUS', '活动状态', activityStatuses, '体验活动'),
  ...group('TASK_STATUS', '任务状态', taskStatuses, '体验任务'),
  ...group('SUGGEST_SOURCE', '建议来源', sources, '优化建议'),
  ...group('ADOPT_RESULT', '采纳结果', adoptResults, '优化建议'),
  ...group('VOICE_SOURCE', '声音来源', voiceSources, '用户声音'),
  ...group('EMOTION', '情感倾向', emotions, '用户声音'),
  ...group('INFO_TYPE', '资讯类型', infoTypes, '体验资讯'),
  ...group('TRAINING_FORM', '培训形式', trainingForms, '方法培训'),
  ...group('REPORT_TYPE', '报告类型', reportTypes, '优秀报告'),
  ...group('REPORT_LEVEL', '报告级别', reportLevels, '优秀报告'),
  ...group('JOURNEY_TYPE', '旅程类型', journeyTypes, '灵犀旅程'),
  ...group('JOB_LEVEL', '职务层级', jobLevels, '行内体验员'),
  ...group('EDUCATION', '教育程度', educations, '行外体验员'),
  ...group('INDUSTRY', '所属行业', industries, '行外体验员'),
  ...group('PERSON_STATUS', '人员状态', personStatus, '体验员'),
  ...group('SF', '是否', yesNo, '通用', { codes: ['1', '0'], withDefault: false }),
  ...group('EMAIL_TYPE', '邮件类型', emailTypes.map((t) => t.label), '邮件记录，编码为邮件模板编码', { codes: emailTypes.map((t) => t.code) }),
  ...group('REQUEST_METHOD', '请求方法', apiMethods, '接口管理', { codes: apiMethods, withDefault: false }),
  ...group('HOLIDAY_TYPE', '假期类型', holidayTypes, '节假日')
]

export const dicts = reactive(
  [...seed, ...more].map(([type, desc, code, value, defaultValue, remark, sort, status], i) => ({ id: i + 1, type, desc, code, value, defaultValue, remark, sort, status }))
)

// 字典类型（按首次出现顺序），描述取该类型第一条
export const dictTypes = computed(() => {
  const map = new Map()
  for (const x of dicts) if (!map.has(x.type)) map.set(x.type, x.desc)
  return [...map].map(([type, desc]) => ({ type, desc, label: `${type}（${desc}）` }))
})

// 某字典类型下开启的字典值，按排序升序
export const dictOptions = (type) =>
  dicts
    .filter((x) => x.type === type && x.status === '开启')
    .sort((a, b) => a.sort - b.sort)
    .map(({ code, value, defaultValue }) => ({ code, value, defaultValue }))

export const newDict = (data) => ({ ...data, id: Math.max(0, ...dicts.map((x) => x.id)) + 1 })

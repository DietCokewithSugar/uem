// 后台管理 · 节假日：非工作日清单（周六、周日 + 法定节假日，扣除调休上班日）
// 定时任务中按工作日执行的任务（如待办超期提醒邮件）据此跳过非工作日
import { reactive, computed } from 'vue'
import { statutoryHolidays, makeupWorkdays } from './holidayCalendar'

const pad = (n) => String(n).padStart(2, '0')
export const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const weekNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
// 'YYYY-MM-DD' 对应的星期
export const weekNameOf = (date) => {
  const [y, m, d] = date.split('-').map(Number)
  return weekNames[new Date(y, m - 1, d).getDay()]
}

// 新增时可选的假期类型
export const holidayTypes = ['星期六', '星期日', '元旦', '春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节', '其他']

function build() {
  const map = new Map()
  for (let d = new Date(2019, 0, 1); d <= new Date(2026, 11, 31); d.setDate(d.getDate() + 1)) {
    const w = d.getDay()
    if (w === 0 || w === 6) map.set(fmtDate(d), weekNames[w])
  }
  for (const { date, name } of statutoryHolidays) map.set(date, name)
  for (const date of makeupWorkdays) map.delete(date)
  return [...map].map(([date, type]) => ({ date, type })).sort((a, b) => (a.date < b.date ? 1 : -1))
}

// 按放假日期倒序
export const holidays = reactive(build())
const dateSet = computed(() => new Set(holidays.map((h) => h.date)))

const dayOf = (date) => (typeof date === 'string' ? date.slice(0, 10) : fmtDate(date))
export const isHoliday = (date) => dateSet.value.has(dayOf(date))
export const isWorkday = (date) => !isHoliday(date)

// 新增一天非工作日，保持倒序；返回插入位置，已存在时返回 -1
export function addHoliday(date, type) {
  if (isHoliday(date)) return -1
  const i = holidays.findIndex((h) => h.date < date)
  const at = i < 0 ? holidays.length : i
  holidays.splice(at, 0, { date, type })
  return at
}

// 删除后该日按工作日处理
export function removeHoliday(date) {
  const i = holidays.findIndex((h) => h.date === date)
  if (i >= 0) holidays.splice(i, 1)
  return i >= 0
}

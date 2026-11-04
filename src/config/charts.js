// 图表配色与常用图形（全站共用，规范见 DESIGN.md「数据图表」）
// 分类色取自数据可视化默认色板，按固定顺序使用，相邻两色在常见色觉异常下也能区分（已用校验脚本检查）。
// 规则：
// 1. 一组数据只用一种颜色（第 1 色），不按数值大小或名次换色；
// 2. 有轻重先后的类别（如问题分级）用同一色相由深到浅；
// 3. 红色只表示风险和警示，不作为普通数据色；不用渐变、不用表情图标；
// 4. 数量和比率不共用一张图的左右两个纵轴，比率另起一行小图。
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']
export const BLUE = SERIES[0]
// 序数色阶（深 → 浅），用于「一级 / 二级 / 三级」这类有顺序的类别
export const ORDINAL = ['#1c5cab', '#3987e5', '#86b6ef']
// 状态色：只在表示好坏时使用，必须同时配文字（如「高度压力」），不单靠颜色区分
export const STATUS = { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' }

export const INK = '#1f2329'
export const INK_2 = '#464c57'
export const INK_3 = '#6b7280'
export const LINE = '#e3e6ea'
export const LINE_2 = '#eef0f3'
export const SURFACE = '#ffffff'
export const FONT = "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif"

const pct = (v, total) => (total ? Math.round((v / total) * 1000) / 10 : 0)

// 横向排行条形图：类别名称较长或需要比较大小时使用。
// rows: [{ name, value }]；sort 按数值降序；limit 超出部分合并为「其他」；colorOf(name) 可为每类指定颜色（如序数色阶）
// share 为 false 时提示框不显示占比（数值本身是评分或比率时）
export function rankBarOption(rows, { unit = '条', sort = true, limit = 10, keepZero = false, colorOf, showPct = false, share = true, labelWidth = 120 } = {}) {
  let list = keepZero ? [...rows] : rows.filter((d) => d.value > 0)
  if (sort) list.sort((a, b) => b.value - a.value)
  if (limit && list.length > limit) {
    const rest = list.slice(limit - 1).reduce((n, d) => n + d.value, 0)
    list = [...list.slice(0, limit - 1), { name: '其他', value: rest }]
  }
  const total = list.reduce((n, d) => n + d.value, 0)
  const few = list.length <= 4 // 类别很少时把条形收拢到中间，避免稀疏
  const text = (v) => (showPct ? `${v}（${pct(v, total)}%）` : `${v}`)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(31, 35, 41, 0.04)' } }, formatter: (ps) => `${ps[0].name}：${ps[0].value}${unit ? ' ' + unit : ''}${share ? `（${pct(ps[0].value, total)}%）` : ''}` },
    grid: { left: 4, right: showPct ? 84 : 44, top: few ? '18%' : 6, bottom: few ? '18%' : 6, containLabel: true },
    xAxis: { type: 'value', show: false, max: (v) => v.max || 1 },
    yAxis: {
      type: 'category', inverse: true, data: list.map((d) => d.name),
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: INK_2, fontSize: 12, width: labelWidth, overflow: 'truncate' }
    },
    series: [{
      type: 'bar', barWidth: few ? 14 : 10,
      itemStyle: { color: BLUE, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', color: INK_2, fontSize: 12, formatter: (p) => text(p.value) },
      data: list.map((d) => (colorOf ? { value: d.value, itemStyle: { color: colorOf(d.name) } } : d.value))
    }]
  }
}

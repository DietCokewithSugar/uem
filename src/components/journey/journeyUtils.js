import { exportCsv } from '@/components/exportCsv'
import { memberText, personName } from '@/mock/journey'

// 旅程中全部典型问题（扁平化，带所属行为）
export function problemsOf(j) {
  return j.map.behaviors.flatMap((b) =>
    (j.map.problems[b.id] || []).map((p) => ({ ...p, problem: p, journey: j, behavior: b.name || '（未命名行为）' }))
  )
}

// 旅程基本信息导出
export const journeyColumns = [
  { prop: 'id', label: '编号' }, { prop: 'name', label: '旅程名称' }, { prop: 'product', label: '所属产品' },
  { prop: 'scene', label: '场景/功能' }, { prop: 'members', label: '旅程群组人员' }, { prop: 'adminDept', label: '旅程管理员部门' },
  { prop: 'status', label: '当前状态' }, { prop: 'createTime', label: '创建时间' }, { prop: 'updateTime', label: '更新时间' },
  { prop: 'reviewer', label: '审核人' }
]
export const exportJourneys = (list, name = '灵犀旅程') =>
  exportCsv(name, journeyColumns, list.map((j) => ({ ...j, members: memberText(j) })))

// 导出明细：每个旅程每个行为一行
export function exportJourneyDetail(list) {
  const rows = list.flatMap((j) =>
    j.map.behaviors.map((b) => ({
      name: j.name,
      behavior: b.name,
      touch: j.map.touchpoints.map((t) => `${t.role}：${t.cells[b.id] || ''}`).join('；'),
      drivers: j.map.drivers.map((d) => d.cells[b.id]).filter(Boolean).join('；'),
      metrics: j.map.metrics
        .flatMap((m) => m.rows.map((r) => r.cells[b.id]).filter((c) => c?.name).map((c) => `${m.category}-${c.name}${c.value}${c.unit}`))
        .join('；'),
      problems: (j.map.problems[b.id] || []).map((p) => p.text).join('；'),
      optimizations: j.map.optimizations.map((o) => o.cells[b.id]).filter(Boolean).join('；')
    }))
  )
  exportCsv('灵犀旅程明细', [
    { prop: 'name', label: '旅程名称' }, { prop: 'behavior', label: '旅程行为' }, { prop: 'touch', label: '触点' },
    { prop: 'drivers', label: '驱动因素' }, { prop: 'metrics', label: '体验指标' }, { prop: 'problems', label: '典型问题' },
    { prop: 'optimizations', label: '优化点' }
  ], rows)
}

export function exportProblems(list) {
  exportCsv('典型问题明细', [
    { prop: 'journeyName', label: '旅程名称' }, { prop: 'behavior', label: '旅程行为' }, { prop: 'text', label: '典型问题' },
    { prop: 'voices', label: '关联用户声音数' }, { prop: 'status', label: '状态' }
  ], list.map((p) => ({ ...p, journeyName: p.journey.name })))
}

export const reviewerName = personName

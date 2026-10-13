// 前端导出 CSV（带 BOM，Excel 可直接打开中文）
export function exportCsv(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [columns.map((c) => c.label), ...rows.map((r) => columns.map((c) => r[c.prop]))]
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + lines.map((l) => l.map(esc).join(',')).join('\n')], { type: 'text/csv' }))
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// 前端导出 CSV（带 BOM，Excel 可直接打开中文）
// 以 0 开头的纯数字（如统一认证号 001700001）写成 ="…"，避免 Excel 去掉前导 0
export function exportCsv(filename, columns, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /^0\d+$/.test(s) ? `"=""${s}"""` : `"${s.replace(/"/g, '""')}"`
  }
  const lines = [columns.map((c) => c.label), ...rows.map((r) => columns.map((c) => r[c.prop]))]
  const d = new Date()
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + lines.map((l) => l.map(esc).join(',')).join('\n')], { type: 'text/csv' }))
  a.download = `${filename}_${day}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  // 延迟释放，避免浏览器尚未开始下载时链接失效（文件名丢失）
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

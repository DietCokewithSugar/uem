<!-- 统计报表 #/statisticsManage：按创建时间下载三类统计数据 -->
<template>
  <div class="uem-card">
    <el-tabs v-model="tab" class="tabs">
      <el-tab-pane label="用户声音看板报表" name="board" />
      <el-tab-pane label="智能分析工具报表" name="tools" />
      <el-tab-pane label="时点和月度压力值数据" name="pressure" />
    </el-tabs>
    <div class="bar">
      <span>创建时间</span>
      <el-date-picker v-model="range" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="请选择开始时间" end-placeholder="请选择截止时间" class="range" />
      <el-button type="primary" @click="download">下载</el-button>
      <el-button @click="range = []">重置</el-button>
    </div>
    <p class="desc">{{ descs[tab] }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { exportCsv } from '@/components/exportCsv'
import { voices, boardData, boardMonths, realtime, pressureLevels } from '@/mock/voice'
import { toolTasks, toolDefs } from '@/mock/voiceTools'

const tab = ref('board')
const range = ref([])
const descs = {
  board: '按产品、功能栏目统计用户声音数量、负面占比与平均情绪指数。',
  tools: '统计各智能分析工具的使用次数、处理行数与处理状态。',
  pressure: '导出时点（每 3 小时）UVSI 值与月度压力指数等级。'
}
const inRange = (d) => !range.value?.length || (d >= range.value[0] && d <= range.value[1])
const C = (...labels) => labels.map((label, i) => ({ prop: String(i), label }))
const R = (rows) => rows.map((r) => Object.fromEntries(r.map((v, i) => [String(i), v])))

function download() {
  let name, cols, rows
  if (tab.value === 'board') {
    const m = {}
    voices.filter((v) => inRange(v.time.slice(0, 10))).forEach((v) => {
      const x = (m[`${v.product}|${v.column}`] ||= { p: v.product, c: v.column, n: 0, neg: 0, s: 0 })
      x.n++
      x.s += v.score
      if (v.score < 0) x.neg++
    })
    name = '用户声音看板报表'
    cols = C('产品', '功能栏目', '声音数量', '负面声音数', '负面占比', '平均情绪指数')
    rows = Object.values(m).map((x) => [x.p, x.c, x.n, x.neg, `${Math.round((x.neg / x.n) * 100)}%`, (x.s / x.n).toFixed(2)])
  } else if (tab.value === 'tools') {
    name = '智能分析工具报表'
    cols = C('工具名称', '使用次数', '处理行数', '已完成任务')
    rows = toolDefs.map((t) => {
      const list = toolTasks.filter((k) => k.tool === t.key && inRange(k.time.slice(0, 10)))
      return [t.name, list.length, list.reduce((n, k) => n + k.source.length, 0), list.filter((k) => k.status === '处理完成').length]
    })
  } else {
    name = '时点和月度压力值数据'
    cols = C('类型', '时间', 'UVSI值/压力等级')
    rows = [
      ...realtime.uvsi.map((v, i) => ['时点', `2026-10-${10 + Math.floor((i * 3 + 3) / 24)} ${String((i * 3 + 3) % 24).padStart(2, '0')}:00`, v]),
      ...boardMonths.map((m, i) => ['月度', m, pressureLevels[boardData.pressureTrend[i]]])
    ]
  }
  if (!rows.length) return ElMessage.warning('所选时间范围内暂无数据')
  exportCsv(name, cols, R(rows))
}
</script>

<style scoped>
.tabs { max-width: 600px; margin: 0 auto; }
.tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.bar { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 16px; font-size: 14px; color: #555; }
.bar .el-button + .el-button { margin-left: 0; }
.range { max-width: 560px; }
.desc { text-align: center; color: #999; font-size: 12px; margin-top: 16px; }
</style>

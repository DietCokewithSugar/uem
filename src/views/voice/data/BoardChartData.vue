<!-- 看板图表数据管理 #/boardManage：维护声音看板中需人工导入的图表数据 -->
<template>
  <div class="uem-card">
    <el-table :data="boardCharts">
      <el-table-column prop="id" label="序号" width="70" />
      <el-table-column prop="column" label="栏目" width="200" />
      <el-table-column prop="name" label="图表名称" min-width="260" />
      <el-table-column prop="updater" label="更新人" width="120" />
      <el-table-column prop="time" label="更新时间" width="170" />
      <el-table-column label="操作" width="230">
        <template #default="{ row }">
          <el-upload :show-file-list="false" action="#" :auto-upload="false" accept=".csv,.xls,.xlsx" :on-change="(f) => upload(row, f)" class="inline">
            <el-button link type="primary">上传</el-button>
          </el-upload>
          <template v-if="row.exportAll">
            <el-button link type="primary" @click="download(row, false)">下载</el-button>
            <el-button link type="primary" @click="download(row, true)">导出全部</el-button>
            <el-tooltip content="导出该图表历次上传的全部数据"><el-icon class="tip"><InfoFilled /></el-icon></el-tooltip>
          </template>
          <template v-else>
            <el-button link type="primary" @click="download(row, false)">下载模板</el-button>
            <el-button link type="primary" @click="download(row, true)">导出数据</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pager" layout="total, prev, pager, next" :total="boardCharts.length" />
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { boardCharts } from '@/mock/voiceTools'
import { boardData, boardMonths } from '@/mock/voice'
import { exportCsv } from '@/components/exportCsv'
import { nowText } from '@/mock/qc'
import { currentUser } from '@/config/user'

// 各图表的数据口径（导出时使用当前看板数据）
const sources = {
  1: { cols: ['银行', '月份', '用户声音数量'], rows: () => ['工商银行', '建设银行', '农业银行', '中国银行', '招商银行'].flatMap((b, i) => boardMonths.map((m, j) => [b, m, Math.round(boardData.validTrend[j] * (1 - i * 0.15))])) },
  2: { cols: ['月份', '情绪指数等级'], rows: () => boardMonths.map((m, i) => [m, ['高度负面', '中度负面', '轻度负面', '中性', '正面'][boardData.emotionTrend[i]]]) },
  3: { cols: ['月份', '压力指数等级'], rows: () => boardMonths.map((m, i) => [m, ['极轻微压力', '轻度压力', '中度压力', '中高度压力', '高度压力'][boardData.pressureTrend[i]]]) },
  4: { cols: ['序号', '重要典型问题'], rows: () => boardData.problems.map((p, i) => [i + 1, p]) }
}
function download(row, withData) {
  const s = sources[row.id]
  const cols = s.cols.map((label, i) => ({ prop: String(i), label }))
  const rows = withData ? s.rows().map((r) => Object.fromEntries(r.map((v, i) => [String(i), v]))) : []
  exportCsv(`${row.name}${withData ? '' : '_模板'}`, cols, rows)
}
function upload(row, file) {
  Object.assign(row, { updater: currentUser.name, time: nowText() })
  ElMessage.success(`「${file.name}」已上传，声音看板「${row.name}」将使用新数据`)
}
</script>

<style scoped>
.inline { display: inline-block; margin-right: 12px; }
.tip { color: #bbb; margin-left: 4px; vertical-align: middle; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

<!-- 批量导出 / 异步导出 / 查看结果：异步导出生成任务，「查看结果」中下载 -->
<template>
  <template v-if="compact">
    <!-- 声音看板样式：批量导出即提交异步任务 -->
    <el-button @click="exportAsync">批量导出</el-button>
    <el-button @click="visible = true">查看导出结果</el-button>
  </template>
  <template v-else>
    <el-button :type="primaryExport ? 'primary' : 'default'" @click="exportNow">批量导出</el-button>
    <el-button @click="exportAsync">异步导出</el-button>
    <el-button @click="visible = true">查看结果</el-button>
  </template>

  <el-dialog v-model="visible" title="导出结果" width="640px">
    <el-table :data="tasks" empty-text="暂无导出任务">
      <el-table-column prop="name" label="文件名称" min-width="200" />
      <el-table-column prop="count" label="记录数" width="80" />
      <el-table-column prop="time" label="提交时间" width="170" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }"><span :class="row.done ? 'ok' : 'wait'">{{ row.done ? '已完成' : '处理中' }}</span></template>
      </el-table-column>
      <el-table-column label="操作" width="70">
        <template #default="{ row }"><el-button link type="primary" :disabled="!row.done" @click="download(row)">下载</el-button></template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { exportCsv } from './exportCsv'
import { exportTasks } from '@/mock/experiencer'
import { nowText } from '@/mock/qc'

const props = defineProps({
  name: { type: String, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  primaryExport: Boolean,
  compact: Boolean
})

const visible = ref(false)
const tasks = computed(() => exportTasks.filter((t) => t.name.startsWith(props.name)))
const exportNow = () => exportCsv(props.name, props.columns, props.rows)

function exportAsync() {
  const task = { name: `${props.name}_${nowText().replace(/[-: ]/g, '')}`, count: props.rows.length, time: nowText(), done: false, rows: [...props.rows] }
  exportTasks.unshift(task)
  setTimeout(() => (task.done = true), 1500)
  ElMessage.success(`导出任务已提交，可在「${props.compact ? '查看导出结果' : '查看结果'}」中下载`)
}
const download = (t) => exportCsv(t.name, props.columns, t.rows)
</script>

<style scoped>
.ok { color: #3c9a5f; }
.wait { color: #e6a23c; }
</style>

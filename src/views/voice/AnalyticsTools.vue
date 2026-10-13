<!-- 分析工具 #/analyticsTools：上传用户声音文件，由智能模型批量处理 -->
<template>
  <div class="tools">
    <div v-for="t in toolDefs" :key="t.key" class="tool" :class="t.theme" @click="open(t)">
      <div class="icon"><el-icon><component :is="t.icon" /></el-icon></div>
      <div class="info">
        <div class="name">{{ t.name }}</div>
        <div class="desc">{{ t.desc }}</div>
      </div>
      <div class="deco" />
    </div>

    <el-dialog v-model="visible" :title="`${current?.name.replace(/（.*）/, '')}模型`" width="860px">
      <template v-if="current">
        <h4><i class="dot" />模型简介</h4>
        <p class="txt">{{ current.desc }}</p>
        <h4><i class="dot" />操作指南</h4>
        <ol class="txt guide">
          <li>点击下载模板；</li>
          <li>将需要分析的内容粘贴到模板中，一行代表一条声音；"文本编号"和"文本内容"为必填项；</li>
          <li>点击导入数据，系统将对上传的文件内容进行智能分析；</li>
          <li>在查看导出结果中，等待分析完成即可下载分析结果数据。</li>
        </ol>
        <p class="warn">请勿上传包含敏感信息的文件。若包含敏感信息，系统将自动进行脱敏处理。</p>
        <p class="warn">因当前模型资源限制，现支持在每日8:00至18:00期间上传5次，单次不超过10000行。</p>
        <p class="hint">
          演示环境说明：仅支持 CSV（模板格式），在浏览器内以规则模拟模型处理，文件不会上传到任何服务器。
          使用提示词：<router-link :to="'/tipsManage'" class="uem-link">{{ current.prompt }}</router-link>
        </p>

        <div class="btns">
          <el-button plain type="primary" @click="downloadTemplate">下载模板</el-button>
          <el-upload :show-file-list="false" action="#" :auto-upload="false" accept=".csv" :on-change="onFile" class="inline">
            <el-button type="primary">导入数据</el-button>
          </el-upload>
          <el-button type="primary" @click="showTasks = true">查看导出结果</el-button>
          <el-button link type="primary" @click="runSample">使用示例数据试一试</el-button>
          <span class="quota">今日剩余次数：{{ 5 - usedToday }}</span>
        </div>

        <el-table v-if="showTasks" :data="tasks" size="small" empty-text="暂无分析任务">
          <el-table-column prop="name" label="文件名称" min-width="260" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }"><span :class="row.status === '处理完成' ? 'ok' : 'wait'">{{ row.status }}</span></template>
          </el-table-column>
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column label="操作" width="110">
            <template #default="{ row }">
              <el-button link type="primary" :disabled="row.status !== '处理完成'" @click="download(row)">下载</el-button>
              <el-button link type="primary" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
          <el-table-column label="原始数据" width="80">
            <template #default="{ row }"><el-button link type="primary" @click="downloadSource(row)">下载</el-button></template>
          </el-table-column>
        </el-table>

        <template v-if="preview">
          <h4><i class="dot" />结果预览（{{ preview.name }}，共 {{ preview.rows.length }} 行）</h4>
          <el-table :data="preview.rows.slice(0, 8)" size="small" max-height="300">
            <el-table-column v-for="k in previewCols" :key="k" :prop="k" :label="k" :min-width="k.includes('内容') || k.includes('举例') || k.includes('问题') ? 220 : 100" show-overflow-tooltip />
          </el-table>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { toolDefs, toolTasks, runTool, sampleRows, desensitize } from '@/mock/voiceTools'
import { exportCsv } from '@/components/exportCsv'
import { parseCsv } from '@/components/parseCsv'
import { nowText } from '@/mock/qc'

const visible = ref(false)
const current = ref(null)
const showTasks = ref(true)
const preview = ref(null)
const tasks = computed(() => toolTasks.filter((t) => t.tool === current.value?.key))
const usedToday = computed(() => tasks.value.filter((t) => t.time.startsWith(nowText().slice(0, 10)) && t.counted).length)
const previewCols = computed(() => Object.keys(preview.value?.rows[0] || {}))

function open(t) {
  current.value = t
  preview.value = null
  visible.value = true
}

const templateCols = [{ prop: 'id', label: '文本编号' }, { prop: 'text', label: '文本内容' }]
const downloadTemplate = () => exportCsv(`${current.value.name}_模板`, templateCols, sampleRows.slice(0, 2))

function process(name, rows, counted = true) {
  if (counted && usedToday.value >= 5) return ElMessage.warning('今日上传次数已用完（每日 5 次）')
  if (rows.length > 10000) return ElMessage.warning('单次不超过 10000 行')
  if (!rows.length) return ElMessage.warning('文件中没有可分析的数据')
  const clean = rows.map((r) => ({ ...r, text: desensitize(r.text) }))
  const masked = clean.filter((r, i) => r.text !== rows[i].text).length
  const stamp = nowText().replace(/-/g, '').replace(' ', '_').replace(/:/g, '')
  const task = { tool: current.value.key, name: `${stamp}_${current.value.name.replace(/（.*）/, '')}分析结果.csv`, status: '处理中', time: nowText(), rows: [], source: clean, counted }
  toolTasks.unshift(task)
  showTasks.value = true
  ElMessage.success(`已导入 ${rows.length} 条，正在智能分析${masked ? `（已自动脱敏 ${masked} 条）` : ''}`)
  setTimeout(() => {
    task.rows = runTool(current.value.key, clean)
    task.status = '处理完成'
    preview.value = task
  }, 900)
}

function onFile(file) {
  if (!/\.csv$/i.test(file.name)) return ElMessage.warning('演示环境仅支持 CSV 格式，请先下载模板')
  const reader = new FileReader()
  reader.onload = () => {
    const [head = [], ...body] = parseCsv(reader.result)
    const iId = head.findIndex((h) => h.includes('编号'))
    const iText = head.findIndex((h) => h.includes('内容'))
    if (iId < 0 || iText < 0) return ElMessage.error('模板缺少「文本编号」或「文本内容」列')
    process(file.name, body.map((r) => ({ id: r[iId], text: r[iText] || '' })).filter((r) => r.id && r.text))
  }
  reader.readAsText(file.raw, 'utf-8')
}
const runSample = () => process('示例数据', sampleRows, false)

const toCols = (rows) => Object.keys(rows[0] || {}).map((k) => ({ prop: k, label: k }))
const download = (t) => (t.rows.length ? exportCsv(t.name.replace(/\.\w+$/, ''), toCols(t.rows), t.rows) : ElMessage.info('该历史任务无结果数据（演示）'))
const downloadSource = (t) => exportCsv(`${t.name.replace(/\.\w+$/, '')}_原始数据`, templateCols, t.source)
async function remove(t) {
  await ElMessageBox.confirm('确认删除该分析任务？', '提示', { type: 'warning' })
  toolTasks.splice(toolTasks.indexOf(t), 1)
  if (preview.value === t) preview.value = null
}
</script>

<style scoped>
.tools { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 8px 20px; }
.tool { position: relative; overflow: hidden; display: flex; align-items: center; gap: 20px; padding: 26px 24px; border-radius: 8px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.tool:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); }
.icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 26px; flex-shrink: 0; }
.info { position: relative; z-index: 1; padding-right: 90px; }
.name { font-size: 17px; color: #333; margin-bottom: 8px; }
.desc { font-size: 12px; color: #888; }
.deco { position: absolute; right: -10px; bottom: -20px; width: 120px; height: 90px; border-radius: 50%; opacity: 0.35; }
.green { background: linear-gradient(90deg, #edf8f0, #dff3e6); } .green .icon, .green .deco { background: linear-gradient(135deg, #5fcf7f, #34a853); }
.teal { background: linear-gradient(90deg, #eaf7f8, #d9f0f2); } .teal .icon, .teal .deco { background: linear-gradient(135deg, #49c6d6, #2f9fc4); }
.blue { background: linear-gradient(90deg, #ecf3fc, #dce9f8); } .blue .icon, .blue .deco { background: linear-gradient(135deg, #5aa6f0, #2f6fe0); }
.purple { background: linear-gradient(90deg, #f1effb, #e4e0f6); } .purple .icon, .purple .deco { background: linear-gradient(135deg, #9b8af0, #6b55c9); }
.red { background: linear-gradient(90deg, #fdeeee, #f9dfdf); } .red .icon, .red .deco { background: linear-gradient(135deg, #f58a8a, #e8545c); }
.orange { background: linear-gradient(90deg, #fdf3e6, #f9e6cc); } .orange .icon, .orange .deco { background: linear-gradient(135deg, #f7b955, #f08a3c); }
h4 { margin: 14px 0 6px; display: flex; align-items: center; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #f08a8f; display: inline-block; }
.txt { color: #555; font-size: 13px; margin: 0 0 4px 18px; line-height: 1.8; }
.guide { padding-left: 18px; }
.warn { color: var(--uem-red); font-size: 13px; margin: 4px 0 0 18px; }
.hint { color: #888; font-size: 12px; margin: 8px 0 0 18px; }
.btns { display: flex; align-items: center; gap: 10px; margin: 16px 0 12px 18px; }
.btns .el-button + .el-button { margin-left: 0; }
.inline { display: inline-block; }
.quota { color: #999; font-size: 12px; margin-left: auto; }
.ok { color: #3c9a5f; }
.wait { color: #e6a23c; }
</style>

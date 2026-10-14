<!-- 后台管理 · 定时任务 #/scheduleJobList：平台各模块的同步、统计、提醒类定时任务（Quartz cron） -->
<template>
  <div>
    <div class="uem-card filter">
      <span>关键字</span>
      <el-input v-model="form.kw" clearable placeholder="服务类 / 方法名 / 描述" style="width: 420px" @keyup.enter="search" />
      <span class="gap" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div ref="cardRef" class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
      <el-table :data="rows" class="jobs">
        <el-table-column type="index" label="序列" width="48" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="服务类" min-width="150">
          <template #default="{ row }"><template v-for="(seg, k) in camel(row.beanName)" :key="k">{{ seg }}<wbr /></template></template>
        </el-table-column>
        <el-table-column label="方法名" min-width="120">
          <template #default="{ row }"><template v-for="(seg, k) in camel(row.methodName)" :key="k">{{ seg }}<wbr /></template></template>
        </el-table-column>
        <el-table-column prop="params" label="方法参数" width="92" />
        <el-table-column label="cron表达式" width="168">
          <template #default="{ row }">
            <el-tooltip placement="top" :show-after="200">
              <template #content>
                <div class="tip-title">{{ row.status === '已启动' ? '接下来的触发时间' : '启动后的触发时间' }}</div>
                <div v-for="t in fires(row.cron, 5)" :key="+t">{{ nowText(t) }}</div>
              </template>
              <div class="cron-cell">
                <code>{{ row.cron }}</code>
                <div v-if="row.status === '已启动'" class="next">下次 {{ nextText(row.cron) }}</div>
                <div v-else class="next muted">暂停中，不触发</div>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="描述" min-width="170" />
        <el-table-column label="状态" width="62">
          <template #default="{ row }"><span :class="row.status === '已启动' ? 'on' : 'off'">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column label="操作" :width="wideOps ? 244 : 128" fixed="right">
          <template #default="{ row }">
            <div class="ops">
              <template v-if="row.status === '已暂停'">
                <el-button link type="primary" @click="toggle(row)">启动</el-button>
              </template>
              <template v-else>
                <el-button link type="primary" @click="toggle(row)">暂停</el-button>
                <el-button link type="primary" :loading="running.has(row.id)" @click="runNow(row)">立刻执行</el-button>
                <el-button link type="primary" @click="open(row)">修改</el-button>
              </template>
              <el-button link type="primary" @click="showLogs(row)">查看日志</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>

    <el-dialog v-model="dialog" :title="editing ? '修改定时任务' : '新增定时任务'" width="640px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="100px">
        <el-form-item label="服务类" prop="beanName"><el-input v-model="d.beanName" placeholder="Spring Bean 名称，如 sysUserServiceImpl" /></el-form-item>
        <el-form-item label="方法名" prop="methodName"><el-input v-model="d.methodName" placeholder="无参或单个 String 参数的 public 方法" /></el-form-item>
        <el-form-item label="方法参数"><el-input v-model="d.params" placeholder="可选，以字符串形式传入方法" /></el-form-item>
        <el-form-item label="cron表达式" prop="cron" :show-message="false">
          <el-input v-model="d.cron" class="mono" placeholder="秒 分 时 日 月 周 [年]，如 0 30 2 * * ?" @input="touched = true" />
          <div class="presets">
            <span class="muted">常用：</span>
            <span v-for="p in presets" :key="p.v" class="uem-link" @click="d.cron = p.v">{{ p.l }}</span>
          </div>
          <div class="preview" :class="{ error: !!cronMsg }">
            <template v-if="cronMsg"><el-icon><CircleCloseFilled /></el-icon>{{ cronMsg }}</template>
            <template v-else-if="preview.length">
              <div class="preview-title">最近 3 次触发时间</div>
              <div v-for="t in preview" :key="+t" class="preview-time">{{ nowText(t) }}（周{{ '日一二三四五六'[t.getDay()] }}）</div>
            </template>
            <span v-else class="muted">格式：秒 分 时 日 月 周 [年]；「日」与「周」须有且只有一个为 ?，支持 * ? , - / L 及 JAN-DEC、SUN-SAT</span>
          </div>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="d.remark" type="textarea" :rows="3" maxlength="200" show-word-limit /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logVisible" :title="logJob ? `执行日志 · ${logJob.beanName}.${logJob.methodName}` : ''" width="900px">
      <template v-if="logJob">
        <el-alert v-if="logJob.status === '已暂停'" class="paused" type="info" show-icon :closable="false" :title="`该任务已于 ${logJob.pausedAt} 暂停，暂停期间不会定时执行`" />
        <el-table :data="logRows" empty-text="暂无执行记录">
          <el-table-column prop="time" label="执行时间" width="186" />
          <el-table-column label="触发方式" width="90">
            <template #default="{ row }"><el-tag size="small" :type="row.trigger === '手动' ? 'warning' : 'info'" effect="plain">{{ row.trigger }}</el-tag></template>
          </el-table-column>
          <el-table-column label="执行结果" width="90">
            <template #default="{ row }"><span :class="row.result === '成功' ? 'on' : 'fail'">{{ row.result }}</span></template>
          </el-table-column>
          <el-table-column label="耗时(ms)" width="100" align="right">
            <template #default="{ row }">{{ row.costMs.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="note" label="说明" min-width="260" />
        </el-table>
        <el-pagination v-model:current-page="logPage" class="pager" layout="total, prev, pager, next" :page-size="8" :total="logJob.logs.length" hide-on-single-page />
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTableQuery } from '@/components/useTableQuery'
import { validateCron, nextFireTimes } from '@/components/cron'
import { scheduleJobs, newJob, runJob } from '@/mock/scheduleJobs'
import { nowText } from '@/mock/qc'

// 长类名按驼峰处断行，避免在单词中间折行
const camel = (s) => String(s ?? '').split(/(?=[A-Z])/)
const kwMatch = (v, kw) => String(v ?? '').toLowerCase().includes(kw)
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => scheduleJobs,
  { kw: '' },
  (j, q) => {
    const kw = q.kw.trim().toLowerCase()
    return !kw || kwMatch(j.beanName, kw) || kwMatch(j.methodName, kw) || kwMatch(j.remark, kw)
  }
)

// 每到整秒刷新「下次触发时间」，避免显示已过去的时间
const now = ref(new Date())
let timer
const tick = () => {
  now.value = new Date()
  timer = setTimeout(tick, 1000 - (Date.now() % 1000))
}
tick()
onUnmounted(() => clearTimeout(timer))
const fires = (cron, n, from = now.value) => nextFireTimes(cron, from, n)
const nextText = (cron, from) => {
  const [t] = fires(cron, 1, from)
  return t ? nowText(t) : '不再触发'
}

// 笔记本等窄屏下操作列按两行排列，让出宽度给其他列
const cardRef = ref()
const wideOps = ref(true)
let ro
onMounted(() => {
  ro = new ResizeObserver(([e]) => (wideOps.value = e.contentRect.width >= 1150))
  ro.observe(cardRef.value)
})
onUnmounted(() => ro?.disconnect())

function toggle(row) {
  const start = row.status === '已暂停'
  Object.assign(row, { status: start ? '已启动' : '已暂停', pausedAt: start ? '' : nowText() })
  ElMessage.success(start ? `已启动，下次执行时间 ${nextText(row.cron, new Date())}` : '已暂停，暂停期间不再定时执行')
}

const running = reactive(new Set())
async function runNow(row) {
  const ok = await ElMessageBox.confirm(`确认立刻执行「${row.beanName}.${row.methodName}」？`, '提示', { type: 'warning' }).catch(() => false)
  if (!ok) return
  running.add(row.id)
  setTimeout(() => {
    const log = runJob(row)
    running.delete(row.id)
    ElMessage.success(`执行成功，耗时 ${log.costMs.toLocaleString()} ms，${log.summary || '可在「查看日志」中查看'}`)
  }, 600)
}

const logVisible = ref(false)
const logJob = ref(null)
const logPage = ref(1)
const logRows = computed(() => (logJob.value?.logs || []).slice((logPage.value - 1) * 8, logPage.value * 8))
function showLogs(row) {
  logJob.value = row
  logPage.value = 1
  logVisible.value = true
}

// ===== 新增 / 修改 =====
const presets = [
  { l: '每天 02:30', v: '0 30 2 * * ?' },
  { l: '每 3 小时', v: '0 0 0/3 * * ?' },
  { l: '工作日 09:00', v: '0 0 9 ? * MON-FRI' },
  { l: '每周一 07:00', v: '0 0 7 ? * MON' },
  { l: '每月最后一天 03:10', v: '0 10 3 L * ?' }
]
const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
// cron 输入过或点过保存后才提示错误（含清空）
const touched = ref(false)
const d = reactive({})
// 语法错误或未来不会触发时返回提示
const cronProblem = (v) => validateCron(v) || (nextFireTimes(v, now.value, 1).length ? '' : '该表达式在未来不会触发，请调整')
const cronMsg = computed(() => (String(d.cron || '').trim() || touched.value ? cronProblem(d.cron) : ''))
const preview = computed(() => (cronMsg.value ? [] : nextFireTimes(d.cron, now.value, 3)))
// 校验与保存一致，均按去除首尾空格后的值
const check = (fn) => ({ validator: (_, v, cb) => { const e = fn(String(v ?? '').trim()); e ? cb(new Error(e)) : cb() }, trigger: 'blur' })
const rules = {
  beanName: [{ required: true, message: '请输入服务类' }, check((v) => (/^[a-z][A-Za-z0-9]*$/.test(v) ? '' : '服务类应为小驼峰的 Spring Bean 名称'))],
  methodName: [
    { required: true, message: '请输入方法名' },
    check((v) =>
      !/^[a-zA-Z_$][\w$]*$/.test(v) ? '方法名格式不正确'
        : scheduleJobs.some((j) => j !== editing.value && j.beanName === d.beanName.trim() && j.methodName === v && j.params === (d.params || '').trim()) ? '已存在相同服务类、方法和参数的任务' : ''
    )
  ],
  cron: [{ required: true, validator: (_, v, cb) => { const e = cronProblem(v); e ? cb(new Error(e)) : cb() }, trigger: 'change' }]
}
function open(row) {
  editing.value = row || null
  touched.value = false
  Object.assign(d, { beanName: '', methodName: '', params: '', cron: '', remark: '' }, row ? { beanName: row.beanName, methodName: row.methodName, params: row.params, cron: row.cron, remark: row.remark } : {})
  dialog.value = true
  setTimeout(() => formRef.value?.clearValidate())
}
async function save() {
  touched.value = true
  if (!(await formRef.value.validate().catch(() => false))) return
  const data = { ...d, beanName: d.beanName.trim(), methodName: d.methodName.trim(), params: (d.params || '').trim(), cron: d.cron.trim().replace(/\s+/g, ' ') }
  if (editing.value) Object.assign(editing.value, data)
  else scheduleJobs.unshift(newJob(data))
  dialog.value = false
  ElMessage.success(editing.value ? '修改成功，新的执行计划已生效' : '新增成功，任务已启动')
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.jobs :deep(.cell) { padding: 0 8px; word-break: normal; overflow-wrap: anywhere; }
.ops { display: flex; flex-wrap: wrap; gap: 4px 12px; }
.ops .el-button + .el-button { margin-left: 0; }
.cron-cell { cursor: default; line-height: 1.5; }
.cron-cell code, .mono :deep(input) { font-family: Menlo, Consolas, 'Courier New', monospace; }
.cron-cell code { font-size: 13px; color: #333; }
.next { font-size: 12px; color: #3c9a5f; white-space: nowrap; }
.tip-title { color: #ccc; margin-bottom: 4px; }
.on { color: #3c9a5f; }
.off, .muted { color: #999; }
.fail { color: var(--uem-red); }
.presets { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; margin-top: 6px; line-height: 20px; }
.preview { width: 100%; margin-top: 8px; padding: 8px 12px; background: #f7f8fa; border-radius: 4px; font-size: 12px; line-height: 20px; color: #555; }
.preview.error { background: var(--uem-red-light); color: var(--uem-red); display: flex; align-items: center; gap: 6px; }
.preview-title { color: #888; }
.preview-time { font-family: Menlo, Consolas, 'Courier New', monospace; color: #333; }
.paused { margin-bottom: 12px; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

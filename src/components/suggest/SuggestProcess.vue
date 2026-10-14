<!-- 优化建议详情 ·「处理」区：按状态展示当前处理人可办理的操作 -->
<!-- 推测：详情页截图来自「全部列表」，未出现处理按钮；各环节表单依据系统流程图与操作日志格式整理 -->
<template>
  <!-- 非当前处理人：仅提示当前处理人；演示环境可切换为当前处理人身份走完流程 -->
  <div v-if="mode === 'others'" class="demo-line">
    <el-icon><InfoFilled /></el-icon>
    <span>当前处理人：{{ s.currentHandler || '未配置' }}（{{ s.currentRole }}）</span>
    <template v-if="handlerPerson">
      <span class="uem-link" @click="actingAs = handlerPerson">演示：以当前处理人身份处理</span>
      <span class="muted">仅演示环境提供，正式环境无此入口</span>
    </template>
  </div>

  <div v-else-if="mode" class="proc">
    <div class="proc-head">
      <span class="title">处理</span>
      <span class="step">{{ stepText }}</span>
      <span v-if="acting" class="acting">
        演示：正以 {{ acting.name }}（{{ acting.id }}）身份处理
        <span class="uem-link" @click="actingAs = null">退出演示</span>
      </span>
    </div>
    <div class="proc-body">
      <div v-if="prevTip" class="tip">{{ prevTip }}</div>

      <!-- 待修改（提交人）：修改后重新提交 -->
      <template v-if="mode === '待修改'">
        <div class="btns"><el-button type="primary" @click="toModify">修改</el-button></div>
      </template>

      <!-- 待处理（分行科技审核岗） -->
      <template v-else-if="mode === '待处理'">
        <div class="tip">分行员工提交的优化建议，审核后转产品线分拣岗{{ sorterName ? `（${sorterName}）` : '' }}分拣；与本行业务无关的可中止。</div>
        <div class="btns">
          <el-button type="primary" @click="doTransferSort">转处理</el-button>
          <el-button @click="doReturn">退回提交人</el-button>
          <el-button @click="doAbort">中止</el-button>
        </div>
      </template>

      <!-- 待分拣（产品线分拣岗） -->
      <el-form v-else-if="mode === '待分拣'" ref="assignRef" :model="assign" :rules="assignRules" label-width="120px" class="pform">
        <el-form-item label="答复人" prop="replierId">
          <el-select v-model="assign.replierId" filterable :placeholder="repliers.length ? '请选择答复人' : '该产品线暂无产品线处理岗人员'" style="width: 360px">
            <el-option v-for="p in repliers" :key="p.id" :label="`${p.name}（${p.id}）`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doAssign">指派答复人</el-button>
          <el-button @click="doEkey">转e键通（研发一体化问题）</el-button>
          <el-button @click="doReturn">退回提交人</el-button>
        </el-form-item>
      </el-form>

      <!-- 待答复（产品线处理岗）：明确是否采纳及解决方式 -->
      <el-form v-else-if="mode === '待答复'" ref="replyRef" :model="reply" :rules="replyRules" :validate-on-rule-change="false" label-width="120px" class="pform">
        <el-form-item label="采纳结果" prop="adoptResult">
          <el-radio-group v-model="reply.adoptResult">
            <el-radio v-for="o in adoptResults" :key="o" :value="o">{{ o }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row v-if="reply.adoptResult === '采纳'" :gutter="16">
          <el-col :span="12">
            <el-form-item label="解决方式" prop="solution">
              <el-select v-model="reply.solution" placeholder="请选择解决方式" style="width: 100%">
                <el-option v-for="o in solutions" :key="o.value" :label="o.value" :value="o.value">
                  <span>{{ o.value }}</span><span class="opt-desc">{{ o.desc }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="reply.priority" placeholder="请选择优先级" style="width: 100%">
                <el-option v-for="o in priorities" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求项编号" prop="reqNo">
              <el-input v-model="reply.reqNo" clearable placeholder="如 I20260814-0196" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划落实时间" prop="planTime">
              <el-date-picker v-model="reply.planTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" :disabled-date="beforeToday" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-else-if="reply.adoptResult === '不采纳'" :gutter="16">
          <el-col :span="12">
            <el-form-item label="未采纳原因" prop="rejectReason">
              <el-select v-model="reply.rejectReason" placeholder="请选择未采纳原因" style="width: 100%">
                <el-option v-for="o in rejectReasons" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="答复意见" prop="replyOpinion">
          <el-input v-model="reply.replyOpinion" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请输入答复意见" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReply">答复</el-button>
          <!-- 「体验问题维护 · 沟通业务部门」开关开启时可转总行业务部门分析处理 -->
          <el-button v-if="canBusiness" @click="bizVisible = true">转总行业务部门</el-button>
        </el-form-item>
      </el-form>

      <!-- 待审核（产品线审核岗） -->
      <template v-else-if="mode === '待审核'">
        <el-descriptions :column="3" border size="small" class="summary">
          <!-- 末项补齐整行，答复意见单独成行 -->
          <el-descriptions-item v-for="([k, v], i) in replySummary" :key="k" :label="k" :span="i === replySummary.length - 1 ? 3 - (i % 3) : 1">{{ v }}</el-descriptions-item>
          <el-descriptions-item label="答复意见" :span="3"><span class="pre">{{ s.replyOpinion }}</span></el-descriptions-item>
        </el-descriptions>
        <div class="tip">审核通过后流转至「{{ passNext }}」{{ passHint ? `，${passHint}` : '' }}；退回后由答复人重新答复。</div>
        <el-form label-width="120px" class="pform">
          <el-form-item label="审核意见" :error="auditErr">
            <el-input v-model="audit.opinion" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="通过时选填，退回时必填" @input="auditErr = ''" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="doAudit(true)">通过</el-button>
            <el-button @click="doAudit(false)">退回</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 待跟进（产品线处理岗）：跟进落实情况 -->
      <el-form v-else-if="mode === '待跟进'" ref="followRef" :model="follow" :rules="followRules" label-width="120px" class="pform">
        <div class="tip">
          解决方式：{{ s.solution }}；计划落实时间：{{ s.planTime || '未填写' }}<span v-if="overdue" class="warn">（已逾期）</span>
        </div>
        <el-form-item label="是否已落实" prop="implemented">
          <el-radio-group v-model="follow.implemented">
            <el-radio value="是">是</el-radio>
            <el-radio value="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="follow.implemented === '是'" label="实际落实时间" prop="actualTime">
          <el-date-picker v-model="follow.actualTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" :disabled-date="afterToday" style="width: 240px" />
        </el-form-item>
        <el-form-item v-else-if="follow.implemented === '否'" label="计划落实时间" prop="planTime">
          <el-date-picker v-model="follow.planTime" type="date" value-format="YYYY-MM-DD" placeholder="如需调整请重新选择" :disabled-date="beforeToday" style="width: 240px" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="follow.note" type="textarea" :rows="2" maxlength="300" show-word-limit placeholder="选填，如投产版本、落实情况" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="doFollow">提交</el-button></el-form-item>
      </el-form>

      <!-- 待业务部门答复（总行业务部门处理岗） -->
      <el-form v-else-if="mode === '待业务部门答复'" ref="brRef" :model="br" :rules="brRules" label-width="120px" class="pform">
        <el-form-item label="采纳结果" prop="adoptResult">
          <el-radio-group v-model="br.adoptResult">
            <el-radio value="采纳">采纳（业务自主解决）</el-radio>
            <el-radio value="不采纳">不采纳</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="br.adoptResult === '采纳'" label="优先级" prop="priority">
          <el-select v-model="br.priority" clearable placeholder="请选择优先级" style="width: 420px">
            <el-option v-for="o in priorities" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item v-else-if="br.adoptResult === '不采纳'" label="未采纳原因" prop="rejectReason">
          <el-select v-model="br.rejectReason" placeholder="请选择未采纳原因" style="width: 420px">
            <el-option v-for="o in rejectReasons" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="答复意见" prop="replyOpinion">
          <el-input v-model="br.replyOpinion" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请输入答复意见" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="doBusinessReply">答复</el-button></el-form-item>
      </el-form>

      <!-- 待开发中心处理：结果由 e键通同步；演示按钮模拟回传 -->
      <template v-else-if="mode === 'ekey'">
        <div class="tip">已转 e键通{{ s.ekeyNo ? `（单号 ${s.ekeyNo}）` : '' }}，处理结果由 e键通同步</div>
        <div class="btns">
          <el-button @click="doEkeyComplete">演示：同步处理完成</el-button>
          <el-button @click="doEkeyReturn">演示：e键通退回</el-button>
          <span class="muted">仅演示环境提供，用于模拟 e键通 回传处理结果</span>
        </div>
      </template>

      <!-- 已完成：提交人满意度评价（推测，对应管理报表「答复满意度」） -->
      <el-form v-else-if="mode === 'evaluate'" ref="evRef" :model="ev" :rules="evRules" label-width="120px" class="pform">
        <div class="tip">优化建议已处理完成，请对答复情况进行评价。</div>
        <el-form-item label="满意度评价" prop="satisfaction">
          <el-radio-group v-model="ev.satisfaction">
            <el-radio v-for="o in satisfactions" :key="o" :value="o">{{ o }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="意见">
          <el-input v-model="ev.note" type="textarea" :rows="2" maxlength="300" show-word-limit placeholder="选填" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="doEvaluate">提交评价</el-button></el-form-item>
      </el-form>
    </div>

    <el-dialog v-model="bizVisible" title="转总行业务部门" width="520px" append-to-body>
      <el-form ref="bizRef" :model="biz" :rules="bizRules" label-width="90px">
        <el-form-item label="业务部门" prop="headDept">
          <el-select v-model="biz.headDept" placeholder="请选择总行业务部门" style="width: 100%">
            <el-option v-for="o in headDepts" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="biz.note" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填，说明需业务部门分析的内容" />
        </el-form-item>
      </el-form>
      <div v-if="bizHandler" class="dlg-tip">转交后由总行业务部门处理岗 {{ bizHandler.name }} 答复</div>
      <template #footer>
        <el-button @click="bizVisible = false">取消</el-button>
        <el-button type="primary" @click="doBusiness">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { persons, headDepts } from '@/mock/system'
import { currentUser } from '@/config/user'
import { featureActive } from '@/mock/problemFeatures'
import { fmtDate } from '@/mock/holidays'
import {
  adoptResults, solutions, solutionOf, priorities, rejectReasons, satisfactions, isOverdue,
  handlersOf, sorterOf, businessHandlerOf,
  transferToSort, returnToSubmitter, abortSuggestion, assignReplier, transferToEkey, replySuggestion, transferToBusiness,
  auditSuggestion, followUp, businessReply, ekeyComplete, ekeyReturn, evaluate
} from '@/mock/suggest'

// 父组件以「编号 + 日志条数」作为 key：每次办理后重新挂载，表单与演示身份随之复位
const props = defineProps({ suggestion: { type: Object, required: true } })
const s = computed(() => props.suggestion)
const router = useRouter()

const actionable = ['待修改', '待处理', '待分拣', '待答复', '待审核', '待跟进', '待业务部门答复']
const me = persons.find((p) => p.id === currentUser.id) || { name: currentUser.name, id: currentUser.id, org: currentUser.dept }
// 当前处理人（提交人等不在人员维护中的，按记录信息构造）
const handlerPerson = computed(() => {
  const x = s.value
  if (!x.currentHandlerId) return null
  return persons.find((p) => p.id === x.currentHandlerId) || { name: x.currentHandler, id: x.currentHandlerId, org: x.status === '待修改' ? x.submitOrg : '' }
})
// 演示：代为处理的人员（须仍为当前处理人）
const actingAs = ref(null)
const actor = computed(() => {
  const x = s.value
  if (x.currentHandlerId === currentUser.id) return me
  return actingAs.value && actingAs.value.id === x.currentHandlerId ? actingAs.value : null
})
const acting = computed(() => (actor.value && actor.value.id !== currentUser.id ? actor.value : null))

const mode = computed(() => {
  const x = s.value
  if (actionable.includes(x.status)) return actor.value ? x.status : 'others'
  if (x.status === '待开发中心处理') return 'ekey'
  if (x.status === '已完成' && x.submitterId === currentUser.id && !x.satisfaction) return 'evaluate'
  return ''
})
const stepText = computed(() => {
  if (mode.value === 'ekey') return '待开发中心处理 · 软件开发中心'
  if (mode.value === 'evaluate') return '满意度评价 · 提交人'
  return `${s.value.status} · ${s.value.currentRole}`
})
// 上一环节的退回 / 转交说明
const prevTip = computed(() => {
  const l = s.value.logs[0]
  return l && l.remark && ['退回', '退回提交人', 'e键通退回', '转总行业务部门'].includes(l.action) ? `${l.operator}「${l.action}」：${l.remark}` : ''
})

const done = (text) => ElMessage.success(`${text}，当前状态：${s.value.status}`)
function ask(title, label, required = true) {
  return ElMessageBox.prompt(required ? `请填写${label}` : `${label}（选填）`, title, {
    inputType: 'textarea',
    inputPlaceholder: `请输入${label}`,
    inputValidator: (v) => !required || !!String(v ?? '').trim() || `请填写${label}`,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false
  })
    .then(({ value }) => String(value ?? '').trim())
    .catch(() => null)
}
const today = fmtDate(new Date())
const beforeToday = (d) => fmtDate(d) < today
const afterToday = (d) => fmtDate(d) > today
const required = (message, trigger = 'change') => ({ required: true, message, trigger })
const notBlank = (message) => ({ validator: (_, v, cb) => (String(v ?? '').trim() ? cb() : cb(new Error(message))), trigger: 'blur' })

// ===== 待修改 =====
const toModify = () => router.push({ path: '/optimSuggestAdd', query: { problemId: s.value.seq } })

// ===== 待处理 / 待分拣：退回、中止 =====
const sorterName = computed(() => sorterOf(s.value.productLine)?.name || '')
function doTransferSort() {
  transferToSort(s.value, actor.value)
  done('已转处理')
}
async function doReturn() {
  const reason = await ask('退回提交人', '退回原因')
  if (reason == null) return
  returnToSubmitter(s.value, reason, actor.value)
  done('已退回提交人')
}
async function doAbort() {
  const reason = await ask('中止', '中止原因')
  if (reason == null) return
  abortSuggestion(s.value, reason, actor.value)
  done('已中止该优化建议')
}

// ===== 待分拣：指派答复人 / 转 e键通 =====
const assignRef = ref()
const assign = reactive({ replierId: '' })
const assignRules = { replierId: [required('请选择答复人')] }
const repliers = computed(() => handlersOf(s.value.productLine))
async function doAssign() {
  if (!(await assignRef.value.validate().catch(() => false))) return
  const p = repliers.value.find((x) => x.id === assign.replierId)
  assignReplier(s.value, p, actor.value)
  done(`已指派答复人 ${p.name}`)
}
async function doEkey() {
  const note = await ask('转e键通（研发一体化问题）', '说明', false)
  if (note == null) return
  transferToEkey(s.value, note, actor.value)
  done(`已转e键通，单号 ${s.value.ekeyNo}`)
}

// ===== 待答复：答复 =====
const replyRef = ref()
const x0 = props.suggestion
// 审核退回后重新答复：带出上次答复内容
const reply = reactive({
  adoptResult: x0.adoptResult || '', solution: x0.solution || '', priority: x0.priority || '', reqNo: x0.reqNo || '',
  planTime: x0.planTime || '', rejectReason: x0.rejectReason || '', replyOpinion: x0.replyOpinion || ''
})
const sol = computed(() => solutionOf(reply.solution))
const needReq = computed(() => !!sol.value?.needReq)
const needPlan = computed(() => sol.value?.next === '待跟进')
const replyRules = computed(() => ({
  adoptResult: [required('请选择采纳结果')],
  solution: [required('请选择解决方式')],
  priority: [required('请选择优先级')],
  reqNo: [
    { required: needReq.value, message: '请输入需求项编号', trigger: 'blur' },
    { validator: (_, v, cb) => { const t = String(v ?? '').trim(); !t || /^I\d{8}-\d{4}$/.test(t) ? cb() : cb(new Error('格式应为 I + 8 位日期 + - + 4 位序号，如 I20260814-0196')) }, trigger: 'blur' }
  ],
  planTime: [
    { required: needPlan.value, message: '请选择计划落实时间', trigger: 'change' },
    { validator: (_, v, cb) => (v && v < today ? cb(new Error('计划落实时间不能早于今天')) : cb()), trigger: 'change' }
  ],
  rejectReason: [required('请选择未采纳原因')],
  replyOpinion: [required('请输入答复意见', 'blur'), notBlank('请输入答复意见')]
}))
watch(() => reply.solution, () => replyRef.value?.clearValidate(['reqNo', 'planTime']))
async function doReply() {
  if (!(await replyRef.value.validate().catch(() => false))) return
  const adopt = reply.adoptResult === '采纳'
  replySuggestion(s.value, {
    adoptResult: reply.adoptResult,
    solution: adopt ? reply.solution : '',
    priority: adopt ? reply.priority : '',
    reqNo: adopt ? String(reply.reqNo ?? '').trim() : '',
    planTime: adopt ? reply.planTime || '' : '',
    rejectReason: adopt ? '' : reply.rejectReason,
    replyOpinion: reply.replyOpinion.trim()
  }, actor.value)
  done('答复成功')
}

// ===== 待答复：转总行业务部门 =====
const canBusiness = computed(() => featureActive('沟通业务部门'))
const bizVisible = ref(false)
const bizRef = ref()
const biz = reactive({ headDept: headDepts.includes(x0.headDept) ? x0.headDept : '', note: '' })
const bizHandler = computed(() => (biz.headDept ? businessHandlerOf(biz.headDept) : null))
const bizRules = {
  headDept: [required('请选择总行业务部门'), { validator: (_, v, cb) => (v && !businessHandlerOf(v) ? cb(new Error('该部门暂未配置总行业务部门处理岗')) : cb()), trigger: 'change' }]
}
async function doBusiness() {
  if (!(await bizRef.value.validate().catch(() => false))) return
  bizVisible.value = false
  transferToBusiness(s.value, biz.headDept, biz.note.trim(), actor.value)
  done(`已转${biz.headDept}`)
}

// ===== 待审核：通过 / 退回 =====
const audit = reactive({ opinion: '' })
const auditErr = ref('')
const replySummary = computed(() => {
  const x = s.value
  const rows = x.adoptResult === '不采纳'
    ? [['采纳结果', x.adoptResult], ['未采纳原因', x.rejectReason]]
    : [['采纳结果', x.adoptResult], ['解决方式', x.solution], ['优先级', x.priority], ['需求项编号', x.reqNo], ['计划落实时间', x.planTime]]
  return [...rows, ['答复人', x.replier], ['答复时间', x.replyTime]].filter(([, v]) => v)
})
const passNext = computed(() => (s.value.adoptResult === '不采纳' ? '已完成' : solutionOf(s.value.solution)?.next || '已完成'))
const passHint = computed(() => ({
  待跟进: s.value.replier ? `由答复人 ${s.value.replier} 跟进落实` : '',
  待开发中心处理: '转 e键通跟进解决',
  已纳入需求整合池: '同步 BRDM 纳入需求整合问题管理',
  已纳入e企创: '同步工银e企创纳入创意管理'
})[passNext.value] || '')
function doAudit(pass) {
  const opinion = audit.opinion.trim()
  if (!pass && !opinion) {
    auditErr.value = '退回时请填写审核意见'
    return
  }
  auditSuggestion(s.value, pass, opinion, actor.value)
  done(pass ? '审核通过' : '已退回答复人')
}

// ===== 待跟进：跟进落实 =====
const followRef = ref()
const follow = reactive({ implemented: '', actualTime: '', planTime: '', note: '' })
const overdue = computed(() => isOverdue(s.value))
const followRules = {
  implemented: [required('请选择是否已落实')],
  actualTime: [required('请选择实际落实时间'), { validator: (_, v, cb) => (v && v > today ? cb(new Error('实际落实时间不能晚于今天')) : cb()), trigger: 'change' }],
  planTime: [{ validator: (_, v, cb) => (v && v < today ? cb(new Error('计划落实时间不能早于今天')) : cb()), trigger: 'change' }]
}
async function doFollow() {
  if (!(await followRef.value.validate().catch(() => false))) return
  const yes = follow.implemented === '是'
  followUp(s.value, { implemented: follow.implemented, actualTime: yes ? follow.actualTime : '', planTime: yes ? '' : follow.planTime || '', note: follow.note.trim() }, actor.value)
  done(yes ? '已确认落实' : '跟进情况已记录')
}

// ===== 待业务部门答复 =====
const brRef = ref()
const br = reactive({ adoptResult: '', priority: '', rejectReason: '', replyOpinion: '' })
const brRules = {
  adoptResult: [required('请选择采纳结果')],
  rejectReason: [required('请选择未采纳原因')],
  replyOpinion: [required('请输入答复意见', 'blur'), notBlank('请输入答复意见')]
}
async function doBusinessReply() {
  if (!(await brRef.value.validate().catch(() => false))) return
  const adopt = br.adoptResult === '采纳'
  businessReply(s.value, { adoptResult: br.adoptResult, priority: adopt ? br.priority || '' : '', rejectReason: adopt ? '' : br.rejectReason, replyOpinion: br.replyOpinion.trim() }, actor.value)
  done('答复成功')
}

// ===== 待开发中心处理（演示）=====
function doEkeyComplete() {
  ekeyComplete(s.value)
  done('已同步 e键通处理结果')
}
async function doEkeyReturn() {
  const reason = await ask('演示：e键通退回', '退回原因', false)
  if (reason == null) return
  ekeyReturn(s.value, reason)
  done('e键通已退回，重新分拣')
}

// ===== 已完成：满意度评价 =====
const evRef = ref()
const ev = reactive({ satisfaction: '', note: '' })
const evRules = { satisfaction: [required('请选择满意度')] }
async function doEvaluate() {
  if (!(await evRef.value.validate().catch(() => false))) return
  evaluate(s.value, ev.satisfaction, ev.note.trim(), me)
  ElMessage.success('评价已提交，感谢您的反馈')
}
</script>

<style scoped>
.demo-line {
  display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px;
  margin-bottom: 16px; padding: 9px 14px; background: #f7f8fa; border-radius: 4px; color: #888; font-size: 13px;
}
.demo-line .el-icon { color: #b0b3b8; }
.muted { color: #aaa; font-size: 12px; }
.proc { margin-bottom: 16px; border: 1px solid #f1e2e3; border-radius: 4px; }
.proc-head {
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px;
  padding: 10px 16px; background: linear-gradient(90deg, #fdf1f0, #fff 70%); border-radius: 4px 4px 0 0;
}
.title { font-size: 15px; font-weight: 600; color: #333; }
.step { font-size: 13px; color: #888; }
.acting { margin-left: auto; font-size: 12px; color: #b26a00; background: #fdf6ec; padding: 2px 10px; border-radius: 10px; }
.proc-body { padding: 16px 16px 2px; }
.pform { max-width: 960px; }
.tip { margin-bottom: 14px; padding: 8px 12px; background: #f7f8fa; border-radius: 4px; font-size: 13px; color: #666; line-height: 1.6; }
.warn { color: var(--uem-red); }
.btns { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; margin-bottom: 14px; }
.btns .el-button + .el-button { margin-left: 0; }
.opt-desc { margin-left: 12px; color: #999; font-size: 12px; }
.summary { margin-bottom: 14px; }
.summary :deep(.el-descriptions__label) { width: 110px; background: #f5f7fa; color: #666; font-weight: normal; }
.pre { white-space: pre-wrap; }
.dlg-tip { font-size: 12px; color: #888; padding-left: 90px; }
</style>

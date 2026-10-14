<!-- 优化建议 · 详情 #/optimSuggestDetail?problemId=<流水号>&currentMenuName=<来源菜单>：答复信息 + 建议信息 + 操作日志 -->
<template>
  <div class="uem-card detail">
    <template v-if="s">
      <div class="head-ops">
        <el-button v-if="isAdmin" size="small" plain @click="remove">删除</el-button>
        <el-button size="small" plain @click="back">返回</el-button>
        <el-button size="small" plain :disabled="!prevSeq" @click="go(prevSeq)">上一条</el-button>
        <el-button size="small" plain :disabled="!nextSeq" @click="go(nextSeq)">下一条</el-button>
      </div>

      <SuggestProcess :key="`${s.seq}-${s.logs.length}`" :suggestion="s" />

      <!-- 答复信息（截图中取值为蓝色） -->
      <table class="grid reply">
        <colgroup><col class="lc" /><col /><col class="lc" /><col /></colgroup>
        <tbody>
          <tr v-for="(row, i) in replyRows" :key="i">
            <template v-for="c in row" :key="c.label">
              <th>{{ c.label }}</th>
              <td :colspan="c.full ? 3 : 1" :class="{ pre: c.pre }">{{ c.value }}</td>
            </template>
          </tr>
        </tbody>
      </table>

      <!-- 优化建议信息 + 操作日志 -->
      <table class="grid info">
        <colgroup><col class="lc" /><col /><col class="lc" /><col /></colgroup>
        <tbody>
          <tr v-for="(row, i) in infoRows" :key="i">
            <template v-for="c in row" :key="c.label">
              <th>{{ c.label }}</th>
              <td :colspan="c.full ? 3 : 1" :class="{ pre: c.pre, 'log-cell': c.key === 'logs' }">
                <div v-if="c.key === 'attachments'" class="atts">
                  <template v-for="(a, k) in s.attachments" :key="k">
                    <div v-if="isImage(a) && a.url" class="att-img">
                      <el-image :src="a.url" :preview-src-list="imageUrls" :initial-index="imageUrls.indexOf(a.url)" fit="cover" preview-teleported hide-on-click-modal class="thumb" />
                      <span class="att-name" :title="a.name">{{ a.name }}</span>
                    </div>
                    <a v-else-if="a.url" class="uem-link att-file" :href="a.url" :download="a.name" target="_blank">
                      <el-icon><Document /></el-icon>{{ a.name }}
                    </a>
                    <span v-else class="att-file"><el-icon><Document /></el-icon>{{ a.name }}</span>
                  </template>
                </div>
                <el-table v-else-if="c.key === 'logs'" :data="s.logs" size="small" border class="log-table" empty-text="暂无操作记录">
                  <el-table-column type="index" label="序号" width="52" align="center" />
                  <el-table-column prop="time" label="操作时间" width="152" />
                  <el-table-column prop="operator" label="操作人" width="88" />
                  <el-table-column prop="dept" label="所属业研部门" width="112" />
                  <el-table-column prop="line" label="所属业研产品线" width="120" />
                  <el-table-column prop="action" label="操作内容" width="110" />
                  <el-table-column prop="remark" label="备注" min-width="200" />
                </el-table>
                <template v-else>{{ c.value }}</template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </template>

    <el-empty v-else description="未找到该优化建议">
      <el-button type="primary" @click="back">返回</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SuggestProcess from '@/components/suggest/SuggestProcess.vue'
import { findSuggestion, removeSuggestion, listContext } from '@/mock/suggest'
import { persons } from '@/mock/system'
import { menuPathOf } from '@/config/menus'
import { currentUser } from '@/config/user'

const route = useRoute()
const router = useRouter()
const s = computed(() => findSuggestion(route.query.problemId))
const menu = computed(() => route.query.currentMenuName || '')

const back = () => router.push(menuPathOf('experience', menu.value) || '/optimSuggestions')

// 删除：仅系统管理员
const isAdmin = computed(() => !!persons.find((p) => p.id === currentUser.id)?.roles.includes('系统管理员'))
async function remove() {
  const rec = s.value
  const ok = await ElMessageBox.confirm(`确认删除优化建议「${rec.id}」？删除后不可恢复。`, '提示', { type: 'warning' }).catch(() => false)
  if (!ok) return
  // 先返回列表再删除，避免详情页闪现「未找到」
  await back()
  removeSuggestion(rec)
  const i = listContext.seqs.indexOf(rec.seq)
  if (i >= 0) listContext.seqs.splice(i, 1)
  ElMessage.success('删除成功')
}

// 上一条 / 下一条：在进入详情前所在列表（同一菜单）的筛选结果中切换
const ctxIndex = computed(() => (s.value && listContext.menu === menu.value ? listContext.seqs.indexOf(s.value.seq) : -1))
const prevSeq = computed(() => (ctxIndex.value > 0 ? listContext.seqs[ctxIndex.value - 1] : null))
const nextSeq = computed(() => (ctxIndex.value >= 0 && ctxIndex.value < listContext.seqs.length - 1 ? listContext.seqs[ctxIndex.value + 1] : null))
const go = (seq) => router.replace({ query: { ...route.query, problemId: String(seq) } })

const cell = (label, value, full = false, extra = {}) => ({ label, value: value ?? '', full, ...extra })
const replyRows = computed(() => {
  const x = s.value
  return [
    [cell('采纳结果', x.adoptResult, true)],
    [cell('答复人', x.replier, true)],
    [cell('答复意见', x.replyOpinion, true, { pre: true })],
    // 推测：不采纳时展示未采纳原因（截图为采纳记录）
    ...(x.adoptResult === '不采纳' ? [[cell('未采纳原因', x.rejectReason, true)]] : []),
    [cell('解决方式', x.solution), cell('优先级', x.priority)],
    [cell('计划落实时间', x.planTime), cell('是否已落实', x.implemented)],
    [cell('实际落实时间', x.actualTime), cell('状态', x.status)]
  ]
})
const infoRows = computed(() => {
  const x = s.value
  return [
    [cell('优化建议编号', x.id), cell('产品名称', x.product)],
    [cell('产品使用渠道', (x.channels || []).join('、'), true)],
    [cell('功能栏目', x.column, true)],
    [cell('附件', '', true, { key: 'attachments' })],
    [cell('描述及解决建议', x.desc, true, { pre: true })],
    [cell('提出人', x.proposer), cell('提出人统一认证号', x.proposerId)],
    [cell('提出人所在机构', x.proposerOrg), cell('提出时间', x.proposeTime)],
    [cell('提交人', x.submitter), cell('提交人统一认证号', x.submitterId)],
    [cell('提交人所在机构', x.submitOrg), cell('提交时间', x.submitTime)],
    [cell('来源', x.source), cell('关联体验活动', x.activity)],
    [cell('所属业研部门', x.bizDept), cell('所属业研产品线', x.productLine)],
    [cell('优化建议分类', x.category), cell('影响程度', x.impact)],
    [cell('当前处理岗', x.currentRole), cell('当前处理人', x.currentHandler)],
    [cell('操作日志', '', true, { key: 'logs' })]
  ]
})

const isImage = (a) => /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(a.name || '') || /^data:image\//.test(a.url || '')
const imageUrls = computed(() => (s.value?.attachments || []).filter((a) => a.url && isImage(a)).map((a) => a.url))
</script>

<style scoped>
.detail { min-height: 300px; }
.head-ops { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px; }
.head-ops .el-button + .el-button { margin-left: 0; }

.grid { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 14px; }
.grid + .grid { margin-top: 14px; }
.grid col.lc { width: 150px; }
.grid th, .grid td { border: 1px solid #dfe5ee; padding: 10px 14px; line-height: 1.6; vertical-align: middle; overflow-wrap: anywhere; }
.grid th { background: #eef3f9; color: #555; font-weight: normal; text-align: left; }
.grid td { background: #fff; color: #333; }
.grid.reply td { color: #2f6bd8; }
.grid td.pre { white-space: pre-wrap; }
.grid td.log-cell { padding: 10px; }

.atts { display: flex; flex-wrap: wrap; gap: 10px 14px; }
.att-img { display: flex; flex-direction: column; width: 88px; gap: 4px; }
.thumb { width: 88px; height: 88px; border: 1px solid #e4e7ed; border-radius: 4px; background: #f7f8fa; }
.att-name { font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.att-file { display: inline-flex; align-items: center; gap: 4px; }

.log-table :deep(th.el-table__cell) { background: #f5f7fa; }
.log-table :deep(.cell) { line-height: 1.5; }
</style>

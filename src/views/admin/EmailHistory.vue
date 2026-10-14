<!-- 后台管理 · 邮件记录 #/emailHistoryList：定时任务发送的提醒 / 预警邮件流水（邮件类型同「字典维护」EMAIL_TYPE） -->
<template>
  <div>
    <div class="uem-card filter">
      <el-form :model="form" label-width="100px" class="grid">
        <el-form-item label="邮件类型">
          <el-select v-model="form.type" clearable placeholder="请选择" style="width: 100%">
            <el-option v-for="t in emailTypes" :key="t.code" :label="`${t.code}（${t.label}）`" :value="t.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮件接收人"><el-input v-model="form.recipient" clearable placeholder="请输入统一认证号" @keyup.enter="search" /></el-form-item>
        <el-form-item label="优化建议编号"><el-input v-model="form.suggestionId" clearable placeholder="请输入优化建议编号" @keyup.enter="search" /></el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="form.created"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="-"
            start-placeholder="请选择开始时间"
            end-placeholder="请选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="查看历史">
          <el-radio-group v-model="form.history"><el-radio value="是">是</el-radio><el-radio value="否">否</el-radio></el-radio-group>
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>

    <div class="uem-card">
      <el-table :data="rows">
        <el-table-column type="index" label="序列" width="70" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="recipient" label="邮件接受者" min-width="110" />
        <el-table-column prop="status" label="优化建议状态" min-width="110" />
        <el-table-column prop="suggestionId" label="优化建议编号" min-width="200" />
        <el-table-column prop="created" label="创建时间" min-width="170" />
        <el-table-column prop="submitTime" label="提交时间" min-width="110" />
        <el-table-column prop="type" label="邮件类型" min-width="130" />
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { emailTypes } from '@/mock/emailTypes'
import { emailRecords } from '@/mock/emailHistory'

const day = (r) => r.created.slice(0, 10)
// 「查看历史」选否时只看最近一批：（所选类型）最近一次发送当天的邮件；记录按创建时间倒序，首次出现即最近
const latestDay = computed(() => {
  const m = {}
  for (const r of emailRecords) {
    m[''] ??= day(r)
    m[r.type] ??= day(r)
    if (Object.keys(m).length > emailTypes.length) break
  }
  return m
})

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => emailRecords,
  { type: '', recipient: '', suggestionId: '', created: [], history: '是' },
  (r, q) =>
    match.equals(r.type, q.type) &&
    match.contains(r.recipient, (q.recipient || '').trim()) &&
    match.contains(r.suggestionId, (q.suggestionId || '').trim()) &&
    match.inRange(day(r), q.created) &&
    (q.history !== '否' || day(r) === latestDay.value[q.type || ''])
)
</script>

<style scoped>
.filter { display: flex; gap: 24px; margin-bottom: 16px; }
.grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; column-gap: 32px; }
.grid :deep(.el-form-item) { margin-bottom: 14px; }
.actions { display: flex; gap: 8px; align-items: flex-start; }
.actions .el-button + .el-button { margin-left: 0; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

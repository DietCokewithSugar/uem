<!-- 体验活动列表：待办 / 总行体验活动 / 分行体验活动 / 我的体验活动 -->
<template>
  <div>
    <SearchForm
      v-if="scope !== 'pending'"
      :model="form"
      :fields="fields"
      :collapsed-count="2"
      :default-expanded="false"
      @search="search"
      @reset="reset"
    />
    <div class="uem-card">
      <div v-if="scope !== 'pending'" class="uem-toolbar">
        <el-button type="primary" @click="router.push({ path: '/activityAdd', query: { from: route.path } })">新增</el-button>
        <el-button @click="exportCsv(route.meta.title, columns, filtered)">批量导出</el-button>
      </div>
      <el-table :data="rows" empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="64" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="活动名称" min-width="230">
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column v-for="c in columns.slice(1)" :key="c.prop" :prop="c.prop" :label="c.label" :min-width="c.width || 110">
          <template #default="{ row }">{{ row[c.prop] === '' ? '-' : row[c.prop] }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="filtered.length"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>

    <el-drawer :model-value="!!detail" title="体验活动详情" size="520px" @close="detail = null">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item v-for="c in detailFields" :key="c.prop" :label="c.label">{{ detail[c.prop] || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { activities, products, bizDomains, expChannels, expMethods, activityStatuses } from '@/mock'
import { currentUser } from '@/config/user'

const props = defineProps({ scope: { type: String, default: 'head' } })
const route = useRoute()
const router = useRouter()

// 待办列表的列与其他列表不同（见截图）
const columns = computed(() =>
  props.scope === 'pending'
    ? [
        { prop: 'name', label: '活动名称' }, { prop: 'product', label: '产品名称' }, { prop: 'channelType', label: '体验渠道类别' },
        { prop: 'channel', label: '体验渠道名称', width: 140 }, { prop: 'method', label: '体验方法', width: 130 },
        { prop: 'dept', label: '活动申请部门', width: 170 }, { prop: 'submitTime', label: '提交时间' }, { prop: 'status', label: '活动状态' }
      ]
    : [
        { prop: 'name', label: '活动名称' }, { prop: 'product', label: '产品名称', width: 140 }, { prop: 'domain', label: '业务领域', width: 90 },
        { prop: 'channel', label: '体验渠道', width: 150 }, { prop: 'method', label: '体验方法', width: 150 },
        { prop: 'dept', label: '申请部门', width: 170 }, { prop: 'people', label: '参与人数', width: 80 },
        { prop: 'submitTime', label: '提交时间', width: 110 }, { prop: 'status', label: '活动状态', width: 90 }
      ]
)
const detailFields = [
  { prop: 'name', label: '活动名称' }, { prop: 'level', label: '活动级别' }, { prop: 'product', label: '产品名称' },
  { prop: 'domain', label: '业务领域' }, { prop: 'channel', label: '体验渠道' }, { prop: 'method', label: '体验方法' },
  { prop: 'dept', label: '申请部门' }, { prop: 'people', label: '参与人数' }, { prop: 'submitTime', label: '提交时间' },
  { prop: 'status', label: '活动状态' }, { prop: 'creator', label: '创建人' }, { prop: 'intro', label: '活动简介' }
]

// 截图中仅可见"活动名称、提交时间"，展开后的字段为推测
const fields = [
  { prop: 'name', label: '活动名称' },
  { prop: 'submitTime', label: '提交时间', type: 'daterange' },
  { prop: 'product', label: '产品名称', type: 'select', options: products },
  { prop: 'domain', label: '业务领域', type: 'select', options: bizDomains },
  { prop: 'channel', label: '体验渠道', type: 'select', options: expChannels },
  { prop: 'method', label: '体验方法', type: 'select', options: expMethods },
  { prop: 'status', label: '活动状态', type: 'select', options: activityStatuses }
]

const inScope = (a) =>
  ({
    pending: a.pendingForMe,
    head: a.level === '总行',
    branch: a.level === '分行',
    mine: a.creator === currentUser.name
  })[props.scope]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => activities,
  { name: '', submitTime: [], product: '', domain: '', channel: '', method: '', status: '' },
  (a, q) =>
    inScope(a) &&
    match.contains(a.name, q.name) &&
    match.inRange(a.submitTime, q.submitTime) &&
    match.equals(a.product, q.product) &&
    match.equals(a.domain, q.domain) &&
    (!q.channel || a.channel.includes(q.channel)) &&
    (!q.method || a.method.includes(q.method)) &&
    match.equals(a.status, q.status)
)

const detail = ref(null)
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

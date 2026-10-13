<!-- 评价数据上传 #/experEvalDataUpLoad -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="exportEts">ETS评价数据导出</el-button></div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="70" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="column" label="栏目" min-width="140" />
        <el-table-column label="产品名称" min-width="180">
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.product }}</span></template>
        </el-table-column>
        <el-table-column prop="updater" label="更新人" width="140" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="download(row)">下载</el-button>
            <el-upload :show-file-list="false" action="#" :auto-upload="false" accept=".xls,.xlsx,.csv" :on-change="(f) => upload(row, f)" class="inline">
              <el-button link type="primary">上传</el-button>
            </el-upload>
            <template v-if="row.exportAll">
              <el-button link type="primary" @click="exportAll(row)">导出全部</el-button>
              <el-tooltip content="导出该渠道历次上传的全部评价数据"><el-icon class="tip"><InfoFilled /></el-icon></el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" class="pager" layout="total, prev, pager, next, jumper" :page-size="pageSize" :total="filtered.length" />
    </div>

    <el-drawer :model-value="!!detail" :title="detail?.product" size="480px" @close="detail = null">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="栏目">{{ detail.column }}</el-descriptions-item>
        <el-descriptions-item label="最近更新">{{ detail.updateTime || '—' }} {{ detail.updater }}</el-descriptions-item>
        <el-descriptions-item label="上传记录">
          <div v-for="f in detail.files" :key="f.time">{{ f.time }} · {{ f.name }}</div>
          <span v-if="!detail.files.length">—</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import { evalUploads, premiumProducts, brandData, months } from '@/mock/monitor'
import { isUploadVisible } from '@/mock/monitorMaint'
import { currentUser } from '@/config/user'

const fields = [
  { prop: 'time', label: '评价时间', type: 'daterange' },
  { prop: 'product', label: '所属精品产品', type: 'select', options: premiumProducts }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  // 「体验监测维护」中冻结的重点渠道 / 精品产品不展示
  () => evalUploads.filter(isUploadVisible),
  { time: [], product: '' },
  (r, q) => (!q.time?.length || (r.updateTime && match.inRange(r.updateTime, q.time))) && match.equals(r.product, q.product)
)
const detail = ref(null)

const dimCols = brandData[months[0]].dims.flatMap((d) => d.items.map(([n]) => ({ prop: n, label: `${d.name.replace('工行', '').replace('满意度', '')}-${n}` })))
const sampleRows = () => months.map((m) => ({ month: m, nps: brandData[m].nps, ...Object.fromEntries(brandData[m].dims.flatMap((d) => d.items)) }))
const download = (r) => exportCsv(`${r.product}_评价数据模板`, [{ prop: 'month', label: '评价月份' }, { prop: 'nps', label: 'NPS' }, ...dimCols], [])
const exportAll = (r) => exportCsv(`${r.product}_全部评价数据`, [{ prop: 'month', label: '评价月份' }, { prop: 'nps', label: 'NPS' }, ...dimCols], sampleRows())
const exportEts = () => exportCsv('ETS评价数据', [{ prop: 'month', label: '评价月份' }, { prop: 'nps', label: 'NPS' }, ...dimCols], sampleRows())

function upload(row, file) {
  const today = new Date().toISOString().slice(0, 10)
  Object.assign(row, { updater: currentUser.name, updateTime: today })
  row.files.unshift({ name: file.name, time: today })
  ElMessage.success(`「${file.name}」上传成功，已提交至「评价数据审核」`)
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.inline { display: inline-block; margin: 0 12px; }
.tip { color: #bbb; margin-left: 4px; vertical-align: middle; }
</style>

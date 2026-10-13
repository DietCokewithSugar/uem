<!-- 体验问题（研发阶段）列表 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" :default-expanded="false" @search="search" @reset="reset" />

    <div class="uem-card">
      <div class="uem-toolbar">
        <el-button type="primary" @click="importDialog = true">批量导入</el-button>
        <el-button @click="downloadTemplate">下载体验问题模板</el-button>
      </div>
      <el-table :data="rows">
        <el-table-column label="问题编号" width="230">
          <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="product" label="产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="desc" label="描述及解决建议" min-width="280" show-overflow-tooltip />
        <el-table-column prop="dept" label="问题提出部门" min-width="170" show-overflow-tooltip />
        <el-table-column prop="proposer" label="提出人" width="90" />
        <el-table-column prop="time" label="提出时间" width="110" />
        <el-table-column prop="adoptResult" label="采纳结果" width="90" />
        <el-table-column prop="status" label="状态" width="90" />
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pager"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filtered.length"
      />
    </div>

    <el-dialog v-model="importDialog" title="批量导入体验问题" width="480px">
      <el-upload drag action="#" :auto-upload="false" accept=".xls,.xlsx">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div>将 Excel 文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">导入</el-button>
      </template>
    </el-dialog>
    <SuggestionDetail kind="problem" :row="detail" @close="detail = null" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import SuggestionDetail from '@/components/SuggestionDetail.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { problems, products, bizDepts } from '@/mock'

const fields = [
  { prop: 'id', label: '问题编号' },
  { prop: 'keyword', label: '关键字' },
  { prop: 'proposer', label: '提出人' },
  { prop: 'product', label: '产品名称', type: 'select', options: products },
  { prop: 'dept', label: '问题提出部门', type: 'select', options: bizDepts },
  { prop: 'adoptResult', label: '采纳结果', type: 'select', options: ['采纳', '未采纳'] },
  { prop: 'time', label: '提出时间', type: 'daterange' }
]

const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => problems,
  { id: '', keyword: '', proposer: '', product: '', dept: '', adoptResult: '', time: [] },
  (r, q) =>
    match.contains(r.id, q.id) &&
    match.contains(r.desc, q.keyword) &&
    match.contains(r.proposer, q.proposer) &&
    match.equals(r.product, q.product) &&
    match.equals(r.dept, q.dept) &&
    match.equals(r.adoptResult, q.adoptResult) &&
    match.inRange(r.time, q.time)
)

const detail = ref(null)
const importDialog = ref(false)
const confirmImport = () => {
  importDialog.value = false
  ElMessage.success('演示环境：导入请求已提交')
}
const downloadTemplate = () => ElMessage.info('演示环境：模板下载功能待接入')
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

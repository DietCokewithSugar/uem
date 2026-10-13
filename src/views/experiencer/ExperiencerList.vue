<!-- 体验员管理：行内 / 行外 × 总行 / 分行
     总行可新增、下载模板、批量新增、修改删除；分行仅查询与导出（与截图一致） -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" label-width="160px" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar">
        <template v-if="isHead">
          <el-button type="primary" @click="openEdit()">新增</el-button>
          <el-button @click="downloadTemplate">下载模板</el-button>
          <el-button @click="importVisible = true">批量新增</el-button>
        </template>
        <AsyncExport :name="route.meta.title" :columns="exportColumns" :rows="exportRows" :primary-export="!isHead" />
      </div>

      <el-table :data="rows" empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="60" :index="(i) => (page - 1) * pageSize + i + 1" />
        <template v-if="kind === 'inside'">
          <el-table-column label="统一认证号" width="110">
            <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="gender" label="性别" width="60" />
          <el-table-column prop="age" label="年龄" width="60" />
          <el-table-column label="地区" min-width="150"><template #default="{ row }">{{ row.region.join('-') }}</template></el-table-column>
          <el-table-column label="所属机构" min-width="120"><template #default="{ row }">{{ row.org[row.org.length - 1] }}</template></el-table-column>
          <el-table-column prop="jobLevel" label="职务层级" min-width="130" />
          <el-table-column prop="workTime" label="参加工作时间" width="110" />
          <el-table-column prop="isOutlet" label="是否营业网点工作人员" width="110" />
          <el-table-column prop="officerLevel" label="体验官等级" width="100" />
        </template>
        <template v-else>
          <el-table-column label="编号" width="110">
            <template #default="{ row }"><span class="uem-link" @click="detail = row">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="90" />
          <el-table-column prop="gender" label="性别" width="60" />
          <el-table-column prop="age" label="年龄" width="60" />
          <el-table-column label="地区" min-width="120"><template #default="{ row }">{{ row.region.join('-') }}</template></el-table-column>
          <el-table-column prop="education" label="教育程度" width="100" />
          <el-table-column prop="industry" label="所属行业" width="100" />
          <el-table-column prop="attr" label="属性" width="90" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="status" label="状态" width="70" />
        </template>
        <el-table-column label="活动总数" width="90"><template #default="{ row }">{{ row.activities.length }}</template></el-table-column>
        <el-table-column label="总评价" width="80"><template #default="{ row }">{{ totalScore(row) || '-' }}</template></el-table-column>
        <el-table-column v-if="isHead" label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">修改</el-button>
            <el-button link type="primary" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, sizes, prev, pager, next, jumper" :total="filtered.length" />
    </div>

    <ExperiencerEditDialog v-model="editVisible" :kind="kind" :row="editing" @save="save" />

    <el-dialog v-model="importVisible" title="批量新增体验员" width="480px">
      <el-upload drag action="#" :auto-upload="false" accept=".xls,.xlsx,.csv">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div>将按模板填写的文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="importVisible = false; ElMessage.success('演示环境：导入任务已提交')">导入</el-button>
      </template>
    </el-dialog>

    <ExperiencerDetail :row="detail" @close="detail = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import AsyncExport from '@/components/AsyncExport.vue'
import ExperiencerEditDialog from './ExperiencerEditDialog.vue'
import ExperiencerDetail from './ExperiencerDetail.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { exportCsv } from '@/components/exportCsv'
import * as E from '@/mock/experiencer'

const props = defineProps({
  kind: { type: String, default: 'inside' }, // inside 行内 / outside 行外
  level: { type: String, default: 'head' } // head 总行 / branch 分行
})
const route = useRoute()
const isHead = computed(() => props.level === 'head')
const levelName = computed(() => (isHead.value ? '总行' : '分行'))
const source = () => (props.kind === 'inside' ? E.insideExperiencers : E.outsideExperiencers)
const totalScore = (r) => r.activities.reduce((n, a) => n + a.score, 0)

const insideFields = [
  { prop: 'id', label: '统一认证号' },
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄段', type: 'numrange' },
  { prop: 'gender', label: '性别', type: 'select', options: E.genders },
  { prop: 'region', label: '地区', type: 'chain', tree: E.regionTree },
  { prop: 'jobLevel', label: '职务层级', type: 'select', options: E.jobLevels },
  { prop: 'workTime', label: '参加工作时间', type: 'month' },
  { prop: 'isOutlet', label: '是否营业网点工作人员', type: 'select', options: E.yesNo },
  { prop: 'channel', label: '熟悉的我行使用渠道', type: 'select', options: E.bankChannels },
  { prop: 'businesses', label: '熟悉的我行业务', type: 'multi', options: E.bankBusinesses },
  { prop: 'peer', label: '熟悉的银行同业', type: 'select', options: E.peerBanks },
  { prop: 'actTime', label: '活动参与时间', type: 'daterange' },
  { prop: 'org', label: '所属机构', type: 'chain', tree: E.orgTree, span: 2 },
  { prop: 'status', label: '人员状态', type: 'select', options: E.personStatus }
]
const outsideFields = [
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄段', type: 'numrange' },
  { prop: 'gender', label: '性别', type: 'select', options: E.genders },
  { prop: 'region', label: '地区', type: 'chain', tree: E.regionTree, depth: 2 },
  { prop: 'education', label: '教育程度', type: 'select', options: E.educations },
  { prop: 'industry', label: '所属行业', type: 'select', options: E.industries },
  { prop: 'attr', label: '属性', type: 'select', options: E.outsideAttrs },
  { prop: 'star', label: '星级', type: 'select', options: E.stars },
  { prop: 'rating', label: '评级', type: 'select', options: E.ratings },
  { prop: 'status', label: '状态', type: 'select', options: E.personStatus },
  { prop: 'actTime', label: '活动参与时间', type: 'daterange' }
]
const fields = props.kind === 'inside' ? insideFields : outsideFields
const initial = Object.fromEntries(
  fields.map((f) => [f.prop, { numrange: ['', ''], chain: [], multi: [], daterange: [] }[f.type] ?? ''])
)

const actIn = (r, range) => !range?.length || r.activities.some((a) => a.time >= range[0] && a.time <= range[1])
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(source, initial, (r, q) =>
  r.level === levelName.value &&
  match.contains(r.id, q.id) &&
  match.contains(r.name, q.name) &&
  match.numRange(r.age, q.age) &&
  match.equals(r.gender, q.gender) &&
  match.chain(r.region, q.region) &&
  match.equals(r.jobLevel, q.jobLevel) &&
  (!q.workTime || r.workTime === q.workTime) &&
  match.equals(r.isOutlet, q.isOutlet) &&
  (!q.channel || r.channels?.includes(q.channel)) &&
  match.anyOf(r.businesses, q.businesses) &&
  match.equals(r.peer, q.peer) &&
  actIn(r, q.actTime) &&
  match.chain(r.org, q.org) &&
  match.equals(r.status, q.status) &&
  match.equals(r.education, q.education) &&
  match.equals(r.industry, q.industry) &&
  match.equals(r.attr, q.attr) &&
  match.equals(r.star, q.star) &&
  match.equals(r.rating, q.rating)
)

const exportColumns = computed(() =>
  props.kind === 'inside'
    ? [{ prop: 'id', label: '统一认证号' }, { prop: 'name', label: '姓名' }, { prop: 'gender', label: '性别' }, { prop: 'age', label: '年龄' }, { prop: 'regionText', label: '地区' }, { prop: 'orgText', label: '所属机构' }, { prop: 'jobLevel', label: '职务层级' }, { prop: 'workTime', label: '参加工作时间' }, { prop: 'isOutlet', label: '是否营业网点工作人员' }, { prop: 'officerLevel', label: '体验官等级' }]
    : [{ prop: 'id', label: '编号' }, { prop: 'name', label: '姓名' }, { prop: 'gender', label: '性别' }, { prop: 'age', label: '年龄' }, { prop: 'regionText', label: '地区' }, { prop: 'education', label: '教育程度' }, { prop: 'industry', label: '所属行业' }, { prop: 'attr', label: '属性' }, { prop: 'type', label: '类型' }, { prop: 'status', label: '状态' }]
)
const exportRows = computed(() => filtered.value.map((r) => ({ ...r, regionText: r.region.join('-'), orgText: r.org?.join('-') })))
const downloadTemplate = () => exportCsv(`${route.meta.title}模板`, exportColumns.value.filter((c) => c.prop !== 'officerLevel'), [])

// 新增 / 修改
const editVisible = ref(false)
const editing = ref(null)
const openEdit = (row) => {
  editing.value = row || null
  editVisible.value = true
}
function save(data) {
  if (editing.value) Object.assign(editing.value, data)
  else source().unshift({ ...data, level: levelName.value, kind: props.kind === 'inside' ? '行内' : '行外', activities: [], officerLevel: '初级' })
  ElMessage.success('保存成功')
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除体验员「${row.name}」？`, '提示', { type: 'warning' })
  source().splice(source().indexOf(row), 1)
  ElMessage.success('删除成功')
}

const detail = ref(null)
const importVisible = ref(false)
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

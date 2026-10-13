<!-- 非在库人员管理 #/nonStoredExperManage：参与过活动但未入库的人员 -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <div class="uem-card">
      <div class="uem-toolbar">
        <AsyncExport name="非在库人员" :columns="columns" :rows="filtered" primary-export />
      </div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="60" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column prop="kind" label="行内/行外" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="id" label="统一认证号" width="140" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="org" label="所属机构" min-width="140" />
        <el-table-column prop="activityCount" label="活动总数" width="100" />
        <el-table-column prop="totalScore" label="总评价" width="100" />
      </el-table>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, sizes, prev, pager, next, jumper" :total="filtered.length" />
    </div>
  </div>
</template>

<script setup>
import SearchForm from '@/components/SearchForm.vue'
import AsyncExport from '@/components/AsyncExport.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { nonStored, genders } from '@/mock/experiencer'

const orgs = [...new Set(nonStored.map((r) => r.org))]
const fields = [
  { prop: 'id', label: '统一认证号' },
  { prop: 'name', label: '姓名' },
  { prop: 'gender', label: '性别', type: 'select', options: genders },
  { prop: 'age', label: '年龄段', type: 'numrange' },
  { prop: 'org', label: '所属机构', type: 'select', options: orgs },
  { prop: 'actTime', label: '活动参与时间', type: 'daterange' }
]
const columns = [
  { prop: 'kind', label: '行内/行外' }, { prop: 'name', label: '姓名' }, { prop: 'id', label: '统一认证号' }, { prop: 'gender', label: '性别' },
  { prop: 'age', label: '年龄' }, { prop: 'org', label: '所属机构' }, { prop: 'activityCount', label: '活动总数' }, { prop: 'totalScore', label: '总评价' }
]
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => nonStored,
  { id: '', name: '', gender: '', age: ['', ''], org: '', actTime: [] },
  (r, q) =>
    match.contains(r.id, q.id) &&
    match.contains(r.name, q.name) &&
    match.equals(r.gender, q.gender) &&
    (q.age.every((x) => x === '') || (r.age !== '' && match.numRange(r.age, q.age))) &&
    match.equals(r.org, q.org) &&
    match.inRange(r.lastTime, q.actTime)
)
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

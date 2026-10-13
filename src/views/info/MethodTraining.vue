<!-- 方法培训 #/methodTraining -->
<template>
  <div>
    <SearchForm :model="form" :fields="fields" @search="search" @reset="reset" />
    <InfoCardGrid v-model:page="page" :items="pageItems" :total="sorted.length" :page-size="pageSize" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SearchForm from '@/components/SearchForm.vue'
import InfoCardGrid from '@/components/InfoCardGrid.vue'
import { useTableQuery, match } from '@/components/useTableQuery'
import { infos, infoOrgs, trainingBoards, trainingForms, fileTypes, sortOptions } from '@/mock'
import { sortInfos } from './sortInfos'

const fields = [
  { prop: 'name', label: '培训名称' },
  { prop: 'publishTime', label: '发布时间', type: 'daterange' },
  { prop: 'org', label: '所属机构', type: 'select', options: infoOrgs },
  { prop: 'board', label: '培训板块', type: 'select', options: trainingBoards },
  { prop: 'form', label: '培训形式', type: 'select', options: trainingForms },
  { prop: 'fileType', label: '文件类型', type: 'select', options: fileTypes },
  { prop: 'sort', label: '排序方式', type: 'select', options: sortOptions },
  { prop: 'author', label: '作者' }
]

const { form, page, filtered, search, reset } = useTableQuery(
  () => infos,
  { name: '', publishTime: [], org: '', board: '', form: '', fileType: '', sort: '', author: '' },
  (it, q) =>
    it.type === '方法培训' &&
    it.status === '发布' &&
    match.contains(it.name, q.name) &&
    match.inRange(it.publishTime, q.publishTime) &&
    match.equals(it.org, q.org) &&
    match.equals(it.board, q.board) &&
    match.equals(it.form, q.form) &&
    match.equals(it.fileType, q.fileType) &&
    match.contains(it.author, q.author)
)
const pageSize = 8
const sorted = computed(() => sortInfos(filtered.value, form.sort))
const pageItems = computed(() => sorted.value.slice((page.value - 1) * pageSize, page.value * pageSize))
</script>

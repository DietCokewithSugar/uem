<!-- 体验研究 #/excellentReport（截图中暂无数据） -->
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
import { infos, infoOrgs, products, reportLevels, reportTypes, sortOptions } from '@/mock'
import { sortInfos } from './sortInfos'

const fields = [
  { prop: 'name', label: '报告名称' },
  { prop: 'publishTime', label: '发布时间', type: 'daterange' },
  { prop: 'org', label: '所属机构', type: 'select', options: infoOrgs },
  { prop: 'product', label: '所属产品', type: 'select', options: products, placeholder: '12月3日前所涉及的产品名称末端均加（原）' },
  { prop: 'level', label: '报告量级', type: 'select', options: reportLevels },
  { prop: 'reportType', label: '报告类型', type: 'select', options: reportTypes },
  { prop: 'sort', label: '排序方式', type: 'select', options: sortOptions },
  { prop: 'author', label: '报告作者' }
]

const { form, page, filtered, search, reset } = useTableQuery(
  () => infos,
  { name: '', publishTime: [], org: '', product: '', level: '', reportType: '', sort: '', author: '' },
  (it, q) =>
    it.type === '体验研究' &&
    it.status === '发布' &&
    match.contains(it.name, q.name) &&
    match.inRange(it.publishTime, q.publishTime) &&
    match.equals(it.org, q.org) &&
    match.equals(it.product, q.product) &&
    match.equals(it.level, q.level) &&
    match.equals(it.reportType, q.reportType) &&
    match.contains(it.author, q.author)
)
const pageSize = 8
const sorted = computed(() => sortInfos(filtered.value, form.sort))
const pageItems = computed(() => sorted.value.slice((page.value - 1) * pageSize, page.value * pageSize))
</script>

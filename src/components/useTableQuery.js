// 列表页通用逻辑：查询条件、过滤、分页
import { reactive, ref, computed } from 'vue'

export function useTableQuery(source, initial, matcher) {
  const form = reactive({ ...initial })
  const applied = ref({ ...initial })
  const page = ref(1)
  const pageSize = ref(10)

  const filtered = computed(() => source().filter((row) => matcher(row, applied.value)))
  const rows = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

  const search = () => {
    applied.value = JSON.parse(JSON.stringify(form))
    page.value = 1
  }
  const reset = () => {
    Object.assign(form, JSON.parse(JSON.stringify(initial)))
    search()
  }
  return { form, page, pageSize, filtered, rows, search, reset }
}

// 常用匹配工具
export const match = {
  contains: (v, q) => !q || String(v ?? '').includes(q),
  equals: (v, q) => !q || q === '全部' || v === q,
  inRange: (v, r) => !r || !r.length || (v >= r[0] && v <= r[1]),
  // 年龄段 [min, max]，空值不限
  numRange: (v, r) => !r || ((r[0] === '' || r[0] == null || v >= Number(r[0])) && (r[1] === '' || r[1] == null || v <= Number(r[1]))),
  // 级联：值数组前缀匹配
  chain: (v = [], q = []) => q.every((x, i) => v[i] === x),
  // 多选：任一命中
  anyOf: (v = [], q = []) => !q.length || q.some((x) => v.includes(x))
}

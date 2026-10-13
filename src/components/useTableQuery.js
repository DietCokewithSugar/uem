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
  inRange: (v, r) => !r || !r.length || (v >= r[0] && v <= r[1])
}

// 登录会话：当前演示身份的读取、切换与持久化（存于浏览器本地，刷新后保持）
import { ref, computed } from 'vue'
import { persons } from '@/mock/system'
import { currentUser } from '@/config/user'
import { personas, DEFAULT_PERSONA, PERSONA_STORAGE_KEY } from '@/config/personas'

// 每次切换身份加一，布局以它作为 key 重新挂载页面，页面内按身份计算的内容随之刷新
export const sessionVersion = ref(0)
export const personaKey = ref(DEFAULT_PERSONA)

const personOf = (p) => persons.find((x) => x.id === p.personId)

export const personaOptions = computed(() =>
  personas
    .map((p) => ({ ...p, person: personOf(p) }))
    .filter((p) => p.person && p.person.status !== '冻结')
)
export const currentPersona = computed(() => personaOptions.value.find((p) => p.key === personaKey.value) || null)

function apply(key) {
  const p = personas.find((x) => x.key === key) || personas.find((x) => x.key === DEFAULT_PERSONA)
  const person = p && personOf(p)
  if (!person) return false
  personaKey.value = p.key
  Object.assign(currentUser, { id: person.id, name: person.name, dept: person.org })
  return true
}

export function restorePersona() {
  let key = DEFAULT_PERSONA
  try {
    key = localStorage.getItem(PERSONA_STORAGE_KEY) || DEFAULT_PERSONA
  } catch {}
  if (!apply(key)) apply(DEFAULT_PERSONA)
}

export function switchPersona(key) {
  if (!apply(key)) return false
  try {
    localStorage.setItem(PERSONA_STORAGE_KEY, key)
  } catch {}
  sessionVersion.value++
  return true
}

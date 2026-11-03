// 跨页面草稿：首页「提交优化建议」卡片输入的描述，带到新增页继续完善（仅保留在当前会话内存中）
import { reactive } from 'vue'

export const suggestDraft = reactive({ text: '' })

export function takeSuggestDraft() {
  const text = suggestDraft.text
  suggestDraft.text = ''
  return text
}

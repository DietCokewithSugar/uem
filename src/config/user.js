// 当前登录用户（行外演示版使用虚拟身份）
// SEED_USER：生成演示数据时使用的固定身份（原截图中的系统管理员），演示数据不随身份切换而变化
// currentUser：当前登录身份，可在顶栏「切换演示身份」中切换（见 config/session.js）
import { reactive } from 'vue'

export const SEED_USER = Object.freeze({
  id: '001700001',
  name: '系统管理员',
  dept: '业务研发中心用户体验部'
})

export const currentUser = reactive({ ...SEED_USER })

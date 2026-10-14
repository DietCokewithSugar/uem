import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as Icons from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
for (const [name, comp] of Object.entries(Icons)) app.component(name, comp)
// 分页跳页文案与平台一致：「跳至 [ ] 页」
const locale = { ...zhCn, el: { ...zhCn.el, pagination: { ...zhCn.el.pagination, goto: '跳至' } } }
app.use(ElementPlus, { locale }).use(router).mount('#app')

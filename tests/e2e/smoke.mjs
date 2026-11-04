// 路由巡检：启动开发服务器，按演示身份逐个打开全部路由，检查页面报错和空白页。
// 用法：npm run test:e2e            （全部身份）
//       npm run test:e2e -- admin   （只跑指定身份，身份 key 见 src/config/personas.js）
// 首次在新环境运行前需安装浏览器：npx playwright install chromium
import { existsSync } from 'node:fs'
import { createServer } from 'vite'
import { chromium } from 'playwright'

// 需要查询参数才能看到内容的页面：按真实入口补上参数
const EXTRA = [
  '/optimPending?type=&suggestStatus=1',
  '/optimPending?type=&suggestStatus=2',
  '/optimPending?type=&suggestStatus=3',
  '/optimPending?type=&suggestStatus=4',
  '/optimPending?type=&suggestStatus=5',
  '/optimPending?type=&suggestStatus=6',
  '/optimPending?type=&suggestStatus=7',
  '/userJourneyManagementNew?tab=problems',
  '/experEvaluationMaintenance?tab=product',
  '/taskAdd?taskListType=1',
  '/noticeAdd?isFh=0&routeType=0'
]

const onlyPersonas = process.argv.slice(2)
const server = await createServer({ server: { port: 0, host: '127.0.0.1' }, logLevel: 'error' })
await server.listen()
const base = server.resolvedUrls.local[0]
const browser = await chromium.launch()
let failures = 0

async function crawl(persona) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  if (persona) await context.addInitScript((key) => { try { localStorage.setItem('uem.persona', key) } catch {} }, persona)
  const page = await context.newPage()
  let current = '(启动)'
  const problems = []
  page.on('pageerror', (e) => problems.push([current, `页面异常：${e.message}`]))
  page.on('console', (m) => { if (m.type() === 'error') problems.push([current, `控制台错误：${m.text()}`]) })
  await page.goto(base, { waitUntil: 'networkidle' })

  const paths = await page.evaluate(() => {
    const router = document.querySelector('#app').__vue_app__.config.globalProperties.$router
    return router.getRoutes().filter((r) => !r.redirect && !r.path.includes(':') && r.path !== '/').map((r) => r.path)
  })
  const all = [...new Set([...paths, ...EXTRA])]
  for (const p of all) {
    current = p
    await page.evaluate((h) => { location.hash = '#' + h }, p)
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(250)
    const text = await page.evaluate(() => document.querySelector('#app')?.innerText.trim().length || 0)
    if (text < 20) problems.push([p, '页面内容为空'])
  }
  await context.close()
  const label = persona || '默认身份'
  if (problems.length) {
    failures += problems.length
    console.log(`✗ ${label}：${all.length} 个页面，${problems.length} 个问题`)
    for (const [p, msg] of problems) console.log(`    ${p}  ${msg.slice(0, 300)}`)
  } else {
    console.log(`✓ ${label}：${all.length} 个页面无报错`)
  }
}

try {
  // 身份清单由应用提供（src/config/personas.js）；尚未引入身份时只跑默认身份
  const personas = await (async () => {
    if (!existsSync(new URL('../../src/config/personas.js', import.meta.url))) return []
    try {
      const mod = await server.ssrLoadModule('/src/config/personas.js')
      return (mod.personas || []).map((x) => x.key)
    } catch {
      return []
    }
  })()
  const list = onlyPersonas.length ? onlyPersonas : personas.length ? personas : [null]
  for (const key of list) await crawl(key)
} finally {
  await browser.close()
  await server.close()
}
process.exit(failures ? 1 : 0)

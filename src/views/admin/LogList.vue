<!-- 后台管理 · 日志管理 #/log：查看、下载 uem-server 服务器日志文件；列表接口 GET /icbc/uem-server/log 受「接口权限」控制，未授权时列表为空 -->
<template>
  <div>
    <div class="uem-card filter">
      <span>文件名</span>
      <el-input v-model="form.name" clearable placeholder="请输入文件名" style="width: 320px" @keyup.enter="search" />
      <span class="gap" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="uem-card">
      <el-table :data="rows">
        <el-table-column prop="name" label="文件名称" min-width="280" />
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }"><span :class="row.status === '写入中' ? 'on' : ''">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column prop="time" label="时间" min-width="180" />
        <el-table-column label="操作" min-width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="download(row)">下载</el-button>
            <el-button link type="primary" @click="view(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="foot">
        <div v-if="!allowed" class="deny">
          <template v-if="forbidden">当前用户已被列入日志接口 {{ LOG_API.method }} {{ LOG_API.uri }} 的禁止用户，可在「<router-link to="/interfaceList" class="uem-link">接口权限</router-link>」中将其移出</template>
          <template v-else>当前用户未获授权访问日志接口 {{ LOG_API.method }} {{ LOG_API.uri }}，可在「<router-link to="/interfaceList" class="uem-link">接口权限</router-link>」中将其加入允许用户</template>
        </div>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" class="pager" layout="total, prev, pager, next, jumper" :total="filtered.length" />
      </div>
    </div>

    <el-dialog v-model="viewVisible" :title="viewing ? `查看日志 · ${viewing.name}` : ''" width="1000px" top="8vh" @opened="toBottom">
      <template v-if="viewing">
        <div class="meta">最后修改时间 {{ viewing.time }}，共 {{ viewLines.length.toLocaleString() }} 行，显示最后 {{ tail.length }} 行</div>
        <pre ref="preRef" class="log">{{ tail.join('\n') }}</pre>
      </template>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
        <el-button type="primary" @click="download(viewing)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useTableQuery } from '@/components/useTableQuery'
import { serverLogs, logLines, logText, LOG_API } from '@/mock/serverLogs'
import { apiPermissions, canAccess } from '@/mock/apiPermissions'
import { persons } from '@/mock/system'
import { currentUser } from '@/config/user'

// 当前用户的角色取自「人员维护」，接口权限变更后列表即时生效
const allowed = computed(() => canAccess(LOG_API.uri, LOG_API.method, { id: currentUser.id, roles: persons.find((p) => p.id === currentUser.id)?.roles || [] }))
const forbidden = computed(() => apiPermissions.some((r) => r.status === '开启' && r.uri === LOG_API.uri && r.method === LOG_API.method && r.denyUsers.includes(currentUser.id)))
const { form, page, pageSize, filtered, rows, search, reset } = useTableQuery(
  () => (allowed.value ? serverLogs : []),
  { name: '' },
  (f, q) => !q.name.trim() || f.name.toLowerCase().includes(q.name.trim().toLowerCase())
)

// 下载：.gz 文件在浏览器端压缩，其余为纯文本
async function download(file) {
  let blob = new Blob([logText(file)], { type: 'text/plain' })
  let name = file.name
  if (name.endsWith('.gz')) {
    if (typeof CompressionStream === 'function') blob = await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob()
    else name = name.replace(/\.gz$/, '')
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  ElMessage.success(`已开始下载 ${name}`)
}

const viewVisible = ref(false)
const viewing = ref(null)
const viewLines = computed(() => (viewing.value ? logLines(viewing.value) : []))
const tail = computed(() => viewLines.value.slice(-50))
const preRef = ref()
const toBottom = () => preRef.value && (preRef.value.scrollTop = preRef.value.scrollHeight)
function view(file) {
  viewing.value = file
  viewVisible.value = true
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.on { color: #3c9a5f; }
.foot { display: flex; align-items: center; gap: 16px; margin-top: 16px; }
.deny { font-size: 12px; color: #999; }
.pager { margin-left: auto; justify-content: flex-end; }
.meta { margin-bottom: 8px; font-size: 12px; color: #888; }
.log { margin: 0; max-height: 60vh; overflow: auto; padding: 12px 14px; background: #f7f8fa; color: #333; border: 1px solid var(--uem-border); border-radius: 4px; font: 12px/1.6 Menlo, Consolas, 'Courier New', monospace; white-space: pre-wrap; overflow-wrap: anywhere; tab-size: 4; }
</style>

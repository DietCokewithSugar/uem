<!-- 用户声音上传 #/customerSoundUpload：批量导入声音，经智能模型识别后进入声音明细 -->
<template>
  <div class="uem-card">
    <div class="uem-toolbar">
      <el-upload :show-file-list="false" action="#" :auto-upload="false" accept=".csv" :on-change="onFile">
        <el-button type="primary">批量导入</el-button>
      </el-upload>
      <el-button @click="exportCsv('用户声音上传模板', tplCols, tplRows)">下载模板</el-button>
      <el-button @click="router.push('/cusAllVoice')">查看结果</el-button>
    </div>
    <el-table :data="voiceUploads">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="time" label="导入时间" width="200" />
      <el-table-column prop="uploader" label="上传人" min-width="140" />
      <el-table-column prop="count" label="导入用户声音量" width="160" />
      <el-table-column label="处理状态" width="140">
        <template #default="{ row }"><span :class="row.status === '处理完成' ? 'ok' : 'wait'">{{ row.status }}</span></template>
      </el-table-column>
    </el-table>
    <el-pagination class="pager" layout="total, prev, pager, next" :total="voiceUploads.length" />
    <p class="hint">演示环境：导入 CSV 后，声音经脱敏与智能模型识别（有效性、情绪、ETS 维度）写入「客户声音 · 全部声音」。</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { exportCsv } from '@/components/exportCsv'
import { parseCsv } from '@/components/parseCsv'
import { voiceUploads, desensitize, runTool } from '@/mock/voiceTools'
import { voices, voiceProducts, voiceSources, emotionScoreOf } from '@/mock/voice'
import { classifyVoice } from '../classifyVoice'
import { nowText } from '@/mock/qc'
import { currentUser } from '@/config/user'

const router = useRouter()
const tplCols = [{ prop: 'time', label: '提出时间' }, { prop: 'source', label: '声音来源' }, { prop: 'product', label: '所属产品' }, { prop: 'column', label: '功能栏目' }, { prop: 'desc', label: '声音描述' }]
const tplRows = [{ time: nowText(), source: 'app用户反馈', product: '融e行基础业务', column: '转账汇款', desc: '转账限额太低，线上无法调整' }]

function onFile(file) {
  if (!/\.csv$/i.test(file.name)) return ElMessage.warning('演示环境仅支持 CSV 格式，请先下载模板')
  const reader = new FileReader()
  reader.onload = () => {
    const [head = [], ...body] = parseCsv(reader.result)
    const idx = (k) => head.findIndex((h) => h.includes(k))
    const [iTime, iSrc, iProd, iCol, iDesc] = ['时间', '来源', '产品', '栏目', '描述'].map(idx)
    if (iDesc < 0) return ElMessage.error('模板缺少「声音描述」列')
    const rows = body.filter((r) => r[iDesc]?.trim())
    if (!rows.length) return ElMessage.warning('文件中没有可导入的声音')
    const rec = { id: Date.now(), time: nowText(), uploader: currentUser.name, count: rows.length, status: '处理中' }
    voiceUploads.unshift(rec)
    setTimeout(() => {
      const valid = runTool('valid', rows.map((r, i) => ({ id: i, text: r[iDesc] })))
      rows.forEach((r, i) => {
        const desc = desensitize(r[iDesc].trim())
        const product = voiceProducts.find((p) => p.name === r[iProd])?.name || '融e行基础业务'
        const { emotion, dim } = classifyVoice(desc)
        voices.unshift({
          id: `U${rec.id}${i}`, time: r[iTime] || nowText(), source: voiceSources.includes(r[iSrc]) ? r[iSrc] : 'app用户反馈',
          product, column: r[iCol] || '其他', desc, emotion, dim, score: emotionScoreOf(emotion), journeyAction: '', handled: '未处理',
          valid: valid[i].有效性 === '有效'
        })
      })
      rec.status = '处理完成'
      ElMessage.success(`导入完成：${rows.length} 条，其中有效 ${valid.filter((v) => v.有效性 === '有效').length} 条`)
    }, 900)
  }
  reader.readAsText(file.raw, 'utf-8')
}
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: flex-end; }
.ok { color: #3c9a5f; }
.wait { color: #e6a23c; }
.hint { color: #999; font-size: 12px; margin-top: 12px; }
</style>

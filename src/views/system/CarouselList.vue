<!-- 首页维护 · 轮播图维护 #/carouseMaintenanceList：控制首页横幅展示内容 -->
<template>
  <div>
    <div class="uem-card filter">
      <span>状态</span>
      <el-select v-model="q" clearable placeholder="请选择" style="width: 420px"><el-option v-for="s in ['展示中', '已下线']" :key="s" :label="s" :value="s" /></el-select>
      <span class="gap" />
      <el-button type="primary" @click="applied = q">查询</el-button>
      <el-button @click="q = applied = ''">重置</el-button>
    </div>
    <div class="uem-card">
      <div class="uem-toolbar"><el-button type="primary" @click="open()">新增</el-button></div>
      <el-table :data="rows">
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><span :class="row.status === '展示中' ? 'on' : 'off'">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column prop="time" label="维护时间" width="180" />
        <el-table-column prop="sort" label="排序" width="80"><template #default="{ row }">{{ row.sort || '-' }}</template></el-table-column>
        <el-table-column label="轮播缩略图" width="140">
          <template #default="{ row }"><div class="thumb" @click="preview = row"><div class="scaled" style="transform: scale(0.1)"><CarouselSlide :item="row" /></div></div></template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="260" />
        <el-table-column label="操作" width="170">
          <template #default="{ row }">
            <el-button link type="primary" @click="toggle(row)">{{ row.status === '展示中' ? '冻结' : '激活' }}</el-button>
            <el-button link type="primary" @click="open(row)">修改</el-button>
            <el-button v-if="row.status !== '展示中'" link type="primary" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pager" layout="total, prev, pager, next" :total="rows.length" />
    </div>

    <el-dialog :model-value="!!preview" :title="preview?.title" width="760px" @close="preview = null">
      <div v-if="preview" class="preview"><div class="scaled" style="transform: scale(0.75)"><CarouselSlide :item="preview" /></div></div>
    </el-dialog>

    <el-dialog v-model="dialog" :title="editing ? '修改轮播图' : '新增轮播图'" width="600px">
      <el-form ref="formRef" :model="d" :rules="rules" label-width="90px">
        <el-form-item label="标题" prop="title"><el-input v-model="d.title" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="d.sort" :min="1" :max="99" /></el-form-item>
        <el-form-item label="跳转链接"><el-input v-model="d.link" placeholder="可选，点击轮播图后跳转的资讯或页面" /></el-form-item>
        <el-form-item label="轮播图片">
          <div class="upload-row">
            <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="onImg"><el-button>选择图片</el-button></el-upload>
            <span class="hint">建议尺寸 1200×400；未上传时使用主题色块</span>
          </div>
          <el-radio-group v-if="!d.src" v-model="d.theme" class="themes">
            <el-radio v-for="t in themes" :key="t.v" :value="t.v">{{ t.l }}</el-radio>
          </el-radio-group>
          <div class="mini"><div class="scaled" style="transform: scale(0.3125)"><CarouselSlide :item="d" /></div></div>
        </el-form-item>
        <el-form-item label="立即展示"><el-switch v-model="d.show" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CarouselSlide from '@/components/CarouselSlide.vue'
import { carousels } from '@/mock/system'
import { nowText } from '@/mock/qc'

const q = ref('')
const applied = ref('')
const rows = computed(() => carousels.filter((c) => !applied.value || c.status === applied.value))
const preview = ref(null)
const themes = [{ v: 'blue', l: '蓝色' }, { v: 'navy', l: '深蓝' }, { v: 'red', l: '红色' }, { v: 'warm', l: '暖色' }, { v: 'slogan', l: '宣传标语' }]

function toggle(row) {
  const on = row.status !== '展示中'
  if (!on && carousels.filter((c) => c.status === '展示中').length === 1) return ElMessage.warning('首页至少保留一张展示中的轮播图')
  Object.assign(row, { status: on ? '展示中' : '已下线', sort: on ? row.sort || nextSort() : '', time: nowText() })
  ElMessage.success(on ? '已激活，首页横幅将展示该轮播图' : '已下线')
}
const nextSort = () => Math.max(0, ...carousels.map((c) => Number(c.sort) || 0)) + 1
async function remove(row) {
  await ElMessageBox.confirm(`确认删除轮播图「${row.title}」？`, '提示', { type: 'warning' })
  carousels.splice(carousels.indexOf(row), 1)
  ElMessage.success('删除成功')
}

const dialog = ref(false)
const editing = ref(null)
const formRef = ref()
const d = reactive({})
const rules = { title: [{ required: true, message: '请输入标题' }] }
function open(row) {
  editing.value = row || null
  Object.assign(d, { title: '', sort: nextSort(), link: '', src: '', theme: 'blue', show: false }, row ? { ...row, sort: Number(row.sort) || nextSort(), show: row.status === '展示中' } : {})
  dialog.value = true
}
function onImg(file) {
  const r = new FileReader()
  r.onload = () => (d.src = r.result)
  r.readAsDataURL(file.raw)
}
async function save() {
  await formRef.value.validate()
  const { show, ...data } = d
  Object.assign(data, { status: show ? '展示中' : '已下线', sort: show ? data.sort : '', time: nowText() })
  if (editing.value) Object.assign(editing.value, data)
  else carousels.unshift({ ...data, id: `c${Date.now()}` })
  dialog.value = false
  ElMessage.success(show ? '保存成功，已在首页横幅展示' : '保存成功')
}
</script>

<style scoped>
.filter { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 14px; color: #555; }
.filter .el-button + .el-button { margin-left: 0; }
.gap { flex: 1; }
.thumb { width: 96px; height: 32px; border-radius: 2px; overflow: hidden; cursor: zoom-in; }
/* 以 960×320 原尺寸绘制后等比缩放，缩略图与首页横幅一致 */
.scaled { width: 960px; height: 320px; font-size: 13px; transform-origin: 0 0; }
.preview { width: 720px; height: 240px; border-radius: 4px; overflow: hidden; }
.upload-row { display: flex; align-items: center; gap: 10px; }
.hint { color: #999; font-size: 12px; }
.themes { margin-top: 6px; }
.mini { width: 300px; height: 100px; margin-top: 8px; border-radius: 4px; overflow: hidden; border: 1px solid #eee; }
.on { color: #3c9a5f; }
.off { color: #999; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>

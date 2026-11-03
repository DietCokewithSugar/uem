<!-- 员工心声 #/empAspirrations：行内员工使用智能问答（工银智涌）的情况 -->
<template>
  <div class="emp">
    <div class="filters uem-card">
      <span>时间</span>
      <el-select v-model="f.unit" size="small" style="width: 80px"><el-option v-for="u in ['年', '月']" :key="u" :label="u" :value="u" /></el-select>
      <el-date-picker v-model="f.time" :type="f.unit === '年' ? 'year' : 'month'" size="small" :value-format="f.unit === '年' ? 'YYYY' : 'YYYY-MM'" style="width: 160px" />
      <span>业务</span>
      <el-select v-model="f.biz" size="small" clearable placeholder="请选择" style="width: 200px"><el-option v-for="[b] in d.asking.业务领域" :key="b" :label="b" :value="b" /></el-select>
      <span>话题</span>
      <el-select v-model="f.topic" size="small" clearable placeholder="请选择" style="width: 200px"><el-option v-for="w in d.hotWords" :key="w" :label="w" :value="w" /></el-select>
      <el-button type="primary" size="small" @click="ElMessage.success('已按条件刷新（演示数据）')">查询</el-button>
      <el-button size="small" @click="Object.assign(f, { unit: '年', time: '2025', biz: '', topic: '' })">重置</el-button>
    </div>

    <div class="grid">
      <div class="col">
        <Panel title="使用情况">
          <template #extra><el-tooltip content="注册用户：已登录过工银智涌的员工；专家用户：负责答复问题的业务专家"><el-icon class="tip"><InfoFilled /></el-icon></el-tooltip></template>
          <div class="usage">
            <div><div class="lbl">注册用户</div><div class="num">{{ d.registered }}<small>万人</small></div></div>
            <EChart class="ring" :option="ring(d.regRatio, ['#2a78d6', '#eb6834'], '%')" />
            <div><div class="lbl">专家用户</div><div class="num">{{ d.experts }}<small>人</small></div></div>
            <div class="rings">
              <EChart class="ring sm" :option="ring(d.expertSplit, ['#2a78d6', '#1baf7a'])" />
              <EChart class="ring sm" :option="ring(d.deptSplit, ['#eda100', '#6250d6'])" />
            </div>
          </div>
        </Panel>
        <Panel title="搜索情况">
          <div class="kv"><div><div class="lbl">累计搜索</div><div class="num">{{ d.searchTotal }}<small>万次</small></div></div><EChart class="bar" :option="barLine(d.searchTrend)" /></div>
        </Panel>
        <Panel title="提问情况">
          <div class="kv"><div><div class="lbl">累计提问</div><div class="num">{{ d.askTotal }}<small>万次</small></div></div><EChart class="bar" :option="barLine(d.askTrend)" /></div>
        </Panel>
      </div>

      <Panel title="地区热度" class="map-panel">
        <template #extra>
          <el-radio-group v-model="heatKey" size="small">
            <el-radio-button value="user">用户</el-radio-button>
            <el-radio-button value="ask">问题</el-radio-button>
            <el-radio-button value="answer">回答</el-radio-button>
          </el-radio-group>
        </template>
        <div class="map-top">
          <div><div class="lbl">全国活跃行内用户</div><div class="num">{{ d.activeUsers }}<small>万人</small></div></div>
          <div class="rank">
            <div class="lbl">活跃用户排行榜</div>
            <div v-for="(b, i) in d.topBranches" :key="b" class="rank-item"><span :class="['idx', `i${i}`]">{{ i + 1 }}</span>{{ b }}</div>
          </div>
        </div>
        <EChart v-if="mapReady" class="map" :option="mapOpt" />
      </Panel>

      <div class="col">
        <Panel title="大家都在问">
          <template #extra>
            <el-radio-group v-model="askKey" size="small"><el-radio-button value="业务领域">业务领域</el-radio-button><el-radio-button value="产品领域">产品领域</el-radio-button></el-radio-group>
          </template>
          <div v-for="([n, v], i) in d.asking[askKey]" :key="n" class="list-item">
            <span :class="['badge', `b${i}`]">{{ i + 1 }}</span><span class="txt">{{ n }}</span><span class="cnt"><el-icon><View /></el-icon>{{ v }}</span>
          </div>
        </Panel>
        <Panel title="大家都在看">
          <div class="sub-title">热门问题</div>
          <div v-for="([q, v], i) in d.hotQuestions" :key="q" class="list-item">
            <span :class="['badge', `b${i}`]">{{ i + 1 }}</span><span class="txt">{{ q }}</span><span class="cnt"><el-icon><View /></el-icon>{{ v }}</span>
          </div>
          <div class="sub-title">热搜词</div>
          <div class="words"><el-tag v-for="w in d.hotWords" :key="w" effect="plain" size="small">{{ w }}</el-tag></div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import EChart from '@/components/EChart.vue'
import Panel from '@/components/Panel.vue'
import { empData as d, provinceHeat } from '@/mock/voice'

const f = reactive({ unit: '年', time: '2025', biz: '', topic: '' })
const heatKey = ref('user')
const askKey = ref('业务领域')

// 中国地图 GeoJSON 按需加载（MIT，来自 china-geojson）
const mapReady = ref(false)
onMounted(async () => {
  if (!echarts.getMap('china')) echarts.registerMap('china', (await import('@/assets/china.json')).default)
  mapReady.value = true
})

const ring = (data, color, unit = '') => ({
  color,
  tooltip: { formatter: `{b}：{c}${unit}` },
  legend: { orient: 'vertical', left: 'center', top: 'middle', itemWidth: 6, itemHeight: 6, textStyle: { fontSize: 9, color: '#666' } },
  series: [{ type: 'pie', radius: ['72%', '86%'], label: { show: true, position: 'outside', formatter: `{c}${unit}`, fontSize: 10 }, labelLine: { length: 4, length2: 4 }, data: data.map(([name, value]) => ({ name, value })) }]
})
const months = ['2月', '4月', '6月', '8月', '10月', '12月']
const barLine = (data) => ({
  grid: { left: 60, right: 10, top: 10, bottom: 26 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: months, axisLabel: { fontSize: 10, rotate: 40 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [
    { type: 'bar', barWidth: 8, itemStyle: { color: '#2a78d6', borderRadius: [3, 3, 0, 0] }, data },
    { type: 'line', symbol: 'none', smooth: true, lineStyle: { color: '#868d98', width: 1 }, data }
  ]
})

const mapOpt = computed(() => {
  const data = provinceHeat.map((p) => ({ name: p.name, value: p[heatKey.value] }))
  const max = Math.max(...data.map((x) => x.value))
  return {
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}：${p.value ?? 0}` },
    visualMap: { min: 0, max, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 10, itemHeight: 260, calculable: true, inRange: { color: ['#dbe8f8', '#5b9be4', '#1d5bb0'] }, textStyle: { fontSize: 10 } },
    series: [{
      type: 'map', map: 'china', roam: false, top: 10, bottom: 50, label: { show: true, fontSize: 9, color: '#333' },
      itemStyle: { borderColor: '#fff', areaColor: '#eef0f3' }, emphasis: { itemStyle: { areaColor: '#164a8f' }, label: { color: '#fff' } },
      data
    }]
  }
})
</script>

<style scoped>
.emp { padding: 12px 20px 30px; }
.filters { display: flex; align-items: center; gap: 10px; padding: 12px 20px; margin-bottom: 12px; font-size: 13px; color: #555; }
.filters .el-button + .el-button { margin-left: 0; }
.grid { display: grid; grid-template-columns: 1fr 1.25fr 1fr; gap: 12px; }
.col { display: flex; flex-direction: column; gap: 12px; }
.lbl { color: #555; font-size: 14px; }
.num { font-size: 26px; font-family: Georgia, serif; color: #333; margin-top: 6px; }
.num small { font-size: 12px; margin-left: 2px; }
.usage { display: grid; grid-template-columns: 1fr 1.3fr; align-items: center; row-gap: 8px; }
.ring { height: 120px; }
.rings { display: flex; }
.ring.sm { height: 110px; flex: 1; }
.kv { display: grid; grid-template-columns: 1fr 1.6fr; align-items: center; }
.bar { height: 130px; }
.tip { color: #999; cursor: help; }
.map-panel :deep(.panel-body) { display: flex; flex-direction: column; }
.map-top { display: flex; justify-content: space-between; }
.rank-item { font-size: 13px; color: #444; margin-top: 6px; display: flex; align-items: center; gap: 8px; }
.idx { width: 16px; text-align: center; color: var(--uem-ink-3); font-size: 12px; }
.idx.i0 { color: var(--uem-ink); font-weight: 600; }
.map { flex: 1; min-height: 460px; }
.list-item { display: flex; align-items: flex-start; gap: 8px; padding: 7px 0; font-size: 13px; color: #333; }
.badge { width: 18px; height: 18px; line-height: 18px; text-align: center; font-size: 11px; font-weight: 600; color: var(--uem-ink-2); background: var(--uem-line-2); border-radius: var(--uem-radius-sm); flex-shrink: 0; margin-top: 1px; font-variant-numeric: tabular-nums; }
.txt { flex: 1; line-height: 1.5; }
.cnt { color: #999; font-size: 12px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0; }
.sub-title { font-weight: 600; font-size: 14px; margin: 4px 0 4px; }
.words { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
@media (max-width: 1400px) { .grid { grid-template-columns: 1fr 1fr; } }
</style>

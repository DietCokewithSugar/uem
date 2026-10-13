<!-- 用户旅程地图：旅程结构 / 驱动因素 / 体验指标 / 典型问题 / 优化点
     列 = 用户行为；readonly 时为看板/预览展示 -->
<template>
  <div class="jmap" :class="{ readonly }">
    <div class="canvas" :style="{ zoom }">
      <!-- 旅程结构 -->
      <MapSection v-model:open="open.structure" title="旅程结构" tip="用户完成目标过程中的关键行为，以及每个行为中与用户接触的触点">
        <template v-if="readonly && !map.behaviors.some((b) => b.name)" #empty>
          <slot name="empty-structure" />
        </template>
        <div class="row">
          <div class="label"><span class="chip">行为</span></div>
          <div
            v-for="(b, i) in map.behaviors"
            :key="b.id"
            class="cell behavior"
            :class="[map.arrow, { last: i === map.behaviors.length - 1 }]"
          >
            <input v-if="!readonly" v-model="b.name" placeholder="请输入用户行为" />
            <span v-else>{{ b.name || '—' }}</span>
            <el-icon v-if="!readonly && map.behaviors.length > 1" class="del" @click="removeBehavior(i)"><Close /></el-icon>
          </div>
          <div v-if="!readonly" class="add-col" title="新增行为" @click="addBehavior"><el-icon><Plus /></el-icon></div>
        </div>
        <div class="touch-block">
          <div class="touch-chip"><span class="chip tall">触点</span></div>
          <div class="touch-rows">
            <div v-for="(t, ti) in map.touchpoints" :key="ti" class="row">
              <div class="role">
                <input v-if="!readonly" v-model="t.role" placeholder="角色" />
                <span v-else>{{ t.role }}</span>
                <el-icon v-if="!readonly && map.touchpoints.length > 1" class="del inline" @click="map.touchpoints.splice(ti, 1)"><Close /></el-icon>
              </div>
              <div v-for="b in map.behaviors" :key="b.id" class="cell">
                <input v-if="!readonly" v-model="t.cells[b.id]" placeholder="请输入触点" />
                <span v-else>{{ t.cells[b.id] || '—' }}</span>
              </div>
            </div>
            <div v-if="!readonly" class="add-row small" @click="map.touchpoints.push({ role: '', cells: {} })"><el-icon><Plus /></el-icon></div>
          </div>
        </div>
      </MapSection>

      <!-- 驱动因素 -->
      <MapSection v-model:open="open.drivers" title="驱动因素" tip="驱动用户进入该行为的动机、诉求或外部因素">
        <LabeledRows :rows="map.drivers" :behaviors="map.behaviors" :readonly="readonly" label-placeholder="请输入因素" cell-placeholder="请输入驱动因素" />
      </MapSection>

      <!-- 体验指标 -->
      <MapSection v-model:open="open.metrics" title="体验指标" tip="从主观态度、行为交易、声音问题三个维度衡量各行为的体验">
        <div v-for="(m, mi) in map.metrics" :key="mi" class="metric-group">
          <div v-for="(r, ri) in m.rows" :key="ri" class="row">
            <div class="label">
              <template v-if="ri === 0">
                <input v-if="!readonly" v-model="m.category" class="chip-input" placeholder="指标类别" />
                <span v-else class="chip">{{ m.category }}</span>
              </template>
            </div>
            <div v-for="b in map.behaviors" :key="b.id" class="cell metric">
              <template v-if="!readonly">
                <input v-model="metricCell(r, b.id).name" placeholder="请输入指标" />
                <input v-model="metricCell(r, b.id).value" placeholder="请输入值" />
                <input v-model="metricCell(r, b.id).unit" placeholder="请输入单位" />
              </template>
              <span v-else-if="r.cells[b.id]?.name">
                {{ r.cells[b.id].name }} <b>{{ r.cells[b.id].value }}</b>{{ r.cells[b.id].unit }}
              </span>
              <span v-else>—</span>
            </div>
          </div>
          <div v-if="!readonly" class="add-row small" @click="m.rows.push({ cells: {} })"><el-icon><Plus /></el-icon></div>
        </div>
        <div v-if="!readonly" class="add-row" @click="map.metrics.push({ category: '', rows: [{ cells: {} }] })"><el-icon><Plus /></el-icon></div>
      </MapSection>

      <!-- 典型问题 -->
      <MapSection v-model:open="open.problems" title="典型问题" tip="各行为中用户声音最集中的问题，关联用户声音条数">
        <template #extra><slot name="problems-extra" /></template>
        <div class="row">
          <div class="label"><span class="chip">典型问题</span></div>
          <div v-for="b in map.behaviors" :key="b.id" class="cell problems">
            <div v-for="(p, pi) in map.problems[b.id] || []" :key="p.id" class="problem" :class="{ done: p.status === '已处理', editing: !readonly }">
              <template v-if="!readonly">
                <input v-model="p.text" placeholder="请输入典型问题" />
                <el-icon class="del inline" @click="map.problems[b.id].splice(pi, 1)"><Close /></el-icon>
              </template>
              <template v-else>
                <span>{{ p.text }}</span>
                <em>{{ p.voices }} 条声音 · {{ p.status }}</em>
              </template>
            </div>
            <span v-if="readonly && !(map.problems[b.id] || []).length">—</span>
            <span v-if="!readonly" class="link" @click="addProblem(b.id)">+ 添加问题</span>
          </div>
        </div>
      </MapSection>

      <!-- 优化点 -->
      <MapSection v-model:open="open.optimizations" title="优化点" tip="针对典型问题提出的优化方向">
        <LabeledRows :rows="map.optimizations" :behaviors="map.behaviors" :readonly="readonly" label-placeholder="请输入类别" cell-placeholder="请输入优化点" />
      </MapSection>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import MapSection from './MapSection.vue'
import LabeledRows from './LabeledRows.vue'
import { uid } from '@/mock/journey'

const props = defineProps({
  map: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
  zoom: { type: Number, default: 1 }
})

const open = reactive({ structure: true, drivers: true, metrics: true, problems: props.readonly, optimizations: props.readonly })

const addBehavior = () => props.map.behaviors.push({ id: uid(), name: '' })
function removeBehavior(i) {
  const [b] = props.map.behaviors.splice(i, 1)
  delete props.map.problems[b.id]
}
const metricCell = (row, bid) => (row.cells[bid] ||= { name: '', value: '', unit: '' })
const addProblem = (bid) => (props.map.problems[bid] ||= []).push({ id: uid('p'), text: '', voices: 0, status: '待处理' })
</script>

<style scoped>
.jmap { overflow-x: auto; padding-bottom: 8px; }
.canvas { min-width: max-content; }
.row { display: flex; align-items: stretch; gap: 8px; margin-bottom: 8px; }
.label { width: 150px; flex-shrink: 0; display: flex; align-items: center; }
.chip, .chip-input {
  display: inline-flex; align-items: center; justify-content: center;
  width: 130px; height: 34px; background: #f8dfb4; color: #6b4a12; border: 1px solid #efc98a;
  border-radius: 2px; font-size: 13px;
}
.chip-input { outline: none; text-align: center; }
.chip.tall { height: 100%; min-height: 70px; width: 60px; }
.cell {
  width: 200px; flex-shrink: 0; position: relative;
  border: 1px solid #e6e8eb; background: #fff; border-radius: 2px; padding: 6px 8px; font-size: 13px;
  display: flex; align-items: center; gap: 4px;
}
.readonly .cell { background: #fafbfc; }
.cell input, .role input {
  width: 100%; border: none; outline: none; background: transparent; font-size: 13px; color: #333;
}
.cell input::placeholder, .role input::placeholder { color: #c0c4cc; }

/* 行为：箭头样式 / 直线样式 */
.behavior.chevron {
  background: #fff4e6; border-color: #f3d3a5;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%);
  padding-left: 22px; padding-right: 22px; border: none;
}
.behavior.line { background: #fff4e6; border-color: #f3d3a5; }
.behavior.line:not(.last)::after {
  content: '→'; position: absolute; right: -9px; top: 50%; transform: translateY(-50%); color: #e3a54a; font-weight: 700;
}

.touch-block { display: flex; gap: 8px; }
.touch-chip { width: 60px; display: flex; padding-bottom: 8px; }
.touch-rows { flex: 1; }
.role { width: 82px; flex-shrink: 0; display: flex; align-items: center; border: 1px solid #e6e8eb; padding: 0 6px; font-size: 12px; position: relative; }

.metric input { border-right: 1px solid #f0f0f0; padding-right: 4px; }
.metric input:last-child { border-right: none; }
.metric b { color: var(--uem-red); margin: 0 2px; }

.problems { flex-direction: column; align-items: stretch; }
.problem { display: flex; flex-direction: column; border-left: 3px solid var(--uem-red); padding: 2px 6px; margin-bottom: 4px; position: relative; }
.problem.done { border-left-color: #6cc0c4; }
.problem.editing { flex-direction: row; align-items: center; gap: 4px; }
.problem em { font-style: normal; color: #999; font-size: 11px; }
.link { color: #3a6fd8; cursor: pointer; font-size: 12px; }

.add-col, .add-row {
  display: flex; align-items: center; justify-content: center; cursor: pointer; color: #bbb;
  border: 1px dashed #e0e0e0; border-radius: 2px;
}
.add-col { width: 44px; }
.add-row { height: 30px; width: 130px; margin: 0 0 10px 0; background: #fdf3e6; color: #e3a54a; border-color: #f3d3a5; }
.add-row.small { width: 40px; background: transparent; color: #bbb; border-color: #e0e0e0; }
.add-col:hover, .add-row:hover { color: var(--uem-red); border-color: var(--uem-red); }
.del { position: absolute; top: 2px; right: 4px; font-size: 11px; color: #bbb; cursor: pointer; z-index: 1; }
.del.inline { position: static; flex-shrink: 0; }
.behavior.chevron .del { right: 18px; }
.del:hover { color: var(--uem-red); }
</style>

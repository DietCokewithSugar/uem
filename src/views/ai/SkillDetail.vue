<!-- AI 工具 · 技能详情 #/skillDetail?id=bny|bnx：技能说明与分步确认的演示对话（前端示例，不调用模型） -->
<template>
  <div v-if="skill" class="detail">
    <section class="block lead">
      <div class="lead-main">
        <p class="summary">{{ skill.summary }}</p>
        <dl class="meta">
          <div><dt>适合</dt><dd>{{ skill.audience }}</dd></div>
          <div><dt>产出</dt><dd>{{ skill.output }}</dd></div>
        </dl>
      </div>
      <p v-if="skill.rule" class="rule"><el-icon><InfoFilled /></el-icon>{{ skill.rule }}</p>
      <p v-if="skill.concept" class="rule"><el-icon><InfoFilled /></el-icon>该技能还在构思中，尚未上线。</p>
    </section>

    <template v-if="!skill.concept">
      <section class="block">
        <h2>两个阶段</h2>
        <div class="stages">
          <div v-for="(st, i) in skill.stages" :key="st.name" class="stage">
            <div class="stage-head"><span class="stage-no">阶段 {{ i + 1 }}</span><b>{{ st.name }}</b></div>
            <p>{{ st.desc }}</p>
            <div class="outs"><span v-for="o in st.outputs" :key="o" class="hc-tag">{{ o }}</span></div>
          </div>
        </div>
      </section>

      <section class="block">
        <h2>使用流程</h2>
        <ol class="flow">
          <li v-for="(f, i) in skill.flow" :key="f.name">
            <span class="flow-no">{{ i + 1 }}</span>
            <div><b>{{ f.name }}</b><p>{{ f.desc }}</p></div>
          </li>
        </ol>
      </section>

      <section class="block two">
        <div>
          <h2>研究类型</h2>
          <div class="chips"><span v-for="t in skill.researchTypes" :key="t" class="chip">{{ t }}</span></div>
          <h3>可分析的数据</h3>
          <div class="chips"><span v-for="t in skill.dataSources" :key="t" class="chip">{{ t }}</span></div>
        </div>
        <div>
          <h2>支持的方法</h2>
          <div v-for="g in skill.methods" :key="g.group" class="method">
            <h3>{{ g.group }}</h3>
            <div class="chips"><span v-for="t in g.items" :key="t" class="chip">{{ t }}</span></div>
          </div>
        </div>
      </section>

      <section class="block">
        <h2>怎么开口</h2>
        <p class="hint">在 AI 助手里提到下面这类需求时会使用该技能：</p>
        <div class="chips"><span v-for="t in skill.triggers" :key="t" class="quote">「{{ t }}」</span></div>
      </section>

      <section class="block">
        <div class="demo-head">
          <h2>演示：分步确认</h2>
          <span class="uem-muted">以下为示例对话，不调用模型</span>
          <el-button v-if="step > 0" size="small" @click="reset">重新开始</el-button>
        </div>
        <div class="chat" aria-live="polite">
          <div class="msg user"><div class="bubble">{{ skill.demo.prompt }}</div></div>
          <template v-for="(m, i) in skill.demo.steps.slice(0, step + 1)" :key="m.node">
            <div class="msg bot">
              <div class="who"><b>{{ skill.name }}</b><span class="node">决策节点 {{ i + 1 }} · {{ m.node }}</span></div>
              <div class="bubble">{{ m.say }}</div>
              <div v-if="m.doc" class="doc">
                <div class="doc-head"><el-icon><Document /></el-icon><b>{{ m.doc.title }}</b><span class="hc-tag">Word</span></div>
                <ul><li v-for="sec in m.doc.sections" :key="sec">{{ sec }}</li></ul>
              </div>
              <div v-if="m.options && i === step" class="opts">
                <el-button type="primary" @click="choose(m.options[0])">{{ m.options[0] }}</el-button>
                <el-button v-for="o in m.options.slice(1)" :key="o" @click="ElMessage.info('演示仅提供默认路径')">{{ o }}</el-button>
              </div>
            </div>
            <div v-if="answers[i]" class="msg user"><div class="bubble">{{ answers[i] }}</div></div>
          </template>
        </div>
      </section>
    </template>
  </div>
  <div v-else class="uem-card">未找到该技能，<router-link to="/skills" class="uem-link">返回技能列表</router-link></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { skillOf } from '@/mock/skills'
import '@/views/home/home.css'

const route = useRoute()
const skill = computed(() => skillOf(route.query.id))
const step = ref(0)
const answers = ref([])
function choose(text) {
  answers.value = [...answers.value.slice(0, step.value), text]
  if (step.value < skill.value.demo.steps.length - 1) step.value++
}
function reset() {
  step.value = 0
  answers.value = []
}
</script>

<style scoped>
.detail { display: flex; flex-direction: column; gap: 16px; }
.block { background: var(--uem-surface); border: 1px solid var(--uem-line); border-radius: var(--uem-radius-lg); padding: 20px 24px; }
.block h2 { margin: 0 0 12px; font-size: var(--uem-fs-md); font-weight: 600; }
.block h3 { margin: 16px 0 8px; font-size: var(--uem-fs-sm); font-weight: 600; color: var(--uem-ink-2); }
.lead { display: flex; flex-direction: column; gap: 12px; }
.summary { margin: 0; font-size: var(--uem-fs-md); line-height: 1.7; max-width: 72ch; }
.meta { margin: 0; display: flex; flex-wrap: wrap; gap: 6px 32px; font-size: var(--uem-fs-sm); }
.meta div { display: flex; gap: 8px; }
.meta dt { color: var(--uem-ink-3); }
.meta dd { margin: 0; color: var(--uem-ink-2); }
.rule { margin: 0; display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: var(--uem-radius); background: var(--uem-info-soft); color: var(--uem-ink-2); font-size: var(--uem-fs-sm); line-height: 1.6; }
.rule .el-icon { margin-top: 3px; color: var(--uem-info); flex-shrink: 0; }

.stages { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 32px; }
.stage { display: flex; flex-direction: column; gap: 8px; }
.stage + .stage { padding-left: 32px; border-left: 1px solid var(--uem-line-2); }
.stage-head { display: flex; align-items: baseline; gap: 8px; }
.stage-no { font-size: var(--uem-fs-xs); color: var(--uem-ink-3); }
.stage p { margin: 0; font-size: var(--uem-fs-sm); color: var(--uem-ink-2); line-height: 1.7; }
.outs { display: flex; flex-wrap: wrap; gap: 6px; }

.flow { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.flow li { display: flex; gap: 10px; }
.flow-no { width: 24px; height: 24px; flex-shrink: 0; border-radius: 50%; background: var(--uem-line-2); color: var(--uem-ink-2); font-size: var(--uem-fs-xs); font-weight: 600; display: grid; place-items: center; }
.flow b { font-size: var(--uem-fs); }
.flow p { margin: 4px 0 0; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); line-height: 1.6; }

.two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.two h3:first-of-type { margin-top: 16px; }
.method h3 { margin-top: 0; }
.method + .method { margin-top: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 3px 10px; border-radius: var(--uem-radius-sm); background: var(--uem-surface-2); border: 1px solid var(--uem-line-2); font-size: var(--uem-fs-sm); color: var(--uem-ink-2); }
.quote { padding: 3px 4px; font-size: var(--uem-fs-sm); color: var(--uem-ink); }
.hint { margin: 0 0 8px; font-size: var(--uem-fs-sm); color: var(--uem-ink-3); }

.demo-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.demo-head h2 { margin: 0; }
.demo-head .el-button { margin-left: auto; }
.chat { display: flex; flex-direction: column; gap: 14px; max-width: 860px; }
.msg { display: flex; flex-direction: column; gap: 6px; }
.msg.user { align-items: flex-end; }
.msg.user .bubble { background: var(--uem-surface-2); border: 1px solid var(--uem-line); max-width: 70%; }
.bubble { padding: 10px 14px; border-radius: var(--uem-radius-lg); font-size: var(--uem-fs); line-height: 1.75; white-space: pre-line; color: var(--uem-ink); }
.msg.bot .bubble { border: 1px solid var(--uem-line); background: var(--uem-surface); }
.who { display: flex; align-items: center; gap: 8px; font-size: var(--uem-fs-sm); }
.node { font-size: var(--uem-fs-xs); color: var(--uem-ai); background: var(--uem-ai-soft); padding: 0 6px; border-radius: var(--uem-radius-sm); line-height: 20px; }
.opts { display: flex; gap: 8px; }
.doc { background: var(--uem-surface-2); border-radius: var(--uem-radius); padding: 12px 14px; max-width: 520px; }
.doc-head { display: flex; align-items: center; gap: 8px; font-size: var(--uem-fs-sm); }
.doc-head .el-icon { color: var(--uem-info); font-size: 18px; }
.doc ul { margin: 8px 0 0; padding-left: 26px; font-size: var(--uem-fs-sm); color: var(--uem-ink-2); line-height: 1.8; }
@media (max-width: 1100px) { .stages, .two { grid-template-columns: minmax(0, 1fr); } .stage + .stage { padding: 16px 0 0; border-left: 0; border-top: 1px solid var(--uem-line-2); } .flow { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>

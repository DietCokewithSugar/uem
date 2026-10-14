<!-- 首页 #/mainIndex -->
<template>
  <div class="home">
    <!-- 横幅 -->
    <!-- 横幅：展示「系统管理 · 轮播图维护」中状态为「展示中」的轮播图 -->
    <div class="banner">
      <el-carousel v-if="slides.length" height="100%" :autoplay="slides.length > 1" :interval="5000" :indicator-position="slides.length > 1 ? '' : 'none'" arrow="hover" class="carousel">
        <el-carousel-item v-for="c in slides" :key="c.id"><CarouselSlide :item="c" /></el-carousel-item>
      </el-carousel>
    </div>

    <!-- 体验动态 -->
    <div class="news uem-card">
      <div class="block-title"><span class="red-title">体验动态</span></div>
      <el-tag effect="dark" class="news-tab">总行动态</el-tag>
      <ul class="news-list">
        <li v-for="n in homeData.news" :key="n.title" @click="openNews(n)">
          <span class="news-title">【体验公告】{{ n.title }}</span>
          <span class="news-date">{{ n.date }}</span>
        </li>
      </ul>
      <router-link to="/experInformation" class="more">更多 <el-icon><CirclePlusFilled /></el-icon></router-link>
    </div>

    <!-- 右侧：待办工作 + 体验支撑 -->
    <div class="side-col">
      <div class="uem-card">
        <div class="block-title">待办工作</div>
        <div class="todo">
          <router-link :to="{ path: '/optimPending', query: { type: '', suggestStatus: '2' } }" class="todo-item">
            <span>优化建议</span><b>{{ suggestionTodo }}</b>
            <el-icon class="todo-bg"><Search /></el-icon>
          </router-link>
          <router-link to="/activityPending" class="todo-item">
            <span>体验活动</span><b>{{ todoCounts.activity }}</b>
            <el-icon class="todo-bg"><Files /></el-icon>
          </router-link>
        </div>
      </div>
      <div class="uem-card support">
        <div class="block-title">体验支撑</div>
        <div class="support-grid">
          <div v-for="(s, i) in homeData.supports" :key="s.name" class="support-item" :class="`bg${i}`" @click="openSupport(s)">
            <el-icon><component :is="s.icon" /></el-icon>{{ s.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 体验问题（研发阶段） -->
    <div class="uem-card stat-card area-p">
      <div class="card-head head-red">体验问题（研发阶段）</div>
      <div class="problem">
        <div class="p-label">体验问题总数</div>
        <div class="p-total">{{ ps.total }}</div>
        <div class="p-rates"><span>{{ solvedRate }}%</span><span>{{ (100 - solvedRate).toFixed(2) }}%</span></div>
        <div class="p-bar"><div class="p-bar-solved" :style="{ width: solvedRate + '%' }" /></div>
        <div class="p-split">
          <div><div class="p-label">已解决问题数</div><div class="p-num solved">{{ ps.solved }}</div></div>
          <div><div class="p-label">待解决问题数</div><div class="p-num pending">{{ ps.pending }}</div></div>
        </div>
      </div>
    </div>

    <!-- 优化建议（运营阶段） -->
    <div class="uem-card stat-card area-s">
      <router-link to="/suggestionDataBoard" class="card-head head-green">优化建议（运营阶段）</router-link>
      <EChart class="bubble" :option="bubbleOption" />
    </div>

    <!-- 体验监测 -->
    <div class="uem-card stat-card monitor area-m">
      <router-link to="/experEvaluationIndex" class="card-head head-blue">体验监测</router-link>
      <div class="monitor-body">
        <div class="nps">
          <EChart class="gauge" :option="gaugeOption" />
          <div class="dims">
            <div v-for="(d, i) in homeData.nps.dims" :key="d.name" class="dim" :class="`dim${i}`">
              <div class="dim-name">{{ d.name }}</div>
              <div class="dim-val">{{ d.value.toFixed(2) }}</div>
            </div>
          </div>
        </div>
        <div class="age">
          <div class="age-title">各年龄段用户净推荐值</div>
          <div v-for="a in homeData.nps.byAge" :key="a.name" class="age-row">
            <span class="age-name">{{ a.name }}</span>
            <div class="age-bar-wrap">
              <div class="age-bar"><div :style="{ width: a.value + '%' }" /></div>
              <span class="age-val">{{ a.value.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EChart from '@/components/EChart.vue'
import { homeData, todoCounts } from '@/mock'
import { carousels } from '@/mock/system'
import CarouselSlide from '@/components/CarouselSlide.vue'

const slides = computed(() => carousels.filter((c) => c.status === '展示中').sort((a, b) => (a.sort || 99) - (b.sort || 99)))
const ps = homeData.problemStats
const solvedRate = Number(((ps.solved / ps.total) * 100).toFixed(2))
const suggestionTodo = computed(() =>
  ['toModify', 'toHandle', 'toSort', 'toReply', 'toFollow'].reduce((n, k) => n + todoCounts[k], 0)
)

const openNews = (n) => ElMessageBox.alert(`${n.title}\n\n（演示环境：资讯正文待接入）`, '体验公告', { confirmButtonText: '关闭' })
const openSupport = (s) => ElMessage.info(`「${s.name}」为外部体验支撑系统，演示环境暂不跳转`)

const bubbleColors = ['#4fb3c8', '#f39c12', '#7f6fd1', '#5aa8e0', '#e74c3c', '#f08a5d', '#4fb3c8', '#f39c12', '#e74c3c', '#e74c3c']
const bubbleOption = {
  tooltip: { formatter: '{b}：{c} 条' },
  series: [
    {
      type: 'graph',
      layout: 'force',
      force: { repulsion: 120, gravity: 0.22, edgeLength: 10, friction: 0.2 },
      roam: false,
      label: { show: true, color: '#fff', fontSize: 11 },
      data: homeData.suggestionBubbles.map((b, i) => ({
        name: b.name,
        value: b.value,
        symbolSize: 40 + b.value * 0.6,
        itemStyle: { color: bubbleColors[i % bubbleColors.length], opacity: 0.88 }
      }))
    }
  ]
}

const gaugeOption = {
  series: [
    {
      type: 'gauge',
      min: -100,
      max: 100,
      startAngle: 200,
      endAngle: -20,
      radius: '95%',
      center: ['50%', '62%'],
      progress: { show: true, width: 10, itemStyle: { color: '#3a8ee6' } },
      axisLine: { lineStyle: { width: 10, color: [[1, '#d6d9de']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: { offsetCenter: [0, '-18%'], fontSize: 13, color: '#555' },
      detail: { offsetCenter: [0, '16%'], fontSize: 28, fontWeight: 600, color: '#333', formatter: '{value}%' },
      data: [{ value: homeData.nps.total, name: '总体NPS' }]
    }
  ]
}
</script>

<style scoped>
.home {
  display: grid;
  grid-template-areas:
    'banner banner news side'
    'p s m side';
  grid-template-columns: 1fr 1.4fr 1.6fr 0.95fr;
  gap: 16px;
  padding: 16px 20px 30px;
  max-width: 1680px;
  margin: 0 auto;
}

/* 横幅 */
.banner { grid-area: banner; min-height: 400px; border-radius: 4px; overflow: hidden; background: #fbe3e4; font-size: 16px; }
.carousel, .carousel :deep(.el-carousel__container) { height: 100%; }

/* 体验动态 */
.news { grid-area: news; position: relative; }
.block-title { font-size: 16px; font-weight: 600; margin-bottom: 14px; color: #333; }
.red-title { color: var(--uem-red); border-bottom: 2px solid var(--uem-red); padding-bottom: 8px; }
.news-tab { margin: 6px 0 10px; }
.news-list { list-style: none; padding: 0; margin: 0; }
.news-list li { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; font-size: 13px; cursor: pointer; }
.news-list li:hover .news-title { color: var(--uem-red); }
.news-title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.news-date { color: #999; flex-shrink: 0; }
.more { color: #3a6fd8; font-size: 12px; display: inline-flex; align-items: center; gap: 2px; margin-top: 6px; }

/* 右侧 */
.side-col { grid-area: side; display: flex; flex-direction: column; gap: 16px; }
.todo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.todo-item { position: relative; text-align: center; padding: 10px 0; color: #666; font-size: 13px; }
.todo-item b { display: block; color: var(--uem-red); font-size: 20px; margin-top: 4px; position: relative; z-index: 1; }
.todo-bg { position: absolute; right: 8px; bottom: 6px; font-size: 32px; color: #e8e8e8; }
.support-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.support-item {
  height: 76px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 14px; color: #444; cursor: pointer; transition: transform 0.2s;
}
.support-item:hover { transform: translateY(-2px); }
.support-item .el-icon { color: var(--uem-red); font-size: 18px; }
.bg0 { background: linear-gradient(135deg, #e7eef6, #c9d8e8); }
.bg1 { background: linear-gradient(135deg, #f1f6f8, #dfeaf0); }
.bg2 { background: linear-gradient(135deg, #fbeceb, #f6d6d2); }
.bg3 { background: linear-gradient(135deg, #f7f7f7, #ececec); }
.bg4 { background: linear-gradient(135deg, #fbf0ea, #f4dccd); }
.bg5 { background: linear-gradient(135deg, #f8f1f3, #efdde2); }

/* 底部统计卡片 */
.stat-card { padding: 0 0 16px; overflow: hidden; display: flex; flex-direction: column; }
.area-p { grid-area: p; }
.area-s { grid-area: s; }
.area-m { grid-area: m; }
.card-head { display: block; padding: 18px 24px; font-size: 16px; font-weight: 600; color: #333; }
.head-red { background: linear-gradient(90deg, #fdf0ef, #fbe3e1); }
.head-green { background: linear-gradient(90deg, #eef7f3, #e2f1ea); }
.head-blue { background: linear-gradient(90deg, #eef3fa, #e2ebf7); }

.problem { padding: 16px 24px 0; text-align: center; }
.p-label { color: #666; font-size: 13px; }
.p-total { font-size: 34px; font-weight: 600; margin: 8px 0 16px; font-family: Georgia, serif; }
.p-rates { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 6px; }
.p-bar { height: 22px; background: #e8545c; display: flex; }
.p-bar-solved { background: #6cc0c4; }
.p-split { display: flex; justify-content: space-between; margin-top: 18px; }
.p-num { font-size: 24px; margin-top: 8px; font-family: Georgia, serif; }
.p-num.solved { color: #4a9ea3; }
.p-num.pending { color: var(--uem-red); }

.bubble { height: 300px; }

.monitor-body { display: flex; padding: 8px 16px 0; gap: 8px; }
.nps { flex: 1; }
.gauge { height: 170px; }
.dims { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 0 10px; }
.dim { text-align: center; font-size: 12px; border: 1px solid #eee; }
.dim-name { color: #fff; padding: 3px 0; }
.dim-val { padding: 3px 0; color: #666; }
.dim0 .dim-name { background: #e8545c; }
.dim1 .dim-name { background: #6b9ee3; }
.dim2 .dim-name { background: #6cc0c4; }
.dim3 .dim-name { background: #f39c12; }
.age { flex: 1.1; }
.age-title { text-align: center; font-size: 13px; color: #555; margin-bottom: 12px; }
.age-row { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #6b8fd6; margin-bottom: 8px; }
.age-name { width: 66px; text-align: right; flex-shrink: 0; }
.age-bar-wrap { flex: 1; text-align: center; }
.age-bar { height: 6px; background: #edf0f5; border-radius: 3px; overflow: hidden; }
.age-bar > div { height: 100%; background: linear-gradient(90deg, #6aa5ff, #2f6ee0); }
.age-val { color: #777; font-size: 11px; }

@media (max-width: 1280px) {
  .home {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'banner banner' 'news side' 'p s' 'm m';
  }
}
</style>

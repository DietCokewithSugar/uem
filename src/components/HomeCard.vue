<!-- 首页卡片外框：标题、说明、右上角入口 -->
<template>
  <section class="hc" :aria-labelledby="id">
    <header class="hc-head">
      <div class="hc-titles">
        <h2 :id="id" class="hc-title">{{ title }}<span v-if="count != null" class="hc-count">{{ count }}</span></h2>
        <p v-if="subtitle" class="hc-sub">{{ subtitle }}</p>
      </div>
      <div class="hc-extra">
        <slot name="extra">
          <router-link v-if="more" :to="more" class="hc-more">{{ moreText }}<el-icon><ArrowRight /></el-icon></router-link>
        </slot>
      </div>
    </header>
    <div class="hc-body"><slot /></div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  count: { type: Number, default: null },
  more: { type: [String, Object], default: null },
  moreText: { type: String, default: '查看全部' }
})
const id = `hc-${Math.random().toString(36).slice(2, 8)}`
</script>

<style scoped>
.hc {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--uem-surface);
  border: 1px solid var(--uem-line);
  border-radius: var(--uem-radius-lg);
  min-width: 0;
}
.hc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 20px 0; }
.hc-titles { min-width: 0; }
.hc-title { margin: 0; display: flex; align-items: center; gap: 8px; font-size: var(--uem-fs-md); font-weight: 600; line-height: 1.5; color: var(--uem-ink); }
.hc-count {
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 10px;
  background: var(--uem-red-soft);
  color: var(--uem-red);
  font-size: var(--uem-fs-xs);
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.hc-sub { margin: 2px 0 0; font-size: var(--uem-fs-xs); color: var(--uem-ink-3); line-height: 1.5; }
.hc-extra { flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
.hc-more { display: inline-flex; align-items: center; gap: 2px; font-size: var(--uem-fs-sm); color: var(--uem-ink-3); white-space: nowrap; }
.hc-more:hover { color: var(--uem-red); }
.hc-body { flex: 1; padding: 12px 20px 18px; min-width: 0; display: flex; flex-direction: column; }
</style>

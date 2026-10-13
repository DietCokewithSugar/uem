<!-- 轮播图内容：上传图片优先；否则按主题绘制（slogan 为首页宣传标语） -->
<template>
  <img v-if="item.src" :src="item.src" class="slide img" :alt="item.title" />
  <div v-else class="slide" :class="item.theme">
    <template v-if="item.theme === 'slogan'">
      <div class="line l1">倾听用户声音</div>
      <div class="line l2">提升产品体验</div>
    </template>
    <div v-else-if="item.theme !== 'none'" class="title">{{ item.title }}</div>
  </div>
</template>

<script setup>
defineProps({ item: { type: Object, required: true } })
</script>

<style scoped>
.slide { width: 100%; height: 100%; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
.img { object-fit: cover; }
.title { color: #fff; font-weight: 700; font-size: 1.6em; padding: 0 8%; line-height: 1.4; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); }
.blue { background: linear-gradient(135deg, #2f6fe0, #6ab0ff); }
.navy { background: linear-gradient(135deg, #1b1f5e, #4b3fb8); }
.warm { background: linear-gradient(135deg, #f7d9b8, #e8a46a); }
.red { background: linear-gradient(135deg, #b0000a, #f0545c); }
.none { background: #f2f2f2; }
.slogan {
  padding: 0 48px;
  background:
    radial-gradient(ellipse 120% 60% at 80% 120%, rgba(255, 255, 255, 0.85), transparent 55%),
    radial-gradient(ellipse 90% 40% at 20% 85%, rgba(230, 60, 70, 0.35), transparent 60%),
    linear-gradient(135deg, #fbd3d6, #f6a5ab 45%, #fde4e6);
}
.slogan::after { content: ''; position: absolute; inset: 0; background: repeating-radial-gradient(ellipse at 110% 130%, transparent 0 26px, rgba(255, 255, 255, 0.25) 26px 28px); }
.line { position: relative; z-index: 1; font-size: 4em; font-weight: 900; letter-spacing: 0.18em; color: #d0101b; text-shadow: 3px 4px 0 rgba(140, 0, 8, 0.18); font-style: italic; }
.line.l2 { text-align: right; margin-top: 0.8em; }
</style>

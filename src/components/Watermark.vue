<!-- 全屏水印：对应行内系统的"姓名 + 工号 + 时间"水印 -->
<template>
  <div class="watermark" :style="{ backgroundImage: `url(${img})` }" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ text: { type: String, required: true } })

const img = computed(() => {
  const c = document.createElement('canvas')
  c.width = 360
  c.height = 220
  const ctx = c.getContext('2d')
  ctx.translate(180, 110)
  ctx.rotate(-Math.PI / 7)
  ctx.font = '13px sans-serif'
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.textAlign = 'center'
  ctx.fillText(props.text, 0, 0)
  return c.toDataURL()
})
</script>

<style scoped>
.watermark {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 3000;
}
</style>

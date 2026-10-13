<!-- 测评素材缩略图：上传图片优先，否则用 SVG 示意（桌面端 / 手机首页 / 手机基金页） -->
<template>
  <img v-if="material?.src" :src="material.src" class="thumb img" alt="测评素材" />
  <svg v-else viewBox="30 0 280 130" preserveAspectRatio="xMidYMid slice" class="thumb">
    <template v-if="kind === 'desktop'">
      <rect width="340" height="130" fill="#eef2fb" />
      <rect x="0" y="0" width="340" height="12" fill="#fff" />
      <rect x="36" y="3" width="30" height="6" fill="#c7000b" />
      <circle cx="140" cy="34" r="10" fill="#f6c9a8" />
      <rect x="156" y="27" width="90" height="6" rx="3" fill="#4a5aa8" />
      <rect x="156" y="37" width="60" height="4" rx="2" fill="#b8c2e0" />
      <rect x="110" y="50" width="160" height="10" rx="5" fill="#fff" stroke="#9fb3f0" />
      <g fill="#fff">
        <rect x="36" y="70" width="76" height="54" rx="3" /><rect x="120" y="70" width="96" height="54" rx="3" /><rect x="224" y="70" width="80" height="54" rx="3" />
      </g>
      <g fill="#d5dcef">
        <rect x="42" y="78" width="50" height="4" /><rect x="42" y="88" width="62" height="3" /><rect x="42" y="96" width="56" height="3" />
        <rect x="126" y="78" width="60" height="4" /><rect x="126" y="88" width="80" height="3" /><rect x="230" y="78" width="60" height="4" />
      </g>
      <rect x="186" y="74" width="24" height="8" rx="2" fill="#4a6cf0" />
    </template>
    <template v-else>
      <defs>
        <linearGradient id="g-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbf73" /><stop offset="1" stop-color="#a9dd8f" /></linearGradient>
      </defs>
      <rect width="340" height="130" :fill="kind === 'mobile-fund' ? '#fff' : 'url(#g-green)'" />
      <text x="46" y="26" font-size="14" font-weight="600" :fill="kind === 'mobile-fund' ? '#222' : '#fff'">10:03</text>
      <rect x="120" y="12" width="90" height="20" rx="10" fill="#111" />
      <circle cx="182" cy="22" r="2.5" fill="#f2a33a" />
      <text x="246" y="26" font-size="11" :fill="kind === 'mobile-fund' ? '#222' : '#fff'">5G 85</text>
      <template v-if="kind === 'mobile-fund'">
        <text x="150" y="62" font-size="14" fill="#333">基金</text>
        <rect x="40" y="84" width="260" height="40" rx="6" fill="#d8141e" />
        <text x="54" y="106" font-size="11" fill="#fff">我的基金(元)</text>
      </template>
      <template v-else>
        <text x="42" y="62" font-size="13" fill="#fff">登录</text>
        <rect x="76" y="48" width="190" height="20" rx="10" fill="#fff" opacity="0.45" />
        <circle cx="290" cy="58" r="8" fill="#e8545c" />
        <g fill="#fff" opacity="0.5">
          <ellipse cx="60" cy="110" rx="34" ry="12" /><ellipse cx="170" cy="118" rx="44" ry="14" /><ellipse cx="280" cy="108" rx="36" ry="12" />
        </g>
      </template>
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ material: Object })
const kind = computed(() => props.material?.kind || 'desktop')
</script>

<style scoped>
.thumb { width: 100%; height: 100%; display: block; }
.img { object-fit: cover; }
</style>

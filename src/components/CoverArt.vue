<!-- 资讯封面插画（四种配色，替代行内图片素材） -->
<template>
  <svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMid slice" class="cover">
    <defs>
      <linearGradient :id="`bg${uid}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="theme.bg[0]" />
        <stop offset="1" :stop-color="theme.bg[1]" />
      </linearGradient>
    </defs>
    <rect width="360" height="170" :fill="`url(#bg${uid})`" />
    <!-- 显示器 -->
    <rect x="132" y="52" width="110" height="74" rx="6" fill="#fff" opacity="0.95" />
    <rect x="140" y="60" width="94" height="58" rx="3" :fill="theme.screen" />
    <rect x="148" y="70" width="40" height="6" rx="3" fill="#fff" opacity="0.8" />
    <rect x="148" y="82" width="70" height="4" rx="2" fill="#fff" opacity="0.5" />
    <rect x="148" y="92" width="56" height="4" rx="2" fill="#fff" opacity="0.5" />
    <rect x="182" y="126" width="10" height="12" :fill="theme.accent" opacity="0.6" />
    <rect x="164" y="138" width="46" height="4" rx="2" :fill="theme.accent" opacity="0.6" />
    <!-- 人物 -->
    <circle cx="188" cy="34" r="9" fill="#2d2d3a" />
    <path d="M174 70 q14 -30 28 0 z" :fill="theme.person" />
    <!-- 对话气泡 -->
    <g :fill="theme.accent" opacity="0.85">
      <rect x="60" y="56" width="54" height="22" rx="11" />
      <rect x="258" y="30" width="62" height="26" rx="6" />
      <rect x="270" y="98" width="46" height="20" rx="10" />
    </g>
    <g fill="#fff">
      <rect x="70" y="64" width="34" height="5" rx="2.5" />
      <rect x="266" y="38" width="46" height="4" rx="2" />
      <rect x="266" y="46" width="30" height="4" rx="2" />
      <rect x="280" y="105" width="26" height="5" rx="2.5" />
    </g>
    <path d="M40 140 l40 -16 l30 10 l40 -22" fill="none" :stroke="theme.accent" stroke-width="2" opacity="0.6" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ variant: { type: Number, default: 0 } })
const uid = Math.random().toString(36).slice(2, 8)
const themes = [
  { bg: ['#e4f1fb', '#c4ddf2'], screen: '#4a8fe7', accent: '#6fb1f0', person: '#f2a33a' },
  { bg: ['#ece8fb', '#cfc6f2'], screen: '#5a63d6', accent: '#8a8ff0', person: '#3c4fb8' },
  { bg: ['#fde8e9', '#f6c3c6'], screen: '#e8545c', accent: '#f08a8f', person: '#c7000b' },
  { bg: ['#fdeee2', '#f6d2b6'], screen: '#f08a3c', accent: '#f2a86a', person: '#e3702a' }
]
const theme = computed(() => themes[props.variant % themes.length])
</script>

<style scoped>
.cover { width: 100%; height: 100%; display: block; }
</style>

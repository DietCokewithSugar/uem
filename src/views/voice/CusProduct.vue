<!-- 产品声音 #/cusSupreme?productId= -->
<template>
  <VoiceTable :key="product" :fixed-product="product" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import VoiceTable from './VoiceTable.vue'
import { voiceProducts } from '@/mock/voice'

const route = useRoute()
const product = computed(() => voiceProducts.find((p) => p.id === route.query.productId)?.name || voiceProducts[0].name)
</script>

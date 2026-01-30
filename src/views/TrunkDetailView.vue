<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiClient } from '@/api/client'

const route = useRoute()
const router = useRouter()
const trunk = ref(null)
const loading = ref(true)
const error = ref('')

const pkey = computed(() => route.params.pkey)

async function fetchTrunk() {
  if (!pkey.value) return
  loading.value = true
  error.value = ''
  try {
    trunk.value = await getApiClient().get(`trunks/${encodeURIComponent(pkey.value)}`)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load trunk'
    trunk.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchTrunk)
watch(pkey, fetchTrunk)

function goBack() {
  router.push({ name: 'trunks' })
}

const detailFields = computed(() => {
  if (!trunk.value || typeof trunk.value !== 'object') return []
  const skip = new Set(['pkey'])
  return Object.entries(trunk.value)
    .filter(([k]) => !skip.has(k))
    .sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <div>
    <p class="back">
      <button type="button" class="back-btn" @click="goBack">← Trunks</button>
    </p>
    <h1>Trunk: {{ pkey }}</h1>

    <p v-if="loading" class="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="trunk">
      <dl class="detail-list">
        <dt>pkey</dt>
        <dd>{{ trunk.pkey }}</dd>
        <template v-for="[key, value] in detailFields" :key="key">
          <dt>{{ key }}</dt>
          <dd>{{ value == null ? '—' : String(value) }}</dd>
        </template>
      </dl>
    </template>
  </div>
</template>

<style scoped>
.back {
  margin-bottom: 1rem;
}
.back-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  cursor: pointer;
}
.back-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}
.loading,
.error {
  margin-top: 1rem;
}
.error {
  color: #dc2626;
}
.detail-list {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 2rem;
  font-size: 0.9375rem;
  max-width: 36rem;
}
.detail-list dt {
  font-weight: 500;
  color: #475569;
}
.detail-list dd {
  margin: 0;
}
</style>

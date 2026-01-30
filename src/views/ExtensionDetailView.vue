<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiClient } from '@/api/client'

const route = useRoute()
const router = useRouter()
const extension = ref(null)
const loading = ref(true)
const error = ref('')

const pkey = computed(() => route.params.pkey)

async function fetchExtension() {
  if (!pkey.value) return
  loading.value = true
  error.value = ''
  try {
    extension.value = await getApiClient().get(`extensions/${encodeURIComponent(pkey.value)}`)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load extension'
    extension.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchExtension)
watch(pkey, fetchExtension)

function goBack() {
  router.push({ name: 'extensions' })
}

const detailFields = computed(() => {
  if (!extension.value || typeof extension.value !== 'object') return []
  const skip = new Set(['pkey'])
  return Object.entries(extension.value)
    .filter(([k]) => !skip.has(k))
    .sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <div>
    <p class="back">
      <button type="button" class="back-btn" @click="goBack">← Extensions</button>
    </p>
    <h1>Extension: {{ pkey }}</h1>

    <p v-if="loading" class="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="extension">
      <dl class="detail-list">
        <dt>pkey</dt>
        <dd>{{ extension.pkey }}</dd>
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

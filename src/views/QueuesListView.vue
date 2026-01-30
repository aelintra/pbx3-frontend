<script setup>
import { ref, onMounted } from 'vue'
import { getApiClient } from '@/api/client'

const queues = ref([])
const loading = ref(true)
const error = ref('')

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.queues)) return response.queues
    if (Object.keys(response).every((k) => /^\d+$/.test(k))) return Object.values(response)
  }
  return []
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getApiClient().get('queues')
    queues.value = normalizeList(response)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load queues'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>Queues</h1>

    <p v-if="loading" class="loading">Loading queues from API…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else-if="queues.length === 0" class="empty">No queues. (API returned an empty list.)</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>pkey</th>
          <th>cluster</th>
          <th>name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="q in queues" :key="q.pkey">
          <td>{{ q.pkey }}</td>
          <td>{{ q.cluster ?? '—' }}</td>
          <td>{{ q.name ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.loading,
.error,
.empty {
  margin-top: 1rem;
}
.error {
  color: #dc2626;
}
.table {
  margin-top: 1rem;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}
.table th,
.table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.table th {
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
}
.table tbody tr:hover {
  background: #f8fafc;
}
</style>

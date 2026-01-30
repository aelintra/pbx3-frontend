<script setup>
import { ref, onMounted } from 'vue'
import { getApiClient } from '@/api/client'

const trunks = ref([])
const loading = ref(true)
const error = ref('')

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.trunks)) return response.trunks
    if (Object.keys(response).every((k) => /^\d+$/.test(k))) return Object.values(response)
  }
  return []
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getApiClient().get('trunks')
    trunks.value = normalizeList(response)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load trunks'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>Trunks</h1>

    <p v-if="loading" class="loading">Loading trunks from API…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else-if="trunks.length === 0" class="empty">No trunks. (API returned an empty list.)</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>pkey</th>
          <th>cluster</th>
          <th>technology</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in trunks" :key="t.pkey">
          <td>
            <router-link :to="{ name: 'trunk-detail', params: { pkey: t.pkey } }" class="cell-link">{{ t.pkey }}</router-link>
          </td>
          <td>{{ t.cluster ?? '—' }}</td>
          <td>{{ t.technology ?? '—' }}</td>
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
.cell-link {
  color: #2563eb;
  text-decoration: none;
}
.cell-link:hover {
  text-decoration: underline;
}
</style>

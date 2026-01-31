<script setup>
import { ref, onMounted } from 'vue'
import { getApiClient } from '@/api/client'

const inboundRoutes = ref([])
const loading = ref(true)
const error = ref('')

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.inboundroutes)) return response.inboundroutes
    if (Object.keys(response).every((k) => /^\d+$/.test(k))) return Object.values(response)
  }
  return []
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getApiClient().get('inboundroutes')
    inboundRoutes.value = normalizeList(response)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load inbound routes'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>Inbound routes</h1>
    <p class="toolbar">
      <router-link :to="{ name: 'inbound-route-create' }" class="add-btn">Add inbound route</router-link>
    </p>

    <p v-if="loading" class="loading">Loading inbound routes…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else-if="inboundRoutes.length === 0" class="empty">No inbound routes.</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>pkey</th>
          <th>cluster</th>
          <th>carrier</th>
          <th>trunkname</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in inboundRoutes" :key="r.pkey">
          <td>
            <router-link :to="{ name: 'inbound-route-detail', params: { pkey: r.pkey } }" class="cell-link">{{ r.pkey }}</router-link>
          </td>
          <td>{{ r.cluster ?? '—' }}</td>
          <td>{{ r.carrier ?? '—' }}</td>
          <td>{{ r.trunkname ?? '—' }}</td>
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
.toolbar {
  margin: 0.75rem 0 0 0;
}
.add-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border-radius: 0.375rem;
  text-decoration: none;
}
.add-btn:hover {
  background: #1d4ed8;
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

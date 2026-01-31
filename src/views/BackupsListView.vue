<script setup>
import { ref, onMounted } from 'vue'
import { getApiClient } from '@/api/client'

const backups = ref([])
const loading = ref(true)
const error = ref('')
const creating = ref(false)
const deletingId = ref(null)

function backupId(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  return item.pkey ?? item.name ?? item.filename ?? item.id ?? String(item)
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.backups)) return response.backups
    if (Object.keys(response).every((k) => /^\d+$/.test(k))) return Object.values(response)
  }
  return []
}

async function fetchBackups() {
  loading.value = true
  error.value = ''
  try {
    const response = await getApiClient().get('backups')
    backups.value = normalizeList(response)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load backups'
    backups.value = []
  } finally {
    loading.value = false
  }
}

async function createNewBackup() {
  creating.value = true
  error.value = ''
  try {
    await getApiClient().get('backups/new')
    await fetchBackups()
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to create backup'
  } finally {
    creating.value = false
  }
}

async function downloadBackup(item) {
  const id = backupId(item)
  if (!id) return
  try {
    const blob = await getApiClient().getBlob(`backups/${encodeURIComponent(id)}`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = id.endsWith('.zip') ? id : `${id}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to download backup'
  }
}

async function deleteBackup(item) {
  const id = backupId(item)
  if (!id) return
  if (!confirm(`Delete backup "${id}"? This cannot be undone.`)) return
  deletingId.value = id
  error.value = ''
  try {
    await getApiClient().delete(`backups/${encodeURIComponent(id)}`)
    await fetchBackups()
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to delete backup'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchBackups)
</script>

<template>
  <div>
    <h1>Backups</h1>
    <p class="toolbar">
      <button
        type="button"
        class="add-btn"
        :disabled="creating"
        @click="createNewBackup"
      >
        {{ creating ? 'Creating…' : 'Create new backup' }}
      </button>
    </p>

    <p v-if="loading" class="loading">Loading backups…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else-if="backups.length === 0" class="empty">No backups.</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Backup</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in backups" :key="backupId(item) || i">
          <td>{{ backupId(item) }}</td>
          <td>
            <button
              type="button"
              class="action-btn"
              @click="downloadBackup(item)"
            >
              Download
            </button>
            <button
              type="button"
              class="action-btn delete"
              :disabled="deletingId === backupId(item)"
              @click="deleteBackup(item)"
            >
              {{ deletingId === backupId(item) ? 'Deleting…' : 'Delete' }}
            </button>
          </td>
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
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
.add-btn:hover:not(:disabled) {
  background: #1d4ed8;
}
.add-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
.action-btn {
  margin-right: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #2563eb;
  background: transparent;
  border: 1px solid #93c5fd;
  border-radius: 0.375rem;
  cursor: pointer;
}
.action-btn:hover {
  background: #eff6ff;
}
.action-btn.delete {
  color: #dc2626;
  border-color: #fca5a5;
}
.action-btn.delete:hover:not(:disabled) {
  background: #fef2f2;
}
.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiClient } from '@/api/client'

const route = useRoute()
const router = useRouter()
const routeData = ref(null)
const loading = ref(true)
const error = ref('')
const editing = ref(false)
const editCluster = ref('default')
const editDesc = ref('')
const editActive = ref('YES')
const saveError = ref('')
const saving = ref(false)
const deleteError = ref('')
const deleting = ref(false)

const pkey = computed(() => route.params.pkey)

async function fetchRoute() {
  if (!pkey.value) return
  loading.value = true
  error.value = ''
  try {
    routeData.value = await getApiClient().get(`routes/${encodeURIComponent(pkey.value)}`)
    editCluster.value = routeData.value?.cluster ?? 'default'
    editDesc.value = routeData.value?.desc ?? ''
    editActive.value = routeData.value?.active ?? 'YES'
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load route'
    routeData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchRoute)
watch(pkey, fetchRoute)

function goBack() {
  router.push({ name: 'routes' })
}

function startEdit() {
  editCluster.value = routeData.value?.cluster ?? 'default'
  editDesc.value = routeData.value?.desc ?? ''
  editActive.value = routeData.value?.active ?? 'YES'
  saveError.value = ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  saveError.value = ''
}

async function saveEdit(e) {
  e.preventDefault()
  saveError.value = ''
  saving.value = true
  try {
    await getApiClient().put(`routes/${encodeURIComponent(pkey.value)}`, {
      cluster: editCluster.value.trim(),
      desc: editDesc.value.trim() || undefined,
      active: editActive.value
    })
    await fetchRoute()
    editing.value = false
  } catch (err) {
    const msg =
      err.data?.cluster?.[0] ??
      err.data?.desc?.[0] ??
      err.data?.active?.[0] ??
      err.data?.message ??
      err.message
    saveError.value = msg || 'Failed to update route'
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!confirm(`Delete route "${pkey.value}"? This cannot be undone.`)) return
  deleteError.value = ''
  deleting.value = true
  try {
    await getApiClient().delete(`routes/${encodeURIComponent(pkey.value)}`)
    router.push({ name: 'routes' })
  } catch (err) {
    deleteError.value = err.data?.message ?? err.message ?? 'Failed to delete route'
  } finally {
    deleting.value = false
  }
}

const detailFields = computed(() => {
  if (!routeData.value || typeof routeData.value !== 'object') return []
  const skip = new Set(['pkey'])
  return Object.entries(routeData.value)
    .filter(([k]) => !skip.has(k))
    .sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <div>
    <p class="back">
      <button type="button" class="back-btn" @click="goBack">← Routes</button>
    </p>
    <h1>Route: {{ pkey }}</h1>

    <p v-if="loading" class="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="routeData">
      <p v-if="!editing" class="toolbar">
        <button type="button" class="edit-btn" @click="startEdit">Edit</button>
        <button
          type="button"
          class="delete-btn"
          :disabled="deleting"
          @click="doDelete"
        >
          {{ deleting ? 'Deleting…' : 'Delete route' }}
        </button>
      </p>
      <p v-if="deleteError" class="error">{{ deleteError }}</p>
      <form v-else-if="editing" class="edit-form" @submit="saveEdit">
        <label for="edit-cluster">cluster</label>
        <input id="edit-cluster" v-model="editCluster" type="text" class="edit-input" required />
        <label for="edit-desc">desc (optional)</label>
        <input id="edit-desc" v-model="editDesc" type="text" class="edit-input" />
        <label for="edit-active">active</label>
        <select id="edit-active" v-model="editActive" class="edit-input">
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <p v-if="saveError" class="error">{{ saveError }}</p>
        <div class="edit-actions">
          <button type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
          <button type="button" class="secondary" @click="cancelEdit">Cancel</button>
        </div>
      </form>
      <dl class="detail-list">
        <dt>pkey</dt>
        <dd>{{ routeData.pkey }}</dd>
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
.toolbar {
  margin: 0 0 0.75rem 0;
}
.edit-btn,
.delete-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  margin-right: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.edit-btn {
  color: #2563eb;
  background: transparent;
  border: 1px solid #93c5fd;
}
.edit-btn:hover {
  background: #eff6ff;
}
.delete-btn {
  color: #dc2626;
  background: transparent;
  border: 1px solid #fca5a5;
}
.delete-btn:hover:not(:disabled) {
  background: #fef2f2;
}
.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.edit-form {
  margin-bottom: 1rem;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.edit-form label {
  font-size: 0.875rem;
  font-weight: 500;
}
.edit-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
}
.edit-input:focus {
  outline: none;
  border-color: #3b82f6;
}
.edit-actions {
  display: flex;
  gap: 0.5rem;
}
.edit-actions button {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
}
.edit-actions button[type="submit"] {
  color: #fff;
  background: #2563eb;
  border: none;
}
.edit-actions button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.edit-actions button.secondary {
  color: #64748b;
  background: transparent;
  border: 1px solid #e2e8f0;
}
.edit-actions button.secondary:hover {
  background: #f1f5f9;
}
</style>

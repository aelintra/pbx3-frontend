<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiClient } from '@/api/client'

const router = useRouter()
const pkey = ref('')
const carrier = ref('DiD')
const cluster = ref('default')
const trunkname = ref('')
const error = ref('')
const loading = ref(false)

function fieldErrors(err) {
  if (!err?.data || typeof err.data !== 'object') return null
  const entries = Object.entries(err.data).filter(([, v]) => Array.isArray(v) && v.length)
  return entries.length ? Object.fromEntries(entries) : null
}

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    const inboundRoute = await getApiClient().post('inboundroutes', {
      pkey: pkey.value.trim(),
      carrier: carrier.value,
      cluster: cluster.value.trim(),
      trunkname: trunkname.value.trim()
    })
    router.push({ name: 'inbound-route-detail', params: { pkey: inboundRoute.pkey } })
  } catch (err) {
    const errors = fieldErrors(err)
    if (errors) {
      const first = Object.values(errors).flat()[0]
      error.value = first || err.message
    } else {
      error.value = err.data?.message ?? err.message ?? 'Failed to create inbound route'
    }
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'inbound-routes' })
}
</script>

<template>
  <div>
    <p class="back">
      <button type="button" class="back-btn" @click="goBack">← Inbound routes</button>
    </p>
    <h1>Create inbound route</h1>

    <form class="form" @submit="onSubmit">
      <label for="pkey">pkey</label>
      <input
        id="pkey"
        v-model="pkey"
        type="text"
        placeholder="e.g. 0123456789"
        required
        autocomplete="off"
      />

      <label for="carrier">carrier</label>
      <select id="carrier" v-model="carrier" required>
        <option value="DiD">DiD</option>
        <option value="CLID">CLID</option>
      </select>

      <label for="cluster">cluster</label>
      <input
        id="cluster"
        v-model="cluster"
        type="text"
        placeholder="e.g. default"
        required
      />

      <label for="trunkname">trunkname</label>
      <input
        id="trunkname"
        v-model="trunkname"
        type="text"
        placeholder="Trunk name"
        required
      />

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating…' : 'Create inbound route' }}
        </button>
        <button type="button" class="secondary" @click="goBack">Cancel</button>
      </div>
    </form>
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
.form {
  margin-top: 1rem;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.form label {
  font-size: 0.875rem;
  font-weight: 500;
}
.form input,
.form select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
}
.form input:focus,
.form select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
.error {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}
.actions button {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
}
.actions button[type="submit"] {
  color: #fff;
  background: #2563eb;
  border: none;
}
.actions button[type="submit"]:hover:not(:disabled) {
  background: #1d4ed8;
}
.actions button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.actions button.secondary {
  color: #64748b;
  background: transparent;
  border: 1px solid #e2e8f0;
}
.actions button.secondary:hover {
  background: #f1f5f9;
}
</style>

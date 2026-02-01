<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApiClient } from '@/api/client'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const toast = useToastStore()
const protocol = ref('')
const pkey = ref('')
const cluster = ref('')
const desc = ref('')
const macaddr = ref('')
const tenants = ref([])
const error = ref('')
const loading = ref(false)

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.tenants)) return response.tenants
    if (Object.keys(response).every((k) => /^\d+$/.test(k))) return Object.values(response)
  }
  return []
}

const tenantOptions = computed(() => {
  const list = tenants.value.map((t) => t.pkey).filter(Boolean)
  return [...new Set(list)].sort((a, b) => String(a).localeCompare(String(b)))
})

const tenantOptionsForSelect = computed(() => {
  const list = tenantOptions.value
  const cur = cluster.value
  if (cur && !list.includes(cur)) return [cur, ...list].sort((a, b) => String(a).localeCompare(String(b)))
  return list
})

const protocolChosen = computed(() => !!protocol.value)

function fieldErrors(err) {
  if (!err?.data || typeof err.data !== 'object') return null
  const entries = Object.entries(err.data).filter(([, v]) => Array.isArray(v) && v.length)
  return entries.length ? Object.fromEntries(entries) : null
}

async function loadTenants() {
  try {
    const response = await getApiClient().get('tenants')
    tenants.value = normalizeList(response)
    if (tenants.value.length && !cluster.value) {
      const first = tenants.value.find((t) => t.pkey)?.pkey
      if (first) cluster.value = first
    }
  } catch {
    tenants.value = []
  }
}

onMounted(loadTenants)

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    const body = {
      pkey: pkey.value.trim(),
      cluster: cluster.value.trim(),
      protocol: protocol.value,
    }
    if (desc.value.trim()) body.desc = desc.value.trim()
    if (macaddr.value.trim()) body.macaddr = macaddr.value.trim().replace(/[^0-9a-fA-F]/g, '')
    const extension = await getApiClient().post('extensions', body)
    const createdPkey = extension?.pkey ?? extension?.data?.pkey
    if (createdPkey) {
      toast.show(`Extension ${createdPkey} created`)
      router.push({ name: 'extension-detail', params: { pkey: createdPkey } })
    } else {
      toast.show('Extension created', 'success')
      router.push({ name: 'extensions' })
    }
  } catch (err) {
    const errors = fieldErrors(err)
    if (errors) {
      const first = Object.values(errors).flat()[0]
      error.value = first || err.message
    } else {
      error.value = err.data?.save?.[0] ?? err.data?.message ?? err.data?.Error ?? err.message ?? 'Failed to create extension'
    }
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'extensions' })
}
</script>

<template>
  <div class="create-view">
    <p class="back">
      <button type="button" class="back-btn" @click="goBack">← Extensions</button>
    </p>
    <h1>Create extension</h1>

    <form class="form" @submit="onSubmit">
      <label for="protocol" class="form-label">Protocol</label>
      <select
        id="protocol"
        v-model="protocol"
        class="form-input"
        aria-label="Choose protocol"
      >
        <option value="">Choose protocol</option>
        <option value="SIP">SIP</option>
        <option value="WebRTC">WebRTC</option>
        <option value="Mailbox">Mailbox</option>
      </select>

      <template v-if="protocolChosen">
        <label for="pkey" class="form-label">Extension number</label>
        <input
          id="pkey"
          v-model="pkey"
          type="text"
          class="form-input"
          placeholder="e.g. 1001"
          required
          autocomplete="off"
        />

        <label for="cluster" class="form-label">Tenant</label>
        <select id="cluster" v-model="cluster" class="form-input" required>
          <option v-for="opt in tenantOptionsForSelect" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <label for="desc" class="form-label">Name</label>
        <input
          id="desc"
          v-model="desc"
          type="text"
          class="form-input"
          placeholder="Short description or display name"
          autocomplete="off"
        />

        <label for="macaddr" class="form-label">MAC address (optional)</label>
        <input
          id="macaddr"
          v-model="macaddr"
          type="text"
          class="form-input"
          placeholder="e.g. 001122334455 (12 hex digits)"
          autocomplete="off"
        />
      </template>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="submit" :disabled="loading || !protocolChosen">
          {{ loading ? 'Creating…' : 'Create' }}
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
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
}
.form-input:focus {
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

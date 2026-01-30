import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createApiClient } from './api/client'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// In dev, expose API client for console testing: createApiClient(baseUrl, token).get('auth/whoami')
if (import.meta.env.DEV) {
  window.createApiClient = createApiClient
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

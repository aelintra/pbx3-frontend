/**
 * Validation rules for form fields
 */

/**
 * Validate IVR Direct Dial (pkey)
 * Must be 3-5 numeric digits
 */
export function validateIvrPkey(value) {
  if (!value || !value.trim()) {
    return 'IVR Direct Dial is required'
  }
  const trimmed = value.trim()
  if (!/^\d{3,5}$/.test(trimmed)) {
    return 'Must be 3-5 numeric digits'
  }
  return null
}

/**
 * Validate Tenant (cluster)
 * Must not be empty
 */
export function validateTenant(value) {
  if (!value || !value.trim()) {
    return 'Tenant is required'
  }
  return null
}

/**
 * Validate Tenant name (pkey) for create
 * Required, non-empty
 */
export function validateTenantPkey(value) {
  if (!value || !value.trim()) {
    return 'Tenant name is required'
  }
  return null
}

/**
 * Validate Greeting Number
 * Optional, but if provided must be valid integer >= 0
 */
export function validateGreetnum(value) {
  if (!value || value === '') {
    return null // Optional field
  }
  const num = parseInt(value, 10)
  if (isNaN(num) || num < 0) {
    return 'Must be a valid greeting number'
  }
  return null
}

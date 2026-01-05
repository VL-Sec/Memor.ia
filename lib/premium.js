// Premium and Trial Management for Memor.ia

const TRIAL_DAYS = 15
const STORAGE_KEYS = {
  FIRST_INSTALL: 'memoria_first_install',
  PREMIUM_STATUS: 'memoria_premium',
  DEVICE_ID: 'memoria_device_id',
  ACTIVATED_CODE: 'memoria_activated_code'
}

// Generate unique device ID
export function getDeviceId() {
  if (typeof window === 'undefined') return null
  
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
  }
  return deviceId
}

// Get first install date
export function getFirstInstallDate() {
  if (typeof window === 'undefined') return null
  
  let installDate = localStorage.getItem(STORAGE_KEYS.FIRST_INSTALL)
  if (!installDate) {
    installDate = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.FIRST_INSTALL, installDate)
  }
  return new Date(installDate)
}

// Calculate days remaining in trial
export function getTrialDaysRemaining() {
  const installDate = getFirstInstallDate()
  if (!installDate) return TRIAL_DAYS
  
  const now = new Date()
  const diffTime = now.getTime() - installDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const remaining = TRIAL_DAYS - diffDays
  
  return Math.max(0, remaining)
}

// Check if trial is active
export function isTrialActive() {
  return getTrialDaysRemaining() > 0
}

// Check if premium is activated (via code)
export function isPremiumActivated() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS) === 'true'
}

// Get activated code
export function getActivatedCode() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.ACTIVATED_CODE)
}

// Activate premium with code
export function activatePremium(code) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true')
  localStorage.setItem(STORAGE_KEYS.ACTIVATED_CODE, code)
}

// Check if user has premium access (trial OR activated)
export function hasPremiumAccess() {
  return isPremiumActivated() || isTrialActive()
}

// Get premium status details
export function getPremiumStatus() {
  const isPremium = isPremiumActivated()
  const trialDays = getTrialDaysRemaining()
  const trialActive = isTrialActive()
  const activatedCode = getActivatedCode()
  
  return {
    hasPremium: isPremium || trialActive,
    isPremiumActivated: isPremium,
    isTrialActive: trialActive && !isPremium,
    trialDaysRemaining: trialDays,
    activatedCode: activatedCode,
    deviceId: getDeviceId()
  }
}

// Generate activation code (for admin)
export function generateActivationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

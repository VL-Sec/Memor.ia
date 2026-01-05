// Reminder and notification system for Memor.ia

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export function scheduleReminder(linkId, linkTitle, reminderTime) {
  const now = new Date().getTime()
  const reminderTimestamp = new Date(reminderTime).getTime()
  const delay = reminderTimestamp - now
  
  if (delay <= 0) {
    console.error('Reminder time must be in the future')
    return null
  }
  
  // Store reminder in localStorage
  const reminders = getReminders()
  const reminder = {
    id: `reminder_${Date.now()}`,
    linkId,
    linkTitle,
    reminderTime: reminderTimestamp,
    scheduled: true
  }
  
  reminders[linkId] = reminder
  saveReminders(reminders)
  
  // Schedule notification
  const timeoutId = setTimeout(() => {
    showNotification(linkTitle, linkId)
    removeReminder(linkId)
  }, delay)
  
  // Store timeout ID for cancellation
  if (typeof window !== 'undefined') {
    window[`reminder_timeout_${linkId}`] = timeoutId
  }
  
  return reminder
}

export function removeReminder(linkId) {
  const reminders = getReminders()
  delete reminders[linkId]
  saveReminders(reminders)
  
  // Clear timeout
  if (typeof window !== 'undefined') {
    const timeoutId = window[`reminder_timeout_${linkId}`]
    if (timeoutId) {
      clearTimeout(timeoutId)
      delete window[`reminder_timeout_${linkId}`]
    }
  }
}

export function getReminder(linkId) {
  const reminders = getReminders()
  return reminders[linkId] || null
}

export function getReminders() {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem('memoria-reminders')
  return stored ? JSON.parse(stored) : {}
}

function saveReminders(reminders) {
  if (typeof window === 'undefined') return
  localStorage.setItem('memoria-reminders', JSON.stringify(reminders))
}

export function showNotification(title, linkId) {
  if (!('Notification' in window)) return
  
  if (Notification.permission === 'granted') {
    const notification = new Notification('💡 Memor.ia Reminder', {
      body: `Time to read: ${title}`,
      icon: '/icon.png',
      badge: '/badge.png',
      tag: `memoria-${linkId}`,
      requireInteraction: true,
      data: { linkId }
    })
    
    notification.onclick = function() {
      window.focus()
      // Navigate to the link
      if (linkId) {
        window.location.href = `/?linkId=${linkId}`
      }
      notification.close()
    }
  }
}

// Initialize reminders on app load
export function initializeReminders() {
  if (typeof window === 'undefined') return
  
  const reminders = getReminders()
  const now = new Date().getTime()
  
  // Re-schedule active reminders
  Object.values(reminders).forEach(reminder => {
    if (reminder.reminderTime > now) {
      const delay = reminder.reminderTime - now
      const timeoutId = setTimeout(() => {
        showNotification(reminder.linkTitle, reminder.linkId)
        removeReminder(reminder.linkId)
      }, delay)
      
      window[`reminder_timeout_${reminder.linkId}`] = timeoutId
    } else {
      // Remove expired reminders
      removeReminder(reminder.linkId)
    }
  })
}

// Weekly recap notification (Sunday 7 PM)
export function scheduleWeeklyRecap() {
  if (typeof window === 'undefined') return
  
  const settings = getSettings()
  if (!settings.enableWeeklyRecap) return
  
  const now = new Date()
  const nextSunday = new Date()
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7))
  nextSunday.setHours(19, 0, 0, 0)
  
  if (nextSunday < now) {
    nextSunday.setDate(nextSunday.getDate() + 7)
  }
  
  const delay = nextSunday.getTime() - now.getTime()
  
  setTimeout(() => {
    showNotification('📊 Weekly Recap', 'weekly-recap')
    scheduleWeeklyRecap() // Reschedule for next week
  }, delay)
}

export function getSettings() {
  if (typeof window === 'undefined') return { enableReminders: true, enableWeeklyRecap: true }
  const stored = localStorage.getItem('memoria-settings')
  return stored ? JSON.parse(stored) : { enableReminders: true, enableWeeklyRecap: true }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return
  localStorage.setItem('memoria-settings', JSON.stringify(settings))
}

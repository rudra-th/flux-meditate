const STORAGE_KEY = 'still'
const OLD_KEY = 'window.storage'

function defaults() {
  return {
    sessions: [],
    settings: {
      defaultDuration: 600,
      soundEnabled: true,
      durationPresets: [3, 5, 10, 15, 20, 30, 45, 60]
    }
  }
}

function migrate() {
  try {
    const old = localStorage.getItem(OLD_KEY)
    if (!old) return defaults()
    const data = JSON.parse(old)
    const migrated = defaults()
    if (Array.isArray(data.sessions)) {
      migrated.sessions = data.sessions.map(s => ({
        duration: s.duration,
        timestamp: s.timestamp,
        completed: s.completed !== false
      }))
    }
    if (data.settings) {
      if (typeof data.settings.soundEnabled === 'boolean') {
        migrated.settings.soundEnabled = data.settings.soundEnabled
      }
    }
    localStorage.removeItem(OLD_KEY)
    return migrated
  } catch {
    return defaults()
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return migrate()
    const data = JSON.parse(raw)
    const d = defaults()
    data.settings = { ...d.settings, ...(data.settings || {}) }
    return { ...d, ...data }
  } catch {
    return migrate()
  }
}

export function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function addSession(duration) {
  const data = load()
  data.sessions.unshift({
    duration,
    timestamp: Date.now(),
    completed: true
  })
  save(data)
  return data
}

export function updateSettings(partial) {
  const data = load()
  data.settings = { ...data.settings, ...partial }
  save(data)
  return data
}

export function resetData() {
  const data = defaults()
  save(data)
  return data
}
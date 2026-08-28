const STORAGE_KEY = 'still'
const OLD_KEY = 'window.storage'
const BACKUP_SUFFIX = 'still-backup'

export const MIN_DURATION = 1
export const MAX_DURATION = 240

function defaults() {
  return {
    sessions: [],
    settings: {
      defaultDuration: 600,
      soundEnabled: true,
      hapticsEnabled: true,
      intervalBell: 0,
      goalMinutes: 20,
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
        duration: Number(s.duration) || 0,
        timestamp: Number(s.timestamp) || Date.now(),
        completed: s.completed !== false
      })).filter(s => s.duration > 0)
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

export function addSession(duration, completed = true) {
  const data = load()
  data.sessions.unshift({
    duration,
    timestamp: Date.now(),
    completed
  })
  save(data)
  return data
}

export function removeSession(timestamp) {
  const data = load()
  data.sessions = data.sessions.filter(s => s.timestamp !== timestamp)
  save(data)
  return data
}

export function updateSettings(partial) {
  const data = load()
  data.settings = { ...data.settings, ...partial }
  save(data)
  return data
}

export function exportData() {
  const data = load()
  const payload = { ...data, __version: 2, __exportedAt: new Date().toISOString() }
  return JSON.stringify(payload, null, 2)
}

export function importData(json) {
  const data = defaults()
  const parsed = JSON.parse(json)
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file')
  if (Array.isArray(parsed.sessions)) {
    data.sessions = parsed.sessions
      .map(s => ({
        duration: Number(s.duration) || 0,
        timestamp: Number(s.timestamp) || Date.now(),
        completed: s.completed !== false
      }))
      .filter(s => s.duration > 0)
  }
  if (parsed.settings && typeof parsed.settings === 'object') {
    data.settings = { ...data.settings, ...parsed.settings }
  }
  save(data)
  return data
}

export function downloadBackup() {
  const blob = new Blob([exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `still-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function clearSessions() {
  const data = load()
  data.sessions = []
  save(data)
  return data
}

export function resetData() {
  const data = defaults()
  save(data)
  return data
}

export { BACKUP_SUFFIX }
export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function dayStart(date = today()) {
  return new Date(date + 'T00:00:00').getTime()
}

export function dayEnd(date = today()) {
  return new Date(date + 'T23:59:59').getTime()
}

export function isToday(ts) {
  return ts >= dayStart() && ts <= dayEnd()
}

export function formatDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function daysBetween(ts1, ts2) {
  const d1 = new Date(ts1)
  const d2 = new Date(ts2)
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
  return Math.round((date2 - date1) / 86400000)
}

export function streak(sessions) {
  const todayTs = dayStart()
  const completed = sessions.filter(s => s.completed).sort((a, b) => b.timestamp - a.timestamp)

  let streak = 0
  let currentDay = todayTs

  for (let i = 0; i < 365; i++) {
    const dayTs = todayTs - i * 86400000
    const hasSession = completed.some(s => s.timestamp >= dayTs && s.timestamp < dayTs + 86400000)
    if (hasSession) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

export function todayMinutes(sessions) {
  return sessions
    .filter(s => s.completed && isToday(s.timestamp))
    .reduce((sum, s) => sum + s.duration, 0) / 60
}

export function weekData(sessions) {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const dayTs = dayStart() - i * 86400000
    const dayEndTs = dayTs + 86400000
    const mins = sessions
      .filter(s => s.completed && s.timestamp >= dayTs && s.timestamp < dayEndTs)
      .reduce((sum, s) => sum + s.duration, 0) / 60
    result.push({
      date: new Date(dayTs),
      minutes: mins,
      label: new Date(dayTs).toLocaleDateString([], { weekday: 'short' })
    })
  }
  return result
}

export function allTimeStats(sessions) {
  const completed = sessions.filter(s => s.completed)
  const total = completed.reduce((sum, s) => sum + s.duration, 0) / 60
  const count = completed.length
  const avg = count > 0 ? total / count : 0
  const longest = count > 0 ? Math.max(...completed.map(s => s.duration)) / 60 : 0
  return { total, count, avg, longest }
}
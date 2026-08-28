export function localDayStart(ts) {
  const d = new Date(ts)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function dayStart() {
  return localDayStart(Date.now())
}

export function addDays(ts, days) {
  return ts + days * 86400000
}

export function isSameDay(ts1, ts2) {
  return localDayStart(ts1) === localDayStart(ts2)
}

export function dayKey(ts) {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function isToday(ts) {
  return isSameDay(ts, Date.now())
}

export function formatDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return rm === 0 ? `${h}h` : `${h}h ${rm}m`
  }
  return `${m}m ${s}s`
}

export function formatMinutes(mins) {
  const m = Math.round(mins)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return rm === 0 ? `${h}h` : `${h}h ${rm}m`
  }
  return `${m}m`
}

export function formatClock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatTime(ts) {
  return formatClock(ts)
}

export function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000 && diff >= 0) return 'Just now'
  if (diff < 3600000 && diff >= 0) return `${Math.floor(diff / 60000)}m ago`
  if (isSameDay(ts, Date.now())) return `Today · ${formatClock(ts)}`
  if (diff < 86400000 && diff >= 0) return `${Math.floor(diff / 3600000)}h ago`
  if (isSameDay(ts, Date.now() - 86400000)) return `Yesterday · ${formatClock(ts)}`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` · ${formatClock(ts)}`
}

export function daysBetween(ts1, ts2) {
  return Math.round((localDayStart(ts2) - localDayStart(ts1)) / 86400000)
}

export function streak(sessions) {
  const completed = sessions
    .filter(s => s.completed && s.duration > 0)
    .sort((a, b) => b.timestamp - a.timestamp)
  const todayTs = dayStart()
  const hasToday = completed.some(s => isSameDay(s.timestamp, todayTs))
  let cursor = hasToday ? localDayStart(todayTs) : localDayStart(todayTs - 86400000)
  let count = 0
  let t = cursor
  while (true) {
    const hit = completed.some(s => s.timestamp >= t && s.timestamp < t + 86400000)
    if (!hit) break
    count++
    t -= 86400000
  }
  return count
}

export function bestStreak(sessions) {
  const days = {}
  sessions
    .filter(s => s.completed && s.duration > 0)
    .forEach(s => { days[localDayStart(s.timestamp)] = true })
  const keys = Object.keys(days).sort((a, b) => a - b).map(Number)
  let best = 0
  let run = 0
  let prev = null
  keys.forEach(k => {
    run = prev !== null && k - prev === 86400000 ? run + 1 : 1
    best = Math.max(best, run)
    prev = k
  })
  return best
}

export function todayMinutes(sessions) {
  return sessions
    .filter(s => s.completed && s.duration > 0 && isToday(s.timestamp))
    .reduce((sum, s) => sum + s.duration, 0) / 60
}

export function weekData(sessions) {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const dayTs = localDayStart(Date.now() - i * 86400000)
    const mins = sessions
      .filter(s => s.completed && s.duration > 0 && s.timestamp >= dayTs && s.timestamp < dayTs + 86400000)
      .reduce((sum, s) => sum + s.duration, 0) / 60
    const d = new Date(dayTs)
    result.push({
      date: dayTs,
      minutes: Math.round(mins * 10) / 10,
      label: d.toLocaleDateString([], { weekday: 'short' }),
      isToday: i === 0
    })
  }
  return result
}

export function allTimeStats(sessions) {
  const completed = sessions.filter(s => s.completed && s.duration > 0)
  const total = completed.reduce((sum, s) => sum + s.duration, 0) / 60
  const count = completed.length
  const avg = count > 0 ? total / count : 0
  const longest = count > 0 ? Math.max(...completed.map(s => s.duration)) / 60 : 0
  return { total, count, avg, longest }
}
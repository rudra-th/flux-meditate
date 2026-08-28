import { allTimeStats, bestStreak, dayStart, isSameDay, localDayStart, streak, todayMinutes } from './date'

const MIN = 60000
const HOUR = 3600000
const DAY = 86400000

function completed(sessions) {
  return sessions.filter(s => s.completed && s.duration > 0)
}

export function overview(sessions) {
  const stats = allTimeStats(sessions)
  const todayMins = todayMinutes(sessions)
  const currentStreak = streak(sessions)
  const best = bestStreak(sessions)
  return { ...stats, todayMins, streak: currentStreak, bestStreak: best }
}

export function goalProgress(sessions, goalMinutes) {
  const todayMins = todayMinutes(sessions)
  return {
    achieved: todayMins,
    goal: goalMinutes,
    ratio: Math.min(1, todayMins / Math.max(1, goalMinutes)),
    capped: Math.min(1.25, todayMins / Math.max(1, goalMinutes))
  }
}

export function dailySeries(sessions, days = 28) {
  const list = completed(sessions)
  const out = []
  const todayStart = dayStart()
  for (let i = days - 1; i >= 0; i--) {
    const dayTs = localDayStart(todayStart - i * DAY)
    const mins = list
      .filter(s => s.timestamp >= dayTs && s.timestamp < dayTs + DAY)
      .reduce((sum, s) => sum + s.duration, 0) / 60
    const d = new Date(dayTs)
    out.push({
      ts: dayTs,
      label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      short: d.toLocaleDateString([], { weekday: 'short' }),
      minutes: Math.round(mins * 10) / 10,
      sessions: list.filter(s => s.timestamp >= dayTs && s.timestamp < dayTs + DAY).length,
      isToday: i === 0
    })
  }
  return out
}

export function weeklyTrend(sessions, weeks = 12) {
  const list = completed(sessions)
  const out = []
  const todayStart = dayStart()
  const weekStart = ts => {
    const d = new Date(localDayStart(ts))
    d.setDate(d.getDate() - d.getDay())
    return d.getTime()
  }
  const startOfThisWeek = weekStart(todayStart)
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = startOfThisWeek - i * 7 * DAY
    const we = ws + 7 * DAY
    const week = list.filter(s => s.timestamp >= ws && s.timestamp < we)
    const minutes = week.reduce((sum, s) => sum + s.duration, 0) / 60
    const start = new Date(ws)
    const end = new Date(Math.min(we - 1, todayStart))
    out.push({
      label: new Date(ws).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      range: `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
      minutes: Math.round(minutes),
      sessions: week.length
    })
  }
  return out
}

export function timeOfDay(sessions) {
  const list = completed(sessions)
  const buckets = [
    { key: 'Morning', from: 5, to: 12 },
    { key: 'Midday', from: 12, to: 17 },
    { key: 'Evening', from: 17, to: 22 },
    { key: 'Night', from: 22, to: 29 }
  ]
  const counts = buckets.map(b => {
    const items = list.filter(s => {
      const h = new Date(s.timestamp).getHours()
      const hour = h < 5 ? h + 24 : h
      return hour >= b.from && hour < b.to
    })
    return {
      name: b.key,
      minutes: Math.round(items.reduce((sum, s) => sum + s.duration, 0) / 60),
      sessions: items.length
    }
  })
  const total = Math.max(1, counts.reduce((sum, c) => sum + c.sessions, 0))
  return counts.map(c => ({ ...c, pct: Math.round((c.sessions / total) * 100) }))
}

export function dayOfWeekAvg(sessions) {
  const list = completed(sessions)
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const groups = names.map(() => ({ mins: 0, count: 0 }))
  list.forEach(s => {
    const dow = new Date(s.timestamp).getDay()
    groups[dow].mins += s.duration / 60
    groups[dow].count += 1
  })
  return groups.map((g, i) => ({
    day: names[i],
    avg: g.count > 0 ? Math.round((g.mins / g.count) * 10) / 10 : 0,
    sessions: g.count
  }))
}

export function hourlyProfile(sessions) {
  const list = completed(sessions)
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: `${h}:00`, minutes: 0, sessions: 0 }))
  list.forEach(s => {
    const h = new Date(s.timestamp).getHours()
    hours[h].minutes += s.duration / 60
    hours[h].sessions += 1
  })
  return hours.map(x => ({ ...x, minutes: Math.round(x.minutes * 10) / 10 }))
}

export function peakHour(sessions) {
  const profile = hourlyProfile(sessions)
  const best = profile.reduce((a, b) => (b.minutes > a.minutes ? b : a), { minutes: 0 })
  if (best.minutes <= 0) return null
  const hour = best.hour
  const period = hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'
  return { hour, period, minutes: best.minutes, label: `${hour.toString().padStart(2, '0')}:00` }
}

export function durationDistribution(sessions) {
  const list = completed(sessions)
  const buckets = [
    { label: '<5m', from: 0, to: 300 },
    { label: '5–10m', from: 300, to: 600 },
    { label: '10–15m', from: 600, to: 900 },
    { label: '15–30m', from: 900, to: 1800 },
    { label: '30–60m', from: 1800, to: 3600 },
    { label: '60m+', from: 3600, to: Infinity }
  ]
  return buckets.map(b => ({
    label: b.label,
    count: list.filter(s => s.duration >= b.from && s.duration < b.to).length
  }))
}

export function monthCompare(sessions) {
  const list = completed(sessions)
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()
  const daysInThis = Math.max(1, Math.round((Date.now() - thisMonthStart) / DAY) + 1)
  const daysInLast = Math.round((thisMonthStart - lastMonthStart) / DAY)

  const totalFor = (start, end) => list.filter(s => s.timestamp >= start && s.timestamp < end)
  const summarize = (items, dayCount) => {
    const minutes = items.reduce((sum, s) => sum + s.duration, 0) / 60
    const count = items.length
    return {
      minutes: Math.round(minutes),
      sessions: count,
      avgSession: count ? minutes / count : 0,
      avgDay: minutes / Math.max(1, dayCount)
    }
  }

  const current = summarize(totalFor(thisMonthStart, now.getTime() + 1), daysInThis)
  const previous = summarize(totalFor(lastMonthStart, thisMonthStart), daysInLast)

  const delta = (a, b) => {
    const pct = b > 0 ? ((a - b) / b) * 100 : 0
    return { pct: Math.round(pct), up: pct > 0 }
  }

  return {
    current,
    previous,
    daysInThis,
    deltaMinutes: delta(current.minutes, previous.minutes),
    deltaSessions: delta(current.sessions, previous.sessions),
    projected: Math.round(current.minutes / daysInThis * Math.max(daysInLast, daysInThis)),
    pace: Math.round(current.minutes / daysInThis)
  }
}

export function consistency30(sessions) {
  const list = completed(sessions)
  const today = dayStart()
  let activeDays = 0
  for (let i = 0; i < 30; i++) {
    const dayTs = localDayStart(today - i * DAY)
    if (list.some(s => s.timestamp >= dayTs && s.timestamp < dayTs + DAY)) activeDays++
  }
  return Math.round((activeDays / 30) * 100)
}

export function maxSessionsInWeek(sessions) {
  const list = completed(sessions)
  const today = dayStart()
  const weekStartOf = ts => {
    const d = new Date(localDayStart(ts))
    d.setDate(d.getDate() - d.getDay())
    return d.getTime()
  }
  const counts = {}
  list.forEach(s => {
    const ws = weekStartOf(s.timestamp)
    counts[ws] = (counts[ws] || 0) + 1
  })
  const currentWs = weekStartOf(today)
  return Math.max(1, ...Object.entries(counts).map(([k, v]) => v))
}

export function milestones(sessions) {
  const stats = allTimeStats(sessions)
  const best = bestStreak(sessions)
  const listAll = [
    { id: 'first', name: 'Take a Breath', desc: 'Complete your first session', check: () => stats.count >= 1 },
    { id: 'ten', name: 'Still & Steady', desc: 'Complete 10 sessions', check: () => stats.count >= 10 },
    { id: 'fifty', name: 'Fifty Still', desc: 'Complete 50 sessions', check: () => stats.count >= 50 },
    { id: 'hundred', name: 'Century of Stillness', desc: 'Complete 100 sessions', check: () => stats.count >= 100 },
    { id: 'm100', name: 'Breathing Room', desc: 'Reach 100 total minutes', check: () => stats.total >= 100 },
    { id: 'm500', name: 'Deep Practice', desc: 'Reach 500 total minutes', check: () => stats.total >= 500 },
    { id: 'm1000', name: 'Stillness Master', desc: 'Reach 1000 total minutes', check: () => stats.total >= 1000 },
    { id: 's7', name: 'Week of Calm', desc: '7-day streak', check: () => best >= 7 },
    { id: 's14', name: 'Fortnight Flow', desc: '14-day streak', check: () => best >= 14 },
    { id: 's30', name: 'Zen Master', desc: '30-day streak', check: () => best >= 30 },
    { id: 'long', name: 'Deep Dive', desc: 'A single session of 45+ minutes', check: () => stats.longest >= 45 },
    { id: 'w7', name: 'Week Warrior', desc: '7 sessions in one week', check: () => maxSessionsInWeek(sessions) >= 7 },
    { id: 'dawn', name: 'Early Riser', desc: 'A session before 8 AM', check: () => sessions.some(s => s.completed && s.duration > 0 && new Date(s.timestamp).getHours() < 8) }
  ]
  return listAll.map(m => ({ ...m, earned: m.check() }))
}

export function weeklyNote(sessions) {
  const week = dailySeries(sessions, 7)
  const sessionsWeek = week.reduce((sum, d) => sum + d.sessions, 0)
  const minsWeek = week.reduce((sum, d) => sum + d.minutes, 0)
  const trainDays = week.filter(d => d.minutes > 0).length
  const avgSession = sessionsWeek ? minsWeek / sessionsWeek : 0
  return { sessionsWeek, minsWeek, trainDays, avgSession }
}

export function longestStreakRange(sessions) {
  const days = {}
  completed(sessions).forEach(s => { days[localDayStart(s.timestamp)] = true })
  const keys = Object.keys(days).sort((a, b) => a - b).map(Number)
  let best = 0
  let bestStart = null
  let bestEnd = null
  let run = 0
  let runStart = null
  let prev = null
  keys.forEach(k => {
    if (prev !== null && k - prev === DAY) {
      run++
    } else {
      run = 1
      runStart = k
    }
    if (run > best) {
      best = run
      bestStart = runStart
      bestEnd = k
    }
    prev = k
  })
  return { length: best, start: bestStart, end: bestEnd }
}

export function totalWeeks(cs) {
  return cs
}

export { MIN, HOUR, DAY }
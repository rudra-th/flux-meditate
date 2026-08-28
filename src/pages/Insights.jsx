import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, AreaChart, Area, PieChart, Pie, ReferenceLine
} from 'recharts'
import { weekData, formatMinutes } from '../lib/date'
import {
  overview, goalProgress, dailySeries, weeklyTrend, monthCompare, timeOfDay,
  dayOfWeekAvg, durationDistribution, consistency30, milestones, weeklyNote,
  peakHour, longestStreakRange, trend7, goalHitRate, records
} from '../lib/analytics'
import EmptyState from '../components/EmptyState'
import ProgressRing from '../components/ProgressRing'
import { FlameIcon, ChartIcon, ActivityIcon, TrophyIcon, SparklesIcon, ClockIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon, TargetIcon } from '../components/Icons'

const ACCENT = '#E9A84E'
const GREEN = '#7EBEA5'
const MUTED = '#5C5F73'
const GRID = 'rgba(255,255,255,0.05)'

function ChartTip({ active, payload, label, suffix = '' }) {
  if (!active || !payload || !payload.length) return null
  return (
    <Box className="chart-tip">
      {label != null && <Box className="chart-tip-label">{label}</Box>}
      {payload.map(p => (
        <Box key={p.dataKey || p.name} className="chart-tip-row">
          <span style={{ color: p.color || p.payload?.fill || ACCENT }}>{p.name || 'value'}</span>
          <b>{p.value}{suffix}</b>
        </Box>
      ))}
    </Box>
  )
}

function Delta({ delta }) {
  if (!delta || Math.abs(delta.pct) < 0.5) {
    return <span className="delta delta-flat">– 0%</span>
  }
  return (
    <span className={`delta ${delta.up ? 'delta-up' : 'delta-down'}`}>
      {delta.up ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
      {Math.abs(delta.pct)}%
    </span>
  )
}

function StatCard({ value, label, color, icon, chip }) {
  return (
    <Box className="stat-card">
      <Box className="stat-card-top">
        <Typography className={`stat-value ${color}`}>{value}</Typography>
        {icon && <Box className="stat-card-icon">{icon}</Box>}
      </Box>
      <Typography className="stat-label">{label}</Typography>
      {chip && <Box className="stat-chip">{chip}</Box>}
    </Box>
  )
}

export default function Insights({ sessions, settings }) {
  const stats = useMemo(() => overview(sessions), [sessions])
  const goal = useMemo(() => goalProgress(sessions, settings.goalMinutes), [sessions, settings.goalMinutes])
  const week = useMemo(() => weekData(sessions), [sessions])
  const days = useMemo(() => dailySeries(sessions, 28), [sessions])
  const weeks = useMemo(() => weeklyTrend(sessions, 12), [sessions])
  const month = useMemo(() => monthCompare(sessions), [sessions])
  const tod = useMemo(() => timeOfDay(sessions), [sessions])
  const dow = useMemo(() => dayOfWeekAvg(sessions), [sessions])
  const dist = useMemo(() => durationDistribution(sessions), [sessions])
  const consistency = useMemo(() => consistency30(sessions), [sessions])
  const badgeList = useMemo(() => milestones(sessions), [sessions])
  const note = useMemo(() => weeklyNote(sessions), [sessions])
  const peak = useMemo(() => peakHour(sessions), [sessions])
  const bestRange = useMemo(() => longestStreakRange(sessions), [sessions])
  const t7 = useMemo(() => trend7(sessions), [sessions])
  const goalHit = useMemo(() => goalHitRate(sessions, settings.goalMinutes), [sessions, settings.goalMinutes])
  const rec = useMemo(() => records(sessions), [sessions])

  if (sessions.length === 0) {
    return (
      <Box className="page">
        <Typography className="page-title">Insights</Typography>
        <EmptyState
          icon={<SparklesIcon size={34} />}
          title="Your story begins here"
          hint="Complete your first meditation and your personal insights will unfold — trends, streaks, and quiet milestones."
        />
      </Box>
    )
  }

  const weekMax = Math.max(...week.map(d => d.minutes), 1)
  const activeMilestones = badgeList.filter(m => m.earned).length

  return (
    <Box className="page">
      <Typography className="page-title">Insights</Typography>

      {note.sessionsWeek > 0 && (
        <Box className="callout">
          <SparklesIcon size={20} />
          <Typography className="callout-text">
            {note.sessionsWeek === 1
              ? 'You sat once this week — a beautiful beginning.'
              : <>You meditated <b>{note.sessionsWeek} times</b> this week ({formatMinutes(note.minsWeek)} total). Keep the rhythm.</>}
          </Typography>
        </Box>
      )}

      <Box className="stat-grid">
        <StatCard
          value={Math.round(stats.todayMins)}
          label="Today"
          color="accent"
          icon={<ClockIcon size={18} />}
          chip={
            stats.todayMins >= settings.goalMinutes
              ? <span className="delta delta-up"><CheckIcon size={12} />goal met</span>
              : <span className="delta delta-flat">{Math.round(goal.goal - stats.todayMins)}m to goal</span>
          }
        />
        <StatCard
          value={stats.streak}
          label="Streak · days"
          color="green"
          icon={<FlameIcon size={18} />}
          chip={<span className="delta delta-flat">best {stats.bestStreak}</span>}
        />
        <StatCard
          value={formatMinutes(stats.total)}
          label="Total"
          color="accent"
          icon={<ChartIcon size={18} />}
          chip={(
            <Box className="stat-chip-row">
              <Delta delta={t7.delta} />
              <span className="stat-chip-caption">7d vs prev 7d</span>
            </Box>
          )}
        />
        <StatCard
          value={stats.count}
          label="Sessions"
          color="green"
          icon={<ActivityIcon size={18} />}
          chip={(
            <Box className="stat-chip-row">
              <Delta delta={t7.deltaSessions} />
              <span className="stat-chip-caption">7d vs prev 7d</span>
            </Box>
          )}
        />
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Daily Goal</Typography>
            <Typography className="chart-sub">Yesterday's pace finished here</Typography>
          </Box>
          <Box className="goal-ring-wrap">
            <ProgressRing progress={goal.ratio} size={72} stroke={7} color={GREEN}>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', color: GREEN, fontSize: '0.78rem' }}>
                {Math.min(100, Math.round(goal.capped * 100))}%
              </Typography>
            </ProgressRing>
          </Box>
        </Box>
        <Box className="goal-bar-box">
          <Box className="goal-track">
            <Box className="goal-fill" style={{ width: `${goal.capped * 100}%` }} />
          </Box>
          <Box className="goal-legend">
            <Typography className="goal-legend-text">{Math.round(goal.achieved)} min of {goal.goal} min</Typography>
            <Typography className="goal-legend-text muted">
              {goal.achieved >= goal.goal ? 'Goal reached — beautifully still' : `${goal.goal - Math.round(goal.achieved)} min to go`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">This Week</Typography>
            <Typography className="chart-sub">Minutes per day · dashed line marks your daily goal</Typography>
          </Box>
          <span className="delta delta-flat" style={{ whiteSpace: 'nowrap' }}>goal {settings.goalMinutes}m</span>
        </Box>
        <Box style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11, fontFamily: 'Raleway' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} unit="m" />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTip suffix=" min" />} />
              <ReferenceLine y={settings.goalMinutes} stroke={GREEN} strokeDasharray="5 4" strokeOpacity={0.7} />
              <Bar dataKey="minutes" name="Minutes" radius={[6, 6, 0, 0]} maxBarSize={26}>
                {week.map((d, i) => (
                  <Cell key={i} fill={d.minutes > 0 ? (d.isToday ? GREEN : ACCENT) : 'rgba(255,255,255,0.05)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Weekly Rhythm</Typography>
            <Typography className="chart-sub">Total minutes across the last 12 weeks</Typography>
          </Box>
          <TargetIcon size={22} className="muted-icon" />
        </Box>
        <Box style={{ height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} interval={1} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 9 }} unit="m" />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTip suffix=" min / week" />} />
              <Bar dataKey="minutes" name="Week total" radius={[6, 6, 0, 0]} maxBarSize={30}>
                {weeks.map((d, i) => {
                  const isLast = i === weeks.length - 1
                  return <Cell key={i} fill={d.minutes > 0 ? (isLast ? GREEN : ACCENT) : 'rgba(255,255,255,0.05)'} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Last 28 Days</Typography>
            <Typography className="chart-sub">Minutes per day · dashed line marks your daily goal</Typography>
          </Box>
        </Box>
        <Box style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.38} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} interval={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} unit="m" />
              <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.15)' }} content={<ChartTip suffix=" min" />} />
              <ReferenceLine y={settings.goalMinutes} stroke={GREEN} strokeDasharray="5 4" strokeOpacity={0.7} />
              <Area type="monotone" dataKey="minutes" name="Minutes" stroke={ACCENT} strokeWidth={2}
                fill="url(#areaGrad)" activeDot={{ r: 4, fill: ACCENT, stroke: '#1A1A2E', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Goal Consistency</Typography>
            <Typography className="chart-sub">Days you reached {settings.goalMinutes} min · last 30 days</Typography>
          </Box>
          <TargetIcon size={22} className="muted-icon" />
        </Box>
        <Box className="goal-bar-box">
          <Box className="goal-track">
            <Box className="goal-fill" style={{ width: `${Math.round(goalHit.ratio * 100)}%` }} />
          </Box>
          <Box className="goal-legend">
            <Typography className="goal-legend-text">met goal on {goalHit.hitDays} of {goalHit.activeDays} active days · {goalHit.hitRate}%</Typography>
            <Typography className="goal-legend-text muted">
              {goalHit.hitRate >= 80
                ? 'Remarkably consistent — your practice is a habit now'
                : goalHit.hitRate >= 40
                  ? 'A steady rhythm taking root'
                  : 'Every active day counts — even the short sits'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Month Momentum</Typography>
            <Typography className="chart-sub">{new Date().toLocaleDateString([], { month: 'long' })} vs last month</Typography>
          </Box>
        </Box>
        <Box className="month-grid">
          <Box className="month-block">
            <Typography className="stat-value accent">{month.current.minutes}</Typography>
            <Typography className="stat-label">min this month</Typography>
            <Delta delta={month.deltaMinutes} />
          </Box>
          <Box className="month-block">
            <Typography className="stat-value green">{month.current.sessions}</Typography>
            <Typography className="stat-label">sessions</Typography>
            <Delta delta={month.deltaSessions} />
          </Box>
          <Box className="month-block">
            <Typography className="stat-value">{month.pace}</Typography>
            <Typography className="stat-label">min / day pace</Typography>
            <span className="delta delta-flat">on track</span>
          </Box>
          <Box className="month-block">
            <Typography className="stat-value">{month.projected}</Typography>
            <Typography className="stat-label">projected total</Typography>
            <span className="delta delta-flat">full month</span>
          </Box>
        </Box>
      </Box>

      <Box className="chart-card">
        <Typography className="chart-title">When You Meditate</Typography>
        <Typography className="chart-sub">Where your minutes land across the day</Typography>
        <Box style={{ height: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tod} dataKey="minutes" nameKey="name" innerRadius={52} outerRadius={76}
                paddingAngle={3} cornerRadius={5} stroke="none">
                {tod.map((d, i) => (
                  <Cell key={i} fill={[ACCENT, GREEN, '#B39DDB', '#5C5F73'][i % 4]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTip suffix=" min" />} />
            </PieChart>
          </ResponsiveContainer>
          <Box className="donut-center">
            <Typography className="donut-value">{Math.round(stats.total)}</Typography>
            <Typography className="donut-label">total min</Typography>
          </Box>
        </Box>
        <Box className="legend-row">
          {tod.map((t, i) => (
            <Box key={t.name} className="legend-item">
              <span className="legend-dot" style={{ background: [ACCENT, GREEN, '#B39DDB', '#5C5F73'][i] }} />
              <span>{t.name}</span>
              <b>{t.pct}%</b>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className="chart-card">
        <Typography className="chart-title">By Day of Week</Typography>
        <Typography className="chart-sub">Average minutes per meditation, by weekday</Typography>
        <Box style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dow} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} unit="m" />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTip suffix=" min avg" />} />
              <Bar dataKey="avg" name="Avg minutes" fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {dist.some(d => d.count > 0) && (
        <Box className="chart-card">
          <Typography className="chart-title">Session Lengths</Typography>
          <Typography className="chart-sub">How long your sitting times tend to be</Typography>
          <Box style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} />
                <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11 }} width={54} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTip suffix=" sessions" />} />
                <Bar dataKey="count" name="Sessions" fill={ACCENT} radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {dist.map((d, i) => <Cell key={i} fill={d.count > 0 ? (i % 2 ? GREEN : ACCENT) : 'rgba(255,255,255,0.05)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Stillness Stats</Typography>
            <Typography className="chart-sub">The deeper numbers behind your practice</Typography>
          </Box>
        </Box>
        <Box className="list-card">
          {[
            ['Average session', `${formatMinutes(stats.avg)}`],
            ['Longest session', formatMinutes(stats.longest)],
            ['Best streak', bestRange.length > 0 ? `${bestRange.length} days` : '—'],
            ['Consistency · last 30 days', `${consistency}%`],
            ['Peak meditation hour', peak ? peak.label : '—'],
            ['Longest streak span', bestRange.start ? `${new Date(bestRange.start).toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${new Date(bestRange.end).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : '—'],
            ['Best day', rec.bestDay ? `${rec.bestDay.minutes} min · ${rec.bestDay.label}` : '—'],
            ['Longest single sit', rec.bestSession ? `${rec.bestSession.minutes} min · ${rec.bestSession.label}` : '—']
          ].map(([label, value]) => (
            <Box key={label} className="list-row">
              <Typography className="list-row-label">{label}</Typography>
              <Typography className="list-row-value">{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className="chart-card">
        <Box className="chart-card-header">
          <Box>
            <Typography className="chart-title">Milestones</Typography>
            <Typography className="chart-sub">{activeMilestones} of {badgeList.length} discovered</Typography>
          </Box>
          <TrophyIcon size={22} className="muted-icon" />
        </Box>
        <Box className="milestone-grid">
          {badgeList.map(m => (
            <Box key={m.id} className={`milestone${m.earned ? ' earned' : ''}`} title={m.desc}>
              <Box className="milestone-icon">
                {m.earned ? <ActivityIcon size={22} /> : <span className="milestone-lock">?</span>}
              </Box>
              <Typography className="milestone-name">{m.name}</Typography>
              <Typography className="milestone-desc">{m.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
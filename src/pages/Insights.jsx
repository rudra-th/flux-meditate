import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { todayMinutes, streak, weekData, allTimeStats } from '../lib/date'

export default function Insights({ sessions }) {
  const todayMins = todayMinutes(sessions)
  const currentStreak = streak(sessions)
  const week = weekData(sessions)
  const stats = allTimeStats(sessions)
  const maxWeek = Math.max(...week.map(d => d.minutes), 1)

  const statCards = [
    { value: Math.round(todayMins), label: 'Today', color: 'accent' },
    { value: currentStreak, label: 'Streak', color: 'green' },
    { value: Math.round(stats.total), label: 'Total Min', color: 'accent' },
    { value: stats.count, label: 'Sessions', color: 'green' }
  ]

  return (
    <Box className="page">
      <Typography className="page-title">Insights</Typography>

      {/* Stats */}
      <Box className="stat-grid">
        {statCards.map((s, i) => (
          <Box key={i} className="stat-card">
            <Typography className={`stat-value ${s.color}`}>{s.value}</Typography>
            <Typography className="stat-label">{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Week Chart */}
      <Box className="chart-card">
        <Typography className="chart-title">This Week</Typography>
        <Box className="bar-chart">
          {week.map((day, i) => (
            <Box key={i} className="bar-col">
              <Box className="bar-wrap">
                <Box className={`bar ${day.minutes > 0 ? 'filled' : 'empty'}`}
                  style={{ height: `${day.minutes > 0 ? (day.minutes / maxWeek) * 100 : 100}%` }}
                />
              </Box>
              <Typography className="bar-label">{day.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* All Time */}
      <Box className="chart-card">
        <Typography className="chart-title">All Time</Typography>
        <Box className="list-card">
          {[
            ['Average Session', `${Math.round(stats.avg)} min`],
            ['Longest Session', `${Math.round(stats.longest)} min`],
            ['Total Sessions', stats.count],
            ['Total Minutes', Math.round(stats.total)]
          ].map(([label, value]) => (
            <Box key={label} className="list-row">
              <Typography className="list-row-label">{label}</Typography>
              <Typography className="list-row-value">{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
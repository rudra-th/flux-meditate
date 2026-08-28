import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatDate, formatDuration } from '../lib/date'

export default function History({ sessions }) {
  if (sessions.length === 0) {
    return (
      <Box className="page">
        <Box className="empty-state">
          <Typography className="empty-state-title">No sessions yet</Typography>
          <Typography className="empty-state-hint">Complete a meditation to see it here</Typography>
        </Box>
      </Box>
    )
  }

  const grouped = sessions.reduce((acc, s) => {
    const date = new Date(s.timestamp).toLocaleDateString([], {
      weekday: 'long', month: 'short', day: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(s)
    return acc
  }, {})

  return (
    <Box className="page">
      <Typography className="page-title">History</Typography>
      {Object.entries(grouped).map(([date, items]) => (
        <Box key={date} className="history-group">
          <Typography className="history-date">{date}</Typography>
          <Box className="history-card">
            {items.map((s, i) => (
              <Box key={i} className="history-item">
                <Box className="history-item-left">
                  <Box className="history-dot" />
                  <Typography className="history-item-time">{formatDate(s.timestamp)}</Typography>
                </Box>
                <Typography className="history-item-duration">{formatDuration(s.duration)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
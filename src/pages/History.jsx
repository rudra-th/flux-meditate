import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatDate, formatDuration, formatMinutes, localDayStart } from '../lib/date'
import { removeSession, downloadBackup } from '../lib/storage'
import EmptyState from '../components/EmptyState'
import SegmentedControl from '../components/SegmentedControl'
import { ListIcon, TrashIcon, DownloadIcon, CalendarIcon, ClockIcon } from '../components/Icons'

export default function History({ sessions, onSession, onData }) {
  const [filter, setFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)

  const filtered = useMemo(() => {
    const now = Date.now()
    const monthStart = new Date().setDate(1)
    if (filter === 'week') {
      const weekStart = localDayStart(now) - (new Date(now).getDay()) * 86400000
      return sessions.filter(s => s.timestamp >= weekStart)
    }
    if (filter === 'month') {
      return sessions.filter(s => s.timestamp >= monthStart)
    }
    return sessions
  }, [sessions, filter])

  const totalMin = useMemo(() => filtered.reduce((sum, s) => sum + s.duration, 0) / 60, [filtered])

  if (sessions.length === 0) {
    return (
      <Box className="page">
        <Typography className="page-title">History</Typography>
        <EmptyState
          icon={<ListIcon size={34} />}
          title="Nothing recorded yet"
          hint="Every completed meditation will be quietly kept here — your personal archive of calm."
        />
      </Box>
    )
  }

  const grouped = filtered.reduce((acc, s) => {
    const date = new Date(s.timestamp).toLocaleDateString([], {
      weekday: 'long', month: 'short', day: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(s)
    return acc
  }, {})

  const handleDelete = (timestamp) => {
    onData(removeSession(timestamp))
    onSession()
    setConfirmId(null)
  }

  return (
    <Box className="page">
      <Typography className="page-title">History</Typography>

      <Box className="history-toolbar">
        <SegmentedControl
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' }
          ]}
        />
        <button className="btn-icon-sm" onClick={downloadBackup} title="Export backup" aria-label="Export backup">
          <DownloadIcon size={18} />
        </button>
      </Box>

      <Box className="history-summary">
        <Box className="history-summary-item">
          <ClockIcon size={16} />
          <Typography className="history-summary-label">Total</Typography>
          <Typography className="history-summary-value">{formatMinutes(totalMin)}</Typography>
        </Box>
        <Box className="history-summary-item">
          <CalendarIcon size={16} />
          <Typography className="history-summary-label">Sessions</Typography>
          <Typography className="history-summary-value">{filtered.length}</Typography>
        </Box>
        <Box className="history-summary-item">
          <ListIcon size={16} />
          <Typography className="history-summary-label">Days</Typography>
          <Typography className="history-summary-value">{Object.keys(grouped).length}</Typography>
        </Box>
      </Box>

      {Object.entries(grouped).map(([date, items]) => (
        <Box key={date} className="history-group">
          <Typography className="history-date">
            {date}
            <span className="history-date-total">{formatMinutes(items.reduce((s, x) => s + x.duration, 0) / 60)}</span>
          </Typography>
          <Box className="history-card">
            {items.map((s, i) => (
              <Box key={s.timestamp} className="history-item">
                <Box className="history-item-left">
                  <Box className="history-dot" />
                  <Box>
                    <Typography className="history-item-time">{formatDate(s.timestamp)}</Typography>
                    <Typography className="history-item-sub">
                      {new Date(s.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                <Box className="history-item-right">
                  <Typography className="history-item-duration">{formatDuration(s.duration)}</Typography>
                  {confirmId === s.timestamp ? (
                    <Box className="history-confirm">
                      <button className="history-confirm-yes" onClick={() => handleDelete(s.timestamp)}>Delete</button>
                      <button className="history-confirm-no" onClick={() => setConfirmId(null)}>Keep</button>
                    </Box>
                  ) : (
                    <button
                      className="btn-icon-xs"
                      onClick={() => setConfirmId(s.timestamp)}
                      aria-label="Delete session"
                    >
                      <TrashIcon size={15} />
                    </button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
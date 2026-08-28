import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { playBell, resumeCtx } from '../lib/audio'
import { addSession } from '../lib/storage'
import { formatDuration } from '../lib/date'
import Ring from '../components/Ring'

export default function Timer({ settings, onSession }) {
  const [duration, setDuration] = useState(settings.defaultDuration)
  const [remaining, setRemaining] = useState(settings.defaultDuration)
  const [running, setRunning] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [completed, setCompleted] = useState(false)

  const endTimeRef = useRef(null)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const pausedRemainingRef = useRef(null)

  // Wake Lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {}
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }

  // Tick — calculates remaining from wall clock, not from counter
  const tick = () => {
    if (!endTimeRef.current) return
    const now = Date.now()
    const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
    setRemaining(left)
    if (left <= 0) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Start the interval + wake lock
  const startInterval = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 250)
    requestWakeLock()
  }

  const stopInterval = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    releaseWakeLock()
  }

  // Recalculate when page becomes visible again (handles throttle/pause)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && running) {
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  // Sync default duration when not running
  useEffect(() => {
    if (!running) {
      setDuration(settings.defaultDuration)
      setRemaining(settings.defaultDuration)
      endTimeRef.current = null
      pausedRemainingRef.current = null
    }
  }, [settings.defaultDuration])

  // Completion
  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false)
      setCompleted(true)
      stopInterval()
      if (settings.soundEnabled) playBell()
      addSession(duration)
      onSession()
    }
  }, [remaining, running])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopInterval()
  }, [])

  const handleStart = () => {
    resumeCtx()
    setCompleted(false)
    endTimeRef.current = Date.now() + duration * 1000
    pausedRemainingRef.current = null
    setRunning(true)
    startInterval()
  }

  const handlePause = () => {
    pausedRemainingRef.current = remaining
    setRunning(false)
    stopInterval()
  }

  const handleResume = () => {
    resumeCtx()
    const left = pausedRemainingRef.current ?? remaining
    endTimeRef.current = Date.now() + left * 1000
    pausedRemainingRef.current = null
    setRunning(true)
    startInterval()
  }

  const handleStop = () => {
    stopInterval()
    setRunning(false)
    setRemaining(duration)
    setCompleted(false)
    endTimeRef.current = null
    pausedRemainingRef.current = null
  }

  const handlePreset = (mins) => {
    if (running) return
    const secs = mins * 60
    setDuration(secs)
    setRemaining(secs)
    setCustomMinutes('')
    setCompleted(false)
  }

  const handleCustomSet = () => {
    if (running) return
    const mins = parseInt(customMinutes, 10)
    if (isNaN(mins) || mins < 1 || mins > 240) return
    const secs = mins * 60
    setDuration(secs)
    setRemaining(secs)
    setCompleted(false)
  }

  const progress = duration > 0 ? 1 - remaining / duration : 0
  const isActive = running || remaining < duration

  return (
    <Box className="timer-page">
      {/* Ring */}
      <Box className="timer-ring-container">
        <Box className="timer-ring-bg" />
        <Ring progress={progress} size={260} stroke={3} />
        <Box className="timer-display">
          {completed ? (
            <Box className="timer-complete">
              <Box className="timer-complete-icon">✓</Box>
              <Typography className="timer-complete-label">Complete</Typography>
            </Box>
          ) : (
            <Typography className="timer-time">{formatDuration(remaining)}</Typography>
          )}
        </Box>
      </Box>

      {/* Controls */}
      <Box className="timer-controls">
        {!isActive && !completed && (
          <button className="btn-primary" onClick={handleStart}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19" /></svg>
          </button>
        )}
        {running && (
          <>
            <button className="btn-secondary" onClick={handlePause}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            </button>
            <button className="btn-icon-sm" onClick={handleStop}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
          </>
        )}
        {!running && remaining < duration && !completed && (
          <>
            <button className="btn-primary" onClick={handleResume}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19" /></svg>
            </button>
            <button className="btn-icon-sm" onClick={handleStop}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
          </>
        )}
      </Box>

      {/* Presets */}
      {!isActive && !completed && (
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Typography className="section-label" sx={{ textAlign: 'center', mb: 1.5 }}>Duration</Typography>
          <Box className="chip-group" sx={{ mb: 3 }}>
            {settings.durationPresets.map(m => (
              <button
                key={m}
                className={`chip${duration === m * 60 ? ' active' : ''}`}
                onClick={() => handlePreset(m)}
              >
                {m}m
              </button>
            ))}
          </Box>

          <Box className="custom-input-row">
            <input
              type="number"
              className="custom-input-field"
              min="1"
              max="240"
              value={customMinutes}
              onChange={e => setCustomMinutes(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSet()}
              placeholder="min"
            />
            <button
              className="custom-input-btn"
              onClick={handleCustomSet}
              disabled={!customMinutes || parseInt(customMinutes) < 1}
            >
              Set
            </button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
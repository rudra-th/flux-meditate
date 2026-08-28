import { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { playBell, playChime, resumeCtx } from '../lib/audio'
import { addSession } from '../lib/storage'
import { formatDuration, streak } from '../lib/date'
import { goalProgress } from '../lib/analytics'
import { BREATH_MODES, patternString, cycleLength } from '../lib/breathing'
import Ring from '../components/Ring'
import ProgressRing from '../components/ProgressRing'
import SegmentedControl from '../components/SegmentedControl'
import { PlayIcon, PauseIcon, StopIcon, TargetIcon, FlameIcon, WindIcon, CheckIcon, SparklesIcon } from '../components/Icons'

export default function Timer({ sessions, settings, onSession }) {
  const [mode, setMode] = useState('meditate')

  return (
    <Box sx={{ p: 0 }}>
      <Box className="timer-mode-bar">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'meditate', label: 'Meditate' },
            { value: 'breathe', label: 'Breathe' }
          ]}
        />
      </Box>
      {mode === 'meditate'
        ? <MeditationTimer sessions={sessions} settings={settings} onSession={onSession} />
        : <BreathTimer settings={settings} sessions={sessions} onSession={onSession} />}
    </Box>
  )
}

function MeditationTimer({ sessions, settings, onSession }) {
  const [duration, setDuration] = useState(settings.defaultDuration)
  const [remaining, setRemaining] = useState(settings.defaultDuration)
  const [running, setRunning] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [completed, setCompleted] = useState(false)

  const endTimeRef = useRef(null)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const pausedRemainingRef = useRef(null)
  const lastBellRef = useRef(-1)

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {}
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {})
      wakeLockRef.current = null
    }
  }

  const tick = useCallback(() => {
    if (!endTimeRef.current) return
    const now = Date.now()
    const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
    setRemaining(left)

    if (settings.intervalBell > 0 && left > 0) {
      const elapsed = duration - left
      const interval = settings.intervalBell * 60
      const mark = Math.floor(elapsed / interval)
      if (mark >= 1 && mark !== lastBellRef.current && left % interval === 0) {
        lastBellRef.current = mark
        playChime(0.18, 660)
      }
    }

    if (left <= 0) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [settings.intervalBell, duration])

  const startInterval = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 250)
    requestWakeLock()
  }

  const stopInterval = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    releaseWakeLock()
  }, [])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && running) tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running, tick])

  useEffect(() => {
    if (!running) {
      setDuration(settings.defaultDuration)
      setRemaining(settings.defaultDuration)
      endTimeRef.current = null
      pausedRemainingRef.current = null
    }
  }, [settings.defaultDuration])

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false)
      setCompleted(true)
      stopInterval()
      if (settings.soundEnabled) playBell()
      if (settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate([120, 60, 120])
      addSession(duration)
      onSession()
    }
  }, [remaining, running, settings, duration, stopInterval, onSession])

  useEffect(() => {
    return () => stopInterval()
  }, [stopInterval])

  const handleStart = () => {
    resumeCtx()
    setCompleted(false)
    endTimeRef.current = Date.now() + duration * 1000
    pausedRemainingRef.current = null
    lastBellRef.current = -1
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
    lastBellRef.current = -1
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
        e.preventDefault()
        if (!isActive && !completed) handleStart()
        else if (running) handlePause()
        else if (!running && remaining < duration && !completed) handleResume()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const goal = goalProgress(sessions, settings.goalMinutes)
  const todayStreak = streak(sessions)

  return (
    <Box className="timer-page">
      {todayStreak > 0 && (
        <Box className="timer-streak-chip">
          <FlameIcon size={16} />
          <span>{todayStreak}-day streak</span>
        </Box>
      )}

      <Box className="timer-ring-container">
        <Box className="timer-ring-bg" />
        <Ring progress={progress} size={260} stroke={3} />
        <Box className="timer-display">
          {completed ? (
            <Box className="timer-complete">
              <Box className="timer-complete-icon">
                <CheckIcon size={30} />
              </Box>
              <Typography className="timer-complete-label">Complete</Typography>
              <Typography className="timer-complete-sub">{formatDuration(duration)} of stillness</Typography>
              <button className="chip active" style={{ marginTop: 6 }} onClick={handleStart}>Again</button>
            </Box>
          ) : (
            <Typography className="timer-time">{formatDuration(remaining)}</Typography>
          )}
        </Box>
      </Box>

      <Box className="timer-controls">
        {!isActive && !completed && (
          <button className="btn-primary" onClick={handleStart} aria-label="Start meditation">
            <PlayIcon size={30} />
          </button>
        )}
        {running && (
          <>
            <button className="btn-secondary" onClick={handlePause} aria-label="Pause">
              <PauseIcon size={26} />
            </button>
            <button className="btn-icon-sm" onClick={handleStop} aria-label="Stop and reset">
              <StopIcon size={18} />
            </button>
          </>
        )}
        {!running && remaining < duration && !completed && (
          <>
            <button className="btn-primary" onClick={handleResume} aria-label="Resume meditation">
              <PlayIcon size={30} />
            </button>
            <button className="btn-icon-sm" onClick={handleStop} aria-label="Stop and reset">
              <StopIcon size={18} />
            </button>
          </>
        )}
      </Box>

      {!isActive && !completed && (
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Typography className="section-label" sx={{ textAlign: 'center', mb: 1.5 }}>Duration</Typography>
          <Box className="chip-group" sx={{ mb: 3 }}>
            {settings.durationPresets.map(m => (
              <button
                key={m}
                className={`chip${duration === m * 60 ? ' active' : ''}`}
                onClick={() => handlePreset(m)}
                aria-pressed={duration === m * 60}
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
              aria-label="Custom duration in minutes"
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

      <Box className="goal-card">
        <Box className="goal-card-left">
          <TargetIcon size={22} />
          <Box>
            <Typography className="goal-card-label">Daily goal</Typography>
            <Typography className="goal-card-value">
              {Math.round(goal.achieved)} / {goal.goal} min
            </Typography>
          </Box>
        </Box>
        <Box className="goal-track">
          <Box className="goal-fill" style={{ width: `${goal.capped * 100}%` }} />
        </Box>
        <ProgressRing progress={goal.ratio} size={44} stroke={5} color="#7EBEA5" glow={false}>
          <Typography sx={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: '#7EBEA5' }}>
            {Math.round(goal.ratio * 100)}%
          </Typography>
        </ProgressRing>
      </Box>
    </Box>
  )
}

function BreathTimer({ sessions, settings, onSession }) {
  const [modeId, setModeId] = useState('box')
  const mode = BREATH_MODES.find(m => m.id === modeId) || BREATH_MODES[0]
  const phases = mode.phases
  const cycle = cycleLength(mode)
  const [phase, setPhase] = useState({ idx: 0, progress: 0, phase: phases[0] })
  const [active, setActive] = useState(false)
  const [done, setDone] = useState(false)
  const breathStartRef = useRef(null)
  const rafRef = useRef(null)
  const prevIdxRef = useRef(0)

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  const stop = useCallback(() => {
    cleanup()
    setActive(false)
  }, [])

  useEffect(() => {
    return () => cleanup()
  }, [])

  const start = () => {
    resumeCtx()
    setDone(false)
    breathStartRef.current = Date.now()
    prevIdxRef.current = 0
    setActive(true)
  }

  const selectMode = (id) => {
    if (id === modeId) return
    cleanup()
    const next = BREATH_MODES.find(m => m.id === id)
    setActive(false)
    setDone(false)
    setModeId(id)
    setPhase({ idx: 0, progress: 0, phase: next.phases[0] })
  }

  useEffect(() => {
    if (!active) return
    const startedAt = breathStartRef.current
    const reps = mode.rounds
    const totalSecs = cycle * reps
    const localPhases = mode.phases

    const loop = () => {
      const elapsed = (Date.now() - startedAt) / 1000
      if (elapsed >= totalSecs) {
        stop()
        setDone(true)
        if (settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate([120, 60, 120])
        const secs = Math.round(totalSecs)
        addSession(secs)
        onSession()
        return
      }
      const cyclePos = elapsed % cycle
      let idx = 0
      let acc = 0
      for (let i = 0; i < localPhases.length; i++) {
        acc += localPhases[i].secs
        if (cyclePos < acc) { idx = i; break }
        idx = i
      }
      const phaseStart = acc - localPhases[idx].secs
      const progress = Math.min(1, (cyclePos - phaseStart) / localPhases[idx].secs)
      setPhase({ idx, progress, phase: localPhases[idx] })

      if (idx !== prevIdxRef.current) {
        prevIdxRef.current = idx
        if (localPhases[idx].key === 'inhale') {
          if (settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate(18)
        } else if (localPhases[idx].key === 'exhale') {
          if (settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate(10)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cleanup()
  }, [active, settings.hapticsEnabled, stop, onSession, modeId, cycle])

  const p = phases[phase.idx]
  let scale = 0.55
  if (p && p.key === 'inhale') scale = 0.55 + phase.progress * 0.45
  else if (p && p.key === 'exhale') scale = 1 - phase.progress * 0.45
  else if (p && p.key === 'hold') scale = phase.idx > 0 && phases[phase.idx - 1].key === 'inhale' ? 1 : 0.55

  const bodyText = active && p ? p.text : 'Ready'
  const bodySub = active && p ? p.note : 'Choose a technique when ready'

  return (
    <Box className="timer-page">
      <Box className="timer-streak-chip breathe-chip">
        <WindIcon size={16} />
        <span>{mode.name} breathing · {patternString(mode)} cycle · {mode.rounds} rounds</span>
      </Box>

      <Typography className="section-label" sx={{ textAlign: 'center', mb: 1 }}>Technique</Typography>
      <Box className="mode-picker">
        {BREATH_MODES.map(m => (
          <button
            key={m.id}
            className={`mode-chip${m.id === modeId ? ' active' : ''}`}
            onClick={() => selectMode(m.id)}
            disabled={active}
            aria-pressed={m.id === modeId}
          >
            <span className="mode-chip-name">{m.name}</span>
            <span className="mode-chip-tag">{m.tag}</span>
          </button>
        ))}
      </Box>

      <Box className="timer-ring-container">
        <Box className="timer-ring-bg" />
        <Ring progress={active || done ? 1 : 0} size={260} stroke={3} paused={false} />
        <Box className="timer-display">
          {done ? (
            <Box className="timer-complete">
              <Box className="timer-complete-icon green">
                <CheckIcon size={30} />
              </Box>
              <Typography className="timer-complete-label">Breathe complete</Typography>
              <Typography className="timer-complete-sub">{mode.name} · {mode.rounds} rounds, logged</Typography>
              <button className="chip active" style={{ marginTop: 6 }} onClick={start}>Again</button>
            </Box>
          ) : (
            <>
              <Box
                className="breathe-orb"
                style={{
                  transform: `scale(${active ? scale : 0.55})`,
                  opacity: active ? '1' : '0.35'
                }}
              />
              <Typography className="breathe-text">{bodyText}</Typography>
              {active && <Typography className="breathe-sub">{bodySub}</Typography>}
            </>
          )}
        </Box>
      </Box>

      <Box className="timer-controls">
        {!active && !done ? (
          <button className="btn-primary green" onClick={start} aria-label="Start breathing exercise">
            <PlayIcon size={30} />
          </button>
        ) : active ? (
          <button className="btn-secondary" onClick={stop} aria-label="Stop breathing exercise">
            <StopIcon size={22} />
          </button>
        ) : (
          <button className="btn-secondary" onClick={start} aria-label="Start breathing exercise again">
            <PlayIcon size={22} />
          </button>
        )}
      </Box>

      <Box className="breathe-road">
        {phases.map((bp, i) => (
          <Box key={i} className={`breathe-step${active && i === phase.idx ? ' current' : ''}`}>
            <span className="breathe-step-time">{bp.secs}s</span>
            <span className="breathe-step-name">{bp.key}</span>
          </Box>
        ))}
        <Box
          className="breathe-road-fill"
          style={{
            width: active ? `${((phase.idx) / phases.length) * 100 + phase.progress * (100 / phases.length)}%` : '0%'
          }}
        />
      </Box>

      {!active && !done && (
        <Box className="mode-note">
          <SparklesIcon size={14} />
          <span>{mode.note}</span>
        </Box>
      )}
    </Box>
  )
}
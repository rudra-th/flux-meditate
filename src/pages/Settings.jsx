import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import { updateSettings, resetData, importData, downloadBackup } from '../lib/storage'
import { TargetIcon, BellIcon, DownloadIcon, UploadIcon, TrashIcon } from '../components/Icons'

const GOAL_OPTIONS = [10, 15, 20, 30, 45, 60]
const BELL_OPTIONS = [5, 10, 15, 20, 30]

function Toggle({ on, onClick, label, icon, desc }) {
  return (
    <Box className="sound-toggle">
      <Box className="sound-toggle-left">
        <Box className="setting-icon">{icon}</Box>
        <Box>
          <Typography className="sound-toggle-label">{label}</Typography>
          {desc && <Typography className="setting-desc">{desc}</Typography>}
        </Box>
      </Box>
      <button className={`toggle-track${on ? ' on' : ''}`} onClick={onClick} role="switch" aria-checked={on} aria-label={label}>
        <Box className="toggle-thumb" />
      </button>
    </Box>
  )
}

export default function Settings({ settings, onChange }) {
  const [addOpen, setAddOpen] = useState(false)
  const [newPreset, setNewPreset] = useState('')
  const [customDefault, setCustomDefault] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const fileRef = useRef(null)
  const [importError, setImportError] = useState('')

  const handleAddPreset = () => {
    const mins = parseInt(newPreset, 10)
    if (isNaN(mins) || mins < 1 || mins > 240) return
    const updated = [...settings.durationPresets, mins].sort((a, b) => a - b)
    onChange(updateSettings({ durationPresets: updated }))
    setNewPreset('')
    setAddOpen(false)
  }

  const handleRemovePreset = (preset) => {
    const updated = settings.durationPresets.filter(p => p !== preset)
    if (updated.length === 0) return
    onChange(updateSettings({ durationPresets: updated }))
    if (settings.defaultDuration === preset * 60) {
      onChange(updateSettings({ defaultDuration: updated[0] * 60 }))
    }
  }

  const handleDefaultDuration = (mins) => {
    onChange(updateSettings({ defaultDuration: mins * 60 }))
    setCustomDefault('')
  }

  const handleCustomDefault = () => {
    const mins = parseInt(customDefault, 10)
    if (isNaN(mins) || mins < 1 || mins > 240) return
    onChange(updateSettings({ defaultDuration: mins * 60 }))
    setCustomDefault('')
  }

  const handleGoal = (mins) => {
    onChange(updateSettings({ goalMinutes: mins }))
    setCustomGoal('')
  }

  const handleCustomGoal = () => {
    const mins = parseInt(customGoal, 10)
    if (isNaN(mins) || mins < 1 || mins > 360) return
    onChange(updateSettings({ goalMinutes: mins }))
    setCustomGoal('')
  }

  const handleBell = (mins) => onChange(updateSettings({ intervalBell: mins }))

  const handleImport = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = importData(String(reader.result))
        onChange(data)
        setImportError('')
      } catch {
        setImportError('That file could not be read as a Still backup.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    setConfirmOpen(false)
    onChange(resetData())
  }

  return (
    <Box className="page">
      <Typography className="page-title">Settings</Typography>

      <Box className="settings-card">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography className="settings-card-title" sx={{ mb: 0 }}>Duration Presets</Typography>
          <button className="btn-icon-sm" onClick={() => setAddOpen(true)} style={{ width: 32, height: 32 }} aria-label="Add preset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </Box>
        <Box className="settings-chip-row">
          {settings.durationPresets.map(m => (
            <button key={m} className="preset-chip" onClick={() => handleRemovePreset(m)} aria-label={`Remove ${m} minute preset`}>
              {m}m
              <span className="delete-x">×</span>
            </button>
          ))}
        </Box>
      </Box>

      <Box className="settings-card">
        <Typography className="settings-card-title">Default Duration</Typography>
        <Box className="chip-group" sx={{ justifyContent: 'flex-start', mb: 2.5 }}>
          {settings.durationPresets.map(m => (
            <button
              key={m}
              className={`chip${settings.defaultDuration === m * 60 ? ' active' : ''}`}
              onClick={() => handleDefaultDuration(m)}
              aria-pressed={settings.defaultDuration === m * 60}
            >
              {m}m
            </button>
          ))}
        </Box>
        <Box className="custom-input-row" sx={{ justifyContent: 'flex-start' }}>
          <input
            type="number"
            className="custom-input-field"
            min="1"
            max="240"
            value={customDefault}
            onChange={e => setCustomDefault(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomDefault()}
            placeholder="min"
            aria-label="Custom default duration in minutes"
          />
          <button className="custom-input-btn" onClick={handleCustomDefault} disabled={!customDefault || parseInt(customDefault) < 1}>
            Set
          </button>
        </Box>
      </Box>

      <Box className="settings-card">
        <Box className="setting-head">
          <Box className="setting-icon"><TargetIcon size={20} /></Box>
          <Box>
            <Typography className="settings-card-title" sx={{ mb: 0 }}>Daily Goal</Typography>
            <Typography className="setting-desc">{settings.goalMinutes} minutes a day</Typography>
          </Box>
        </Box>
        <Box className="chip-group" sx={{ justifyContent: 'flex-start', mb: 2, mt: 2 }}>
          {GOAL_OPTIONS.map(m => (
            <button
              key={m}
              className={`chip${settings.goalMinutes === m ? ' active' : ''}`}
              onClick={() => handleGoal(m)}
              aria-pressed={settings.goalMinutes === m}
            >
              {m}m
            </button>
          ))}
        </Box>
        <Box className="custom-input-row" sx={{ justifyContent: 'flex-start' }}>
          <input
            type="number"
            className="custom-input-field"
            min="1"
            max="360"
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomGoal()}
            placeholder="min"
            aria-label="Custom daily goal in minutes"
          />
          <button className="custom-input-btn" onClick={handleCustomGoal} disabled={!customGoal || parseInt(customGoal) < 1}>
            Set
          </button>
        </Box>
      </Box>

      <Box className="settings-card">
        <Box className="setting-head">
          <Box className="setting-icon"><BellIcon size={20} /></Box>
          <Box>
            <Typography className="settings-card-title" sx={{ mb: 0 }}>Interval Bell</Typography>
            <Typography className="setting-desc">{settings.intervalBell > 0 ? `Chime every ${settings.intervalBell} minutes` : 'A gentle reminder mid-session'}</Typography>
          </Box>
        </Box>
        <Box className="chip-group" sx={{ justifyContent: 'flex-start', mt: 2 }}>
          <button className={`chip${settings.intervalBell === 0 ? ' active' : ''}`} onClick={() => handleBell(0)} aria-pressed={settings.intervalBell === 0}>
            Off
          </button>
          {BELL_OPTIONS.map(m => (
            <button key={m} className={`chip${settings.intervalBell === m ? ' active' : ''}`} onClick={() => handleBell(m)} aria-pressed={settings.intervalBell === m}>
              {m}m
            </button>
          ))}
        </Box>
      </Box>

      <Box className="settings-card">
        <Toggle
          on={settings.soundEnabled}
          onClick={() => onChange(updateSettings({ soundEnabled: !settings.soundEnabled }))}
          label="End-of-session bell"
          desc="A deep bell when a meditation completes"
          icon={settings.soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
        />
      </Box>

      <Box className="settings-card">
        <Toggle
          on={settings.hapticsEnabled}
          onClick={() => onChange(updateSettings({ hapticsEnabled: !settings.hapticsEnabled }))}
          label="Haptic feedback"
          desc="Gentle vibration on completion and breath phases"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 12c3-4 6-4 9 0s6 4 9 0" />
              <path d="M3 17c3-4 6-4 9 0s6 4 9 0" />
              <path d="M3 7c3-4 6-4 9 0s6 4 9 0" />
            </svg>
          }
        />
      </Box>

      <Box className="settings-card">
        <Typography className="settings-card-title">Your Data</Typography>
        <Box className="data-actions">
          <button className="danger-btn outline" onClick={downloadBackup}>
            <DownloadIcon size={18} />
            Export backup
          </button>
          <button className="danger-btn outline" onClick={() => fileRef.current && fileRef.current.click()}>
            <UploadIcon size={18} />
            Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImport} />
        </Box>
        {importError && <Typography className="import-error">{importError}</Typography>}
      </Box>

      <button className="danger-btn" onClick={() => setConfirmOpen(true)}>
        <TrashIcon size={18} />
        Reset All Data
      </button>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} PaperProps={{ sx: { bgcolor: '#21213A', borderRadius: '16px', border: 'none', minWidth: 300 } }}>
        <DialogTitle sx={{ fontFamily: '"Lora", serif', fontSize: '1.15rem', color: '#EDE8E2' }}>
          Add Duration Preset
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            type="number"
            value={newPreset}
            onChange={e => setNewPreset(e.target.value)}
            placeholder="Minutes"
            inputProps={{ min: 1, max: 240, style: { fontFamily: '"JetBrains Mono", monospace', color: '#EDE8E2' } }}
            onKeyDown={e => e.key === 'Enter' && handleAddPreset()}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                color: '#EDE8E2',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover fieldset': { borderColor: '#E9A84E' },
                '&.Mui-focused fieldset': { borderColor: '#E9A84E' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ color: '#8B8FA3', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddPreset}
            disabled={!newPreset || parseInt(newPreset) < 1}
            sx={{ textTransform: 'none', bgcolor: '#E9A84E', color: '#1A1A2E', '&:hover': { bgcolor: '#d4953c' } }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { bgcolor: '#21213A', borderRadius: '16px', border: 'none', minWidth: 300 } }}>
        <DialogTitle sx={{ fontFamily: '"Lora", serif', fontSize: '1.15rem', color: '#EDE8E2' }}>
          Reset All Data?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#8B8FA3', fontSize: '0.88rem' }}>
            This will permanently delete all your meditation sessions. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#8B8FA3', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReset}
            sx={{ textTransform: 'none', bgcolor: '#CF6679', color: '#1A1A2E', '&:hover': { bgcolor: '#b85a6b' } }}
          >
            Delete Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
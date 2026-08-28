import { useState } from 'react'
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
import { updateSettings, resetData } from '../lib/storage'

export default function Settings({ settings, onChange }) {
  const [addOpen, setAddOpen] = useState(false)
  const [newPreset, setNewPreset] = useState('')
  const [customDefault, setCustomDefault] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

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

  const handleReset = () => {
    setConfirmOpen(false)
    onChange(resetData())
  }

  return (
    <Box className="page">
      <Typography className="page-title">Settings</Typography>

      {/* Duration Presets */}
      <Box className="settings-card">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography className="settings-card-title" sx={{ mb: 0 }}>Duration Presets</Typography>
          <button className="btn-icon-sm" onClick={() => setAddOpen(true)} style={{ width: 32, height: 32 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </Box>
        <Box className="settings-chip-row">
          {settings.durationPresets.map(m => (
            <button key={m} className="preset-chip" onClick={() => handleRemovePreset(m)}>
              {m}m
              <span className="delete-x">×</span>
            </button>
          ))}
        </Box>
      </Box>

      {/* Default Duration */}
      <Box className="settings-card">
        <Typography className="settings-card-title">Default Duration</Typography>
        <Box className="chip-group" sx={{ justifyContent: 'flex-start', mb: 2.5 }}>
          {settings.durationPresets.map(m => (
            <button
              key={m}
              className={`chip${settings.defaultDuration === m * 60 ? ' active' : ''}`}
              onClick={() => handleDefaultDuration(m)}
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
          />
          <button
            className="custom-input-btn"
            onClick={handleCustomDefault}
            disabled={!customDefault || parseInt(customDefault) < 1}
          >
            Set
          </button>
        </Box>
      </Box>

      {/* Sound */}
      <Box className="settings-card">
        <Box className="sound-toggle">
          <Box className="sound-toggle-left">
            {settings.soundEnabled ? (
              <VolumeUpIcon sx={{ color: 'var(--text-secondary)', fontSize: 22 }} />
            ) : (
              <VolumeOffIcon sx={{ color: 'var(--text-secondary)', fontSize: 22 }} />
            )}
            <Typography className="sound-toggle-label">Bell Sound</Typography>
          </Box>
          <button
            className={`toggle-track${settings.soundEnabled ? ' on' : ''}`}
            onClick={() => onChange(updateSettings({ soundEnabled: !settings.soundEnabled }))}
          >
            <Box className="toggle-thumb" />
          </button>
        </Box>
      </Box>

      {/* Reset */}
      <button className="danger-btn" onClick={() => setConfirmOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        Reset All Data
      </button>

      {/* Add Preset Dialog */}
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

      {/* Confirm Reset Dialog */}
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
import Box from '@mui/material/Box'

export default function SegmentedControl({ options, value, onChange, size = 'md' }) {
  return (
    <Box
      className={`segmented${size === 'sm' ? ' segmented-sm' : ''}`}
      role="tablist"
      aria-label="Mode"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented-option${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <span className="segmented-icon">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </Box>
  )
}
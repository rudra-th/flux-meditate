import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function EmptyState({ icon, title, hint, children }) {
  return (
    <Box className="empty-state">
      {icon && <Box className="empty-state-icon">{icon}</Box>}
      <Typography className="empty-state-title">{title}</Typography>
      <Typography className="empty-state-hint">{hint}</Typography>
      {children}
    </Box>
  )
}
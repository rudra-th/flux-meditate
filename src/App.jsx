import { useState, useCallback } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import { load } from './lib/storage'
import TabBar from './components/TabBar'
import Timer from './pages/Timer'
import Insights from './pages/Insights'
import History from './pages/History'
import Settings from './pages/Settings'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#E9A84E' },
    secondary: { main: '#7EBEA5' },
    background: {
      default: '#1A1A2E',
      paper: '#1E1E32'
    },
    text: {
      primary: '#EDE8E2',
      secondary: '#8B8FA3'
    },
    error: { main: '#CF6679' },
    divider: 'transparent'
  },
  typography: {
    fontFamily: '"Raleway", -apple-system, sans-serif',
    h1: { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 },
    h2: { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 },
    h3: { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 },
    h4: { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 },
    h6: { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 },
    body1: { fontFamily: '"Raleway", sans-serif', fontWeight: 400, letterSpacing: '0.01em' },
    body2: { fontFamily: '"Raleway", sans-serif', fontWeight: 400, letterSpacing: '0.01em' },
    button: { fontFamily: '"Raleway", sans-serif', fontWeight: 600, letterSpacing: '0.02em' }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 12, cursor: 'pointer' }
      }
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { cursor: 'pointer' }
      }
    }
  }
})

export default function App() {
  const [data, setData] = useState(() => load())
  const [tab, setTab] = useState('timer')
  const refresh = useCallback(() => setData(load()), [])

  const pageProps = { sessions: data.sessions, settings: data.settings, onSession: refresh }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-shell">
        <Box className="app-content">
          {tab === 'timer' && <Timer {...pageProps} />}
          {tab === 'insights' && <Insights {...pageProps} />}
          {tab === 'history' && <History {...pageProps} />}
          {tab === 'settings' && <Settings settings={data.settings} onChange={setData} />}
        </Box>
        <TabBar current={tab} onChange={setTab} />
      </Box>
    </ThemeProvider>
  )
}
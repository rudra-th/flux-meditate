const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function TimerIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
      <path d="M12 2v2" />
    </svg>
  )
}

export function ChartIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="12" width="3" height="9" rx="1" />
      <rect x="10.5" y="8" width="3" height="13" rx="1" />
      <rect x="18" y="3" width="3" height="18" rx="1" />
    </svg>
  )
}

export function ListIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="3" cy="6" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="3" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

export function GearIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

export function PlayIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,5 19,12 8,19" />
    </svg>
  )
}

export function PauseIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

export function StopIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

export function CheckIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="2">
      <polyline points="4,12 10,18 20,6" />
    </svg>
  )
}

export function SunIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

export function MoonIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function TrashIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function TargetIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export function FlameIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 22c4.4 0 7-2.5 7-6.5 0-2.7-1.3-4.7-2.5-6-1-1.1-2-2.1-2-3.5 0-1 .4-1.8 1-2.5-3.5.4-6 3-6.5 5C7.8 10 7 11 7 12.5 7 15 9 22 12 22z" />
      <path d="M12 22c-1.5 0-3-1-3-3 0-1.3.8-2.3 1.5-3 .6-.6 1-1.3 1-2-.9.3-2.5 1.2-2.5 3.3" />
    </svg>
  )
}

export function ActivityIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  )
}

export function TrophyIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
    </svg>
  )
}

export function DownloadIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3v12" />
      <polyline points="7,10 12,15 17,10" />
      <path d="M4 21h16" />
    </svg>
  )
}

export function UploadIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 15V3" />
      <polyline points="7,8 12,3 17,8" />
      <path d="M4 21h16" />
    </svg>
  )
}

export function LeafIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M21 3s-8-1-12.5 3.5S6 17 9 21c2 2.5 12-1 12-10V3" />
      <path d="M6.5 13.5c3 1 6 2.5 8 4.5" />
    </svg>
  )
}

export function WindIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
      <path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  )
}

export function ZapIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <polyline points="9,6 15,12 9,18" />
    </svg>
  )
}

export function ClockIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

export function BellIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

export function CalendarIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
    </svg>
  )
}

export function TrendingUpIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <polyline points="3,17 9,11 13,15 21,7" />
      <polyline points="15,7 21,7 21,13" />
    </svg>
  )
}

export function SparklesIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 17l.9 2.1L22 20l-2.1.9L19 23l-.9-2.1L16 20l2.1-.9L19 17z" />
    </svg>
  )
}

export function ArrowUpIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 19V5" />
      <polyline points="5,12 12,5 19,12" />
    </svg>
  )
}

export function ArrowDownIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 5v14" />
      <polyline points="19,12 12,19 5,12" />
    </svg>
  )
}
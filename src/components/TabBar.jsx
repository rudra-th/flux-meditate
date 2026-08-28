import { TimerIcon, ChartIcon, ListIcon, GearIcon } from './Icons'

export default function TabBar({ current, onChange }) {
  const tabs = [
    { id: 'timer', label: 'Timer', icon: <TimerIcon size={22} /> },
    { id: 'insights', label: 'Insights', icon: <ChartIcon size={22} /> },
    { id: 'history', label: 'History', icon: <ListIcon size={22} /> },
    { id: 'settings', label: 'Settings', icon: <GearIcon size={22} /> }
  ]

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item${current === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
          aria-label={tab.label}
          aria-current={current === tab.id ? 'page' : undefined}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
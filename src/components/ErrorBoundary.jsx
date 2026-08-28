import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {}

  handleReset = () => {
    this.setState({ hasError: false })
    window.location.hash = ''
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <div className="app-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div className="empty-state">
              <div className="empty-state-icon">◌</div>
              <p className="empty-state-title" style={{ fontFamily: 'Lora, serif', fontSize: '1.2rem' }}>Something went still wrong</p>
              <p className="empty-state-hint" style={{ fontSize: '0.85rem', color: '#8B8FA3', marginBottom: 16 }}>
                A quiet error occurred. Reloading usually fixes it.
              </p>
              <button className="chip active" onClick={this.handleReset}>Reload</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import HomePage from './pages/Home'
import ProfilePage from './pages/Profile'
import UserProfilePage from './pages/UserProfile'
import SettingsPage from './pages/Settings'
import SearchPage from './pages/Search'
import Login from './components/Login'
import { ThemeProvider } from './contexts/ThemeContext'
import { 
  getState, 
  subscribe, 
  initializeApp, 
  recordActivityTimestamp, 
  hasSessionExpired, 
  logout, 
  INACTIVITY_TIMEOUT_MS, 
  INACTIVITY_LOGOUT_MESSAGE 
} from './store-mongodb'

export default function App() {
  const [state, setState] = useState(getState())
  const [bootstrapped, setBootstrapped] = useState(false)
  
  useEffect(() => {
    return subscribe(() => setState(getState()))
  }, [])

  useEffect(() => {
    let active = true
    initializeApp().finally(() => {
      if (active) {
        setBootstrapped(true)
      }
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!state.isAuthenticated) return
    const activityEvents: Array<keyof DocumentEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart', 'visibilitychange']
    let inactivityTimer: number | undefined

    const resetTimer = () => {
      if (document.visibilityState === 'hidden') {
        return
      }
      recordActivityTimestamp()
      if (inactivityTimer) {
        window.clearTimeout(inactivityTimer)
      }
      inactivityTimer = window.setTimeout(() => {
        if (hasSessionExpired()) {
          logout(INACTIVITY_LOGOUT_MESSAGE)
        }
      }, INACTIVITY_TIMEOUT_MS)
    }

    activityEvents.forEach(event => document.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      activityEvents.forEach(event => document.removeEventListener(event, resetTimer))
      if (inactivityTimer) {
        window.clearTimeout(inactivityTimer)
      }
    }
  }, [state.isAuthenticated])

  if (!bootstrapped) {
    return (
 <ThemeProvider>
        <div className="app-loading-state">
          <div className="app-loading-spinner" aria-hidden="true" />
          <span>Preparing your feed…</span>
        </div>
      </ThemeProvider>
    )
  }

  if (!state.isAuthenticated) {
    return (
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    )
  }

          return (
          <ThemeProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user/:userId" element={<UserProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ThemeProvider>
        )
}

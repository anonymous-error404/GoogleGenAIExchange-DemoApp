import { Routes, Route } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
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
  registerActivity, 
  INACTIVITY_TIMEOUT_MS, 
  logout 
} from './store-mongodb'

export default function App() {
  const [state, setState] = useState(getState())
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  useEffect(() => {
    initializeApp()
    return subscribe(() => setState(getState()))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!state.isAuthenticated) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
      }
      return
    }

    const lastActivity = state.lastActivityAt ?? Date.now()
    const elapsed = Date.now() - lastActivity
    const remaining = Math.max(INACTIVITY_TIMEOUT_MS - elapsed, 0)

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }

    inactivityTimer.current = window.setTimeout(() => {
      logout()
    }, remaining)

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
      }
    }
  }, [state.isAuthenticated, state.lastActivityAt])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.isAuthenticated) return

    const activityHandler = () => registerActivity()
    const activityEvents: Array<keyof WindowEventMap> = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart'
    ]

    activityEvents.forEach(event =>
      window.addEventListener(event, activityHandler)
    )

    return () => {
      activityEvents.forEach(event =>
        window.removeEventListener(event, activityHandler)
      )
    }
  }, [state.isAuthenticated])

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

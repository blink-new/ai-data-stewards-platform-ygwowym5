import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { ChatWorkspace } from './pages/ChatWorkspace'
import { DataChat } from './pages/DataChat'
import { DataAnalysis } from './pages/DataAnalysis'
import { ProfileSettings } from './pages/ProfileSettings'
import { LoadingScreen } from './components/ui/LoadingScreen'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">AI Data Stewards Platform</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
          <button 
            onClick={() => blink.auth.login()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background flex">
        <Sidebar user={user} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/chat" element={<ChatWorkspace user={user} />} />
            <Route path="/data-chat" element={<DataChat user={user} />} />
            <Route path="/analysis" element={<DataAnalysis user={user} />} />
            <Route path="/profile" element={<ProfileSettings user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
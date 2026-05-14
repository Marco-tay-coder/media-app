import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profil from './pages/Profil'
import { useAuth } from './hooks/useAuth'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null  // ← rien au lieu du spinner bloquant

  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/profil" element={
          <PrivateRoute><Profil /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
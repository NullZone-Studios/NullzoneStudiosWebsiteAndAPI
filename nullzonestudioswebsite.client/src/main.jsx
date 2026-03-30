import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.jsx'
import './index.css'
import App from './App.jsx'
import AdminPanel from './pages/AdminPanel/AdminPanel.jsx'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
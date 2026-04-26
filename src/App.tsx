import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getSession } from './lib/api'
import { ThemeProvider } from './lib/theme'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initLogger } from './lib/logger'
import CookieConsent from './pages/CookieConsent'

// Lazy-load all pages for code-splitting
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Cookies = lazy(() => import('./pages/Cookies'))
const Legal = lazy(() => import('./pages/Legal'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const Chat = lazy(() => import('./pages/Chat'))
const NPS = lazy(() => import('./pages/NPS'))
const Brain = lazy(() => import('./pages/Brain'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Referral = lazy(() => import('./pages/Referral'))
const Decisions = lazy(() => import('./pages/Decisions'))
const Business = lazy(() => import('./pages/Business'))
const NotFound = lazy(() => import('./pages/NotFound'))
const New = lazy(() => import('./pages/New'))

// Inline skeleton fallback — avoids loading a separate CSS file for the loading state
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F5F5',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40,
          border: '4px solid #D1E0F3',
          borderTopColor: '#2D3261',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <div style={{ color: '#2D3261', fontWeight: 600, fontSize: '0.9rem' }}>Cargando...</div>
      </div>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const session = getSession()
  return session ? <>{children}</> : <Navigate to="/" replace />
}

function LoggedInRoute({ children }: { children: React.ReactNode }) {
  const session = getSession()
  return session ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  useEffect(() => {
    const session = getSession()
    initLogger(session?.user?.id)
  }, [])

  return (
    <ThemeProvider>
      <ErrorBoundary>
        {/* Skip link for keyboard/screen reader accessibility */}
        <a href="#main-content" style={{
          position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1,
          overflow: 'hidden', zIndex: 9999,
        }}
        onFocus={e => { e.currentTarget.style.position = 'fixed'; e.currentTarget.style.left = '1rem'; e.currentTarget.style.top = '1rem'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; e.currentTarget.style.overflow = 'visible'; e.currentTarget.style.background = '#FFD054'; e.currentTarget.style.color = '#2D3261'; e.currentTarget.style.padding = '0.6rem 1rem'; e.currentTarget.style.borderRadius = '8px'; e.currentTarget.style.fontWeight = '700'; e.currentTarget.style.fontSize = '0.85rem'; e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.zIndex = '9999'; }}
        onBlur={e => { e.currentTarget.style.position = 'absolute'; e.currentTarget.style.left = '-9999px'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px'; e.currentTarget.style.overflow = 'hidden'; }}
        >Saltar al contenido principal</a>

        <div id="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LoggedInRoute><Landing /></LoggedInRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/verificar-email" element={<VerifyEmail />} />
              <Route path="/recuperar" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/aviso-legal" element={<Legal />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/onboarding" element={
                <PrivateRoute>
                  <Onboarding />
                </PrivateRoute>
              } />
              <Route
                path="/checkout/exito"
                element={
                  <PrivateRoute>
                    <CheckoutSuccess />
                  </PrivateRoute>
                }
              />
              <Route path="/chat" element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } />
              <Route path="/nps" element={
                <PrivateRoute>
                  <NPS />
                </PrivateRoute>
              } />
              <Route path="/brain" element={
                <PrivateRoute>
                  <Brain />
                </PrivateRoute>
              } />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/referral"
                element={
                  <PrivateRoute>
                    <Referral />
                  </PrivateRoute>
                }
              />
              <Route
                path="/decisions"
                element={
                  <PrivateRoute>
                    <Decisions />
                  </PrivateRoute>
                }
              />
              <Route path="/business" element={
                <PrivateRoute>
                  <Business />
                </PrivateRoute>
              }
              />
              <Route path="/new" element={
                <PrivateRoute>
                  <New />
                </PrivateRoute>
              }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        <CookieConsent />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

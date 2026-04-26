import { insforge, EDGE_FUNCTIONS_URL } from './insforge'

export interface User {
  id: string
  email: string
  emailVerified?: boolean
  nombre?: string
  clienteId?: string
  clienteNombre?: string
  rol?: string
  idioma?: string
  profile?: {
    name?: string
    nombreEmpresa?: string
    avatar_url?: string
  }
}

export interface LoginResponse {
  user: User
  accessToken: string
  appUser?: {
    id: string
    nombre: string
    rol: string
    idioma: string
    clienteId: string
  }
}

export interface RegisterRequest {
  email: string
  password: string
  nombre: string
  company: string
  sector?: string
  vision?: string
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/auth-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    if (res.status === 429) {
      const msg = data.error || data.message || 'Demasiados intentos. Por favor, espera.'
      throw new Error(`${msg} Si has olvidado tu contraseña, puedes recuperarla en /recuperar.`)
    }
    throw new Error(data.error || data.message || 'Error al iniciar sesión')
  }

  // Merge appUser data into user for easy access
  const user: User = {
    id: data.appUser?.id || data.user?.id,
    email: data.user?.email || email,
    emailVerified: data.user?.emailVerified,
    nombre: data.appUser?.nombre || data.user?.profile?.name,
    clienteId: data.appUser?.clienteId,
    rol: data.appUser?.rol,
    idioma: data.appUser?.idioma,
    profile: data.user?.profile,
  }

  return {
    user,
    accessToken: data.session?.accessToken || data.token,
    appUser: data.appUser,
  }
}

export async function register(req: RegisterRequest): Promise<{ requireEmailVerification: boolean }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/auth-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      const minutes = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 5
      throw new Error(`Demasiados intentos. Por favor, espera ${minutes} minuto${minutes > 1 ? 's' : ''} antes de intentarlo de nuevo.`)
    }
    throw new Error(data.error || data.message || 'Error en el registro')
  }

  // Registration succeeded — save session immediately if we got a token
  if (data.user) {
    const user: User = {
      id: data.appUserId || data.user?.id,
      email: data.user?.email || req.email,
      emailVerified: data.user?.emailVerified,
      nombre: req.nombre,
      clienteId: data.clientId,
      profile: { name: req.nombre, nombreEmpresa: req.company },
    }
    const requireEmailVerification = data.requireEmailVerification ?? data.user?.requireEmailVerification ?? false
    const accessToken = data.accessToken || data.user?.accessToken

    // If email verification not required, save session immediately
    if (!requireEmailVerification && accessToken) {
      saveSession(accessToken, user)
    } else if (accessToken) {
      // Email verification required — store token so VerifyEmail can use it
      sessionStorage.setItem('pending_email', req.email)
      sessionStorage.setItem('pending_token', accessToken)
      sessionStorage.setItem('pending_user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('pending_email', req.email)
    }
  }

  return { requireEmailVerification: data.requireEmailVerification ?? data.user?.requireEmailVerification ?? false }
}

export async function verifyEmail(email: string, code: string) {
  const { data, error } = await insforge.auth.verifyEmail({ email, otp: code })
  if (error || !data) throw new Error(error?.message || 'Error verificando email')
  sessionStorage.removeItem('pending_email')
  return data
}

export async function resendVerificationCode(email: string) {
  const { data, error } = await insforge.auth.resendVerificationEmail({ email })
  if (error) throw new Error(error.message)
  return data
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await insforge.auth.getCurrentUser()
  return (data?.user as User) ?? null
}

export async function setProfile(profile: { name?: string; nombreEmpresa?: string }) {
  const { data, error } = await insforge.auth.setProfile(profile)
  if (error) throw new Error(error.message)
  return data
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function sendResetPasswordEmail(email: string) {
  const { data, error } = await insforge.auth.sendResetPasswordEmail({
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(error.message)
  return data
}

export async function resetPassword(newPassword: string, token: string) {
  const { data, error } = await insforge.auth.resetPassword({ newPassword, otp: token })
  if (error) throw new Error(error.message)
  return data
}

// ── Onboarding helpers ───────────────────────────────────────────────────────

export async function getOnboardingStatus(): Promise<{ completed: boolean; tipo?: string; contenido?: string } | null> {
  const session = getSession()
  if (!session) return null
  try {
    const res = await fetch(`${EDGE_FUNCTIONS_URL}/onboarding-status`, {
      headers: { 'Authorization': `Bearer ${session.token}` }
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ── Session helpers ──────────────────────────────────────────────────────────

export function saveSession(accessToken: string, user: User) {
  localStorage.setItem('if_token', accessToken)
  localStorage.setItem('if_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('if_token')
  localStorage.removeItem('if_user')
  sessionStorage.removeItem('pending_user')
  sessionStorage.removeItem('pending_email')
  sessionStorage.removeItem('pending_token')
}

export function getSession(): { token: string; user: User } | null {
  const token = localStorage.getItem('if_token')
  const userStr = localStorage.getItem('if_user')
  if (!token || !userStr) return null
  try {
    return { token, user: JSON.parse(userStr) as User }
  } catch {
    return null
  }
}

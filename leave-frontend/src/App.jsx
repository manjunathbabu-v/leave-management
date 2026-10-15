import { useState } from 'react'
import { api, decodeJwt, isExpired, resolveRole } from './api.js'
import Employee from './Employee.jsx'
import Manager from './Manager.jsx'

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem('session'))
    return s && !isExpired(s.token) ? s : null
  } catch {
    return null
  }
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: form })
      const token = data.accessToken
      const role = await resolveRole(token, data)
      onLogin({ token, role, username: decodeJwt(token).sub || form.username })
    } catch (err) {
      setError(err.status >= 400 && err.status < 500 || err.status === 500
        ? 'Wrong username or password. Check both and try again.'
        : 'Cannot reach the server. Make sure the backend is running on port 8080.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login">
      <form className="panel login-card" onSubmit={submit}>
        <h1>Leave Desk</h1>
        <p className="muted">Sign in to request time off or review your team's requests.</p>
        <label>Username
          <input autoFocus required autoComplete="username" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label>Password
          <input required type="password" autoComplete="current-password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="alert error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState(load)

  const login = (s) => { localStorage.setItem('session', JSON.stringify(s)); setSession(s) }
  const logout = () => { localStorage.removeItem('session'); setSession(null) }

  if (!session) return <Login onLogin={login} />
  const manager = session.role === 'ROLE_MANAGER'

  return (
    <>
      <header className="bar">
        <strong>Leave Desk</strong>
        <div className="who">
          <span>{session.username}</span>
          <span className="role">{manager ? 'Manager' : 'Employee'}</span>
          <button className="btn" onClick={logout}>Sign out</button>
        </div>
      </header>
      <main className="page">
        {manager ? <Manager session={session} onExpired={logout} /> : <Employee session={session} onExpired={logout} />}
      </main>
    </>
  )
}

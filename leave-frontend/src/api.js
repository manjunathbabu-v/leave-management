// All calls use relative URLs (/api/...) so the Vite proxy makes them same-origin.
export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = new Error(res.status >= 500 ? 'The server had a problem. Try again.' : 'Request was not allowed.')
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

export const isExpired = (token) => {
  const { exp } = decodeJwt(token)
  return !exp || exp * 1000 < Date.now()
}

// The backend's token has no role in it, so: use a role if the server ever sends one,
// otherwise ask the API - managers can list leaves (200), employees get 403.
export async function resolveRole(token, loginData) {
  const claims = decodeJwt(token)
  const given = loginData.role || claims.role || (claims.roles && [].concat(claims.roles)[0])
  if (given) return given
  try {
    await api('/api/leaves?page=0&size=1', { token })
    return 'ROLE_MANAGER'
  } catch (e) {
    if (e.status === 403) return 'ROLE_EMPLOYEE'
    throw e
  }
}

export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1
export const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

import { useCallback, useEffect, useState } from 'react'
import { api, daysBetween, fmtDate } from './api.js'

const label = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' }

export default function Employee({ session, onExpired }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [leaves, setLeaves] = useState(null)

  const today = new Date().toISOString().slice(0, 10)
  const days = form.startDate && form.endDate && form.endDate >= form.startDate
    ? daysBetween(form.startDate, form.endDate) : 0

  const loadLeaves = useCallback(() => {
    api('/api/leaves/my', { token: session.token })
      .then(setLeaves)
      .catch((err) => (err.status === 401 ? onExpired() : setMsg({ type: 'error', text: 'Could not load your requests.' })))
  }, [session.token, onExpired])

  useEffect(loadLeaves, [loadLeaves])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (form.endDate < form.startDate) return setMsg({ type: 'error', text: 'The end date must be on or after the start date.' })
    setBusy(true)
    try {
      await api('/api/leaves', { method: 'POST', body: form, token: session.token })
      setForm({ startDate: '', endDate: '', reason: '' })
      setMsg({ type: 'ok', text: 'Request sent. Your manager will review it.' })
      loadLeaves()
    } catch (err) {
      if (err.status === 401) return onExpired()
      setMsg({ type: 'error', text: err.status === 403 ? 'Your session has expired. Sign in again.' : err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="two-col">
      <section className="panel">
        <h2>Request time off</h2>
        <form onSubmit={submit}>
          <div className="row">
            <label>First day off
              <input type="date" required min={today} value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </label>
            <label>Last day off
              <input type="date" required min={form.startDate || today} value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </label>
          </div>
          {days > 0 && <p className="muted">{days} {days === 1 ? 'day' : 'days'} in total</p>}
          <label>Reason
            <textarea required rows="4" placeholder="Family trip, medical appointment…" value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </label>
          {msg && <p className={`alert ${msg.type}`} role="status">{msg.text}</p>}
          <button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button>
        </form>
      </section>

      <section className="panel">
        <div className="head">
          <h2>My requests</h2>
          <button className="btn" onClick={loadLeaves}>Refresh</button>
        </div>
        {!leaves && <p className="muted">Loading your requests…</p>}
        {leaves && leaves.length === 0 && (
          <p className="muted">No requests yet. Send one using the form.</p>
        )}
        {leaves && leaves.length > 0 && (
          <ul className="list">
            {leaves.map((l) => (
              <li key={l.id}>
                <div>
                  <strong>{fmtDate(l.startDate)} – {fmtDate(l.endDate)}</strong>
                  <div className="muted small">{daysBetween(l.startDate, l.endDate)} days</div>
                  <div className="muted">{l.reason}</div>
                </div>
                <span className={`chip ${l.status}`}>{label[l.status] || l.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
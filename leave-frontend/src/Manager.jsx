import { useCallback, useEffect, useState } from 'react'
import { api, daysBetween, fmtDate } from './api.js'

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
const label = { ALL: 'All', PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' }

export default function Manager({ session, onExpired }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const fail = useCallback((err) => {
    if (err.status === 401) return onExpired()
    setError(err.status === 403 ? 'Your session has expired or you do not have access. Sign in again.' : err.message)
  }, [onExpired])

  const fetchPage = useCallback(() => {
    setError('')
    api(`/api/leaves?page=${page}&size=10`, { token: session.token }).then(setData).catch(fail)
  }, [page, session.token, fail])

  useEffect(fetchPage, [fetchPage])

  const decide = async (id, action) => {
    setBusyId(id)
    try {
      const updated = await api(`/api/leaves/${id}/${action}`, { method: 'PUT', token: session.token })
      setData((d) => ({ ...d, content: d.content.map((l) => (l.id === id ? updated : l)) }))
    } catch (err) {
      fail(err)
    } finally {
      setBusyId(null)
    }
  }

  const rows = (data?.content || [])
    .filter((l) => filter === 'ALL' || l.status === filter)
    .sort((a, b) => b.id - a.id)

  return (
    <section className="panel">
      <div className="head">
        <h2>Leave requests</h2>
        <div className="tabs" role="tablist">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''}
              onClick={() => setFilter(f)}>{label[f]}</button>
          ))}
        </div>
      </div>

      {error && <p className="alert error" role="alert">{error}</p>}
      {!data && !error && <p className="muted">Loading requests…</p>}
      {data && rows.length === 0 && (
        <p className="muted">{filter === 'ALL' ? 'No leave requests yet.' : `No ${label[filter].toLowerCase()} requests on this page.`}</p>
      )}

      {rows.length > 0 && (
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Employee</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.employee?.username}</strong><div className="muted small">{l.employee?.email}</div></td>
                  <td>{fmtDate(l.startDate)} – {fmtDate(l.endDate)}<div className="muted small">{daysBetween(l.startDate, l.endDate)} days</div></td>
                  <td className="reason">{l.reason}</td>
                  <td><span className={`chip ${l.status}`}>{label[l.status] || l.status}</span></td>
                  <td className="actions">
                    {l.status === 'PENDING' && (
                      <>
                        <button className="btn ok" disabled={busyId === l.id} onClick={() => decide(l.id, 'approve')}>Approve</button>
                        <button className="btn danger" disabled={busyId === l.id} onClick={() => decide(l.id, 'reject')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="pager">
          <button className="btn" disabled={data.first} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {data.number + 1} of {data.totalPages}</span>
          <button className="btn" disabled={data.last} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </section>
  )
}

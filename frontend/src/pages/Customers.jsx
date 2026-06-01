import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getCustomers, createCustomer, deleteCustomer } from '../services/api'

const emptyForm = { full_name: '', email: '', phone: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await createCustomer(form)
      toast.success('Customer added')
      setShowModal(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating customer')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, name) => {
    if (!confirm(`Delete customer "${name}"? This may affect their orders.`)) return
    try {
      await deleteCustomer(id)
      toast.success('Customer removed')
      setCustomers(c => c.filter(x => x.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error deleting customer')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setErrors({}); setShowModal(true) }}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" display="block">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <h3>No customers yet</h3>
            <p>Add your first customer to start taking orders</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td style={{color:'var(--accent)'}}>{c.email}</td>
                    <td>{c.phone}</td>
                    <td style={{color:'var(--text-muted)', fontSize:13}}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c.id, c.full_name)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add Customer</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.full_name}
                  onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                  placeholder="e.g. Rahul Sharma"/>
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="rahul@example.com"/>
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" value={form.phone}
                  onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  placeholder="+91 98765 43210"/>
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

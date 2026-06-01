import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOrders, getCustomers, getProducts, createOrder, deleteOrder } from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [errors, setErrors] = useState({})

  const load = () => Promise.all([
    getOrders().then(r => setOrders(r.data)),
    getCustomers().then(r => setCustomers(r.data)),
    getProducts().then(r => setProducts(r.data)),
  ]).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, field, val) => setItems(i => i.map((it, j) => j === idx ? {...it, [field]: val} : it))

  const validate = () => {
    const e = {}
    if (!customerId) e.customer = 'Please select a customer'
    if (items.some(i => !i.product_id)) e.items = 'All items must have a product selected'
    if (items.some(i => !i.quantity || Number(i.quantity) < 1)) e.qty = 'All quantities must be at least 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const calcTotal = () => items.reduce((sum, it) => {
    const p = products.find(p => p.id === Number(it.product_id))
    return sum + (p ? p.price * (Number(it.quantity) || 0) : 0)
  }, 0)

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await createOrder({
        customer_id: Number(customerId),
        items: items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) }))
      })
      toast.success('Order created')
      setShowModal(false)
      setCustomerId('')
      setItems([{ product_id: '', quantity: 1 }])
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating order')
    } finally {
      setSaving(false)
    }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try {
      await deleteOrder(id)
      toast.success('Order cancelled')
      setOrders(o => o.filter(x => x.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error cancelling order')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setErrors({}); setShowModal(true) }}>
          + New Order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" display="block">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <h3>No orders yet</h3>
            <p>Create your first order above</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><span className="sku">#{String(o.id).padStart(4,'0')}</span></td>
                    <td>{o.customer?.full_name || '—'}</td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td style={{color:'var(--success)', fontWeight:600}}>${o.total_amount.toFixed(2)}</td>
                    <td style={{color:'var(--text-muted)', fontSize:13}}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:8}}>
                        <Link to={`/orders/${o.id}`} className="btn btn-ghost btn-sm">View</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(o.id)}>Cancel</button>
                      </div>
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
          <div className="modal" style={{maxWidth: 600}}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Order</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="form-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Select a customer…</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
                </select>
                {errors.customer && <div className="form-error">{errors.customer}</div>}
              </div>

              <div style={{marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <label className="form-label" style={{margin:0}}>Order Items *</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} style={{display:'grid', gridTemplateColumns:'1fr 120px 40px', gap:8, marginBottom:10, alignItems:'center'}}>
                  <select className="form-select" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)} (qty: {p.quantity})</option>
                    ))}
                  </select>
                  <input className="form-input" type="number" min="1" value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', e.target.value)} placeholder="Qty"/>
                  {items.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(idx)}
                      style={{padding:'8px', minWidth:0}}>✕</button>
                  )}
                </div>
              ))}
              {(errors.items || errors.qty) && (
                <div className="form-error" style={{marginBottom:12}}>{errors.items || errors.qty}</div>
              )}

              <div style={{background:'var(--bg-secondary)', borderRadius:8, padding:'12px 16px', marginTop:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{color:'var(--text-secondary)', fontSize:14}}>Estimated Total</span>
                  <span style={{color:'var(--success)', fontWeight:600, fontSize:18}}>${calcTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

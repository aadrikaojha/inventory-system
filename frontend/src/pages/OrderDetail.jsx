import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../services/api'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getOrder(id)
      .then(r => setOrder(r.data))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>
  if (error) return (
    <div>
      <div className="empty-state">
        <h3>{error}</h3>
        <Link to="/orders" className="btn btn-ghost" style={{marginTop:16}}>Back to Orders</Link>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Order #{String(order.id).padStart(4,'0')}</h2>
          <p className="page-subtitle">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Link to="/orders" className="btn btn-ghost">← Back to Orders</Link>
      </div>

      <div className="grid-2" style={{marginBottom: 24}}>
        <div className="card">
          <h3 style={{fontSize:14, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14}}>Customer</h3>
          <div style={{fontSize:18, fontWeight:600, marginBottom:4}}>{order.customer?.full_name}</div>
          <div style={{color:'var(--accent)', fontSize:14}}>{order.customer?.email}</div>
          <div style={{color:'var(--text-secondary)', fontSize:14, marginTop:4}}>{order.customer?.phone}</div>
        </div>
        <div className="card">
          <h3 style={{fontSize:14, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14}}>Order Summary</h3>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <span style={{color:'var(--text-secondary)'}}>Items</span>
            <span>{order.items?.length}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <span style={{color:'var(--text-secondary)'}}>Status</span>
            <span className="badge badge-accent">{order.status}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:10, marginTop:4}}>
            <span style={{fontWeight:600}}>Total</span>
            <span style={{color:'var(--success)', fontWeight:700, fontSize:18}}>${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{fontSize:16, fontWeight:600, marginBottom:18}}>Order Items</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || '—'}</td>
                  <td><span className="sku">{item.product?.sku || '—'}</span></td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{color:'var(--success)', fontWeight:600}}>
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', paddingTop:16, borderTop:'1px solid var(--border)', marginTop:8}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13, color:'var(--text-muted)', marginBottom:4}}>Order Total</div>
            <div style={{fontSize:24, fontWeight:700, color:'var(--success)'}}>${order.total_amount.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getDashboard } from '../services/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Business overview at a glance</p>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom: 28}}>
        <StatCard value={data?.total_products ?? 0} label="Total Products"
          color="#6c63ff" bg="rgba(108,99,255,0.15)"
          icon={<IconBox/>}/>
        <StatCard value={data?.total_customers ?? 0} label="Total Customers"
          color="#4ade80" bg="rgba(74,222,128,0.15)"
          icon={<IconUsers/>}/>
        <StatCard value={data?.total_orders ?? 0} label="Total Orders"
          color="#fbbf24" bg="rgba(251,191,36,0.15)"
          icon={<IconOrders/>}/>
        <StatCard value={data?.low_stock_products?.length ?? 0} label="Low Stock Alerts"
          color="#f87171" bg="rgba(248,113,113,0.15)"
          icon={<IconAlert/>}/>
      </div>

      {data?.low_stock_products?.length > 0 && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:18}}>
            <span style={{color:'#f87171', display:'flex'}}>
              <IconAlert/>
            </span>
            <h3 style={{fontSize:16, fontWeight:600}}>Low Stock Products</h3>
            <span className="badge badge-danger">{data.low_stock_products.length} items</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Price</th><th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="sku">{p.sku}</span></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ value, label, color, bg, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{background: bg, color}}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{color}}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

const IconBox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconOrders = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/>
  </svg>
)
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

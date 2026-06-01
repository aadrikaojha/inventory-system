import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api'

const emptyForm = { name: '', sku: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity })
    setErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required'
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid quantity required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) }
    try {
      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product created')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      setProducts(p => p.filter(x => x.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error deleting product')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" display="block">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <h3>No products yet</h3>
            <p>Add your first product to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="sku">{p.sku}</span></td>
                    <td style={{color:'var(--success)'}}>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.quantity <= 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:8}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(p.id, p.name)}>Delete</button>
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
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="e.g. Wireless Mouse"/>
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input className="form-input" value={form.sku}
                  onChange={e => setForm(f => ({...f, sku: e.target.value}))}
                  placeholder="e.g. WM-001" style={{fontFamily:'var(--font-mono)'}}/>
                {errors.sku && <div className="form-error">{errors.sku}</div>}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input className="form-input" type="number" step="0.01" min="0" value={form.price}
                    onChange={e => setForm(f => ({...f, price: e.target.value}))}
                    placeholder="0.00"/>
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input className="form-input" type="number" min="0" value={form.quantity}
                    onChange={e => setForm(f => ({...f, quantity: e.target.value}))}
                    placeholder="0"/>
                  {errors.quantity && <div className="form-error">{errors.quantity}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['base', 'sauce', 'cheese', 'veggie', 'meat'];
const CAT_EMOJIS = { base: '🍞', sauce: '🍅', cheese: '🧀', veggie: '🥗', meat: '🥩' };

export default function AdminInventory() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'base', quantity: 100, price: 0, threshold: 20, description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = () => {
    api.get('/inventory')
      .then(res => setItems(res.data))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  };

  const seedInventory = async () => {
    if (!window.confirm('This will reset all inventory to defaults. Continue?')) return;
    try {
      const { data } = await api.post('/inventory/seed');
      toast.success(data.message);
      fetchInventory();
    } catch {
      toast.error('Seed failed');
    }
  };

  const openEdit = (item) => {
    setForm({ name: item.name, category: item.category, quantity: item.quantity, price: item.price, threshold: item.threshold, description: item.description || '', id: item._id });
    setModal('edit');
  };

  const openAdd = () => {
    setForm({ name: '', category: 'base', quantity: 100, price: 0, threshold: 20, description: '' });
    setModal('add');
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required');
    setSaving(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/inventory', form);
        setItems(prev => [...prev, data]);
        toast.success('Item added!');
      } else {
        const { data } = await api.patch(`/inventory/${form.id}`, form);
        setItems(prev => prev.map(i => i._id === form.id ? data : i));
        toast.success('Item updated!');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const { data } = await api.patch(`/inventory/${item._id}`, { available: !item.available });
      setItems(prev => prev.map(i => i._id === item._id ? data : i));
    } catch {
      toast.error('Update failed');
    }
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);
  const getStockLevel = (item) => {
    if (item.quantity <= item.threshold) return 'low';
    if (item.quantity <= item.threshold * 2) return 'mid';
    return 'high';
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Inventory <span>Management</span> 📦</h1>
        <p>Track and manage pizza ingredients stock levels</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter('all')}>All ({items.length})</button>
          {CATEGORIES.map(c => (
            <button key={c} className={`btn ${filter === c ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(c)}>
              {CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)} ({items.filter(i => i.category === c).length})
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={seedInventory}>🌱 Seed Default</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Item</button>
        </div>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const level = getStockLevel(item);
                  const pct = Math.min(100, Math.round((item.quantity / 150) * 100));
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        {item.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.description}</div>}
                      </td>
                      <td><span className="badge badge-ok" style={{ fontSize: '0.7rem' }}>{CAT_EMOJIS[item.category]} {item.category}</span></td>
                      <td>
                        <div style={{ minWidth: 120 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                            <span style={{ color: 'var(--text-muted)' }}>min: {item.threshold}</span>
                          </div>
                          <div className="stock-bar-wrap">
                            <div className={`stock-bar ${level}`} style={{ width: `${pct}%` }} />
                          </div>
                          {level === 'low' && <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.2rem' }}>⚠️ Below threshold!</div>}
                        </div>
                      </td>
                      <td>₹{item.price}</td>
                      <td>
                        <button onClick={() => toggleAvailability(item)}
                          className={`badge ${item.available ? 'badge-ok' : 'badge-low'}`}
                          style={{ cursor: 'pointer', border: 'none', background: item.available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                          {item.available ? '✅ Available' : '❌ Unavailable'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <h2 className="modal-title">{modal === 'add' ? '➕ Add Item' : '✏️ Edit Item'}</h2>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Threshold</label>
                <input className="form-input" type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: +e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Item' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
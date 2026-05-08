import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/inventory/summary'),
      api.get('/orders'),
    ]).then(([invRes, ordRes]) => {
      setStats(invRes.data);
      setRecentOrders(ordRes.data.slice(0, 5));
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const totalOrders = recentOrders.length;
  const revenue = recentOrders.reduce((s, o) => s + o.totalPrice, 0);
  const lowStockCount = stats?.lowStockItems?.length || 0;
  const catEmojis = { base: '🍞', sauce: '🍅', cheese: '🧀', veggie: '🥗', meat: '🥩' };

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Admin <span>Dashboard</span> 📊</h1>
        <p>Manage orders, inventory, and operations</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Recent Orders</div>
          <div className="stat-value">{totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Revenue (recent)</div>
          <div className="stat-value">₹{revenue}</div>
        </div>
        <div className="stat-card" style={{ borderColor: lowStockCount > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>{lowStockCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Inventory Categories</div>
          <div className="stat-value">{stats?.summary?.length || 0}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="section-title" style={{ marginBottom: 0 }}>Recent <span>Orders</span></div>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {recentOrders.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o._id}>
                        <td style={{ fontWeight: 600 }}>#{o._id.slice(-6).toUpperCase()}</td>
                        <td>{o.user?.name || 'Unknown'}</td>
                        <td>₹{o.totalPrice}</td>
                        <td>
                          <span className={`badge badge-${o.status === 'Order Received' ? 'received' : o.status === 'In the Kitchen' ? 'kitchen' : o.status === 'Sent to Delivery' ? 'delivery' : 'delivered'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="section-title" style={{ marginBottom: 0 }}>Inventory <span>Summary</span></div>
            <Link to="/admin/inventory" className="btn btn-secondary btn-sm">Manage →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.summary?.map(cat => (
              <div key={cat._id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{catEmojis[cat._id] || '📦'} {cat._id.charAt(0).toUpperCase() + cat._id.slice(1)}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {cat.lowStock > 0 && <span className="badge badge-low">⚠️ {cat.lowStock} low</span>}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.count} items</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>Total stock: {cat.total}</span>
                </div>
              </div>
            ))}
          </div>

          {stats?.lowStockItems?.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>⚠️ Low Stock Alerts</p>
              {stats.lowStockItems.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.25rem 0', color: 'var(--text-secondary)' }}>
                  <span>{item.name}</span>
                  <span style={{ color: item.quantity <= 5 ? '#f87171' : '#fbbf24' }}>{item.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
const BADGE = { 'Order Received': 'badge-received', 'In the Kitchen': 'badge-kitchen', 'Sent to Delivery': 'badge-delivery', 'Delivered': 'badge-delivered' };
const ICONS = { 'Order Received': '📋', 'In the Kitchen': '👨‍🍳', 'Sent to Delivery': '🚀', 'Delivered': '✅' };

export default function AdminOrders() {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
      toast.success(`Order updated: ${status} 🍕`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Manage <span>Orders</span> 📋</h1>
        <p>View and update all customer orders</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter('all')}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(s)}>
            {ICONS[s]} {s} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div> :
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders in this category</div>
        ) : (
          filtered.map(order => (
            <div key={order._id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700 }}>#{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`badge ${BADGE[order.status]}`}>{ICONS[order.status]} {order.status}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{order.totalPrice}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    👤 {order.user?.name} ({order.user?.email}) · {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    🍞 {order.pizza?.base} · 🍅 {order.pizza?.sauce} · 🧀 {order.pizza?.cheese}
                    {order.pizza?.veggies?.length > 0 && ` · 🥗 ${order.pizza.veggies.join(', ')}`}
                  </div>
                </div>
                <button onClick={() => setExpanded(e => e === order._id ? null : order._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>
                  {expanded === order._id ? '▲' : '▼'}
                </button>
              </div>

              {expanded === order._id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Update Order Status</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {STATUSES.map(s => (
                      <button key={s}
                        className={`btn btn-sm ${order.status === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => updateStatus(order._id, s)}
                        disabled={updating === order._id || order.status === s}>
                        {updating === order._id ? '...' : `${ICONS[s]} ${s}`}
                      </button>
                    ))}
                  </div>
                  {order.deliveryAddress && (
                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📍 {order.deliveryAddress}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )
      }
    </div>
  );
}
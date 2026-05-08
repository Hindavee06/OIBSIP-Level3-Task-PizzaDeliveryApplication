import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
const STATUS_ICONS = { 'Order Received': '📋', 'In the Kitchen': '👨‍🍳', 'Sent to Delivery': '🚀', 'Delivered': '✅' };
const STATUS_BADGE = { 'Order Received': 'badge-received', 'In the Kitchen': 'badge-kitchen', 'Sent to Delivery': 'badge-delivery', 'Delivered': 'badge-delivered' };

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const currentIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <span className={`badge ${STATUS_BADGE[order.status]}`}>
              {STATUS_ICONS[order.status]} {order.status}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {new Date(order.createdAt).toLocaleString()} · ₹{order.totalPrice}
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <span>🍞 {order.pizza.base}</span>
              <span>🍅 {order.pizza.sauce}</span>
              <span>🧀 {order.pizza.cheese}</span>
              {order.pizza.veggies?.length > 0 && <span>🥗 {order.pizza.veggies.join(', ')}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Order Progress</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STATUS_STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem',
                      background: i <= currentIdx ? 'var(--accent)' : 'var(--bg-card)',
                      border: `2px solid ${i <= currentIdx ? 'var(--accent)' : 'var(--border)'}`,
                      transition: 'all 0.3s'
                    }}>
                      {i < currentIdx ? '✓' : STATUS_ICONS[s]}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: i <= currentIdx ? 'var(--accent)' : 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'center', maxWidth: 60 }}>{s}</p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--accent)' : 'var(--border)', marginBottom: 20, transition: 'background 0.3s' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            📍 {order.deliveryAddress}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      api.get('/orders/my-orders').then(res => setOrders(res.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="page-hero">
        <h1>My <span>Orders</span> 📋</h1>
        <p>Track your pizza orders in real time</p>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div> :
        orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍕</div>
            <h2>No orders yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Looks like you haven't placed any orders</p>
            <a href="/build-pizza" className="btn btn-primary">Build Your First Pizza</a>
          </div>
        ) : orders.map(order => <OrderCard key={order._id} order={order} />)
      }
    </div>
  );
}
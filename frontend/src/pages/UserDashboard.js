import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { user, api } = useAuth();
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pizza/varieties')
      .then(res => setVarieties(res.data))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Welcome, <span>{user.name.split(' ')[0]}</span>! 🍕</h1>
        <p>Explore our signature pizzas or build your own masterpiece</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <Link to="/build-pizza" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
          👨‍🍳 Build Your Own Pizza
        </Link>
        <Link to="/my-orders" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
          📋 Track Orders
        </Link>
      </div>

      <div className="section-title">Signature <span>Varieties</span></div>
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div> : (
        <div className="grid-auto">
          {varieties.map((v, i) => (
            <div key={i} className="card variety-card" onClick={() => window.location.href='/build-pizza'}>
              <span className="emoji">{v.emoji}</span>
              <h3>{v.name}</h3>
              <p>{v.description}</p>
              <div className="tags">
                <span className="tag">🍞 {v.base}</span>
                <span className="tag">🍅 {v.sauce}</span>
                <span className="tag">🧀 {v.cheese}</span>
              </div>
              <div className="variety-price">₹{v.price}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-accent)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎨</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Can't find your perfect pizza?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Build it from scratch — choose your base, sauce, cheese, and toppings</p>
        <Link to="/build-pizza" className="btn btn-primary">Start Building →</Link>
      </div>
    </div>
  );
}
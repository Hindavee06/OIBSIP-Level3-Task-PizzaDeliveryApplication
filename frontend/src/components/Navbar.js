import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return (
    <nav className="navbar">
      <Link to="/login" className="navbar-brand">Pizza<span>Craft</span> 🍕</Link>
      <div className="nav-links">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Register</Link>
      </div>
    </nav>
  );

  return (
    <nav className="navbar">
      <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="navbar-brand">
        Pizza<span>Craft</span> 🍕
      </Link>
      <div className="nav-links">
        {user.role === 'admin' ? (
          <>
            <Link to="/admin" className={isActive('/admin') && location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}>📊 <span>Dashboard</span></Link>
            <Link to="/admin/orders" className={isActive('/admin/orders')}>📋 <span>Orders</span></Link>
            <Link to="/admin/inventory" className={isActive('/admin/inventory')}>📦 <span>Inventory</span></Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>🍕 <span>Menu</span></Link>
            <Link to="/build-pizza" className={isActive('/build-pizza')}>👨‍🍳 <span>Build Pizza</span></Link>
            <Link to="/my-orders" className={isActive('/my-orders')}>📋 <span>My Orders</span></Link>
          </>
        )}
        <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Hi, {user.name.split(' ')[0]}!
        </span>
        <button className="nav-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
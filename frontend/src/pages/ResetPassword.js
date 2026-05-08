import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>New <span>Password</span> 🔐</h1>
        <p className="auth-subtitle">Choose a strong new password</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/auth/verify-email/${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'loading' && <><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Verifying...</p></>}
        {status === 'success' && <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1>Email <span>Verified!</span></h1>
          <p className="auth-subtitle">{message}</p>
          <Link to="/login" className="btn btn-primary btn-full mt-3">Go to Login</Link>
        </>}
        {status === 'error' && <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h1>Verification <span>Failed</span></h1>
          <p className="auth-subtitle">{message}</p>
          <Link to="/login" className="btn btn-secondary btn-full mt-3">Go to Login</Link>
        </>}
      </div>
    </div>
  );
}

export default ResetPassword;
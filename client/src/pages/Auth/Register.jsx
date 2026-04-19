import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrafficCone, User, BarChart3, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Common/Toast';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { showToast('Fill all fields', 'error'); return; }
    setLoading(true);
    try {
      const user = await register(name, email, password, role);
      showToast(`Welcome, ${user.name}!`, 'success');
      const routes = { user: '/user/home', relief_admin: '/relief/dashboard', field_unit: '/field/mission' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-logo"><TrafficCone size={48} style={{ color: 'inherit' }} /></span>
          <h1 className="text-heading auth-title">NEXUSTRAFFIC</h1>
          <p className="auth-subtitle">Create Your Account</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="register-name" className="input-field" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="register-email" className="input-field" type="email" placeholder="agent@nexustraffic.io" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="register-password" className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <div className="role-radios">
              {[{ value: 'user', label: 'User', icon: <User size={16} style={{ color: 'inherit' }} /> }, { value: 'relief_admin', label: 'Relief Admin', icon: <BarChart3 size={16} style={{ color: 'inherit' }} /> }, { value: 'field_unit', label: 'Field Unit', icon: <Target size={16} style={{ color: 'inherit' }} /> }].map(r => (
                <label key={r.value} className={`role-radio ${role === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={e => setRole(e.target.value)} />
                  <span className="role-icon">{r.icon}</span>
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button id="register-submit" className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

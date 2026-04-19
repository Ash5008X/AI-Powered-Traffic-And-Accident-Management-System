import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserNavbar.css';

export default function UserNavbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="user-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-nexus">NEXUS</span>
          <span className="brand-traffic">TRAFFIC</span>
        </div>
        <div className="navbar-links desktop-only">
          <NavLink to="/user/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/user/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Reports</NavLink>
          <NavLink to="/user/alerts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Alerts</NavLink>
          <NavLink to="/user/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profile</NavLink>
        </div>
        <div className="navbar-actions">
          <button className="navbar-bell" aria-label="Notifications">
            <span className="bell-icon"><Bell size={16} style={{ color: 'inherit' }} /></span>
            <span className="bell-badge">3</span>
          </button>
          <div className="navbar-avatar" title={user?.name || 'User'}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>
      </div>
    </nav>
  );
}

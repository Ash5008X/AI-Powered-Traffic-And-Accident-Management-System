import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getCurrentISTTime } from '../../utils/timeUtils';
import StatusToggle from '../Common/StatusToggle';
import { showToast } from '../Common/Toast';
import './ReliefNavbar.css';

export default function ReliefNavbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const [clock, setClock] = useState(getCurrentISTTime());
  const [onDuty, setOnDuty] = useState(true);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setClock(getCurrentISTTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleDuty = () => {
    setOnDuty(!onDuty);
    showToast(`Center ${!onDuty ? 'ON' : 'OFF'} duty`, !onDuty ? 'success' : 'warning');
  };

  const handleBellClick = () => {
    setShowNotifPanel(!showNotifPanel);
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifPanel(false);
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    if (notif.incidentId) {
      navigate('/relief/incidents');
    }
    setShowNotifPanel(false);
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className="relief-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-nexus">NEXUS</span>
          <span className="brand-traffic">TRAFFIC</span>
        </div>
        <div className="navbar-links desktop-only">
          <NavLink to="/relief/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/relief/incidents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Incidents</NavLink>
          <NavLink to="/relief/alerts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Alerts</NavLink>
          <NavLink to="/relief/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Reports</NavLink>
        </div>
        <div className="navbar-actions">
          <span className="navbar-clock text-mono desktop-only">{clock} IST</span>

          {/* Notification bell */}
          <div className="navbar-bell-wrapper" ref={notifRef}>
            <button className="navbar-bell" aria-label="Notifications" onClick={handleBellClick}>
              <span className="bell-icon">🔔</span>
              {unreadCount > 0 && <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>

            {showNotifPanel && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <span className="notif-panel-title">Notifications</span>
                  {unreadCount > 0 && (
                    <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                <div className="notif-panel-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <button
                        key={n.id}
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <span className="notif-item-icon">
                          {n.type === 'message' ? '💬' : n.type === 'incident' ? '🚨' : '📡'}
                        </span>
                        <div className="notif-item-body">
                          <span className="notif-item-text">{n.message}</span>
                          <span className="notif-item-time text-mono">
                            {new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.read && <span className="notif-unread-dot" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ON/OFF toggle */}
          <div className="desktop-only">
            <StatusToggle isOn={onDuty} onToggle={toggleDuty} />
          </div>

          <span className="navbar-cmd-id text-mono desktop-only">CENTRAL_CMD_01</span>

          {/* Profile avatar */}
          <div className="navbar-profile-wrapper" ref={profileRef}>
            <button className="navbar-avatar" aria-label="Profile" onClick={handleProfileClick}>
              {userInitial}
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">{userInitial}</div>
                  <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name">{user?.name}</span>
                    <span className="profile-dropdown-email text-mono">{user?.email}</span>
                  </div>
                </div>
                <div className="profile-dropdown-divider" />
                <button className="profile-dropdown-item" onClick={() => { navigate('/relief/profile'); setShowProfileMenu(false); }}>
                  <span>👤</span> My Profile
                </button>
                <button className="profile-dropdown-item" onClick={() => { navigate('/relief/dashboard'); setShowProfileMenu(false); }}>
                  <span>📊</span> Dashboard
                </button>
                <div className="profile-dropdown-divider" />
                <button className="profile-dropdown-item danger" onClick={logout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

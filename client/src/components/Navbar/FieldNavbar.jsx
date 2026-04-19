import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getCurrentISTTime } from '../../utils/timeUtils';
import StatusToggle from '../Common/StatusToggle';
import { showToast } from '../Common/Toast';
import './FieldNavbar.css';

export default function FieldNavbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const [onDuty, setOnDuty] = useState(true);
  const [clock, setClock] = useState(getCurrentISTTime());
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setClock(getCurrentISTTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleDuty = () => {
    setOnDuty(!onDuty);
    showToast(`Unit ${!onDuty ? 'ON' : 'OFF'} duty`, !onDuty ? 'success' : 'warning');
  };

  const handleBellClick = () => {
    setShowNotifPanel(!showNotifPanel);
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    if (notif.incidentId) {
      navigate('/field/incidents');
    }
    setShowNotifPanel(false);
  };

  return (
    <nav className="field-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-nexus">NEXUS</span>
          <span className="brand-traffic">TRAFFIC</span>
        </div>
        <div className="navbar-links desktop-only">
          <NavLink to="/field/mission" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Mission</NavLink>
          <NavLink to="/field/incidents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Incidents</NavLink>
          <NavLink to="/field/updates" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Updates</NavLink>
          <NavLink to="/field/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profile</NavLink>
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

          <StatusToggle isOn={onDuty} onToggle={toggleDuty} />
        </div>
      </div>
    </nav>
  );
}

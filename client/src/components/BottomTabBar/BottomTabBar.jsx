import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomTabBar.css';

const tabConfigs = {
  user: [
    { path: '/user/home', label: 'Home', icon: '🏠' },
    { path: '/user/reports', label: 'My Reports', icon: '📋' },
    { path: '/user/alerts', label: 'Alerts', icon: '🔔' },
    { path: '/user/profile', label: 'Profile', icon: '👤' },
  ],
  relief_admin: [
    { path: '/relief/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/relief/incidents', label: 'Incidents', icon: '🚨' },
    { path: '/relief/alerts', label: 'Alerts', icon: '📡' },
    { path: '/relief/reports', label: 'Reports', icon: '📑' },
  ],
  field_unit: [
    { path: '/field/mission', label: 'Mission', icon: '🎯' },
    { path: '/field/incidents', label: 'Incidents', icon: '⚡' },
    { path: '/field/updates', label: 'Updates', icon: '📨' },
    { path: '/field/profile', label: 'Profile', icon: '👤' },
  ],
};

export default function BottomTabBar({ role }) {
  const tabs = tabConfigs[role] || tabConfigs.user;
  return (
    <nav className="bottom-tab-bar mobile-only">
      {tabs.map(tab => (
        <NavLink key={tab.path} to={tab.path} className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

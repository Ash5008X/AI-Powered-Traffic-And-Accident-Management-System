import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Bell, User, LayoutDashboard, Siren, Radio, FileText, Target, Zap, ScrollText } from 'lucide-react';
import './BottomTabBar.css';

const tabConfigs = {
  user: [
    { path: '/user/home', label: 'Home', icon: <Home size={16} style={{ color: 'inherit' }} /> },
    { path: '/user/reports', label: 'My Reports', icon: <ClipboardList size={16} style={{ color: 'inherit' }} /> },
    { path: '/user/alerts', label: 'Alerts', icon: <Bell size={16} style={{ color: 'inherit' }} /> },
    { path: '/user/profile', label: 'Profile', icon: <User size={16} style={{ color: 'inherit' }} /> },
  ],
  relief_admin: [
    { path: '/relief/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} style={{ color: 'inherit' }} /> },
    { path: '/relief/incidents', label: 'Incidents', icon: <Siren size={16} style={{ color: 'inherit' }} /> },
    { path: '/relief/alerts', label: 'Alerts', icon: <Radio size={16} style={{ color: 'inherit' }} /> },
    { path: '/relief/reports', label: 'Reports', icon: <FileText size={16} style={{ color: 'inherit' }} /> },
  ],
  field_unit: [
    { path: '/field/mission', label: 'Mission', icon: <Target size={16} style={{ color: 'inherit' }} /> },
    { path: '/field/incidents', label: 'Incidents', icon: <Zap size={16} style={{ color: 'inherit' }} /> },
    { path: '/field/updates', label: 'Updates', icon: <ScrollText size={16} style={{ color: 'inherit' }} /> },
    { path: '/field/profile', label: 'Profile', icon: <User size={16} style={{ color: 'inherit' }} /> },
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

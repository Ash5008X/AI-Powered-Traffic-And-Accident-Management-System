import React, { useState, useEffect } from 'react';
import { Settings2, Lock } from 'lucide-react';
import UserNavbar from '../../components/Navbar/UserNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import StatusToggle from '../../components/Common/StatusToggle';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Common/Toast';
import api from '../../services/api';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState({ notifications: true, smsUpdates: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.preferences) setPrefs(user.preferences);
  }, [user]);

  const handleToggle = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setSaving(true);
    try {
      await api.patch('/users/preferences', newPrefs);
      showToast('Preferences updated', 'success');
    } catch (err) { showToast('Failed to save', 'error'); setPrefs(prefs); } finally { setSaving(false); }
  };

  return (
    <div className="user-profile-page">
      <UserNavbar />
      <main className="profile-content">
        <div className="profile-card card">
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <h1 className="text-heading profile-name">{user?.name?.toUpperCase()}</h1>
          <span className="text-mono profile-email">{user?.email}</span>
          <span className="badge-pill profile-role" style={{ background: 'rgba(46,196,182,0.15)', color: 'var(--color-accent)', marginTop: 8 }}>{user?.role?.toUpperCase()}</span>
        </div>

        <div className="profile-section card">
          <h2 className="section-title text-heading"><Settings2 size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> PREFERENCES</h2>
          <div className="pref-item">
            <div>
              <span className="pref-label">Push Notifications</span>
              <span className="pref-desc">Receive alerts for nearby incidents</span>
            </div>
            <StatusToggle isOn={prefs.notifications} onToggle={() => handleToggle('notifications')} labelOn="ON" labelOff="OFF" disabled={saving} />
          </div>
          <div className="pref-item">
            <div>
              <span className="pref-label">SMS Updates</span>
              <span className="pref-desc">Get critical alerts via SMS</span>
            </div>
            <StatusToggle isOn={prefs.smsUpdates} onToggle={() => handleToggle('smsUpdates')} labelOn="ON" labelOff="OFF" disabled={saving} />
          </div>
        </div>

        <div className="profile-section card">
          <h2 className="section-title text-heading"><Lock size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> ACCOUNT</h2>
          <button className="btn btn-danger logout-btn" onClick={logout}>LOGOUT</button>
        </div>
      </main>
      <BottomTabBar role="user" />
    </div>
  );
}

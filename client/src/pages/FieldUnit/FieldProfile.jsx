import React, { useState, useEffect } from 'react';
import FieldNavbar from '../../components/Navbar/FieldNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import StatusToggle from '../../components/Common/StatusToggle';
import StatChip from '../../components/Common/StatChip';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Common/Toast';
import api from '../../services/api';
import './FieldProfile.css';

export default function FieldProfile() {
  const { user, logout } = useAuth();
  const [unit, setUnit] = useState(null);
  const [onDuty, setOnDuty] = useState(true);

  useEffect(() => {
    loadUnit();
  }, []);

  const loadUnit = async () => {
    try {
      const res = await api.get(`/field-units/${user._id}`);
      setUnit(res.data);
      setOnDuty(res.data?.status !== 'off_duty');
    } catch (err) { console.error(err); }
  };

  const handleToggleDuty = async () => {
    const newStatus = onDuty ? 'off_duty' : 'available';
    try {
      await api.patch(`/field-units/${user._id}/status`, { status: newStatus });
      setOnDuty(!onDuty);
      showToast(`Status: ${newStatus.replace('_', ' ').toUpperCase()}`, onDuty ? 'warning' : 'success');
    } catch (err) { showToast('Failed', 'error'); }
  };

  return (
    <div className="field-profile-page">
      <FieldNavbar />
      <main className="field-profile-content">
        <div className="profile-card card">
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <h1 className="text-heading profile-name">{user?.name?.toUpperCase()}</h1>
          <span className="text-mono profile-email">{user?.email}</span>
          <span className="badge-pill" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--color-high)', marginTop: 8, fontSize: 10 }}>FIELD UNIT</span>
          {unit && <span className="text-mono" style={{ fontSize: 11, color: 'var(--color-info)', marginTop: 4 }}>{unit.unitId}</span>}
        </div>

        {unit && (
          <div className="field-stats-grid">
            <StatChip label="Status" value={unit.status?.replace('_', ' ').toUpperCase()} color={onDuty ? 'var(--color-active)' : 'var(--color-inactive)'} />
            <StatChip label="Missions Today" value={unit.missionsToday} color="var(--color-info)" icon="🎯" />
          </div>
        )}

        <div className="profile-section card">
          <h2 className="section-title text-heading">⚙️ DUTY STATUS</h2>
          <div className="pref-item">
            <div>
              <span className="pref-label">On Duty / Off Duty</span>
              <span className="pref-desc">Toggle your availability</span>
            </div>
            <StatusToggle isOn={onDuty} onToggle={handleToggleDuty} />
          </div>
        </div>

        <div className="profile-section card">
          <h2 className="section-title text-heading">🔒 ACCOUNT</h2>
          <button className="btn btn-danger logout-btn" onClick={logout}>LOGOUT</button>
        </div>
      </main>
      <BottomTabBar role="field_unit" />
    </div>
  );
}

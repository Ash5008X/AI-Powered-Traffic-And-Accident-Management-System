import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import UserNavbar from '../../components/Navbar/UserNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import AlertCard from '../../components/AlertCard/AlertCard';
import IncidentCard from '../../components/IncidentCard/IncidentCard';
import StatChip from '../../components/Common/StatChip';
import SkeletonLoader from '../../components/Common/SkeletonLoader';
import { showToast } from '../../components/Common/Toast';
import api from '../../services/api';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ type: 'accident', severity: 'medium', description: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    if (socket) {
      socket.on('alert:broadcast', (alert) => { setAlerts(prev => [alert, ...prev]); showToast('New alert received!', 'warning'); });
      socket.on('incident:new', (inc) => { setNearby(prev => [inc, ...prev]); });
      return () => { socket.off('alert:broadcast'); socket.off('incident:new'); };
    }
  }, [socket]);

  const loadData = async () => {
    try {
      const [alertRes, nearbyRes] = await Promise.all([
        api.get('/alerts/active'),
        api.get('/incidents/nearby?lat=19.076&lng=72.877&radius=50'),
      ]);
      setAlerts(alertRes.data);
      setNearby(nearbyRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/incidents', {
        type: reportForm.type, severity: reportForm.severity, description: reportForm.description,
        location: { lat: 19.076 + (Math.random() - 0.5) * 0.1, lng: 72.877 + (Math.random() - 0.5) * 0.1, address: reportForm.address || 'Mumbai, India' },
      });
      if (socket) socket.emit('incident:report', res.data);
      showToast('Incident reported successfully!', 'success');
      setShowReportModal(false);
      setReportForm({ type: 'accident', severity: 'medium', description: '', address: '' });
      loadData();
    } catch (err) { showToast('Failed to report incident', 'error'); } finally { setSubmitting(false); }
  };

  const handleSafe = async (incidentId) => {
    try {
      await api.patch(`/incidents/${incidentId}/dismiss`);
      showToast('Marked as safe', 'success');
      setNearby(prev => prev.filter(i => i._id !== incidentId));
    } catch (err) { showToast('Failed', 'error'); }
  };

  return (
    <div className="user-home-page">
      <UserNavbar />
      <main className="user-home-content">
        <header className="user-home-header">
          <div>
            <h1 className="text-heading user-greeting">WELCOME BACK, {user?.name?.toUpperCase()}</h1>
            <p className="user-greeting-sub">Stay informed. Stay safe.</p>
          </div>
          <button id="report-accident-btn" className="btn btn-danger report-btn" onClick={() => setShowReportModal(true)}>🚨 REPORT ACCIDENT</button>
        </header>

        <div className="user-home-grid">
          <section className="user-home-section">
            <h2 className="section-title text-heading">📡 ACTIVE ALERTS</h2>
            {loading ? <SkeletonLoader lines={4} /> : alerts.length === 0 ? (
              <div className="empty-state">No active alerts in your area</div>
            ) : (
              <div className="alerts-list">{alerts.slice(0, 5).map(a => <AlertCard key={a._id} alert={a} />)}</div>
            )}
          </section>

          <section className="user-home-section">
            <h2 className="section-title text-heading">🔴 NEARBY INCIDENTS</h2>
            {loading ? <SkeletonLoader lines={4} /> : nearby.length === 0 ? (
              <div className="empty-state">No incidents nearby</div>
            ) : (
              <div className="incidents-list">
                {nearby.slice(0, 5).map(inc => (
                  <IncidentCard key={inc._id} incident={inc} actions={
                    inc.status !== 'resolved' && inc.status !== 'dismissed' && (
                      <button className="btn btn-success" onClick={() => handleSafe(inc._id)}>✓ I'M SAFE</button>
                    )
                  } />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="user-home-section stats-section">
          <h2 className="section-title text-heading">📊 AREA OVERVIEW</h2>
          <div className="stats-grid">
            <StatChip label="Active Alerts" value={alerts.length} color="var(--color-medium)" icon="📡" />
            <StatChip label="Nearby Incidents" value={nearby.length} color="var(--color-critical)" icon="🔴" />
            <StatChip label="Critical" value={nearby.filter(n => n.severity === 'critical').length} color="var(--color-critical)" icon="⚠️" />
            <StatChip label="Resolved Today" value={nearby.filter(n => n.status === 'resolved').length} color="var(--color-resolved)" icon="✅" />
          </div>
        </section>
      </main>

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">🚨 REPORT AN INCIDENT</h2>
            <form className="report-form" onSubmit={handleReport}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="select-field" value={reportForm.type} onChange={e => setReportForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="accident">🚗 Accident</option>
                  <option value="congestion">🚧 Congestion</option>
                  <option value="hazard">⚠️ Hazard</option>
                  <option value="medical">🏥 Medical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="select-field" value={reportForm.severity} onChange={e => setReportForm(p => ({ ...p, severity: e.target.value }))}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location / Address</label>
                <input className="input-field" placeholder="e.g. NH-48, Andheri East" value={reportForm.address} onChange={e => setReportForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input-field" placeholder="Describe what happened..." value={reportForm.description} onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={submitting}>{submitting ? 'REPORTING...' : '🚨 REPORT'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomTabBar role="user" />
    </div>
  );
}

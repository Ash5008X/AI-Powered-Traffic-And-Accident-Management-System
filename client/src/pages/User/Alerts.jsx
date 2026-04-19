import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import UserNavbar from '../../components/Navbar/UserNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import AlertCard from '../../components/AlertCard/AlertCard';
import SkeletonLoader from '../../components/Common/SkeletonLoader';
import { useSocket } from '../../context/SocketContext';
import { showToast } from '../../components/Common/Toast';
import api from '../../services/api';
import './Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    loadAlerts();
    if (socket) {
      socket.on('alert:broadcast', (alert) => { setAlerts(prev => [alert, ...prev]); showToast('New alert!', 'warning'); });
      socket.on('alert:cancelled', (alert) => { setAlerts(prev => prev.map(a => a._id === alert._id ? { ...a, active: false } : a)); });
      return () => { socket.off('alert:broadcast'); socket.off('alert:cancelled'); };
    }
  }, [socket]);

  const loadAlerts = async () => {
    try {
      const res = await api.get('/alerts/active');
      setAlerts(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="user-alerts-page">
      <UserNavbar />
      <main className="user-alerts-content">
        <h1 className="text-heading page-title"><Bell size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> ALERTS FEED</h1>
        <p className="page-subtitle">Real-time traffic alerts in your area</p>
        {loading ? <SkeletonLoader lines={5} /> : alerts.length === 0 ? (
          <div className="empty-state">No active alerts right now</div>
        ) : (
          <div className="alerts-feed">{alerts.map(a => <AlertCard key={a._id} alert={a} onClick={() => setSelected(a)} />)}</div>
        )}
      </main>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">ALERT DETAILS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><span className="form-label">Alert ID</span><p className="text-mono">{selected.alertId}</p></div>
              <div><span className="form-label">Type</span><p>{selected.type}</p></div>
              <div><span className="form-label">Message</span><p>{selected.message}</p></div>
              <div><span className="form-label">Zone</span><p className="text-mono">{selected.zone || 'N/A'}</p></div>
              <div><span className="form-label">Severity</span><p>{selected.severity}</p></div>
              <div><span className="form-label">Status</span><p>{selected.active ? <><CheckCircle2 size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> Active</> : <><AlertCircle size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> Cancelled</>}</p></div>
            </div>
            <button className="btn btn-ghost" onClick={() => setSelected(null)} style={{ marginTop: 16 }}>CLOSE</button>
          </div>
        </div>
      )}
      <BottomTabBar role="user" />
    </div>
  );
}

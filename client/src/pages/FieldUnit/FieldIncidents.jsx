import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import FieldNavbar from '../../components/Navbar/FieldNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import IncidentCard from '../../components/IncidentCard/IncidentCard';
import IncidentDetail from '../../components/IncidentDetail/IncidentDetail';
import SkeletonLoader from '../../components/Common/SkeletonLoader';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Common/Toast';
import api from '../../services/api';
import './FieldIncidents.css';

export default function FieldIncidents() {
  const { user } = useAuth();
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
    if (socket) {
      socket.on('incident:new', (inc) => setIncidents(prev => [inc, ...prev]));
      socket.on('incident:updated', (updated) => setIncidents(prev => prev.map(i => i._id === updated._id ? updated : i)));
      return () => { socket.off('incident:new'); socket.off('incident:updated'); };
    }
  }, [socket]);

  const loadIncidents = async () => {
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data.filter(i => i.status !== 'resolved' && i.status !== 'dismissed'));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleRequestAssignment = async (incId) => {
    try {
      await api.post(`/incidents/${incId}/request-assignment`);
      showToast('Assignment requested!', 'info');
    } catch (err) { showToast('Failed', 'error'); }
  };

  return (
    <div className="field-incidents-page">
      <FieldNavbar />
      <main className="field-incidents-content">
        <h1 className="text-heading page-title"><Zap size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> ALL INCIDENTS</h1>
        <p className="page-subtitle">Active incidents in the system</p>
        {loading ? <SkeletonLoader lines={5} /> : incidents.length === 0 ? (
          <div className="empty-state">No active incidents</div>
        ) : (
          <div className="field-incidents-list">
            {incidents.map(inc => (
              <IncidentCard key={inc._id} incident={inc} onClick={() => setSelected(inc)} actions={
                inc.status === 'pending' && <button className="btn btn-info" onClick={(e) => { e.stopPropagation(); handleRequestAssignment(inc._id); }}>REQUEST ASSIGNMENT</button>
              } />
            ))}
          </div>
        )}
      </main>
      {selected && <IncidentDetail incident={selected} onClose={() => setSelected(null)} />}
      <BottomTabBar role="field_unit" />
    </div>
  );
}

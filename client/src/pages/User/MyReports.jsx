import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import UserNavbar from '../../components/Navbar/UserNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import IncidentCard from '../../components/IncidentCard/IncidentCard';
import IncidentDetail from '../../components/IncidentDetail/IncidentDetail';
import TimelineBar from '../../components/Common/TimelineBar';
import SkeletonLoader from '../../components/Common/SkeletonLoader';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import './MyReports.css';

export default function MyReports() {
  const [incidents, setIncidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    loadReports();
    if (socket) {
      socket.on('incident:updated', (updated) => {
        setIncidents(prev => prev.map(i => i._id === updated._id ? updated : i));
        if (selected && selected._id === updated._id) setSelected(updated);
      });
      return () => socket.off('incident:updated');
    }
  }, [socket]);

  const loadReports = async () => {
    try {
      const res = await api.get('/incidents?reportedBy=me');
      setIncidents(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="myreports-page">
      <UserNavbar />
      <main className="myreports-content">
        <h1 className="text-heading page-title"><ClipboardList size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> MY REPORTS</h1>
        <p className="page-subtitle">Track incidents you've reported</p>
        {loading ? <SkeletonLoader lines={5} /> : incidents.length === 0 ? (
          <div className="empty-state">You haven't reported any incidents yet</div>
        ) : (
          <div className="reports-list">
            {incidents.map(inc => (
              <div key={inc._id} className="report-item">
                <IncidentCard incident={inc} onClick={() => setSelected(inc)} />
                <div className="report-timeline-wrap">
                  <TimelineBar status={inc.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {selected && <IncidentDetail incident={selected} onClose={() => setSelected(null)} />}
      <BottomTabBar role="user" />
    </div>
  );
}

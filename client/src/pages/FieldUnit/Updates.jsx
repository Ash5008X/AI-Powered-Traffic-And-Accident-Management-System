import React, { useState, useEffect } from 'react';
import { ScrollText, Stethoscope, AlertTriangle, Route, FileText, LifeBuoy, ClipboardList, MapPin } from 'lucide-react';
import FieldNavbar from '../../components/Navbar/FieldNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import SkeletonLoader from '../../components/Common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatISTFull } from '../../utils/timeUtils';
import api from '../../services/api';
import './Updates.css';

export default function Updates() {
  const { user } = useAuth();
  const socket = useSocket();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
    if (socket) {
      socket.on('incident:updated', () => loadUpdates());
      return () => socket.off('incident:updated');
    }
  }, [socket]);

  const loadUpdates = async () => {
    try {
      const res = await api.get(`/field-units/${user._id}/updates`);
      setUpdates(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const actionIcons = { medical: <Stethoscope size={16} style={{ color: 'inherit' }} />, hazard: <AlertTriangle size={16} style={{ color: 'inherit' }} />, road: <Route size={16} style={{ color: 'inherit' }} />, report: <FileText size={16} style={{ color: 'inherit' }} />, backup_request: <LifeBuoy size={16} style={{ color: 'inherit' }} />, assignment_request: <ClipboardList size={16} style={{ color: 'inherit' }} /> };

  return (
    <div className="field-updates-page">
      <FieldNavbar />
      <main className="field-updates-content">
        <h1 className="text-heading page-title"><ScrollText size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> MISSION UPDATES</h1>
        <p className="page-subtitle">Activity log for current mission</p>
        {loading ? <SkeletonLoader lines={5} /> : updates.length === 0 ? (
          <div className="empty-state">No updates yet — complete actions during your mission to see them here</div>
        ) : (
          <div className="updates-timeline">
            {updates.map((u, i) => (
              <div key={i} className="update-item card">
                <span className="update-icon">{actionIcons[u.type || u.actionType] || <MapPin size={16} style={{ color: 'inherit' }} />}</span>
                <div className="update-info">
                  <span className="update-type text-heading">{(u.type || u.actionType || 'action').replace('_', ' ').toUpperCase()}</span>
                  {u.details && <p className="update-details">{u.details}</p>}
                  {u.notes && <p className="update-details">{u.notes}</p>}
                  <span className="update-time text-mono">{formatISTFull(u.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomTabBar role="field_unit" />
    </div>
  );
}

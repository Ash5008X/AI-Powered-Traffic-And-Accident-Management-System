import React, { useState, useEffect, useRef } from 'react';
import FieldNavbar from '../../components/Navbar/FieldNavbar';
import BottomTabBar from '../../components/BottomTabBar/BottomTabBar';
import ChatThread from '../../components/ChatThread/ChatThread';
import SeverityBadge from '../../components/Common/SeverityBadge';
import TimelineBar from '../../components/Common/TimelineBar';
import StatusToggle from '../../components/Common/StatusToggle';
import SkeletonLoader from '../../components/Common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { showToast } from '../../components/Common/Toast';
import { formatISTFull } from '../../utils/timeUtils';
import api from '../../services/api';
import './MyMission.css';

export default function MyMission() {
  const { user } = useAuth();
  const socket = useSocket();
  const [unit, setUnit] = useState(null);
  const [mission, setMission] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onDuty, setOnDuty] = useState(true);
  const [eta, setEta] = useState(12);
  const etaRef = useRef(null);

  useEffect(() => {
    loadMission();
    const locInterval = setInterval(() => {
      if (socket && unit) {
        socket.emit('unit:updateLocation', { unitId: unit._id, lat: 19.076 + (Math.random() - 0.5) * 0.01, lng: 72.877 + (Math.random() - 0.5) * 0.01 });
      }
    }, 30000);
    return () => clearInterval(locInterval);
  }, [socket, unit]);

  useEffect(() => {
    if (mission && mission.status === 'en_route') {
      etaRef.current = setInterval(() => setEta(prev => Math.max(0, prev - 1 / 60)), 1000);
      return () => clearInterval(etaRef.current);
    }
  }, [mission?.status]);

  useEffect(() => {
    if (socket) {
      socket.on('incident:updated', (updated) => { if (mission && mission._id === updated._id) setMission(updated); });
      socket.on('chat:message', (msg) => { if (mission && msg.incidentId === mission._id) setChatMessages(prev => [...prev, msg]); });
      return () => { socket.off('incident:updated'); socket.off('chat:message'); };
    }
  }, [socket, mission]);

  const loadMission = async () => {
    try {
      const unitRes = await api.get(`/field-units/${user._id}`);
      setUnit(unitRes.data);
      setOnDuty(unitRes.data?.status !== 'off_duty');
      if (unitRes.data?.currentIncident) {
        const incRes = await api.get(`/field-units/${user._id}/assigned`);
        if (incRes.data) { setMission(incRes.data); setChatMessages(incRes.data.chat || []); if (socket) socket.emit('join:incident', { incidentId: incRes.data._id }); }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleArrived = async () => {
    try {
      await api.patch(`/field-units/${user._id}/arrived`);
      if (socket) socket.emit('unit:arrived', { incidentId: mission._id, unitId: unit?._id });
      showToast('Arrival confirmed!', 'success');
      loadMission();
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleBackup = async () => {
    try {
      await api.post(`/incidents/${mission._id}/backup-request`);
      showToast('Backup requested!', 'info');
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleAction = async (actionType) => {
    try {
      await api.post(`/incidents/${mission._id}/actions`, { actionType, type: actionType });
      showToast(`${actionType.toUpperCase()} logged`, 'success');
      loadMission();
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleResolve = async () => {
    try {
      await api.patch(`/incidents/${mission._id}/status`, { status: 'resolved' });
      if (socket) socket.emit('incident:markResolved', { incidentId: mission._id });
      showToast('Incident resolved!', 'success');
      setMission(null);
      loadMission();
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleFileReport = async () => {
    const notes = prompt('Enter report notes:');
    if (!notes) return;
    try {
      await api.post(`/incidents/${mission._id}/actions`, { actionType: 'report', type: 'report', notes });
      showToast('Report filed', 'success');
      loadMission();
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleToggleDuty = async () => {
    const newStatus = onDuty ? 'off_duty' : 'available';
    try {
      await api.patch(`/field-units/${user._id}/status`, { status: newStatus });
      setOnDuty(!onDuty);
      showToast(`Status: ${newStatus.replace('_', ' ').toUpperCase()}`, onDuty ? 'warning' : 'success');
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleSendChat = async (message) => {
    if (!mission) return;
    try {
      await api.post(`/incidents/${mission._id}/chat`, { message, senderRole: user.role });
      if (socket) socket.emit('chat:send', { incidentId: mission._id, message, senderRole: user.role });
    } catch (err) { showToast('Failed', 'error'); }
  };

  if (loading) return (<div className="field-mission-page"><FieldNavbar /><main style={{ padding: 20 }}><SkeletonLoader lines={6} /></main></div>);

  return (
    <div className="field-mission-page">
      <FieldNavbar />
      <main className="mission-content">
        <div className="mission-header">
          <div>
            <h1 className="text-heading page-title">🎯 MY MISSION</h1>
            {unit && <span className="text-mono" style={{ fontSize: 11, color: 'var(--color-info)' }}>{unit.unitId}</span>}
          </div>
        </div>

        {!mission ? (
          <div className="no-mission card">
            <span style={{ fontSize: 48 }}>✅</span>
            <h2 className="text-heading" style={{ fontSize: 18 }}>NO ACTIVE MISSION</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Awaiting assignment from relief center</p>
          </div>
        ) : (
          <div className="mission-layout">
            <div className="mission-info card">
              <div className="mission-info-header">
                <span className="text-mono mission-id">{mission.incidentId}</span>
                <SeverityBadge severity={mission.severity} />
              </div>
              <h2 className="text-heading" style={{ fontSize: 18, marginBottom: 8 }}>{mission.type?.toUpperCase()} INCIDENT</h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>{mission.description}</p>
              <div style={{ marginBottom: 12 }}><span className="text-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>📍 {mission.location?.address || 'Location pending'}</span></div>
              <TimelineBar status={mission.status} />

              {mission.status === 'en_route' && (
                <div className="eta-display card-elevated" style={{ marginTop: 16, padding: 16, textAlign: 'center' }}>
                  <span className="form-label">ETA</span>
                  <span className="text-heading" style={{ fontSize: 32, color: 'var(--color-accent)' }}>{Math.floor(eta)}:{String(Math.floor((eta % 1) * 60)).padStart(2, '0')}</span>
                </div>
              )}

              <div className="mission-actions">
                {['assigned', 'en_route'].includes(mission.status) && <button className="btn btn-primary" onClick={handleArrived}>📍 I HAVE ARRIVED</button>}
                <button className="btn btn-warning" onClick={handleBackup}>🆘 REQUEST BACKUP</button>
                {mission.status === 'on_site' && (
                  <>
                    <button className="btn btn-info" onClick={() => handleAction('medical')}>🏥 MEDICAL AID GIVEN</button>
                    <button className="btn btn-warning" onClick={() => handleAction('hazard')}>⚠️ HAZARD CONTAINED</button>
                    <button className="btn btn-ghost" onClick={() => handleAction('road')}>🛣️ ROAD CLEARED</button>
                    <button className="btn btn-ghost" onClick={handleFileReport}>📝 FILE REPORT</button>
                    <button className="btn btn-success" onClick={handleResolve}>✅ MARK INCIDENT RESOLVED</button>
                  </>
                )}
              </div>
            </div>

            <div className="mission-chat card">
              <h3 className="text-heading" style={{ fontSize: 13, padding: '12px 16px 0' }}>💬 INCIDENT COMMS</h3>
              <ChatThread messages={chatMessages} onSend={handleSendChat} />
            </div>
          </div>
        )}
      </main>
      <BottomTabBar role="field_unit" />
    </div>
  );
}

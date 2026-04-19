import React from 'react';
import SeverityBadge from '../Common/SeverityBadge';
import TimelineBar from '../Common/TimelineBar';
import { formatISTFull } from '../../utils/timeUtils';
import './IncidentDetail.css';

export default function IncidentDetail({ incident, onClose, children }) {
  if (!incident) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content incident-detail" onClick={e => e.stopPropagation()}>
        <div className="incident-detail-header">
          <div>
            <span className="text-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{incident.incidentId}</span>
            <h2 className="modal-title">{incident.type?.toUpperCase()} INCIDENT</h2>
          </div>
          <SeverityBadge severity={incident.severity} />
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 10px', minHeight: 32 }}>✕</button>
        </div>
        <TimelineBar status={incident.status} />
        <div className="incident-detail-body">
          <div className="detail-row">
            <span className="detail-label">Location</span>
            <span className="detail-value text-mono">{incident.location?.address || `${incident.location?.lat?.toFixed(4)}, ${incident.location?.lng?.toFixed(4)}`}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Description</span>
            <span className="detail-value">{incident.description || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reported</span>
            <span className="detail-value text-mono">{formatISTFull(incident.createdAt)}</span>
          </div>
          {incident.resources?.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Resources</span>
              <div className="detail-resources">{incident.resources.map((r, i) => <span key={i} className="badge-pill resource-pill">{r}</span>)}</div>
            </div>
          )}
          {incident.actions?.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Actions Log</span>
              <div className="actions-log">
                {incident.actions.map((a, i) => (
                  <div key={i} className="action-entry">
                    <span className="action-type text-mono">{a.type || a.actionType}</span>
                    <span className="action-time text-mono">{formatISTFull(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {children && <div className="incident-detail-actions">{children}</div>}
      </div>
    </div>
  );
}

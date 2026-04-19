import React from 'react';
import SeverityBadge from '../Common/SeverityBadge';
import { timeAgo } from '../../utils/timeUtils';
import './AlertCard.css';

const typeIcons = { accident: '🚗', congestion: '🚧', route_update: '🔄', system: '⚙️', all_clear: '✅' };

export default function AlertCard({ alert, onClick }) {
  return (
    <div className={`alert-card card severity-border-${alert.severity || 'medium'}`} onClick={onClick}>
      <div className="alert-card-header">
        <span className="alert-type-icon">{typeIcons[alert.type] || '📡'}</span>
        <div className="alert-card-meta">
          <span className="alert-id text-mono">{alert.alertId}</span>
          <span className="alert-time text-mono">{timeAgo(alert.createdAt)}</span>
        </div>
        <SeverityBadge severity={alert.severity || 'medium'} />
      </div>
      <p className="alert-message">{alert.message}</p>
      {alert.zone && <span className="alert-zone text-mono">ZONE: {alert.zone}</span>}
      {!alert.active && <span className="alert-inactive badge-pill">CANCELLED</span>}
    </div>
  );
}
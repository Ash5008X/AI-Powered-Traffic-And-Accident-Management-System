import React from 'react';
import SeverityBadge from '../Common/SeverityBadge';
import { Car, TrafficCone, RefreshCw, Settings2, CheckCircle2, Radio } from 'lucide-react';
import { timeAgo } from '../../utils/timeUtils';
import './AlertCard.css';

const typeIcons = { accident: <Car size={16} style={{ color: 'inherit' }} />, congestion: <TrafficCone size={16} style={{ color: 'inherit' }} />, route_update: <RefreshCw size={16} style={{ color: 'inherit' }} />, system: <Settings2 size={16} style={{ color: 'inherit' }} />, all_clear: <CheckCircle2 size={16} style={{ color: 'inherit' }} /> };

export default function AlertCard({ alert, onClick }) {
  return (
    <div className={`alert-card card severity-border-${alert.severity || 'medium'}`} onClick={onClick}>
      <div className="alert-card-header">
        <span className="alert-type-icon">{typeIcons[alert.type] || <Radio size={16} style={{ color: 'inherit' }} />}</span>
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
import React from 'react';
import SeverityBadge from '../Common/SeverityBadge';
import { Car, TrafficCone, AlertTriangle, Stethoscope, AlertCircle, MapPin } from 'lucide-react';
import { timeAgo } from '../../utils/timeUtils';
import './IncidentCard.css';

const typeIcons = { accident: <Car size={16} style={{ color: 'inherit' }} />, congestion: <TrafficCone size={16} style={{ color: 'inherit' }} />, hazard: <AlertTriangle size={16} style={{ color: 'inherit' }} />, medical: <Stethoscope size={16} style={{ color: 'inherit' }} /> };
const statusLabels = { pending: 'PENDING', assigned: 'ASSIGNED', en_route: 'EN ROUTE', on_site: 'ON SITE', resolved: 'RESOLVED', dismissed: 'DISMISSED' };

export default function IncidentCard({ incident, onClick, actions }) {
  return (
    <div className={`incident-card card severity-border-${incident.severity}`} onClick={onClick}>
      <div className="incident-card-header">
        <span className="incident-type-icon">{typeIcons[incident.type] || <AlertCircle size={16} style={{ color: 'inherit' }} />}</span>
        <div className="incident-card-info">
          <span className="incident-id text-mono">{incident.incidentId}</span>
          <span className="incident-type text-heading">{incident.type?.toUpperCase()}</span>
        </div>
        <SeverityBadge severity={incident.severity} />
      </div>
      <p className="incident-desc">{incident.description || 'No description provided'}</p>
      <div className="incident-card-footer">
        <span className="incident-location text-mono"><MapPin size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }} /> {incident.location?.address || `${incident.location?.lat?.toFixed(4)}, ${incident.location?.lng?.toFixed(4)}`}</span>
        <div className="incident-card-row">
          <span className={`incident-status badge-pill status-${incident.status}`}>{statusLabels[incident.status] || incident.status}</span>
          <span className="incident-time text-mono">{timeAgo(incident.createdAt)}</span>
        </div>
      </div>
      {actions && <div className="incident-card-actions" onClick={e => e.stopPropagation()}>{actions}</div>}
    </div>
  );
}

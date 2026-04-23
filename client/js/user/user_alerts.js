(() => {
  // DOM Elements
  const activeAlertsList = document.getElementById('active-alerts-list');
  const activeAlertsCount = document.getElementById('active-alerts-count');
  const pastAlertsList = document.getElementById('past-alerts-list');

  const statAccident = document.getElementById('stat-accident');
  const statCongestion = document.getElementById('stat-congestion');
  const statRoute = document.getElementById('stat-route');
  const statSystem = document.getElementById('stat-system');

  const detailEmpty = document.getElementById('alert-detail-empty');
  const detailPanel = document.getElementById('alert-detail-panel');
  const detailPriority = document.getElementById('alert-detail-priority');
  const detailRef = document.getElementById('alert-detail-ref');
  const detailTitle = document.getElementById('alert-detail-title');
  const detailCoords = document.getElementById('alert-detail-coords');
  const detailDesc = document.getElementById('alert-detail-desc');
  const detailTime = document.getElementById('alert-detail-time');
  const detailDist = document.getElementById('alert-detail-dist');
  const detailSeverity = document.getElementById('alert-detail-severity');
  const detailCloseBtn = document.getElementById('alert-detail-close-btn');

  // Filter Chips
  const chips = document.querySelectorAll('.filter-bar .chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Mock User Location (Sector 01)
  const USER_LOCATION = { lat: 34.053, lng: -118.241 };

  // Helpers
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('nexustraffic_auth'))?.token; } catch { return null; }
  };

  const getUserId = () => {
    try { return JSON.parse(localStorage.getItem('nexustraffic_auth'))?.user?._id; } catch { return null; }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return `${d.toISOString().split('T')[1].substring(0, 8)} UTC`;
  };

  const categorizeType = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('accident')) return 'accident';
    if (t.includes('congestion')) return 'congestion';
    if (t.includes('route')) return 'route';
    return 'system';
  };

  const getTypeColor = (category) => {
    switch(category) {
      case 'accident': return '#FF6B35';
      case 'congestion': return '#FFB830';
      case 'route': return '#3A86FF';
      case 'system': return '#BF5AF2';
      default: return '#BF5AF2';
    }
  };

  let allNearbyAlerts = [];

  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/incidents', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch incidents');
      const allIncidents = await res.json();
      const myId = getUserId();

      // Filter: Within 2km AND NOT reported by me
      allNearbyAlerts = allIncidents.filter(inc => {
        if (inc.reportedBy === myId) return false;
        if (!inc.location || !inc.location.lat) return false;
        const dist = haversine(USER_LOCATION.lat, USER_LOCATION.lng, inc.location.lat, inc.location.lng);
        if (dist <= 2) {
          inc.distanceKm = dist; // attach distance
          return true;
        }
        return false;
      });

      // Sort newest first
      allNearbyAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const activeAlerts = allNearbyAlerts.filter(r => ['pending', 'assigned', 'en_route'].includes(r.status));
      const pastAlerts = allNearbyAlerts.filter(r => ['resolved', 'dismissed'].includes(r.status));

      // Calculate Stats Today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayAlerts = allNearbyAlerts.filter(r => new Date(r.createdAt) >= todayStart);
      
      let counts = { accident: 0, congestion: 0, route: 0, system: 0 };
      todayAlerts.forEach(a => counts[categorizeType(a.type)]++);

      statAccident.textContent = counts.accident.toString().padStart(2, '0');
      statCongestion.textContent = counts.congestion.toString().padStart(2, '0');
      statRoute.textContent = counts.route.toString().padStart(2, '0');
      statSystem.textContent = counts.system.toString().padStart(2, '0');

      activeAlertsCount.textContent = activeAlerts.length.toString();

      renderActiveAlerts(activeAlerts);
      renderPastAlerts(pastAlerts);

    } catch (err) {
      console.error(err);
      activeAlertsList.innerHTML = `<div style="color:var(--critical);">Failed to load alerts.</div>`;
    }
  };

  const showDetail = (alert) => {
    detailEmpty.style.display = 'none';
    detailPanel.style.display = 'block';

    const category = categorizeType(alert.type);
    detailPriority.textContent = `${(alert.type || 'System').toUpperCase()}_${(alert.severity || 'Normal').toUpperCase()}`;
    detailPriority.className = `detail-priority-badge badge-${category}`;

    detailRef.textContent = `INCIDENT_LOG // ${alert.incidentId || 'SYS-000'}`;
    detailTitle.textContent = `${alert.type} — ${alert.location?.address || 'Unknown'}`;
    detailCoords.textContent = `${alert.location?.lat || 0}° N, ${alert.location?.lng || 0}° W`;
    detailDesc.textContent = alert.description || 'No additional details provided.';
    
    detailTime.textContent = formatDate(alert.createdAt);
    detailDist.textContent = alert.distanceKm ? `${alert.distanceKm.toFixed(1)} km away` : 'Nearby';
    detailSeverity.textContent = (alert.severity || 'Normal').charAt(0).toUpperCase() + (alert.severity || 'Normal').slice(1);
    detailSeverity.style.color = getTypeColor(category);
  };

  detailCloseBtn.addEventListener('click', () => {
    detailPanel.style.display = 'none';
    detailEmpty.style.display = 'flex';
  });

  const renderActiveAlerts = (alerts) => {
    if (alerts.length === 0) {
      activeAlertsList.innerHTML = `<div style="opacity:0.5;grid-column:1/-1;">No active nearby alerts.</div>`;
      return;
    }

    const html = alerts.map(alert => {
      const cat = categorizeType(alert.type);
      const distStr = alert.distanceKm ? `${alert.distanceKm.toFixed(1)} km away` : 'Nearby';

      return `
        <div class="alert-card accent-${cat}" data-id="${alert._id}" style="cursor:pointer;">
          <span class="alert-type-badge badge-${cat}">${alert.type}</span>
          <div class="alert-card-title">${alert.type} — ${alert.location?.address || 'Unknown'}</div>
          <div class="alert-sector" style="color:${getTypeColor(cat)};">Priority ${alert.severity || 'Normal'} // System</div>
          <div class="alert-card-body">${alert.description || 'No description provided.'}</div>
          <div class="alert-card-footer">
            <span class="alert-dist">${distStr}</span>
            <span class="alert-time">${formatDate(alert.createdAt)}</span>
          </div>
        </div>
      `;
    }).join('');

    activeAlertsList.innerHTML = html;

    activeAlertsList.querySelectorAll('.alert-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const alert = allNearbyAlerts.find(x => x._id === id);
        if (alert) showDetail(alert);
      });
    });
  };

  const renderPastAlerts = (alerts) => {
    if (alerts.length === 0) {
      pastAlertsList.innerHTML = `<div style="opacity:0.5;">No past alerts earlier today.</div>`;
      return;
    }

    const html = alerts.map(alert => {
      const isDismissed = alert.status === 'dismissed';
      const label = isDismissed ? 'Dismissed' : 'Cleared_Success';
      const pill = isDismissed ? 'Dismissed' : 'Cleared';

      return `
        <div class="cleared-row" data-id="${alert._id}" style="cursor:pointer;">
          <div>
            <div class="cleared-title">${alert.type} — ${alert.location?.address || 'Unknown'} // ${pill}</div>
            <div class="cleared-meta">
              <span class="cleared-status" style="color:${isDismissed ? 'var(--text-muted)' : 'var(--success)'}">${label}</span>
              <span class="cleared-time">${formatDate(alert.createdAt)}</span>
            </div>
          </div>
          <span class="pill-cleared" style="border-color:${isDismissed ? 'var(--text-muted)' : 'var(--success)'}; color:${isDismissed ? 'var(--text-muted)' : 'var(--success)'};">${pill}</span>
        </div>
      `;
    }).join('');

    pastAlertsList.innerHTML = html;

    pastAlertsList.querySelectorAll('.cleared-row').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const alert = allNearbyAlerts.find(x => x._id === id);
        if (alert) showDetail(alert);
      });
    });
  };

  loadAlerts();
})();

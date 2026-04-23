document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statTotal = document.getElementById('stat-total');
  const statActive = document.getElementById('stat-active');
  const statResolved = document.getElementById('stat-resolved');
  const activeReportsCount = document.getElementById('active-reports-count');
  const activeReportsList = document.getElementById('active-reports-list');
  const pastReportsList = document.getElementById('past-reports-list');

  const reportDetailEmpty = document.getElementById('report-detail-empty');
  const reportDetailPanel = document.getElementById('report-detail-panel');
  const detailTicketId = document.getElementById('detail-ticket-id');
  const detailTitle = document.getElementById('detail-title');
  const detailCoords = document.getElementById('detail-coords');
  const detailType = document.getElementById('detail-type');
  const detailSeverity = document.getElementById('detail-severity');
  const detailDesc = document.getElementById('detail-desc');
  const detailCloseBtn = document.getElementById('detail-close-btn');

  // Helpers
  const getToken = () => {
    try {
      return JSON.parse(localStorage.getItem('nexustraffic_auth'))?.token;
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return `${date.toISOString().split('T')[0]} · ${date.toISOString().split('T')[1].substring(0, 8)} UTC`;
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'assigned': return 'in-progress';
      case 'en_route': return 'en-route';
      case 'resolved': return 'resolved';
      case 'dismissed': return 'dismissed';
      default: return 'pending';
    }
  };

  let allReports = [];

  const loadReports = async () => {
    try {
      const res = await fetch('/api/incidents?reportedBy=me', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      
      allReports = await res.json();
      
      // Sort newest first
      allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const activeReports = allReports.filter(r => ['pending', 'assigned', 'en_route'].includes(r.status));
      const pastReports = allReports.filter(r => ['resolved', 'dismissed'].includes(r.status));
      const resolvedReports = pastReports.filter(r => r.status === 'resolved');

      // Update Stats
      statTotal.textContent = allReports.length.toString().padStart(2, '0');
      statActive.textContent = activeReports.length.toString().padStart(2, '0');
      statResolved.textContent = resolvedReports.length.toString().padStart(2, '0');
      activeReportsCount.textContent = activeReports.length.toString();

      // Render Lists
      renderActiveReports(activeReports);
      renderPastReports(pastReports);

    } catch (err) {
      console.error('Error loading reports:', err);
      activeReportsList.innerHTML = `<div style="color: var(--critical);">Failed to load active reports.</div>`;
      pastReportsList.innerHTML = `<div style="color: var(--critical);">Failed to load past reports.</div>`;
    }
  };

  const showReportDetail = (report) => {
    reportDetailEmpty.style.display = 'none';
    reportDetailPanel.style.display = 'block';

    detailTicketId.textContent = `TICKET_ID // ${report.incidentId || '---'}`;
    detailTitle.textContent = `${report.type} — ${report.location?.address || 'Unknown Location'}`;
    detailCoords.textContent = `GEO_LOC // ${report.location?.lat || 0}° N, ${report.location?.lng || 0}° W`;
    
    detailType.textContent = (report.type || 'Unknown').toUpperCase();
    detailSeverity.textContent = (report.severity || 'Unknown').toUpperCase();
    detailDesc.textContent = report.description || 'No description provided.';
  };

  detailCloseBtn.addEventListener('click', () => {
    reportDetailPanel.style.display = 'none';
    reportDetailEmpty.style.display = 'flex';
  });

  const renderActiveReports = (reports) => {
    if (reports.length === 0) {
      activeReportsList.innerHTML = `<div style="opacity: 0.5; padding: 20px 0;">No active reports found.</div>`;
      return;
    }

    const html = reports.map((report, idx) => {
      const sevClass = getSeverityClass(report.severity);
      const statClass = getStatusClass(report.status);
      const statLabel = (report.status || 'pending').replace('_', ' ').toUpperCase();
      
      const steps = ['pending', 'assigned', 'en_route', 'resolved'];
      let currentStepIdx = steps.indexOf(report.status);
      if (currentStepIdx === -1) currentStepIdx = 0;

      // Build Progress Row
      let progressRowHtml = '<div class="progress-row">';
      const stepLabels = ['Reported', "Ack'd", 'En Route', 'Resolved'];
      const stepIcons = ['check', 'check', 'local_shipping', 'task_alt'];

      for (let i = 0; i < 4; i++) {
        let dotStatus = 'pending';
        let lineStatus = 'pending';
        
        if (i < currentStepIdx) {
          dotStatus = 'done';
          lineStatus = 'done';
        } else if (i === currentStepIdx) {
          dotStatus = 'active';
        }

        progressRowHtml += `
          <div class="prog-step">
            <div class="prog-dot ${dotStatus}"><span class="material-symbols-outlined">${stepIcons[i]}</span></div>
            <span class="prog-label ${dotStatus}">${stepLabels[i]}</span>
          </div>
        `;
        
        if (i < 3) {
          progressRowHtml += `<div class="prog-line ${lineStatus}"></div>`;
        }
      }
      progressRowHtml += '</div>';

      return `
        <div class="card report-card ${sevClass}" style="margin-bottom: 12px; cursor: pointer;" data-id="${report._id}">
          <div class="report-card-top">
            <span class="ticket-id">TICKET_ID // ${report.incidentId || '---'}</span>
            <span class="status-badge ${statClass}">${statLabel}</span>
          </div>
          <div class="report-title">${report.type} — ${report.location?.address || 'Unknown'}</div>
          <div class="report-meta">
            <span class="meta-item">COORD // ${report.location?.lat || 0}°, ${report.location?.lng || 0}°</span>
            <span class="meta-item muted">SUBMITTED // ${formatDate(report.createdAt)}</span>
          </div>
          <p class="report-body">${report.description || 'No description provided.'}</p>
          ${progressRowHtml}
        </div>
      `;
    }).join('');

    activeReportsList.innerHTML = html;

    // Attach click events
    activeReportsList.querySelectorAll('.report-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const r = allReports.find(x => x._id === id);
        if (r) showReportDetail(r);
      });
    });
  };

  const renderPastReports = (reports) => {
    if (reports.length === 0) {
      pastReportsList.innerHTML = `<div style="opacity: 0.5; padding: 20px;">No past reports found.</div>`;
      return;
    }

    const html = reports.map((report) => {
      const statLabel = (report.status || 'resolved').charAt(0).toUpperCase() + (report.status || 'resolved').slice(1);
      const isDismissed = report.status === 'dismissed';
      
      return `
        <div class="past-row ${isDismissed ? 'dismissed' : 'resolved'}" style="cursor: pointer;" data-id="${report._id}">
          <div class="past-row-main">
            <div class="past-row-id">${report.incidentId || '---'}</div>
            <div class="past-row-title">${report.type} — ${report.location?.address || 'Unknown'}</div>
          </div>
          <span class="past-row-date">${formatDate(report.createdAt)}</span>
          <span class="past-pill ${isDismissed ? 'dismissed' : 'resolved'}">${statLabel}</span>
        </div>
      `;
    }).join('');

    pastReportsList.innerHTML = html;

    // Attach click events
    pastReportsList.querySelectorAll('.past-row').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const r = allReports.find(x => x._id === id);
        if (r) showReportDetail(r);
      });
    });
  };

  loadReports();
});

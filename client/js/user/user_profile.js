(() => {
  // DOM Elements
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileId = document.getElementById('profile-id');
  const statReportsFiled = document.getElementById('stat-reports-filed');
  const statIncidentsResolved = document.getElementById('stat-incidents-resolved');

  // Helpers
  const getAuth = () => {
    try {
      return JSON.parse(localStorage.getItem('nexustraffic_auth'));
    } catch {
      return null;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const loadProfile = async () => {
    const auth = getAuth();
    if (!auth || !auth.user) {
      profileName.textContent = 'Unknown User';
      return;
    }

    const user = auth.user;
    profileName.textContent = user.name || 'Unknown User';
    profileAvatar.textContent = getInitials(user.name);
    
    // Create a deterministic short ID based on the MongoDB ObjectID
    const shortId = user._id ? user._id.substring(user._id.length - 6).toUpperCase() : '000000';
    profileId.textContent = `USER_ID // NX-${shortId}`;

    try {
      const res = await fetch('/api/incidents?reportedBy=me', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch incidents');
      
      const reports = await res.json();
      
      statReportsFiled.textContent = reports.length.toString();
      statIncidentsResolved.textContent = reports.filter(r => r.status === 'resolved').length.toString();

    } catch (err) {
      console.error('Error loading reports:', err);
      statReportsFiled.textContent = 'Err';
      statIncidentsResolved.textContent = 'Err';
    }
  };

  // Toggle switch listeners (Visual only for now)
  const toggles = document.querySelectorAll('.toggle-switch');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });

  loadProfile();
})();

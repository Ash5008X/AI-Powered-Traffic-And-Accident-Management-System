(() => {
  const AUTH_KEY = 'nexustraffic_auth';
  const API_BASE = window.NEXUS_API_BASE || 'http://localhost:5000/api';

  const DASHBOARD_BY_ROLE = {
    user: 'pages/user/user_dashboard.html',
    relief_admin: 'pages/relief_center/relief_dashbaord.html',
    field_unit: 'pages/field_unit/field_desktop.html'
  };

  const NAV_BY_ROLE = {
    user: [
      { labels: ['home', 'dashboard'], path: 'pages/user/user_dashboard.html' },
      { labels: ['my reports', 'reports'], path: 'pages/user/user_reports.html' },
      { labels: ['alerts'], path: 'pages/user/user_alerts.html' },
      { labels: ['profile'], path: 'pages/user/user_profile.html' }
    ],
    relief_admin: [
      { labels: ['dashboard'], path: 'pages/relief_center/relief_dashbaord.html' },
      { labels: ['active incidents'], path: 'pages/relief_center/active_incident.html' },
      { labels: ['alerts'], path: 'pages/relief_center/alerts.html' },
      { labels: ['reports'], path: 'pages/relief_center/reports.html' },
      { labels: ['teams'], path: 'pages/relief_center/teams.html' }
    ],
    field_unit: [
      { labels: ['my mission'], path: 'pages/field_unit/field_desktop.html' },
      { labels: ['incidents'], path: 'pages/field_unit/field_incidents.html' },
      { labels: ['updates'], path: 'pages/field_unit/field_updates.html' },
      { labels: ['profile'], path: 'pages/field_unit/field_profile.html' }
    ]
  };

  function normalizeRole(role) {
    if (!role) return '';
    return String(role).trim().toLowerCase().replace(/-/g, '_');
  }

  function clientRootPath() {
    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    const index = normalizedPath.toLowerCase().lastIndexOf('/client/');
    return index >= 0 ? normalizedPath.slice(0, index + '/client/'.length) : '/';
  }

  function toClientUrl(relativePath) {
    const cleanPath = relativePath.replace(/^\/+/, '');
    const protocol = window.location.protocol;
    if (protocol === 'file:') {
      return `${clientRootPath()}${cleanPath}`;
    }
    return `${window.location.origin}/${cleanPath}`;
  }

  function getAuth() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setAuth(auth) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  }

  function dashboardPathForRole(role) {
    return DASHBOARD_BY_ROLE[normalizeRole(role)] || 'index.html';
  }

  function redirectToDashboard(role) {
    window.location.href = toClientUrl(dashboardPathForRole(role));
  }

  function redirectToLogin() {
    clearAuth();
    window.location.href = toClientUrl('index.html');
  }

  async function request(path, options = {}) {
    const auth = getAuth();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    if (auth?.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  }

  async function login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuth(data);
    return data;
  }

  async function register(payload) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        role: normalizeRole(payload.role)
      })
    });
    setAuth(data);
    return data;
  }

  async function me() {
    const data = await request('/auth/me');
    const auth = getAuth();
    if (auth?.token) {
      setAuth({ token: auth.token, user: data });
    }
    return data;
  }

  function wireNavbar(role) {
    const navItems = NAV_BY_ROLE[normalizeRole(role)];
    if (!navItems) return;

    const links = Array.from(document.querySelectorAll('a'));
    for (const link of links) {
      const text = link.textContent.trim().toLowerCase();
      const item = navItems.find((navItem) => navItem.labels.includes(text));
      if (item) {
        link.href = toClientUrl(item.path);
      }
    }

    const brandLinks = Array.from(document.querySelectorAll('.brand, .brand a, a.brand'));
    for (const brand of brandLinks) {
      if (brand.tagName === 'A') {
        brand.href = toClientUrl(dashboardPathForRole(role));
      } else {
        brand.style.cursor = 'pointer';
        brand.addEventListener('click', () => {
          window.location.href = toClientUrl(dashboardPathForRole(role));
        });
      }
    }

    const mobileButtons = Array.from(document.querySelectorAll('.mobile-nav .mob-btn'));
    for (const button of mobileButtons) {
      const text = button.textContent.trim().toLowerCase();
      const item = navItems.find((navItem) => navItem.labels.some((label) => text.includes(label)));
      if (item) {
        button.addEventListener('click', () => {
          window.location.href = toClientUrl(item.path);
        });
      }
    }

    const signOutElements = Array.from(document.querySelectorAll('button, a')).filter((element) => {
      const text = element.textContent.trim().toLowerCase();
      return text.includes('sign out') || text.includes('logout') || text.includes('log out');
    });

    for (const element of signOutElements) {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        redirectToLogin();
      });
    }
  }

  function requiredRoleForCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    if (path.includes('/pages/user/')) return 'user';
    if (path.includes('/pages/relief_center/')) return 'relief_admin';
    if (path.includes('/pages/field_unit/')) return 'field_unit';
    return '';
  }

  function isAuthPage() {
    const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    return path.endsWith('/index.html') || path.endsWith('/pages/register.html');
  }

  async function bootstrap() {
    const requiredRole = requiredRoleForCurrentPage();
    if (!requiredRole) {
      if (isAuthPage() && getAuth()?.token) {
        try {
          const user = await me();
          redirectToDashboard(user.role);
        } catch {
          clearAuth();
        }
      }
      return;
    }

    const auth = getAuth();
    if (!auth?.token) {
      redirectToLogin();
      return;
    }

    try {
      const user = await me();
      const userRole = normalizeRole(user.role);
      if (userRole !== requiredRole) {
        redirectToDashboard(userRole);
        return;
      }
      wireNavbar(userRole);
      
      // Inject user profile name
      const nameEls = document.querySelectorAll('.nt-user-name');
      const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : 'Admin');
      for (const el of nameEls) {
        el.textContent = firstName.toUpperCase();
      }
    } catch {
      redirectToLogin();
    }
  }

  window.NexusAuth = {
    login,
    register,
    me,
    clearAuth,
    redirectToDashboard,
    normalizeRole
  };

  document.addEventListener('DOMContentLoaded', bootstrap);
})();

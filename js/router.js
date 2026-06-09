// ========================================
// STRATIFY AI — SPA Router
// ========================================

const Router = (() => {
  const routes = {};
  let currentRoute = null;
  let currentParams = {};

  function register(path, handler) {
    routes[path] = handler;
  }

  function navigate(path, params = {}) {
    currentParams = params;
    window.location.hash = path;
  }

  function getParams() {
    return currentParams;
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const parts = hash.split('/');
    const path = parts[0];
    const id = parts[1] || null;

    if (id) {
      currentParams = { id };
    }

    currentRoute = path;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === path);
    });

    // Execute route handler
    const handler = routes[path];
    if (handler) {
      const container = document.getElementById('page-content');
      if (container) {
        window.scrollTo(0, 0);
        container.innerHTML = '';
        container.className = 'page-container animate-fade-in';
        handler(container, currentParams);
      }
    } else {
      // 404
      const container = document.getElementById('page-content');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">Page Not Found</h3>
            <p class="empty-state-text">The page you're looking for doesn't exist.</p>
            <button class="btn btn-primary" onclick="Router.navigate('dashboard')">Go to Dashboard</button>
          </div>
        `;
      }
    }
  }

  function init() {
    window.addEventListener('hashchange', handleRouteChange);
    // Initial route
    handleRouteChange();
  }

  return {
    register,
    navigate,
    getParams,
    getCurrentRoute,
    init,
  };
})();

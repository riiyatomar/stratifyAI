// ========================================
// STRATIFY AI — Sidebar Component
// ========================================

const Sidebar = (() => {
  async function render() {
    const stats = await Store.getStats();

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">S</div>
          <div class="sidebar-brand">
            <span class="sidebar-brand-name">Stratify AI</span>
            <span class="sidebar-brand-tagline">Client Lifecycle Automation</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-label">Overview</div>
          <a class="nav-item" data-route="dashboard" href="#dashboard">
            <span class="nav-item-icon">🏠</span>
            <span>Dashboard</span>
          </a>

          <div class="sidebar-section-label">Workflow</div>
          <a class="nav-item" data-route="new-project" href="#new-project">
            <span class="nav-item-icon">➕</span>
            <span>New Project</span>
          </a>
          <a class="nav-item" data-route="consultant" href="#consultant">
            <span class="nav-item-icon">🎯</span>
            <span>Consultant</span>
          </a>
          <a class="nav-item" data-route="proposals" href="#proposals">
            <span class="nav-item-icon">📄</span>
            <span>Proposals</span>
            ${stats.pendingProposals > 0 ? `<span class="nav-item-badge">${stats.pendingProposals}</span>` : ''}
          </a>
          <a class="nav-item" data-route="projects" href="#projects">
            <span class="nav-item-icon">📋</span>
            <span>Projects</span>
          </a>
          <a class="nav-item" data-route="scope" href="#scope">
            <span class="nav-item-icon">🔍</span>
            <span>Scope Control</span>
          </a>

          <div class="sidebar-section-label">System</div>
          <a class="nav-item" data-route="agents" href="#agents">
            <span class="nav-item-icon">🤖</span>
            <span>AI Agents</span>
          </a>
          <a class="nav-item" data-route="settings" href="#settings">
            <span class="nav-item-icon">⚙️</span>
            <span>Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a class="nav-item" data-route="projects" href="#projects" style="opacity: 0.85;">
            <span class="nav-item-icon">📊</span>
            <span>${stats.total} project${stats.total !== 1 ? 's' : ''}</span>
          </a>
        </div>
      </aside>

      <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">☰</button>
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
  }

  function init() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
      });
    }
  }

  async function refresh() {
    const sidebarElement = document.getElementById('sidebar');
    if (!sidebarElement) return;

    // Just update badge counts
    const stats = await Store.getStats();
    const proposalBadge = sidebarElement.querySelector('[data-route="proposals"] .nav-item-badge');

    if (stats.pendingProposals > 0) {
      if (proposalBadge) {
        proposalBadge.textContent = stats.pendingProposals;
      } else {
        const proposalNav = sidebarElement.querySelector('[data-route="proposals"]');
        if (proposalNav) {
          const badge = document.createElement('span');
          badge.className = 'nav-item-badge';
          badge.textContent = stats.pendingProposals;
          proposalNav.appendChild(badge);
        }
      }
    } else if (proposalBadge) {
      proposalBadge.remove();
    }
  }

  return { render, init, refresh };
})();

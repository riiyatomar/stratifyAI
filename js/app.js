// ========================================
// STRATIFY AI — App Bootstrap
// ========================================

// Utility functions (global)
function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// App initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Seed demo data on first visit
  await Store.seedDemoData();

  // Render sidebar
  const app = document.getElementById('app');
  app.innerHTML = `
    ${await Sidebar.render()}
    <main class="main-content">
      <div class="page-container" id="page-content"></div>
    </main>
  `;

  // Initialize sidebar events
  Sidebar.init();

  // Register routes
  Router.register('dashboard', (c) => DashboardPage.render(c));
  Router.register('new-project', (c) => NewProjectPage.render(c));
  Router.register('consultant', (c) => ConsultantPage.render(c));
  Router.register('proposals', (c, p) => ProposalsPage.render(c, p));
  Router.register('projects', (c, p) => ProjectsPage.render(c, p));
  Router.register('scope', (c, p) => ScopePage.render(c, p));
  Router.register('agents', (c) => AgentsPage.render(c));
  Router.register('settings', (c) => SettingsPage.render(c));

  // Initialize router
  Router.init();
});

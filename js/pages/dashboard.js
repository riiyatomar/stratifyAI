// ========================================
// STRATIFY AI — Dashboard Page
// ========================================

const DashboardPage = (() => {
  function render(container) {
    const stats = Store.getStats();
    const recentActivity = Store.getRecentActivity(8);
    const projects = Store.getProjects();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Overview of your client lifecycle pipeline</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" id="dash-new-project">
              ➕ New Project
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="bento-grid bento-grid-4 stagger-children" style="margin-bottom: var(--space-6);">
        <div class="glass-card stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon cyan">📁</div>
            ${stats.total > 0 ? `<span class="stat-card-trend text-success">Active</span>` : ''}
          </div>
          <div class="stat-card-value">${stats.active}</div>
          <div class="stat-card-label">Active Projects</div>
        </div>

        <div class="glass-card stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon violet">📄</div>
          </div>
          <div class="stat-card-value">${stats.proposals}</div>
          <div class="stat-card-label">Proposals Generated</div>
        </div>

        <div class="glass-card stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon amber">🔍</div>
          </div>
          <div class="stat-card-value">${stats.scopeChanges}</div>
          <div class="stat-card-label">Scope Evaluations</div>
        </div>

        <div class="glass-card stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon emerald">✅</div>
          </div>
          <div class="stat-card-value">${stats.completionRate}%</div>
          <div class="stat-card-label">Completion Rate</div>
        </div>
      </div>

      <!-- Agent Pipeline Visualization -->
      <div class="glass-card-static agent-pipeline" style="margin-bottom: var(--space-6);">
        <h4 style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
          🧠 Agent Pipeline
        </h4>
        <div class="pipeline-flow">
          <div class="pipeline-node pipeline-clickable" data-pipeline-target="new-project" data-tooltip="Start a new project">
            <span class="pipeline-node-icon">📥</span>
            <span class="pipeline-node-name">Client Input</span>
            <span class="pipeline-node-status">Trigger</span>
          </div>
          <span class="pipeline-arrow">→</span>
          <div class="pipeline-node pipeline-clickable" data-pipeline-target="agents" data-tooltip="Business Analyst Agent">
            <span class="pipeline-node-icon">📋</span>
            <span class="pipeline-node-name">Analyst</span>
            <span class="pipeline-node-status">Agent 1</span>
          </div>
          <span class="pipeline-arrow">→</span>
          <div class="pipeline-node pipeline-clickable" data-pipeline-target="agents" data-tooltip="Pre-Sales Consultant Agent">
            <span class="pipeline-node-icon">💼</span>
            <span class="pipeline-node-name">Consultant</span>
            <span class="pipeline-node-status">Agent 2</span>
          </div>
          <span class="pipeline-arrow">→</span>
          <div class="pipeline-node pipeline-clickable" data-pipeline-target="agents" data-tooltip="Project Manager Agent">
            <span class="pipeline-node-icon">📊</span>
            <span class="pipeline-node-name">Planner</span>
            <span class="pipeline-node-status">Agent 3</span>
          </div>
          <span class="pipeline-arrow">→</span>
          <div class="pipeline-node pipeline-clickable" data-pipeline-target="agents" data-tooltip="Scope Control Auditor Agent">
            <span class="pipeline-node-icon">🔍</span>
            <span class="pipeline-node-name">Auditor</span>
            <span class="pipeline-node-status">Agent 4</span>
          </div>
        </div>
      </div>

      <div class="two-col" style="margin-bottom: var(--space-6);">
        <!-- Recent Activity -->
        <div class="glass-card-static dashboard-activity">
          <div class="dashboard-activity-header">
            <h4>📡 Recent Activity</h4>
          </div>
          ${recentActivity.length > 0 ? `
            <div class="activity-list">
              ${recentActivity.map(a => renderActivityItem(a)).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: var(--space-8) var(--space-4);">
              <div class="empty-state-icon">📡</div>
              <p class="empty-state-text">No activity yet. Create your first project to get started.</p>
            </div>
          `}
        </div>

        <!-- Quick Actions -->
        <div class="glass-card-static" style="padding: var(--space-5);">
          <h4 style="margin-bottom: var(--space-4);">⚡ Quick Actions</h4>
          <div class="quick-actions" style="padding: 0;">
            <div class="quick-action" id="qa-new-project">
              <span class="quick-action-icon">➕</span>
              <span class="quick-action-label">New Project</span>
              <span class="quick-action-desc">Start requirement intake</span>
            </div>
            <div class="quick-action" id="qa-view-proposals">
              <span class="quick-action-icon">📄</span>
              <span class="quick-action-label">Proposals</span>
              <span class="quick-action-desc">View & manage</span>
            </div>
            <div class="quick-action" id="qa-scope-check">
              <span class="quick-action-icon">🔍</span>
              <span class="quick-action-label">Scope Check</span>
              <span class="quick-action-desc">Evaluate changes</span>
            </div>
          </div>

          ${projects.length > 0 ? `
            <div class="divider"></div>
            <h5 style="margin-bottom: var(--space-3); color: var(--text-secondary);">Recent Projects</h5>
            ${projects.slice(0, 3).map(p => `
              <div class="activity-item" style="cursor: pointer;" onclick="Router.navigate('projects/${p.id}')">
                <div class="status-dot ${getStatusDotClass(p.status)} status-dot-pulse"></div>
                <div class="activity-info">
                  <div class="activity-text"><strong>${p.company || p.clientName}</strong></div>
                  <div class="activity-time">${capitalizeFirst(p.status)} · ${formatTimeAgo(p.updatedAt)}</div>
                </div>
                <span class="badge ${getStatusBadge(p.status)}">${capitalizeFirst(p.status)}</span>
              </div>
            `).join('')}
          ` : ''}
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('dash-new-project')?.addEventListener('click', () => Router.navigate('new-project'));
    document.getElementById('qa-new-project')?.addEventListener('click', () => Router.navigate('new-project'));
    document.getElementById('qa-view-proposals')?.addEventListener('click', () => Router.navigate('proposals'));
    document.getElementById('qa-scope-check')?.addEventListener('click', () => Router.navigate('scope'));

    // Pipeline node click handlers
    document.querySelectorAll('.pipeline-clickable').forEach(node => {
      node.addEventListener('click', () => {
        const target = node.dataset.pipelineTarget;
        if (target) Router.navigate(target);
      });
    });
  }

  function renderActivityItem(activity) {
    const agentIcons = {
      analyst: '📋',
      consultant: '💼',
      planner: '📊',
      auditor: '🔍',
      orchestrator: '🧠',
    };

    const typeColors = {
      created: 'cyan',
      analysis: 'cyan',
      proposal: 'violet',
      plan: 'emerald',
      scope: 'amber',
      task: 'emerald',
    };

    const icon = agentIcons[activity.agent] || '📌';
    const color = typeColors[activity.type] || 'cyan';

    return `
      <div class="activity-item">
        <div class="activity-icon stat-card-icon ${color}" style="width: 32px; height: 32px; font-size: 0.85rem;">
          ${icon}
        </div>
        <div class="activity-info">
          <div class="activity-text">
            <strong>${activity.projectName}</strong> — ${activity.message}
          </div>
          <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
        </div>
      </div>
    `;
  }

  function getStatusDotClass(status) {
    const map = {
      requirements: 'status-dot-info',
      proposal: 'status-dot-warning',
      planning: 'status-dot-info',
      active: 'status-dot-success',
      completed: 'status-dot-success',
    };
    return map[status] || 'status-dot-info';
  }

  function getStatusBadge(status) {
    const map = {
      requirements: 'badge-info',
      proposal: 'badge-warning',
      planning: 'badge-primary',
      active: 'badge-success',
      completed: 'badge-success',
    };
    return map[status] || 'badge-neutral';
  }

  return { render };
})();

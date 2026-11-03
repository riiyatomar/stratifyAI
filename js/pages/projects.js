// ========================================
// STRATIFY AI — Projects Page
// ========================================

const ProjectsPage = (() => {
  let activeView = 'list'; // list | kanban

  async function render(container, params) {
    if (params?.id) {
      await renderProjectDetail(container, params.id);
    } else {
      await renderProjectList(container);
    }
  }

  async function renderProjectList(container) {
    const projects = await Store.getProjects();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">Projects</h1>
            <p class="page-subtitle">Manage all client projects and execution plans</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="Router.navigate('new-project')">➕ New Project</button>
          </div>
        </div>
      </div>

      ${projects.length > 0 ? `
        <div class="stagger-children" style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${projects.map(p => renderProjectCard(p)).join('')}
        </div>
      ` : `
        <div class="glass-card-static empty-state">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">No Projects Yet</h3>
          <p class="empty-state-text">Create a new project to start the AI-powered workflow.</p>
          <button class="btn btn-primary" onclick="Router.navigate('new-project')">➕ New Project</button>
        </div>
      `}
    `;
  }

  function renderProjectCard(project) {
    const plan = project.plan;
    const totalTasks = plan ? plan.modules.reduce((acc, m) => acc + m.tasks.length, 0) : 0;
    const doneTasks = plan ? plan.modules.reduce((acc, m) => acc + m.tasks.filter(t => t.status === 'done').length, 0) : 0;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return `
      <div class="glass-card" style="padding: var(--space-5); cursor: pointer;"
           onclick="Router.navigate('projects/${project.id}')">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-3);">
          <div>
            <h4 style="margin-bottom: var(--space-1);">${project.company || project.clientName || 'Untitled'}</h4>
            <p class="text-secondary" style="font-size: var(--text-sm);">
              ${project.clientName} · Created ${formatTimeAgo(project.createdAt)}
            </p>
          </div>
          <span class="badge ${getStatusBadge(project.status)}">${capitalizeFirst(project.status)}</span>
        </div>

        ${project.requirements?.objective ? `
          <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-3);">
            ${truncate(project.requirements.objective, 150)}
          </p>
        ` : ''}

        <div style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--text-xs); color: var(--text-tertiary);">
          ${plan ? `
            <span>📋 ${plan.modules.length} modules</span>
            <span>✅ ${doneTasks}/${totalTasks} tasks</span>
          ` : ''}
          ${project.proposal ? '<span>📄 Proposal ready</span>' : ''}
          ${(project.scopeLog || []).length > 0 ? `<span>🔍 ${project.scopeLog.length} scope checks</span>` : ''}
        </div>

        ${totalTasks > 0 ? `
          <div style="margin-top: var(--space-3);">
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: var(--space-1); font-size: var(--text-xs); color: var(--text-tertiary);">
              <span>Progress</span>
              <span>${progress}%</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  async function renderProjectDetail(container, projectId) {
    const project = await Store.getProject(projectId);
    if (!project) {
      container.innerHTML = `
        <div class="glass-card-static empty-state">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">Project Not Found</h3>
          <button class="btn btn-primary" onclick="Router.navigate('projects')">← Back to Projects</button>
        </div>
      `;
      return;
    }

    const plan = project.plan;
    const totalTasks = plan ? plan.modules.reduce((acc, m) => acc + m.tasks.length, 0) : 0;
    const doneTasks = plan ? plan.modules.reduce((acc, m) => acc + m.tasks.filter(t => t.status === 'done').length, 0) : 0;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">${project.company || project.clientName}</h1>
            <p class="page-subtitle">${project.requirements?.objective || 'No objective defined'}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-ghost" onclick="Router.navigate('projects')">← Back</button>
            ${project.proposal ? `<button class="btn btn-secondary" onclick="Router.navigate('proposals/${project.id}')">📄 View Proposal</button>` : ''}
            <button class="btn btn-secondary" id="scope-check-btn">🔍 Scope Check</button>
            <button class="btn btn-danger btn-sm" id="delete-project-btn">🗑️</button>
          </div>
        </div>
      </div>

      <!-- Project Info Bar -->
      <div class="glass-card-static project-header-bar" style="margin-bottom: var(--space-5);">
        <span class="badge ${getStatusBadge(project.status)}" style="font-size: var(--text-sm);">${capitalizeFirst(project.status)}</span>
        <span style="color: var(--text-tertiary); font-size: var(--text-sm);">|</span>
        <span style="font-size: var(--text-sm); color: var(--text-secondary);">👤 ${project.clientName}</span>
        ${project.requirements?.budgetRange ? `
          <span style="color: var(--text-tertiary); font-size: var(--text-sm);">|</span>
          <span style="font-size: var(--text-sm); color: var(--text-secondary);">💰 ${project.requirements.budgetRange}</span>
        ` : ''}
        ${project.requirements?.timeline ? `
          <span style="color: var(--text-tertiary); font-size: var(--text-sm);">|</span>
          <span style="font-size: var(--text-sm); color: var(--text-secondary);">📅 ${project.requirements.timeline}</span>
        ` : ''}
        <span style="margin-left: auto; font-size: var(--text-sm); color: var(--text-secondary);">
          ${progress}% complete · ${doneTasks}/${totalTasks} tasks
        </span>
      </div>

      <div class="two-col" style="margin-bottom: var(--space-5);">
        <!-- Requirements Summary -->
        <div class="glass-card-static" style="padding: var(--space-5);">
          <h4 style="margin-bottom: var(--space-4);">📋 Requirements Summary</h4>
          ${project.requirements ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <div>
                <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Features</h6>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                  ${(project.requirements.features || []).map(f => `
                    <span class="badge badge-primary">${typeof f === 'string' ? f : f.name || f}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">User Types</h6>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                  ${(project.requirements.userTypes || []).map(u => `
                    <span class="badge badge-neutral">${u}</span>
                  `).join('')}
                </div>
              </div>
              ${(project.requirements.risks || []).length > 0 ? `
                <div>
                  <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Risks</h6>
                  <ul style="padding-left: var(--space-4);">
                    ${project.requirements.risks.map(r => `
                      <li style="font-size: var(--text-sm); color: var(--color-warning); list-style: disc; margin-bottom: 4px;">${r}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          ` : '<p class="text-secondary">No requirements analyzed yet.</p>'}
        </div>

        <!-- Milestones -->
        <div class="glass-card-static" style="padding: var(--space-5);">
          <h4 style="margin-bottom: var(--space-4);">🎯 Milestones</h4>
          ${plan?.milestones?.length > 0 ? `
            <div class="timeline">
              ${plan.milestones.map(m => `
                <div class="timeline-item ${m.status === 'completed' ? 'completed' : m.status === 'in-progress' ? '' : ''}">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-date">${m.date}</div>
                    <div class="timeline-title">${m.name}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-secondary">No milestones defined yet.</p>'}
        </div>
      </div>

      <!-- Execution Plan / Task Modules -->
      ${plan ? `
        <div class="glass-card-static" style="padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); border-left: 3px solid var(--accent-cyan); display: flex; align-items: center; justify-content: space-between;">
          <h3 style="display: flex; align-items: center; gap: var(--space-3); margin: 0;">
            📊 Execution Plan
            <span class="badge badge-primary" style="font-size: var(--text-xs);">${plan.modules.reduce((acc, m) => acc + m.tasks.length, 0)} tasks across ${plan.modules.length} modules</span>
          </h3>
          <span class="text-secondary" style="font-size: var(--text-sm);"></span>
        </div>
        <div class="module-list stagger-children">
          ${plan.modules.map(mod => renderModule(mod, projectId)).join('')}
        </div>
      ` : `
        <div class="glass-card-static empty-state" style="margin-top: var(--space-4);">
          <div class="empty-state-icon">📊</div>
          <h3 class="empty-state-title">No Execution Plan</h3>
          <p class="empty-state-text">Generate a project plan using the Planner Agent.</p>
          <button class="btn btn-primary" id="generate-plan-btn">📊 Generate Plan</button>
        </div>
      `}

      <!-- Scope Log -->
      ${(project.scopeLog || []).length > 0 ? `
        <h3 style="margin-top: var(--space-8); margin-bottom: var(--space-4);">🔍 Scope Change Log</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${project.scopeLog.map(entry => `
            <div class="scope-result-card glass-card-static">
              <span class="scope-result-icon">${entry.classification === 'in-scope' ? '✅' : entry.classification === 'out-scope' ? '❌' : '⚠️'}</span>
              <div class="scope-result-body">
                <div class="scope-result-title">${entry.request}</div>
                <div class="scope-result-justification">${entry.justification}</div>
                <div class="scope-result-impact">
                  <span class="scope-impact-item">⏱️ ${entry.impact?.time || 'N/A'}</span>
                  <span class="scope-impact-item">💰 ${entry.impact?.cost || 'N/A'}</span>
                  <span class="scope-impact-item">📅 ${formatTimeAgo(entry.timestamp)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    // Events
    document.getElementById('scope-check-btn')?.addEventListener('click', () => {
      Router.navigate('scope', { projectId: project.id });
    });

    document.getElementById('delete-project-btn')?.addEventListener('click', () => {
      Modal.confirm({
        title: 'Delete Project',
        message: `Are you sure you want to delete the project for <strong>${project.company || project.clientName}</strong>? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
          await Store.deleteProject(project.id);
          Toast.success('Project deleted');
          await Sidebar.refresh();
          Router.navigate('projects');
        },
      });
    });

    document.getElementById('generate-plan-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('generate-plan-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Generating...';
      const result = await Orchestrator.runPlanGeneration(project.id);
      if (result.success) {
        Toast.success('Project plan generated!');
        renderProjectDetail(container, projectId);
      } else {
        Toast.error(result.message || 'Failed to generate plan');
        btn.disabled = false;
        btn.innerHTML = '📊 Generate Plan';
      }
    });

    // Task toggle events
    document.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('click', () => {
        const taskId = cb.dataset.taskId;
        const moduleId = cb.dataset.moduleId;
        toggleTask(projectId, moduleId, taskId, cb);
      });
    });
  }

  function renderModule(mod, projectId) {
    const total = mod.tasks.length;
    const done = mod.tasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return `
      <div class="glass-card-static module-card">
        <div class="module-header">
          <h5 class="module-title">
            <span style="opacity: 0.5;">📦</span>
            ${mod.name}
          </h5>
          <div class="module-progress">
            <span class="text-secondary" style="font-size: var(--text-sm);">${done}/${total}</span>
            <div class="progress-bar" style="width: 80px;">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
        <div class="task-column-labels">
          <span class="task-column-label-spacer"></span>
          <div class="task-column-label-group">
            <span class="task-column-label">Priority</span>
            <span class="task-column-label">Effort</span>
          </div>
        </div>
        <div class="task-list">
          ${mod.tasks.map(task => renderTask(task, mod.id, projectId)).join('')}
        </div>
      </div>
    `;
  }

  function renderTask(task, moduleId, projectId) {
    const isComplete = task.status === 'done';
    const priorityColors = {
      critical: 'badge-danger',
      high: 'badge-warning',
      medium: 'badge-info',
      low: 'badge-neutral',
    };

    return `
      <div class="task-item">
        <div class="task-checkbox ${isComplete ? 'checked' : ''}" data-task-id="${task.id}" data-module-id="${moduleId}"></div>
        <span class="task-name ${isComplete ? 'completed' : ''}">${task.name}</span>
        <div class="task-meta">
          <span class="task-badge-wrapper">
            <span class="task-badge-label">Priority</span>
            <span class="badge ${priorityColors[task.priority] || 'badge-neutral'}" style="font-size: 0.65rem;">${task.priority}</span>
          </span>
          <span class="task-badge-wrapper">
            <span class="task-badge-label">Effort</span>
            <span class="badge badge-neutral" style="font-size: 0.65rem;">${task.effort}</span>
          </span>
        </div>
      </div>
    `;
  }

  async function toggleTask(projectId, moduleId, taskId, element) {
    const project = await Store.getProject(projectId);
    if (!project?.plan) return;

    const module = project.plan.modules.find(m => m.id === moduleId);
    if (!module) return;

    const task = module.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Toggle
    task.status = task.status === 'done' ? 'todo' : 'done';

    await Store.updateProject(projectId, { plan: project.plan });

    // Update UI
    element.classList.toggle('checked');
    const nameEl = element.nextElementSibling;
    if (nameEl) nameEl.classList.toggle('completed');

    // Update progress
    const moduleCard = element.closest('.module-card');
    if (moduleCard) {
      const total = module.tasks.length;
      const done = module.tasks.filter(t => t.status === 'done').length;
      const progress = Math.round((done / total) * 100);

      const countEl = moduleCard.querySelector('.module-progress .text-secondary');
      if (countEl) countEl.textContent = `${done}/${total}`;

      const progressFill = moduleCard.querySelector('.progress-bar-fill');
      if (progressFill) progressFill.style.width = `${progress}%`;
    }

    if (task.status === 'done') {
      await Store.addProjectActivity(projectId, {
        type: 'task',
        message: `Task "${task.name}" completed`,
        agent: 'planner',
      });
    }
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

  function truncate(str, max) {
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  return { render };
})();

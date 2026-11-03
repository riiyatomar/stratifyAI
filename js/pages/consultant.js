// ========================================
// STRATIFY AI — Project Consultant Page
// ========================================
// Full-page UI for the AI Project Consultant
// Paste raw client briefs → Get structured analysis

const ConsultantPage = (() => {
  let lastResult = null;

  function render(container) {
    lastResult = null;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">Project Consultant</h1>
            <p class="page-subtitle">Paste a raw client brief — the AI Consultant classifies, evaluates, and builds a structured project scope</p>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="glass-card-static consultant-input-area" id="consultant-input-area">
        <div class="consultant-input-header">
          <span class="consultant-input-icon">🎯</span>
          <div>
            <h4 style="margin: 0;">Client Brief Analysis</h4>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 2px;">Paste the raw client message, email, or requirements document</p>
          </div>
        </div>

        <div class="wizard-form" style="margin-top: var(--space-5);">
          <div class="input-group">
            <label for="consultant-brief">Raw Client Brief</label>
            <textarea class="input-field" id="consultant-brief" rows="8"
              placeholder="Paste the client's raw message or requirements here. Each line or sentence will be individually analyzed.

Example:
We need an e-commerce platform with user login and payment processing.
The budget is around $25,000.
It should be modern and beautiful.
Can you also build a mobile app?
Add product search and filtering.
We want it within 2 months.
Maybe add AI-powered recommendations."></textarea>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-secondary btn-sm" id="consultant-load-sample" style="gap: var(--space-2);">
              📋 Load Sample Brief
            </button>
            <button class="btn btn-primary" id="consultant-analyze-btn">
              🎯 Analyze Brief
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div id="consultant-results"></div>
    `;

    // Events
    document.getElementById('consultant-analyze-btn')?.addEventListener('click', runAnalysis);
    document.getElementById('consultant-load-sample')?.addEventListener('click', loadSampleBrief);
  }

  function loadSampleBrief() {
    const sample = `We need an e-commerce platform for selling organic products online.
User registration and login with social media options.
Product catalog with categories, search, and filters.
Shopping cart and secure payment gateway integration with Stripe.
Order tracking and delivery status notifications.
Admin dashboard with sales analytics and inventory management.
The budget is around $40,000.
It should look modern and professional.
Can you also build us a native mobile app for iOS and Android?
Maybe add an AI chatbot for customer support.
Customer reviews and ratings for products.
We want to launch within 3 months.
The website must be GDPR compliant.
Add multi-language support for English and Spanish.`;

    document.getElementById('consultant-brief').value = sample;
    Toast.success('Sample brief loaded. Click "Analyze Brief" to proceed.');
  }

  async function runAnalysis() {
    const brief = document.getElementById('consultant-brief')?.value?.trim();

    if (!brief || brief.length < 10) {
      Toast.warning('Please enter a client brief with at least a few sentences.');
      return;
    }

    const btn = document.getElementById('consultant-analyze-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Analyzing...';

    // Simulate processing delay for realism
    await new Promise(r => setTimeout(r, 800));

    const result = ConsultantAnalyzerAgent.analyzeClientBrief(brief);

    btn.disabled = false;
    btn.innerHTML = '🎯 Analyze Brief';

    if (result.success) {
      lastResult = result;
      renderResults(result);
      Toast.success(`Analysis complete: ${result.summary.accepted} accepted, ${result.summary.rejected} rejected, ${result.summary.needsClarification} need clarification`);
    } else {
      Toast.error(result.message || 'Analysis failed');
    }
  }

  function renderResults(result) {
    const resultsDiv = document.getElementById('consultant-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
      <!-- Summary Stats Bar -->
      <div class="consultant-stats-bar glass-card-static" style="animation: fadeInUp 0.4s ease forwards;">
        <div class="consultant-stat">
          <span class="consultant-stat-value">${result.summary.total}</span>
          <span class="consultant-stat-label">Total Inputs</span>
        </div>
        <div class="consultant-stat-divider"></div>
        <div class="consultant-stat">
          <span class="consultant-stat-value accent-green">${result.summary.accepted}</span>
          <span class="consultant-stat-label">Accepted</span>
        </div>
        <div class="consultant-stat-divider"></div>
        <div class="consultant-stat">
          <span class="consultant-stat-value accent-red">${result.summary.rejected}</span>
          <span class="consultant-stat-label">Rejected</span>
        </div>
        <div class="consultant-stat-divider"></div>
        <div class="consultant-stat">
          <span class="consultant-stat-value accent-yellow">${result.summary.needsClarification}</span>
          <span class="consultant-stat-label">Needs Clarification</span>
        </div>
      </div>

      <!-- 1. Problem Understanding -->
      ${renderProblemUnderstanding(result.problemUnderstanding)}

      <!-- 2. Scope Evaluation Table -->
      ${renderEvaluationTable(result.evaluationTable)}

      <!-- 3. Base Scope -->
      ${renderBaseScope(result.baseScope)}

      <!-- 4. Budget Analysis -->
      ${renderBudgetAnalysis(result.budgetAnalysis)}

      <!-- 5. Execution Plan -->
      ${renderExecutionPlan(result.executionPlan)}

      <!-- Action Bar -->
      <div class="consultant-action-bar glass-card-static" style="animation: fadeInUp 0.4s ease 0.6s both;">
        <div class="consultant-action-info">
          <span style="font-size: 1.5rem;">✨</span>
          <div>
            <strong style="font-size: var(--text-base);">Ready to create a project?</strong>
            <p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
              Create a new project pre-filled with this analysis — only accepted features are included.
            </p>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="consultant-create-project">
          🚀 Create Project from Analysis
        </button>
      </div>
    `;

    // Bind the create project action
    document.getElementById('consultant-create-project')?.addEventListener('click', () => createProjectFromAnalysis(result));

    // Smooth scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderProblemUnderstanding(pu) {
    return `
      <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.1s both;">
        <div class="consultant-section-header">
          <span class="consultant-section-icon">🧠</span>
          <h4 class="consultant-section-title">Problem Understanding</h4>
        </div>
        <div class="consultant-problem-grid">
          <div class="consultant-problem-card">
            <div class="consultant-problem-label">Core Objective</div>
            <div class="consultant-problem-value">${pu.coreObjective}</div>
          </div>
          <div class="consultant-problem-card">
            <div class="consultant-problem-label">Project Type</div>
            <div class="consultant-problem-value">${pu.projectType}</div>
          </div>
          <div class="consultant-problem-card">
            <div class="consultant-problem-label">Accepted Features</div>
            <div class="consultant-problem-value accent-green">${pu.acceptedFeatures}</div>
          </div>
          <div class="consultant-problem-card">
            <div class="consultant-problem-label">Issues Found</div>
            <div class="consultant-problem-value accent-red">${pu.issuesFound}</div>
          </div>
        </div>
        <p class="consultant-summary-text">${pu.summary}</p>
      </div>
    `;
  }

  function renderEvaluationTable(items) {
    return `
      <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.2s both;">
        <div class="consultant-section-header">
          <span class="consultant-section-icon">📊</span>
          <h4 class="consultant-section-title">Scope Evaluation Table</h4>
        </div>
        <div class="consultant-table-legend">
          <span class="classification-pill classification-feature">Feature</span>
          <span class="classification-pill classification-vague">Vague</span>
          <span class="classification-pill classification-constraint">Constraint</span>
          <span class="classification-pill classification-scope-change">Scope Change</span>
          <span class="classification-pill classification-valid-extension">Extension</span>
        </div>
        <div class="table-wrapper" style="margin-top: var(--space-4);">
          <table class="data-table consultant-eval-table">
            <thead>
              <tr>
                <th style="width: 30%;">Input</th>
                <th style="width: 15%;">Classification</th>
                <th style="width: 12%;">Decision</th>
                <th style="width: 43%;">Justification</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, i) => `
                <tr class="consultant-eval-row" style="animation: fadeInUp 0.3s ease ${0.05 * i}s both;">
                  <td>
                    <div class="consultant-eval-statement">${item.statement}</div>
                  </td>
                  <td>
                    <span class="classification-pill classification-${item.classification}">
                      ${getClassificationIcon(item.classification)} ${formatClassification(item.classification)}
                    </span>
                  </td>
                  <td>
                    <span class="decision-badge decision-${item.decision}">
                      ${getDecisionIcon(item.decision)} ${capitalizeFirst(item.decision)}
                    </span>
                  </td>
                  <td>
                    <div class="consultant-eval-justification">${item.justification}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderBaseScope(scope) {
    if (scope.totalFeatures === 0 && scope.totalConstraints === 0) {
      return `
        <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.3s both;">
          <div class="consultant-section-header">
            <span class="consultant-section-icon">📋</span>
            <h4 class="consultant-section-title">Base Scope</h4>
          </div>
          <div class="empty-state" style="padding: var(--space-8);">
            <div class="empty-state-icon">⚠️</div>
            <p class="empty-state-text">No features were accepted into the base scope. The client brief needs more specific requirements.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.3s both;">
        <div class="consultant-section-header">
          <span class="consultant-section-icon">📋</span>
          <h4 class="consultant-section-title">Base Scope</h4>
          <span class="badge badge-primary" style="margin-left: auto;">${scope.totalFeatures} Features</span>
        </div>
        <div class="consultant-scope-grid">
          ${scope.features.map((f, i) => `
            <div class="consultant-scope-item" style="animation: fadeInUp 0.3s ease ${0.05 * i}s both;">
              <span class="consultant-scope-icon">${f.type === 'Extension' ? '🔧' : '✅'}</span>
              <div class="consultant-scope-body">
                <div class="consultant-scope-name">${f.name}</div>
                <span class="badge ${f.type === 'Extension' ? 'badge-info' : 'badge-success'}" style="font-size: 0.6rem;">${f.type}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ${scope.totalConstraints > 0 ? `
          <div class="divider"></div>
          <div class="consultant-section-subheader">
            <span>⚙️</span>
            <strong>Validated Constraints (${scope.totalConstraints})</strong>
          </div>
          <div class="consultant-constraints-list">
            ${scope.constraints.map(c => `
              <div class="consultant-constraint-item">
                <span class="badge badge-warning" style="font-size: 0.6rem;">Constraint</span>
                <span>${c.name}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderBudgetAnalysis(budget) {
    if (!budget.estimated) {
      return `
        <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.4s both;">
          <div class="consultant-section-header">
            <span class="consultant-section-icon">💰</span>
            <h4 class="consultant-section-title">Budget Analysis</h4>
          </div>
          <p style="color: var(--text-tertiary); font-size: var(--text-sm);">${budget.message}</p>
        </div>
      `;
    }

    return `
      <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.4s both;">
        <div class="consultant-section-header">
          <span class="consultant-section-icon">💰</span>
          <h4 class="consultant-section-title">Budget Analysis</h4>
        </div>

        <!-- Budget Overview Cards -->
        <div class="consultant-budget-overview">
          <div class="consultant-budget-card">
            <div class="consultant-budget-card-label">Estimated Cost Range</div>
            <div class="consultant-budget-card-value">
              $${budget.costRange.min.toLocaleString()} — $${budget.costRange.max.toLocaleString()}
            </div>
            <div class="consultant-budget-card-sub">@ $${budget.hourlyRate}/hr</div>
          </div>
          <div class="consultant-budget-card">
            <div class="consultant-budget-card-label">Estimated Hours</div>
            <div class="consultant-budget-card-value">${budget.totalHours} hrs</div>
            <div class="consultant-budget-card-sub">incl. ${budget.overheadHours} hrs overhead (30%)</div>
          </div>
          <div class="consultant-budget-card">
            <div class="consultant-budget-card-label">Timeline Estimate</div>
            <div class="consultant-budget-card-value">${budget.timelineRange.min}-${budget.timelineRange.max} weeks</div>
            <div class="consultant-budget-card-sub">with dedicated team</div>
          </div>
        </div>

        ${budget.budgetFit ? `
          <div class="consultant-budget-fit consultant-budget-fit-${budget.budgetFit.status}">
            <span class="consultant-budget-fit-icon">
              ${budget.budgetFit.status === 'within-budget' ? '✅' : budget.budgetFit.status === 'tight-budget' ? '⚠️' : '❌'}
            </span>
            <div>
              <strong>Budget Fit: ${formatBudgetStatus(budget.budgetFit.status)}</strong>
              <p style="margin: 4px 0 0; font-size: var(--text-sm); opacity: 0.85;">${budget.budgetFit.message}</p>
            </div>
          </div>
        ` : ''}

        <!-- Feature Cost Breakdown -->
        <div style="margin-top: var(--space-5);">
          <div class="consultant-section-subheader" style="margin-bottom: var(--space-3);">
            <span>📊</span>
            <strong>Feature Cost Breakdown</strong>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Complexity</th>
                  <th>Est. Hours</th>
                  <th>Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                ${budget.featureEstimates.map(f => `
                  <tr>
                    <td>${f.name}</td>
                    <td><span class="badge ${f.complexity === 'High' ? 'badge-danger' : f.complexity === 'Medium' ? 'badge-warning' : 'badge-success'}">${f.complexity}</span></td>
                    <td>${f.hours} hrs</td>
                    <td>$${f.cost.toLocaleString()}</td>
                  </tr>
                `).join('')}
                <tr style="border-top: 2px solid var(--glass-border-strong);">
                  <td><strong>Overhead (30%)</strong></td>
                  <td><span class="badge badge-neutral">—</span></td>
                  <td><strong>${budget.overheadHours} hrs</strong></td>
                  <td><strong>$${(budget.overheadHours * budget.hourlyRate).toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderExecutionPlan(plan) {
    if (!plan.phases || plan.phases.length === 0) {
      return `
        <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.5s both;">
          <div class="consultant-section-header">
            <span class="consultant-section-icon">📅</span>
            <h4 class="consultant-section-title">Execution Plan</h4>
          </div>
          <p style="color: var(--text-tertiary); font-size: var(--text-sm);">${plan.message}</p>
        </div>
      `;
    }

    return `
      <div class="glass-card-static consultant-section" style="animation: fadeInUp 0.4s ease 0.5s both;">
        <div class="consultant-section-header">
          <span class="consultant-section-icon">📅</span>
          <h4 class="consultant-section-title">Execution Plan</h4>
          <span class="badge badge-primary" style="margin-left: auto;">${plan.totalPhases} Phases</span>
        </div>

        <!-- Phase Timeline Bar -->
        <div class="consultant-phase-bar">
          ${plan.phases.map(phase => `
            <div class="consultant-phase-bar-item" style="background: ${phase.color}25; border-left: 3px solid ${phase.color};">
              <span style="color: ${phase.color}; font-weight: 600;">${phase.icon} ${phase.name}</span>
              <span style="font-size: var(--text-xs); color: var(--text-tertiary);">${phase.duration}</span>
            </div>
          `).join('')}
        </div>

        <!-- Phase Details -->
        <div class="consultant-phase-details">
          ${plan.phases.map((phase, i) => `
            <div class="consultant-phase-card" style="animation: fadeInUp 0.3s ease ${0.1 * i}s both;">
              <div class="consultant-phase-header" style="border-left: 3px solid ${phase.color};">
                <div class="consultant-phase-number" style="background: ${phase.color}; color: white;">
                  ${i + 1}
                </div>
                <div>
                  <div class="consultant-phase-name">${phase.icon} ${phase.name}</div>
                  <div class="consultant-phase-duration">⏱️ ${phase.duration}</div>
                </div>
              </div>
              <div class="consultant-phase-tasks">
                ${phase.tasks.map(task => `
                  <div class="consultant-phase-task">
                    <span class="consultant-phase-task-dot" style="background: ${phase.color};"></span>
                    <span>${task}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Create a project from the consultant analysis
   */
  async function createProjectFromAnalysis(result) {
    const btn = document.getElementById('consultant-create-project');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Creating Project...';

    await new Promise(r => setTimeout(r, 600));

    const accepted = result.evaluationTable.filter(e => e.decision === 'accept');
    const features = accepted.filter(a => a.classification === 'feature' || a.classification === 'valid-extension');
    const constraints = accepted.filter(a => a.classification === 'constraint');

    // Build requirements data
    const requirements = {
      objective: result.problemUnderstanding.coreObjective,
      features: features.map(f => f.statement),
      userTypes: ['Admin', 'End User'],
      constraints: constraints.map(c => c.statement),
      risks: [
        result.summary.rejected > 0 ? `${result.summary.rejected} client request(s) were out-of-scope — may cause friction` : null,
        result.summary.needsClarification > 0 ? `${result.summary.needsClarification} item(s) need clarification from client` : null,
        'Requirements may evolve during development',
      ].filter(Boolean),
      budgetRange: result.budgetAnalysis.estimated
        ? `$${result.budgetAnalysis.costRange.min.toLocaleString()} - $${result.budgetAnalysis.costRange.max.toLocaleString()}`
        : 'Not specified',
      timeline: result.budgetAnalysis.estimated
        ? `${result.budgetAnalysis.timelineRange.min}-${result.budgetAnalysis.timelineRange.max} weeks`
        : 'Not specified',
      rawInput: result.rawInput,
    };

    // Generate proposal from requirements
    const proposalResult = ConsultantAgent.generateProposal(requirements, {
      clientName: 'Client',
      company: result.problemUnderstanding.projectType + ' Project',
    });

    // Generate plan from requirements
    const planResult = PlannerAgent.generatePlan(requirements, proposalResult.success ? proposalResult.data : null);

    // Create the project
    const project = await Store.createProject({
      clientName: 'Client',
      company: result.problemUnderstanding.projectType + ' Project',
      email: '',
      requirements,
      proposal: proposalResult.success ? proposalResult.data : null,
      plan: planResult.success ? planResult.data : null,
    });

    await Store.updateProject(project.id, {
      status: proposalResult.success ? 'proposal' : 'requirements',
    });

    await Store.addProjectActivity(project.id, {
      type: 'analysis',
      message: `Project created from Consultant analysis: ${result.summary.accepted} features accepted, ${result.summary.rejected} rejected`,
      agent: 'consultant-analyzer',
    });

    btn.disabled = false;
    btn.innerHTML = '🚀 Create Project from Analysis';

    Toast.success('Project created successfully! Redirecting...');
    await Sidebar.refresh();

    // Navigate to the project
    setTimeout(() => {
      Router.navigate('projects', { id: project.id });
    }, 800);
  }

  // ---- Helpers ----

  function getClassificationIcon(classification) {
    const icons = {
      'feature': '🟢',
      'vague': '🟡',
      'constraint': '🔵',
      'scope-change': '🔴',
      'valid-extension': '🟣',
    };
    return icons[classification] || '⚪';
  }

  function formatClassification(classification) {
    const labels = {
      'feature': 'Feature',
      'vague': 'Vague',
      'constraint': 'Constraint',
      'scope-change': 'Scope Change',
      'valid-extension': 'Extension',
    };
    return labels[classification] || classification;
  }

  function getDecisionIcon(decision) {
    const icons = {
      'accept': '✅',
      'reject': '❌',
      'clarify': '❓',
    };
    return icons[decision] || '—';
  }

  function formatBudgetStatus(status) {
    const labels = {
      'within-budget': 'Within Budget',
      'tight-budget': 'Tight Budget',
      'over-budget': 'Over Budget',
    };
    return labels[status] || status;
  }

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return { render };
})();

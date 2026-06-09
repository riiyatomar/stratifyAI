// ========================================
// STRATIFY AI — Scope Control Page
// ========================================
// Full consultant-grade structured output:
// 1. Problem Understanding  2. Base Scope  3. Scope Evaluation Table
// 4. Budget & Feasibility  5. Execution Plan  6. Risks & Notes

const ScopePage = (() => {
  let selectedProjectId = null;

  function render(container, params) {
    selectedProjectId = params?.projectId || null;
    const projects = Store.getProjects().filter(p => p.requirements);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">Scope Control</h1>
            <p class="page-subtitle">Evaluate new client requests against original scope — powered by the Auditor Agent</p>
          </div>
        </div>
      </div>

      ${projects.length === 0 ? `
        <div class="glass-card-static empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No Projects Available</h3>
          <p class="empty-state-text">Create a project with requirements first to use scope control.</p>
          <button class="btn btn-primary" onclick="Router.navigate('new-project')">➕ New Project</button>
        </div>
      ` : `
        <!-- Project Selector -->
        <div class="glass-card-static scope-input-area">
          <h4 style="margin-bottom: var(--space-4);">🔍 Scope Evaluation</h4>

          <div class="wizard-form">
            <div class="input-group">
              <label for="scope-project">Select Project</label>
              <select class="select-field" id="scope-project">
                <option value="">Choose a project...</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === selectedProjectId ? 'selected' : ''}>
                    ${p.company || p.clientName} — ${capitalizeFirst(p.status)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="input-group">
              <label for="scope-request">New Client Request</label>
              <textarea class="input-field" id="scope-request" rows="4"
                placeholder="Paste or type the client's new request here. Each statement will be classified as FEATURE, VAGUE, CONSTRAINT, SCOPE_CHANGE, or VALID_EXTENSION.

Example: Can we add a chatbot for customer support? Also, I'd like the dashboard to show daily active users. Make it better. We need this done in 2 weeks."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button class="btn btn-primary" id="run-scope-check">
                🔍 Run Scope Analysis
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div id="scope-results"></div>

        <!-- History -->
        <div id="scope-history"></div>
      `}
    `;

    if (selectedProjectId) {
      renderScopeHistory(selectedProjectId);
    }

    document.getElementById('scope-project')?.addEventListener('change', (e) => {
      selectedProjectId = e.target.value;
      document.getElementById('scope-results').innerHTML = '';
      if (selectedProjectId) {
        renderScopeHistory(selectedProjectId);
      } else {
        document.getElementById('scope-history').innerHTML = '';
      }
    });

    document.getElementById('run-scope-check')?.addEventListener('click', runScopeCheck);
  }

  async function runScopeCheck() {
    const projectId = document.getElementById('scope-project')?.value;
    const request = document.getElementById('scope-request')?.value?.trim();

    if (!projectId) { Toast.warning('Please select a project first.'); return; }
    if (!request || request.length < 5) { Toast.warning('Please enter the client\'s request (at least 5 characters).'); return; }

    const btn = document.getElementById('run-scope-check');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Analyzing...';

    Orchestrator.onProgress((agentName, agentIcon, status) => {
      if (status === 'processing') {
        btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> ${agentName} analyzing...`;
      }
    });

    const result = await Orchestrator.runScopeEvaluation(projectId, request);

    btn.disabled = false;
    btn.innerHTML = '🔍 Run Scope Analysis';

    if (result.success) {
      renderResults(result);
      renderScopeHistory(projectId);
      document.getElementById('scope-request').value = '';
      Toast.success(`Scope analysis complete: ${result.summary.inScope} in-scope, ${result.summary.outScope} out-of-scope, ${result.summary.vague || 0} vague, ${result.summary.partial} partial`);
    } else {
      Toast.error(result.message || 'Analysis failed');
    }
  }

  // ========================================
  // STRUCTURED CONSULTANT OUTPUT RENDERER
  // ========================================

  function renderResults(result) {
    const resultsDiv = document.getElementById('scope-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
      <!-- Section 1: Problem Understanding -->
      ${renderProblemUnderstanding(result)}

      <!-- Section 2: Base Scope -->
      ${renderBaseScope(result)}

      <!-- Section 3: Scope Evaluation Table -->
      ${renderScopeTable(result)}

      <!-- Section 4: Budget & Feasibility -->
      ${renderBudgetAnalysis(result)}

      <!-- Section 5: Execution Plan -->
      ${renderExecutionPlan(result)}

      <!-- Section 6: Risks & Notes -->
      ${renderRisks(result)}
    `;
  }

  // ---- Section 1: Problem Understanding ----
  function renderProblemUnderstanding(result) {
    return `
      <div class="glass-card-static scope-section" style="animation: fadeInUp 0.4s ease forwards;">
        <div class="scope-section-header">
          <span class="scope-section-icon">🧠</span>
          <h4 class="scope-section-title">Problem Understanding</h4>
        </div>
        <p class="scope-section-body">${result.problemUnderstanding || 'No summary available.'}</p>
        <div class="scope-verdict-bar verdict-${getVerdictClass(result.overallVerdict)}">
          <span class="scope-verdict-label">Verdict:</span>
          <span class="scope-verdict-text">${result.overallVerdict}</span>
        </div>
      </div>
    `;
  }

  // ---- Section 2: Base Scope ----
  function renderBaseScope(result) {
    const features = result.baseScope || [];
    if (features.length === 0) return '';
    return `
      <div class="glass-card-static scope-section" style="animation: fadeInUp 0.5s ease forwards;">
        <div class="scope-section-header">
          <span class="scope-section-icon">📦</span>
          <h4 class="scope-section-title">Base Scope (Original Features)</h4>
        </div>
        <div class="scope-base-grid">
          ${features.map(f => `
            <div class="scope-base-item">
              <span class="scope-base-dot"></span>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---- Section 3: Scope Evaluation Table ----
  function renderScopeTable(result) {
    const items = result.scopeEvaluation || [];
    if (items.length === 0) return '';
    return `
      <div class="glass-card-static scope-section" style="animation: fadeInUp 0.6s ease forwards;">
        <div class="scope-section-header">
          <span class="scope-section-icon">🛑</span>
          <h4 class="scope-section-title">Scope Evaluation</h4>
          <div class="scope-summary-badges">
            ${result.summary.inScope > 0 ? `<span class="scope-tag in-scope">✅ ${result.summary.inScope} In Scope</span>` : ''}
            ${result.summary.outScope > 0 ? `<span class="scope-tag out-scope">❌ ${result.summary.outScope} Out of Scope</span>` : ''}
            ${(result.summary.vague || 0) > 0 ? `<span class="scope-tag vague">🔶 ${result.summary.vague} Vague</span>` : ''}
            ${result.summary.partial > 0 ? `<span class="scope-tag partial">⚠️ ${result.summary.partial} Partial</span>` : ''}
          </div>
        </div>
        <div class="scope-table-wrap">
          <table class="scope-eval-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="scope-eval-row scope-eval-row--${getRowClass(item.type)}">
                  <td class="scope-eval-request">${item.request}</td>
                  <td><span class="type-badge type-badge--${item.type}">${formatType(item.type)}</span></td>
                  <td class="scope-eval-status">${item.status}</td>
                  <td class="scope-eval-reason">${item.reason}</td>
                  <td class="scope-eval-impact">
                    ${item.impact ? `<span>⏱️ ${item.impact.time || 'N/A'}</span><span>💰 ${item.impact.cost || 'N/A'}</span>` : 'N/A'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ---- Section 4: Budget & Feasibility ----
  function renderBudgetAnalysis(result) {
    const ba = result.budgetAnalysis;
    if (!ba) return '';
    return `
      <div class="glass-card-static scope-section" style="animation: fadeInUp 0.7s ease forwards;">
        <div class="scope-section-header">
          <span class="scope-section-icon">💰</span>
          <h4 class="scope-section-title">Budget & Feasibility Analysis</h4>
        </div>
        <div class="budget-analysis-grid">
          <div class="budget-analysis-card">
            <div class="budget-analysis-label">Additional Cost</div>
            <div class="budget-analysis-value">${ba.additionalCostEstimate}</div>
          </div>
          <div class="budget-analysis-card">
            <div class="budget-analysis-label">Additional Time</div>
            <div class="budget-analysis-value">${ba.additionalTimeEstimate}</div>
          </div>
        </div>
        <div class="budget-analysis-recommendation">
          <span class="budget-rec-icon">${ba.additionalCostEstimate === '$0' ? '🟢' : '🟡'}</span>
          <span>${ba.recommendation}</span>
        </div>
      </div>
    `;
  }

  // ---- Section 5: Execution Plan ----
  function renderExecutionPlan(result) {
    const plan = result.executionPlan || [];
    if (plan.length === 0) {
      return `
        <div class="glass-card-static scope-section" style="animation: fadeInUp 0.8s ease forwards;">
          <div class="scope-section-header">
            <span class="scope-section-icon">📊</span>
            <h4 class="scope-section-title">Execution Plan</h4>
          </div>
          <p class="scope-section-body text-secondary" style="font-style: italic;">No in-scope or valid extension items to execute. All requests are either out-of-scope, vague, or constraints.</p>
        </div>
      `;
    }
    return `
      <div class="glass-card-static scope-section" style="animation: fadeInUp 0.8s ease forwards;">
        <div class="scope-section-header">
          <span class="scope-section-icon">📊</span>
          <h4 class="scope-section-title">Execution Plan</h4>
          <span class="scope-plan-count">${plan.length} actionable item(s)</span>
        </div>
        <div class="scope-plan-list">
          ${plan.map((item, i) => `
            <div class="scope-plan-item">
              <span class="scope-plan-num">${i + 1}</span>
              <div class="scope-plan-detail">
                <span class="scope-plan-feature">${item.feature}</span>
                <span class="type-badge type-badge--${item.type}" style="font-size: 0.65rem;">${formatType(item.type)}</span>
              </div>
              <div class="scope-plan-impact">
                <span>⏱️ ${item.impact?.time || 'Included'}</span>
                <span>💰 ${item.impact?.cost || 'Included'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---- Section 6: Risks & Notes ----
  function renderRisks(result) {
    const risks = result.risks || [];
    if (risks.length === 0) return '';
    return `
      <div class="glass-card-static scope-section" style="animation: fadeInUp 0.9s ease forwards;">
        <div class="scope-section-header">
          <span class="scope-section-icon">⚠️</span>
          <h4 class="scope-section-title">Risks & Notes</h4>
        </div>
        <div class="scope-risks-list">
          ${risks.map(r => `
            <div class="scope-risk-item scope-risk-item--${r.type}">
              <span class="scope-risk-icon">${r.icon}</span>
              <span class="scope-risk-text">${r.message}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---- Helpers ----
  function formatType(type) {
    const map = {
      'FEATURE': 'Feature',
      'VAGUE': 'Vague',
      'CONSTRAINT': 'Constraint',
      'SCOPE_CHANGE': 'Scope Change',
      'VALID_EXTENSION': 'Extension',
    };
    return map[type] || type;
  }

  function getRowClass(type) {
    const map = {
      'FEATURE': 'feature',
      'VAGUE': 'vague',
      'CONSTRAINT': 'constraint',
      'SCOPE_CHANGE': 'scope-change',
      'VALID_EXTENSION': 'extension',
    };
    return map[type] || 'default';
  }

  function getVerdictClass(verdict) {
    if (!verdict) return 'neutral';
    if (verdict.includes('approved') || verdict.includes('All items')) return 'success';
    if (verdict.includes('out-of-scope') || verdict.includes('change request')) return 'danger';
    return 'warning';
  }

  // ---- History Renderer ----
  function renderScopeHistory(projectId) {
    const project = Store.getProject(projectId);
    const historyDiv = document.getElementById('scope-history');
    if (!historyDiv || !project) return;

    const log = project.scopeLog || [];
    if (log.length === 0) { historyDiv.innerHTML = ''; return; }

    historyDiv.innerHTML = `
      <div class="glass-card-static" style="padding: var(--space-5);">
        <h4 style="margin-bottom: var(--space-4);">📜 Scope Change History</h4>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${log.map(entry => `
            <div class="scope-result-card">
              <span class="scope-result-icon">
                ${entry.classification === 'in-scope' ? '✅' : entry.classification === 'out-scope' ? '❌' : entry.classification === 'vague' ? '🔶' : '⚠️'}
              </span>
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
      </div>
    `;
  }

  return { render };
})();

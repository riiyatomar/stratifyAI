// ========================================
// STRATIFY AI — New Project Wizard Page
// ========================================

const NewProjectPage = (() => {
  let currentStep = 1;
  const totalSteps = 4;
  let formData = {
    clientName: '',
    company: '',
    email: '',
    rawDescription: '',
    budget: '',
    timeline: '',
    budgetValue: 25000,
    customBudget: '',
    customTimeline: '',
    useCustomBudget: false,
  };

  function render(container) {
    currentStep = 1;
    formData = { clientName: '', company: '', email: '', rawDescription: '', budget: '', timeline: '', budgetValue: 25000, customBudget: '', customTimeline: '', useCustomBudget: false };
    renderStep(container);
  }

  function renderStep(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">New Project</h1>
            <p class="page-subtitle">Feed requirements to the AI agent pipeline</p>
          </div>
        </div>
      </div>

      <div class="wizard">
        <!-- Step Indicator -->
        <div class="wizard-steps">
          <div class="steps">
            ${renderStepIndicator(1, 'Client Info')}
            <div class="step-connector" style="${currentStep > 1 ? 'background: var(--color-success)' : ''}"></div>
            ${renderStepIndicator(2, 'Requirements')}
            <div class="step-connector" style="${currentStep > 2 ? 'background: var(--color-success)' : ''}"></div>
            ${renderStepIndicator(3, 'Budget & Timeline')}
            <div class="step-connector" style="${currentStep > 3 ? 'background: var(--color-success)' : ''}"></div>
            ${renderStepIndicator(4, 'Review & Run')}
          </div>
        </div>

        <!-- Step Content -->
        <div class="glass-card-static" style="padding: var(--space-6);">
          <div class="wizard-body" id="wizard-body">
            ${getStepContent()}
          </div>
        </div>

        <!-- Footer -->
        <div class="wizard-footer">
          <button class="btn btn-secondary" id="wizard-back" ${currentStep === 1 ? 'style="visibility:hidden"' : ''}>
            ← Back
          </button>
          <span class="text-secondary" style="font-size: var(--text-sm);">
            Step ${currentStep} of ${totalSteps}
          </span>
          ${currentStep < totalSteps ? `
            <button class="btn btn-primary" id="wizard-next">
              Next →
            </button>
          ` : `
            <button class="btn btn-primary btn-lg" id="wizard-run">
              🧠 Run Agent Pipeline
            </button>
          `}
        </div>
      </div>
    `;

    bindEvents(container);
  }

  function renderStepIndicator(step, label) {
    let cls = '';
    if (step < currentStep) cls = 'completed';
    else if (step === currentStep) cls = 'active';

    return `
      <div class="step ${cls}">
        <div class="step-number">${step < currentStep ? '✓' : step}</div>
        <span class="step-label">${label}</span>
      </div>
    `;
  }

  function getStepContent() {
    switch (currentStep) {
      case 1:
        return `
          <div class="wizard-section">
            <h3 class="wizard-section-title">👤 Client Information</h3>
            <div class="wizard-form">
              <div class="wizard-row">
                <div class="input-group">
                  <label for="client-name">Client Name *</label>
                  <input type="text" class="input-field" id="client-name" placeholder="Enter the name"
                    value="${formData.clientName}">
                </div>
                <div class="input-group">
                  <label for="company-name">Company Name *</label>
                  <input type="text" class="input-field" id="company-name" placeholder="Enter the company name"
                    value="${formData.company}">
                </div>
              </div>
              <div class="input-group">
                <label for="client-email">Email Address</label>
                <input type="email" class="input-field" id="client-email" placeholder="Enter the email"
                  value="${formData.email}">
              </div>
            </div>
          </div>
        `;

      case 2:
        return `
          <div class="wizard-section">
            <h3 class="wizard-section-title">📋 Project Requirements</h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--space-4); font-size: var(--text-sm);">
              Describe the project in detail. The <strong>Business Analyst Agent</strong> will classify each statement as a Feature, Constraint, Scope Change, or flag it as Vague.
            </p>
            <div class="wizard-form">
              <div class="input-group">
                <label for="raw-description">Project Description *</label>
                <textarea class="input-field" id="raw-description" rows="8"
                  placeholder="Tell us about your project in your own words. What are you looking to build, who is it for, and what key features or constraints do you have in mind?"
                >${formData.rawDescription}</textarea>
              </div>
              <div style="display: flex; justify-content: flex-end; margin-top: var(--space-2);">
                <button class="btn btn-ghost" id="preview-classify" type="button" style="font-size: var(--text-sm);">
                  🔎 Preview Classification
                </button>
              </div>
              <div id="classification-preview"></div>
            </div>
          </div>
        `;

      case 3:
        const isCustomTimeline = formData.timeline === 'custom';
        return `
          <div class="wizard-section">
            <h3 class="wizard-section-title">💰 Budget & Timeline</h3>
            <div class="wizard-form">
              <div class="input-group">
                <label>Budget Range</label>
                <div class="budget-mode-toggle">
                  <button class="btn btn-sm ${!formData.useCustomBudget ? 'btn-primary' : 'btn-ghost'}" id="budget-mode-slider" type="button">Slider</button>
                  <button class="btn btn-sm ${formData.useCustomBudget ? 'btn-primary' : 'btn-ghost'}" id="budget-mode-custom" type="button">Enter Manually</button>
                </div>

                <div id="budget-slider-section" style="${formData.useCustomBudget ? 'display:none' : ''}">
                  <div class="budget-slider-container">
                    <input type="range" class="budget-range" id="budget-slider"
                      min="5000" max="200000" step="5000" value="${formData.budgetValue}">
                    <div class="budget-labels">
                      <span>$5K</span>
                      <span>$50K</span>
                      <span>$100K</span>
                      <span>$200K</span>
                    </div>
                    <div class="budget-display text-gradient" id="budget-display">
                      $${(formData.budgetValue / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                <div id="budget-custom-section" style="${!formData.useCustomBudget ? 'display:none' : ''}">
                  <div class="custom-budget-input-wrap">
                    <span class="custom-budget-prefix">$</span>
                    <input type="number" class="input-field" id="custom-budget-input"
                      placeholder="e.g. 75000"
                      value="${formData.customBudget}"
                      min="0" step="1000">
                  </div>
                  <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: var(--space-2);">
                    Enter your exact budget amount in dollars
                  </p>
                </div>
              </div>

              <div class="input-group">
                <label for="timeline-select">Expected Timeline</label>
                <select class="select-field" id="timeline-select">
                  <option value="" ${!formData.timeline ? 'selected' : ''}>Select timeline...</option>
                  <option value="1-2 months" ${formData.timeline === '1-2 months' ? 'selected' : ''}>1-2 months</option>
                  <option value="2-3 months" ${formData.timeline === '2-3 months' ? 'selected' : ''}>2-3 months</option>
                  <option value="3-6 months" ${formData.timeline === '3-6 months' ? 'selected' : ''}>3-6 months</option>
                  <option value="6-12 months" ${formData.timeline === '6-12 months' ? 'selected' : ''}>6-12 months</option>
                  <option value="12+ months" ${formData.timeline === '12+ months' ? 'selected' : ''}>12+ months</option>
                  <option value="Flexible" ${formData.timeline === 'Flexible' ? 'selected' : ''}>Flexible</option>
                  <option value="custom" ${formData.timeline === 'custom' ? 'selected' : ''}>✏️ Enter Manually...</option>
                </select>
                <div id="custom-timeline-section" style="${!isCustomTimeline ? 'display:none' : ''}; margin-top: var(--space-3);">
                  <input type="text" class="input-field" id="custom-timeline-input"
                    placeholder="e.g. 4 weeks, 45 days, 10 sprints..."
                    value="${formData.customTimeline}">
                  <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: var(--space-2);">
                    Enter your preferred timeline in any format
                  </p>
                </div>
              </div>
            </div>
          </div>
        `;

      case 4:
        return `
          <div class="wizard-section">
            <h3 class="wizard-section-title">🚀 Review & Launch Pipeline</h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--space-5); font-size: var(--text-sm);">
              Review the information below. When you click "Run Agent Pipeline", all 4 AI agents will process the data sequentially.
            </p>

            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div class="glass-card-static" style="padding: var(--space-4);">
                <h5 style="color: var(--text-secondary); margin-bottom: var(--space-2);">👤 Client</h5>
                <p><strong>${formData.clientName || 'Not provided'}</strong> · ${formData.company || 'Not provided'}</p>
                ${formData.email ? `<p class="text-secondary" style="font-size: var(--text-sm);">${formData.email}</p>` : ''}
              </div>

              <div class="glass-card-static" style="padding: var(--space-4);">
                <h5 style="color: var(--text-secondary); margin-bottom: var(--space-2);">📋 Requirements</h5>
                <p style="font-size: var(--text-sm); line-height: 1.6; color: var(--text-secondary);">
                  ${formData.rawDescription ? truncate(formData.rawDescription, 300) : '<em>Not provided</em>'}
                </p>
              </div>

              <div class="glass-card-static" style="padding: var(--space-4);">
                <h5 style="color: var(--text-secondary); margin-bottom: var(--space-2);">💰 Budget & Timeline</h5>
                <p>
                  Budget: <strong>${formData.useCustomBudget && formData.customBudget ? '$' + Number(formData.customBudget).toLocaleString() : '$' + (formData.budgetValue / 1000).toFixed(0) + 'K'}</strong>
                  ${formData.timeline ? ` · Timeline: <strong>${formData.timeline === 'custom' ? (formData.customTimeline || 'Custom') : formData.timeline}</strong>` : ''}
                </p>
              </div>

              <!-- Agent Pipeline Preview -->
              <div class="glass-card-static" style="padding: var(--space-4);" id="pipeline-status">
                <h5 style="color: var(--text-secondary); margin-bottom: var(--space-3);">🧠 Agent Pipeline</h5>
                <div style="display: flex; flex-direction: column; gap: var(--space-3);" id="agent-status-list">
                  <div class="processing-card" style="padding: var(--space-3);">
                    <div class="agent-avatar analyst">📋</div>
                    <div class="agent-info">
                      <span class="agent-name">Business Analyst</span>
                      <span class="agent-status">Waiting...</span>
                    </div>
                  </div>
                  <div class="processing-card" style="padding: var(--space-3);">
                    <div class="agent-avatar consultant">💼</div>
                    <div class="agent-info">
                      <span class="agent-name">Pre-Sales Consultant</span>
                      <span class="agent-status">Waiting...</span>
                    </div>
                  </div>
                  <div class="processing-card" style="padding: var(--space-3);">
                    <div class="agent-avatar planner">📊</div>
                    <div class="agent-info">
                      <span class="agent-name">Project Manager</span>
                      <span class="agent-status">Waiting...</span>
                    </div>
                  </div>
                  <div class="processing-card" style="padding: var(--space-3);">
                    <div class="agent-avatar auditor">🔍</div>
                    <div class="agent-info">
                      <span class="agent-name">Scope Control Auditor</span>
                      <span class="agent-status">Standby for future requests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
    }
  }

  function bindEvents(container) {
    // Back button
    document.getElementById('wizard-back')?.addEventListener('click', () => {
      saveCurrentStepData();
      currentStep--;
      renderStep(container);
    });

    // Next button
    document.getElementById('wizard-next')?.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      saveCurrentStepData();
      currentStep++;
      renderStep(container);
    });

    // Run pipeline button
    document.getElementById('wizard-run')?.addEventListener('click', () => {
      runPipeline(container);
    });

    // Classification preview button (Step 2)
    document.getElementById('preview-classify')?.addEventListener('click', () => {
      const desc = document.getElementById('raw-description')?.value?.trim();
      if (!desc || desc.length < 10) {
        Toast.warning('Enter at least a few sentences to preview classification.');
        return;
      }
      const classified = AnalystAgent.classifyStatements(desc, null);
      renderClassificationPreview(classified);
    });

    // Budget mode toggle
    document.getElementById('budget-mode-slider')?.addEventListener('click', () => {
      formData.useCustomBudget = false;
      document.getElementById('budget-slider-section').style.display = '';
      document.getElementById('budget-custom-section').style.display = 'none';
      document.getElementById('budget-mode-slider').className = 'btn btn-sm btn-primary';
      document.getElementById('budget-mode-custom').className = 'btn btn-sm btn-ghost';
    });

    document.getElementById('budget-mode-custom')?.addEventListener('click', () => {
      formData.useCustomBudget = true;
      document.getElementById('budget-slider-section').style.display = 'none';
      document.getElementById('budget-custom-section').style.display = '';
      document.getElementById('budget-mode-slider').className = 'btn btn-sm btn-ghost';
      document.getElementById('budget-mode-custom').className = 'btn btn-sm btn-primary';
    });

    // Budget slider
    const budgetSlider = document.getElementById('budget-slider');
    if (budgetSlider) {
      budgetSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        formData.budgetValue = val;
        formData.budget = `$${(val / 1000).toFixed(0)}K`;
        document.getElementById('budget-display').textContent = `$${(val / 1000).toFixed(0)}K`;
      });
    }

    // Custom budget input
    document.getElementById('custom-budget-input')?.addEventListener('input', (e) => {
      formData.customBudget = e.target.value;
    });

    // Timeline select — show/hide custom input
    document.getElementById('timeline-select')?.addEventListener('change', (e) => {
      const customSection = document.getElementById('custom-timeline-section');
      if (e.target.value === 'custom') {
        customSection.style.display = '';
        formData.timeline = 'custom';
      } else {
        customSection.style.display = 'none';
        formData.timeline = e.target.value;
      }
    });

    // Custom timeline input
    document.getElementById('custom-timeline-input')?.addEventListener('input', (e) => {
      formData.customTimeline = e.target.value;
    });
  }

  function renderClassificationPreview(classified) {
    const container = document.getElementById('classification-preview');
    if (!container) return;

    const typeColors = {
      'FEATURE': 'var(--color-success)',
      'VAGUE': '#f59e0b',
      'CONSTRAINT': 'var(--accent-cyan)',
      'SCOPE_CHANGE': 'var(--color-danger)',
      'VALID_EXTENSION': '#8b5cf6',
    };
    const typeLabels = {
      'FEATURE': '✅ Feature',
      'VAGUE': '🔶 Vague',
      'CONSTRAINT': '🔒 Constraint',
      'SCOPE_CHANGE': '❌ Scope Change',
      'VALID_EXTENSION': '✅ Extension',
    };

    const vagueCount = classified.filter(c => c.type === 'VAGUE').length;

    container.innerHTML = `
      <div class="classification-preview-box" style="margin-top: var(--space-4); animation: fadeInUp 0.3s ease forwards;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
          <h5 style="margin: 0; font-size: var(--text-sm); color: var(--text-secondary);">📊 Statement Classification Preview</h5>
          ${vagueCount > 0 ? `<span class="scope-tag vague" style="font-size: 0.65rem;">⚠️ ${vagueCount} vague item(s) — consider clarifying</span>` : `<span class="scope-tag in-scope" style="font-size: 0.65rem;">✅ All statements are actionable</span>`}
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          ${classified.map(c => `
            <div class="classify-preview-row" style="border-left: 3px solid ${typeColors[c.type] || 'var(--border-primary)'}; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); background: rgba(255,255,255,0.02);">
              <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                <span class="type-badge type-badge--${c.type}" style="font-size: 0.6rem;">${typeLabels[c.type] || c.type}</span>
                <span style="font-size: var(--text-sm); color: var(--text-primary);">${c.text}</span>
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 2px; padding-left: var(--space-2);">${c.reason}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function saveCurrentStepData() {
    switch (currentStep) {
      case 1:
        formData.clientName = document.getElementById('client-name')?.value || '';
        formData.company = document.getElementById('company-name')?.value || '';
        formData.email = document.getElementById('client-email')?.value || '';
        break;
      case 2:
        formData.rawDescription = document.getElementById('raw-description')?.value || '';
        break;
      case 3:
        formData.timeline = document.getElementById('timeline-select')?.value || '';
        if (formData.useCustomBudget) {
          formData.customBudget = document.getElementById('custom-budget-input')?.value || '';
        }
        if (formData.timeline === 'custom') {
          formData.customTimeline = document.getElementById('custom-timeline-input')?.value || '';
        }
        break;
    }
  }

  function validateCurrentStep() {
    switch (currentStep) {
      case 1:
        const name = document.getElementById('client-name')?.value?.trim();
        const company = document.getElementById('company-name')?.value?.trim();
        if (!name && !company) {
          Toast.warning('Please enter at least a client name or company name.');
          return false;
        }
        return true;
      case 2:
        const desc = document.getElementById('raw-description')?.value?.trim();
        if (!desc || desc.length < 20) {
          Toast.warning('Please provide a detailed project description (at least 20 characters).');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  async function runPipeline(container) {
    const runBtn = document.getElementById('wizard-run');
    const backBtn = document.getElementById('wizard-back');
    if (runBtn) {
      runBtn.disabled = true;
      runBtn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Processing...';
    }
    if (backBtn) backBtn.disabled = true;

    // Set up progress callback
    Orchestrator.onProgress((agentName, agentIcon, status, data) => {
      updateAgentStatus(agentName, agentIcon, status, data);
    });

    // Resolve final budget value
    let finalBudget;
    if (formData.useCustomBudget && formData.customBudget) {
      const numVal = parseFloat(formData.customBudget);
      finalBudget = numVal >= 1000 ? `$${(numVal / 1000).toFixed(numVal % 1000 === 0 ? 0 : 1)}K` : `$${numVal}`;
    } else {
      finalBudget = formData.budget || `$${(formData.budgetValue / 1000).toFixed(0)}K`;
    }

    // Resolve final timeline value
    const finalTimeline = formData.timeline === 'custom' ? formData.customTimeline : formData.timeline;

    const input = {
      rawDescription: formData.rawDescription,
      budget: finalBudget,
      timeline: finalTimeline,
    };

    const clientInfo = {
      clientName: formData.clientName,
      company: formData.company,
      email: formData.email,
    };

    try {
      const result = await Orchestrator.runFullPipeline(input, clientInfo);

      if (result.success) {
        Toast.success('All agents completed successfully! Project created.');
        await Sidebar.refresh();

        // Show success state briefly, then navigate
        setTimeout(() => {
          Router.navigate('projects/' + result.project.id);
        }, 1500);
      } else {
        Toast.error(`Pipeline failed at ${result.stage}: ${result.message}`);
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.innerHTML = '🧠 Run Agent Pipeline';
        }
        if (backBtn) backBtn.disabled = false;
      }
    } catch (err) {
      Toast.error('Unexpected error: ' + err.message);
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.innerHTML = '🧠 Run Agent Pipeline';
      }
      if (backBtn) backBtn.disabled = false;
    }
  }

  function updateAgentStatus(agentName, agentIcon, status, data) {
    const statusList = document.getElementById('agent-status-list');
    if (!statusList) return;

    const cards = statusList.querySelectorAll('.processing-card');
    const agentMap = {
      'Business Analyst': 0,
      'Pre-Sales Consultant': 1,
      'Project Manager': 2,
      'Scope Control Auditor': 3,
      'Orchestrator': -1,
    };

    const idx = agentMap[agentName];
    if (idx === undefined || idx < 0) return;

    const card = cards[idx];
    if (!card) return;

    const statusEl = card.querySelector('.agent-status');

    if (status === 'processing') {
      statusEl.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span> Processing...';
      card.style.borderColor = 'var(--accent-cyan)';
      card.style.boxShadow = 'var(--shadow-glow-cyan)';
    } else if (status === 'complete') {
      statusEl.textContent = data?.summary || 'Complete ✓';
      statusEl.style.color = 'var(--color-success)';
      card.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      card.style.boxShadow = 'none';
    } else if (status === 'error') {
      statusEl.textContent = data?.message || 'Error ✕';
      statusEl.style.color = 'var(--color-danger)';
      card.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
  }

  function truncate(str, max) {
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  return { render };
})();

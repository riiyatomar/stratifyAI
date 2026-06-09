// ========================================
// STRATIFY AI — AI Agents Page
// ========================================

const AgentsPage = (() => {
  function render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">AI Agents</h1>
            <p class="page-subtitle">Your 4 specialized AI agents + orchestrator</p>
          </div>
        </div>
      </div>

      <div class="bento-grid bento-grid-2 stagger-children" style="margin-top: var(--space-2);">
        <!-- Agent 1: Business Analyst -->
        <div class="glass-card-static" id="agent-card-analyst" style="padding: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
            <div class="agent-avatar analyst" style="width: 56px; height: 56px; font-size: 1.5rem;">📋</div>
            <div>
              <h4>Business Analyst Agent</h4>
              <p class="text-secondary" style="font-size: var(--text-sm);">Agent 1 · Requirement Analysis</p>
            </div>
          </div>
          <div class="divider"></div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3);">
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Role</h6>
              <p style="font-size: var(--text-sm);">Break down client requirements into structured format</p>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Extracts</h6>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                <span class="badge badge-primary">Objective</span>
                <span class="badge badge-primary">Features</span>
                <span class="badge badge-primary">User Types</span>
                <span class="badge badge-primary">Constraints</span>
                <span class="badge badge-primary">Risks</span>
              </div>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Capabilities</h6>
              <p style="font-size: var(--text-sm); color: var(--text-secondary);">Smart clarification questions, keyword extraction, risk assessment, confidence scoring</p>
            </div>
          </div>
        </div>

        <!-- Agent 2: Pre-Sales Consultant -->
        <div class="glass-card-static" id="agent-card-consultant" style="padding: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
            <div class="agent-avatar consultant" style="width: 56px; height: 56px; font-size: 1.5rem;">💼</div>
            <div>
              <h4>Pre-Sales Consultant Agent</h4>
              <p class="text-secondary" style="font-size: var(--text-sm);">Agent 2 · Proposal Generation</p>
            </div>
          </div>
          <div class="divider"></div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3);">
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Role</h6>
              <p style="font-size: var(--text-sm);">Generate client-friendly, persuasive proposals</p>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Outputs</h6>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                <span class="badge badge-primary">Problem Statement</span>
                <span class="badge badge-primary">Solution</span>
                <span class="badge badge-primary">Feature Grid</span>
                <span class="badge badge-primary">Timeline</span>
                <span class="badge badge-primary">Cost Estimate</span>
                <span class="badge badge-primary">Value Prop</span>
              </div>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Tone</h6>
              <p style="font-size: var(--text-sm); color: var(--text-secondary);">Professional, persuasive, clear — avoids technical overload unless necessary</p>
            </div>
          </div>
        </div>

        <!-- Agent 3: Project Manager -->
        <div class="glass-card-static" id="agent-card-planner" style="padding: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
            <div class="agent-avatar planner" style="width: 56px; height: 56px; font-size: 1.5rem;">📊</div>
            <div>
              <h4>Project Manager Agent</h4>
              <p class="text-secondary" style="font-size: var(--text-sm);">Agent 3 · Execution Planning</p>
            </div>
          </div>
          <div class="divider"></div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3);">
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Role</h6>
              <p style="font-size: var(--text-sm);">Convert requirements into execution plans</p>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Outputs</h6>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                <span class="badge badge-primary">Modules</span>
                <span class="badge badge-primary">Tasks</span>
                <span class="badge badge-primary">Priorities</span>
                <span class="badge badge-primary">Effort Estimates</span>
                <span class="badge badge-primary">Milestones</span>
              </div>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Capabilities</h6>
              <p style="font-size: var(--text-sm); color: var(--text-secondary);">Domain-specific task generation, dependency detection, milestone scheduling</p>
            </div>
          </div>
        </div>

        <!-- Agent 4: Scope Control Auditor -->
        <div class="glass-card-static" id="agent-card-auditor" style="padding: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
            <div class="agent-avatar auditor" style="width: 56px; height: 56px; font-size: 1.5rem;">🔍</div>
            <div>
              <h4>Scope Control Auditor Agent</h4>
              <p class="text-secondary" style="font-size: var(--text-sm);">Agent 4 · Change Detection</p>
            </div>
          </div>
          <div class="divider"></div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3);">
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Role</h6>
              <p style="font-size: var(--text-sm);">Compare new requests against original scope — strict gatekeeper</p>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Classifications</h6>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                <span class="scope-tag in-scope" style="font-size: var(--text-xs);">✅ In Scope</span>
                <span class="scope-tag out-scope" style="font-size: var(--text-xs);">❌ Out of Scope</span>
                <span class="scope-tag partial" style="font-size: var(--text-xs);">⚠️ Needs Discussion</span>
              </div>
            </div>
            <div>
              <h6 style="color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; margin-bottom: var(--space-1);">Approach</h6>
              <p style="font-size: var(--text-sm); color: var(--text-secondary);">Strict and logical — avoids being overly lenient. Provides reasoning and impact analysis.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Orchestrator -->
      <div class="glass-card-static" style="padding: var(--space-6); margin-top: var(--space-5);">
        <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
          <div class="agent-avatar orchestrator" style="width: 56px; height: 56px; font-size: 1.5rem;">🧠</div>
          <div>
            <h4>Orchestrator AI</h4>
            <p class="text-secondary" style="font-size: var(--text-sm);">Pipeline Controller · Chains all agents</p>
          </div>
        </div>
        <div class="divider"></div>
        <div style="margin-top: var(--space-3);">
          <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-4);">
            The Orchestrator manages the sequential execution of all agents, ensuring consistency across outputs. It handles data flow between agents, resolves conflicts intelligently, and maintains the project lifecycle state.
          </p>
          <div class="pipeline-flow" style="justify-content: center;">
            <div class="pipeline-node pipeline-clickable" data-scroll-to="">
              <span class="pipeline-node-icon">📥</span>
              <span class="pipeline-node-name">Input</span>
            </div>
            <span class="pipeline-arrow">→</span>
            <div class="pipeline-node pipeline-clickable" data-scroll-to="agent-card-analyst">
              <span class="pipeline-node-icon">📋</span>
              <span class="pipeline-node-name">Agent 1</span>
            </div>
            <span class="pipeline-arrow">→</span>
            <div class="pipeline-node pipeline-clickable" data-scroll-to="agent-card-consultant">
              <span class="pipeline-node-icon">💼</span>
              <span class="pipeline-node-name">Agent 2</span>
            </div>
            <span class="pipeline-arrow">→</span>
            <div class="pipeline-node pipeline-clickable" data-scroll-to="agent-card-planner">
              <span class="pipeline-node-icon">📊</span>
              <span class="pipeline-node-name">Agent 3</span>
            </div>
            <span class="pipeline-arrow">→</span>
            <div class="pipeline-node pipeline-clickable" data-scroll-to="agent-card-auditor">
              <span class="pipeline-node-icon">🔍</span>
              <span class="pipeline-node-name">Agent 4</span>
            </div>
            <span class="pipeline-arrow">→</span>
            <div class="pipeline-node active pipeline-clickable" data-scroll-to="">
              <span class="pipeline-node-icon">✅</span>
              <span class="pipeline-node-name">Output</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Pipeline node click handlers - scroll to agent cards
    document.querySelectorAll('.pipeline-clickable[data-scroll-to]').forEach(node => {
      node.addEventListener('click', () => {
        const targetId = node.dataset.scrollTo;
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight effect
            el.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
            el.style.boxShadow = '0 0 25px rgba(0, 212, 255, 0.25)';
            el.style.borderColor = 'rgba(0, 212, 255, 0.4)';
            setTimeout(() => {
              el.style.boxShadow = '';
              el.style.borderColor = '';
            }, 1500);
          }
        }
      });
    });
  }

  return { render };
})();

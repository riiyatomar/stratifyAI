// ========================================
// ORCHESTRATOR AI — Agent Pipeline Controller
// ========================================
// Role: Chain all 4 agents in sequence
// Flow: Input → Analyst → Consultant → Planner → Monitor via Auditor
// Ensures consistency across all outputs
// Resolves conflicts intelligently

const Orchestrator = (() => {
  const AGENT_NAME = 'Orchestrator';
  const AGENT_ICON = '🧠';
  const AGENT_COLOR = 'orchestrator';

  let _onProgress = null;

  /**
   * Set a progress callback for UI updates
   * @param {Function} callback - (agentName, status, data) => void
   */
  function onProgress(callback) {
    _onProgress = callback;
  }

  function reportProgress(agentName, agentIcon, status, data = null) {
    if (_onProgress) {
      _onProgress(agentName, agentIcon, status, data);
    }
  }

  /**
   * Run the full agent pipeline: Analyst → Consultant → Planner
   * @param {Object} input - Raw input data
   * @param {Object} clientInfo - { clientName, company, email }
   * @returns {Promise<Object>} Complete project data
   */
  async function runFullPipeline(input, clientInfo) {
    // Simulate processing time for realism
    reportProgress(AnalystAgent.AGENT_NAME, AnalystAgent.AGENT_ICON, 'processing');
    await delay(800);

    // Step 1: Business Analyst
    const analysisResult = AnalystAgent.analyze(input);

    if (!analysisResult.success) {
      reportProgress(AnalystAgent.AGENT_NAME, AnalystAgent.AGENT_ICON, 'error', analysisResult);
      return { success: false, stage: 'analysis', ...analysisResult };
    }

    reportProgress(AnalystAgent.AGENT_NAME, AnalystAgent.AGENT_ICON, 'complete', analysisResult);
    await delay(500);

    // Step 2: Pre-Sales Consultant
    reportProgress(ConsultantAgent.AGENT_NAME, ConsultantAgent.AGENT_ICON, 'processing');
    await delay(1000);

    const proposalResult = ConsultantAgent.generateProposal(analysisResult.data, clientInfo);

    if (!proposalResult.success) {
      reportProgress(ConsultantAgent.AGENT_NAME, ConsultantAgent.AGENT_ICON, 'error', proposalResult);
      return { success: false, stage: 'proposal', ...proposalResult };
    }

    reportProgress(ConsultantAgent.AGENT_NAME, ConsultantAgent.AGENT_ICON, 'complete', proposalResult);
    await delay(500);

    // Step 3: Project Manager
    reportProgress(PlannerAgent.AGENT_NAME, PlannerAgent.AGENT_ICON, 'processing');
    await delay(800);

    const planResult = PlannerAgent.generatePlan(analysisResult.data, proposalResult.data);

    if (!planResult.success) {
      reportProgress(PlannerAgent.AGENT_NAME, PlannerAgent.AGENT_ICON, 'error', planResult);
      return { success: false, stage: 'planning', ...planResult };
    }

    reportProgress(PlannerAgent.AGENT_NAME, PlannerAgent.AGENT_ICON, 'complete', planResult);
    await delay(500);

    // Pipeline complete
    reportProgress(AGENT_NAME, AGENT_ICON, 'complete');

    // Create the project
    const project = Store.createProject({
      clientName: clientInfo.clientName,
      company: clientInfo.company,
      email: clientInfo.email,
      requirements: analysisResult.data,
      proposal: proposalResult.data,
      plan: planResult.data,
    });

    // Update project status
    Store.updateProject(project.id, { status: 'proposal' });

    // Add activity entries
    Store.addProjectActivity(project.id, {
      type: 'analysis',
      message: `Requirements analysis completed: ${analysisResult.summary}`,
      agent: 'analyst',
    });

    Store.addProjectActivity(project.id, {
      type: 'proposal',
      message: `Proposal generated: ${proposalResult.summary}`,
      agent: 'consultant',
    });

    Store.addProjectActivity(project.id, {
      type: 'plan',
      message: `Project plan created: ${planResult.summary}`,
      agent: 'planner',
    });

    return {
      success: true,
      project,
      analysis: analysisResult,
      proposal: proposalResult,
      plan: planResult,
    };
  }

  /**
   * Run only the Analyst agent
   */
  async function runAnalysis(input) {
    reportProgress(AnalystAgent.AGENT_NAME, AnalystAgent.AGENT_ICON, 'processing');
    await delay(600);

    const result = AnalystAgent.analyze(input);
    reportProgress(AnalystAgent.AGENT_NAME, AnalystAgent.AGENT_ICON,
      result.success ? 'complete' : 'error', result);

    return result;
  }

  /**
   * Run proposal generation for an existing project
   */
  async function runProposalGeneration(projectId) {
    const project = Store.getProject(projectId);
    if (!project || !project.requirements) {
      return { success: false, message: 'Project requirements not found.' };
    }

    reportProgress(ConsultantAgent.AGENT_NAME, ConsultantAgent.AGENT_ICON, 'processing');
    await delay(800);

    const result = ConsultantAgent.generateProposal(project.requirements, {
      clientName: project.clientName,
      company: project.company,
    });

    if (result.success) {
      Store.updateProject(projectId, {
        proposal: result.data,
        status: 'proposal',
      });

      Store.addProjectActivity(projectId, {
        type: 'proposal',
        message: `Proposal generated: ${result.summary}`,
        agent: 'consultant',
      });
    }

    reportProgress(ConsultantAgent.AGENT_NAME, ConsultantAgent.AGENT_ICON,
      result.success ? 'complete' : 'error', result);

    return result;
  }

  /**
   * Run plan generation for an existing project
   */
  async function runPlanGeneration(projectId) {
    const project = Store.getProject(projectId);
    if (!project || !project.requirements) {
      return { success: false, message: 'Project requirements not found.' };
    }

    reportProgress(PlannerAgent.AGENT_NAME, PlannerAgent.AGENT_ICON, 'processing');
    await delay(800);

    const result = PlannerAgent.generatePlan(project.requirements, project.proposal);

    if (result.success) {
      Store.updateProject(projectId, {
        plan: result.data,
        status: project.proposal ? 'planning' : 'requirements',
      });

      Store.addProjectActivity(projectId, {
        type: 'plan',
        message: `Project plan created: ${result.summary}`,
        agent: 'planner',
      });
    }

    reportProgress(PlannerAgent.AGENT_NAME, PlannerAgent.AGENT_ICON,
      result.success ? 'complete' : 'error', result);

    return result;
  }

  /**
   * Run scope evaluation for a new client request
   */
  async function runScopeEvaluation(projectId, newRequest) {
    const project = Store.getProject(projectId);
    if (!project) {
      return { success: false, message: 'Project not found.' };
    }

    reportProgress(AuditorAgent.AGENT_NAME, AuditorAgent.AGENT_ICON, 'processing');
    await delay(600);

    const result = AuditorAgent.evaluate(newRequest, project.requirements, project.proposal);

    if (result.success) {
      // Log each result to the scope log
      result.results.forEach(item => {
        Store.addScopeEntry(projectId, {
          request: item.request,
          type: item.type,
          classification: item.classification,
          justification: item.justification,
          impact: item.impact,
          matchConfidence: item.matchConfidence,
        });
      });

      Store.addProjectActivity(projectId, {
        type: 'scope',
        message: `Scope evaluation: ${result.summary.inScope} in-scope, ${result.summary.outScope} out-of-scope, ${result.summary.vague || 0} vague, ${result.summary.partial} needs discussion`,
        agent: 'auditor',
      });
    }

    reportProgress(AuditorAgent.AGENT_NAME, AuditorAgent.AGENT_ICON,
      result.success ? 'complete' : 'error', result);

    return result;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return {
    onProgress,
    runFullPipeline,
    runAnalysis,
    runProposalGeneration,
    runPlanGeneration,
    runScopeEvaluation,
    AGENT_NAME,
    AGENT_ICON,
    AGENT_COLOR,
  };
})();

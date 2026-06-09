// ========================================
// AGENT 3: Senior Project Manager AI
// ========================================
// Role: Convert requirements into execution plan
// Break into modules, tasks, priorities, effort
// Output: Task table, milestones, timeline phases

const PlannerAgent = (() => {
  const AGENT_NAME = 'Project Manager';
  const AGENT_ICON = '📊';
  const AGENT_COLOR = 'planner';

  /**
   * Generate execution plan from requirements and proposal
   * @param {Object} requirements - From AnalystAgent
   * @param {Object} proposal - From ConsultantAgent (optional)
   * @returns {Object} Structured project plan
   */
  function generatePlan(requirements, proposal) {
    if (!requirements) {
      return { success: false, message: 'No requirements data available for planning.' };
    }

    const features = proposal?.features || requirements.features || [];
    const modules = buildModules(features, requirements);
    const milestones = buildMilestones(modules, requirements);

    return {
      success: true,
      data: {
        modules,
        milestones,
      },
      summary: `Plan generated with ${modules.length} modules, ${countTotalTasks(modules)} tasks, and ${milestones.length} milestones.`,
    };
  }

  function buildModules(features, requirements) {
    // Always start with a Setup/Foundation module
    const modules = [
      {
        id: Store.generateId(),
        name: 'Project Setup & Architecture',
        tasks: [
          createTask('Project repository setup', 'critical', 'Low'),
          createTask('Architecture design & documentation', 'critical', 'Medium'),
          createTask('Development environment configuration', 'high', 'Low'),
          createTask('CI/CD pipeline setup', 'medium', 'Medium'),
          createTask('Design system & UI kit creation', 'high', 'Medium'),
        ],
      },
    ];

    // Convert features into modules
    features.forEach(feature => {
      const featureName = typeof feature === 'string' ? feature : (feature.name || String(feature));
      const tasks = generateTasksForFeature(featureName, feature);

      modules.push({
        id: Store.generateId(),
        name: capitalizeFirst(featureName),
        tasks,
      });
    });

    // Always add Testing & QA module
    modules.push({
      id: Store.generateId(),
      name: 'Testing & Quality Assurance',
      tasks: [
        createTask('Unit testing', 'high', 'High'),
        createTask('Integration testing', 'high', 'Medium'),
        createTask('Cross-browser compatibility testing', 'medium', 'Medium'),
        createTask('Performance & load testing', 'medium', 'Medium'),
        createTask('Security audit', 'critical', 'High'),
        createTask('Bug fixes & optimization', 'high', 'Medium'),
      ],
    });

    // Deployment module
    modules.push({
      id: Store.generateId(),
      name: 'Deployment & Launch',
      tasks: [
        createTask('Staging environment deployment', 'high', 'Medium'),
        createTask('User Acceptance Testing (UAT)', 'critical', 'High'),
        createTask('Production deployment', 'critical', 'Medium'),
        createTask('Post-launch monitoring setup', 'high', 'Low'),
        createTask('Documentation & handover', 'high', 'Medium'),
      ],
    });

    return modules;
  }

  function generateTasksForFeature(featureName, featureData) {
    const lower = featureName.toLowerCase();
    const priority = (featureData?.priority || 'medium').toLowerCase();
    const basePriority = priority === 'critical' ? 'critical' : priority === 'high' ? 'high' : 'medium';

    // Domain-specific task generation
    if (lower.includes('auth') || lower.includes('login') || lower.includes('sign')) {
      return [
        createTask('Design authentication flow', basePriority, 'Low'),
        createTask('Implement registration & login API', basePriority, 'Medium'),
        createTask('Build login/registration UI forms', basePriority, 'Medium'),
        createTask('Add password recovery flow', 'medium', 'Medium'),
        createTask('Implement session management & JWT', basePriority, 'Medium'),
        createTask('Write auth integration tests', 'high', 'Low'),
      ];
    }

    if (lower.includes('dashboard') || lower.includes('analytics')) {
      return [
        createTask('Design dashboard layout & wireframes', basePriority, 'Low'),
        createTask('Build data aggregation backend', basePriority, 'High'),
        createTask('Implement chart & graph components', basePriority, 'High'),
        createTask('Create KPI widgets', 'high', 'Medium'),
        createTask('Add date range filters & controls', 'medium', 'Medium'),
        createTask('Optimize dashboard query performance', 'medium', 'Medium'),
      ];
    }

    if (lower.includes('payment') || lower.includes('billing') || lower.includes('subscription')) {
      return [
        createTask('Payment gateway integration research', basePriority, 'Low'),
        createTask('Implement payment processing API', basePriority, 'High'),
        createTask('Build checkout UI flow', basePriority, 'High'),
        createTask('Add subscription management', 'high', 'High'),
        createTask('Implement invoice generation', 'medium', 'Medium'),
        createTask('Payment webhook handling', 'high', 'Medium'),
        createTask('PCI compliance verification', 'critical', 'Medium'),
      ];
    }

    if (lower.includes('user') || lower.includes('role') || lower.includes('rbac') || lower.includes('access')) {
      return [
        createTask('Design role & permission model', basePriority, 'Medium'),
        createTask('Implement RBAC middleware', basePriority, 'High'),
        createTask('Build user management admin panel', 'high', 'Medium'),
        createTask('Add profile management', 'medium', 'Low'),
        createTask('Implement role assignment UI', 'high', 'Medium'),
      ];
    }

    if (lower.includes('notification') || lower.includes('email') || lower.includes('alert')) {
      return [
        createTask('Design notification architecture', basePriority, 'Medium'),
        createTask('Implement email notification service', basePriority, 'Medium'),
        createTask('Build in-app notification UI', 'high', 'Medium'),
        createTask('Add notification preferences', 'medium', 'Low'),
        createTask('Create notification templates', 'medium', 'Low'),
      ];
    }

    if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('cart') || lower.includes('catalog')) {
      return [
        createTask('Design product catalog schema', basePriority, 'Medium'),
        createTask('Build product listing & detail pages', basePriority, 'High'),
        createTask('Implement shopping cart', basePriority, 'High'),
        createTask('Build checkout & order flow', 'critical', 'High'),
        createTask('Implement order tracking', 'high', 'Medium'),
        createTask('Add product reviews & ratings', 'medium', 'Medium'),
      ];
    }

    if (lower.includes('search') || lower.includes('filter')) {
      return [
        createTask('Design search architecture', basePriority, 'Medium'),
        createTask('Implement search backend (indexing)', basePriority, 'High'),
        createTask('Build search UI with autocomplete', 'high', 'Medium'),
        createTask('Add advanced filters & facets', 'medium', 'Medium'),
        createTask('Implement result pagination & sorting', 'medium', 'Low'),
      ];
    }

    if (lower.includes('file') || lower.includes('upload') || lower.includes('document') || lower.includes('media')) {
      return [
        createTask('Design file storage architecture', basePriority, 'Medium'),
        createTask('Implement file upload API', basePriority, 'Medium'),
        createTask('Build file upload UI with drag & drop', 'high', 'Medium'),
        createTask('Add file preview & thumbnails', 'medium', 'Medium'),
        createTask('Implement file access controls', 'high', 'Low'),
      ];
    }

    if (lower.includes('workflow') || lower.includes('automat')) {
      return [
        createTask('Design workflow engine architecture', basePriority, 'High'),
        createTask('Implement workflow state machine', basePriority, 'High'),
        createTask('Build workflow configuration UI', 'high', 'High'),
        createTask('Add approval step processing', 'high', 'Medium'),
        createTask('Implement workflow notifications', 'medium', 'Low'),
      ];
    }

    if (lower.includes('report') || lower.includes('export')) {
      return [
        createTask('Design report templates', basePriority, 'Medium'),
        createTask('Implement report generation engine', basePriority, 'High'),
        createTask('Add PDF/Excel export', 'high', 'Medium'),
        createTask('Build scheduled report system', 'medium', 'Medium'),
      ];
    }

    // Generic fallback
    return [
      createTask(`Design ${featureName} architecture`, basePriority, 'Low'),
      createTask(`Implement ${featureName} backend logic`, basePriority, 'High'),
      createTask(`Build ${featureName} UI components`, basePriority, 'Medium'),
      createTask(`Write tests for ${featureName}`, 'medium', 'Low'),
    ];
  }

  function createTask(name, priority = 'medium', effort = 'Medium') {
    return {
      id: Store.generateId(),
      name,
      status: 'todo', // todo | in-progress | review | done
      priority, // critical | high | medium | low
      effort, // Low | Medium | High
    };
  }

  function buildMilestones(modules, requirements) {
    const milestones = [];
    const now = new Date();
    let weekOffset = 0;

    // Discovery & Setup milestone
    weekOffset += 2;
    milestones.push({
      name: 'Project Kickoff & Setup Complete',
      date: addWeeks(now, weekOffset),
      status: 'upcoming',
    });

    // Add milestone per 2-3 modules
    for (let i = 1; i < modules.length - 2; i += 2) {
      weekOffset += 3;
      const moduleNames = modules.slice(i, Math.min(i + 2, modules.length - 2))
        .map(m => m.name)
        .join(' & ');
      milestones.push({
        name: `${moduleNames} - Ready for Review`,
        date: addWeeks(now, weekOffset),
        status: 'upcoming',
      });
    }

    // Testing milestone
    weekOffset += 2;
    milestones.push({
      name: 'QA & Testing Complete',
      date: addWeeks(now, weekOffset),
      status: 'upcoming',
    });

    // Launch milestone
    weekOffset += 1;
    milestones.push({
      name: 'Production Launch',
      date: addWeeks(now, weekOffset),
      status: 'upcoming',
    });

    return milestones;
  }

  function addWeeks(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString().split('T')[0];
  }

  function countTotalTasks(modules) {
    return modules.reduce((acc, mod) => acc + mod.tasks.length, 0);
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    generatePlan,
    AGENT_NAME,
    AGENT_ICON,
    AGENT_COLOR,
  };
})();

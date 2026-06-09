// ========================================
// STRATIFY AI — Data Store (localStorage)
// ========================================

const Store = (() => {
  const STORAGE_KEY = 'stratify_ai_data';

  const defaultData = {
    projects: [],
    settings: {
      companyName: 'Your Company',
      currency: 'USD',
      defaultRate: 100,
      autoSave: true,
      notifications: true,
    },
    meta: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultData };
      const data = JSON.parse(raw);
      return { ...defaultData, ...data };
    } catch (e) {
      console.error('Store: Failed to load data', e);
      return { ...defaultData };
    }
  }

  function save(data) {
    try {
      data.meta.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Store: Failed to save data', e);
      return false;
    }
  }

  function getData() {
    return load();
  }

  // ---- Project CRUD ----

  function getProjects() {
    return load().projects || [];
  }

  function getProject(id) {
    return getProjects().find(p => p.id === id) || null;
  }

  function createProject(projectData) {
    const data = load();
    const project = {
      id: generateId(),
      status: 'requirements', // requirements | proposal | planning | active | completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Client info
      clientName: projectData.clientName || '',
      company: projectData.company || '',
      email: projectData.email || '',
      // Requirements (from Business Analyst Agent)
      requirements: projectData.requirements || null,
      // Proposal (from Pre-Sales Consultant Agent)
      proposal: projectData.proposal || null,
      // Project Plan (from Project Manager Agent)
      plan: projectData.plan || null,
      // Scope Control Log (from Scope Control Auditor Agent)
      scopeLog: [],
      // Activity log
      activityLog: [
        {
          id: generateId(),
          type: 'created',
          message: 'Project created',
          agent: 'orchestrator',
          timestamp: new Date().toISOString(),
        }
      ],
    };

    data.projects.unshift(project);
    save(data);
    return project;
  }

  function updateProject(id, updates) {
    const data = load();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;

    data.projects[idx] = {
      ...data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    save(data);
    return data.projects[idx];
  }

  function addProjectActivity(projectId, activity) {
    const data = load();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    project.activityLog = project.activityLog || [];
    project.activityLog.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...activity,
    });

    project.updatedAt = new Date().toISOString();
    save(data);
  }

  function addScopeEntry(projectId, entry) {
    const data = load();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    project.scopeLog = project.scopeLog || [];
    project.scopeLog.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...entry,
    });

    project.updatedAt = new Date().toISOString();
    save(data);
  }

  function deleteProject(id) {
    const data = load();
    data.projects = data.projects.filter(p => p.id !== id);
    save(data);
  }

  // ---- Settings ----

  function getSettings() {
    return load().settings;
  }

  function updateSettings(updates) {
    const data = load();
    data.settings = { ...data.settings, ...updates };
    save(data);
    return data.settings;
  }

  // ---- Stats ----

  function getStats() {
    const projects = getProjects();
    return {
      total: projects.length,
      active: projects.filter(p => ['requirements', 'proposal', 'planning', 'active'].includes(p.status)).length,
      completed: projects.filter(p => p.status === 'completed').length,
      proposals: projects.filter(p => p.proposal).length,
      pendingProposals: projects.filter(p => p.status === 'proposal').length,
      scopeChanges: projects.reduce((acc, p) => acc + (p.scopeLog?.length || 0), 0),
      completionRate: projects.length > 0
        ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
        : 0,
    };
  }

  function getRecentActivity(limit = 10) {
    const projects = getProjects();
    const activities = [];

    projects.forEach(project => {
      (project.activityLog || []).forEach(activity => {
        activities.push({
          ...activity,
          projectId: project.id,
          projectName: project.clientName || project.company || 'Untitled',
        });
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return activities.slice(0, limit);
  }

  // ---- Helpers ----

  function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ---- Export seed data for demo ----
  function seedDemoData() {
    const data = load();
    if (data.projects.length > 0) return; // Don't seed if data exists

    const demoProjects = [
      {
        id: 'demo_1',
        status: 'active',
        clientName: 'Marcus Chen',
        company: 'NovaTech Solutions',
        email: 'marcus@novatech.io',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        requirements: {
          objective: 'Build an employee management portal with real-time analytics dashboard, role-based access, and automated reporting',
          features: [
            'Employee onboarding workflow',
            'Real-time analytics dashboard',
            'Role-based access control (RBAC)',
            'Automated monthly reports',
            'Leave management system',
            'Performance review module',
          ],
          userTypes: ['Admin', 'HR Manager', 'Employee', 'Department Head'],
          constraints: ['Must integrate with existing SAP system', 'GDPR compliance required', 'Support 500+ concurrent users'],
          risks: ['SAP integration complexity', 'Data migration from legacy system', 'Tight timeline for compliance requirements'],
          budgetRange: '$50,000 - $80,000',
          timeline: '4-6 months',
          rawInput: 'We need an employee management portal...',
        },
        proposal: {
          problemStatement: 'NovaTech Solutions currently relies on disparate spreadsheets and manual processes for employee management, leading to inefficiencies, data inconsistencies, and compliance risks. The lack of a centralized system hampers real-time decision-making and creates bottlenecks in HR operations.',
          solution: 'We propose building a modern, cloud-based Employee Management Portal that centralizes all HR operations into a single, intuitive platform with real-time analytics capabilities.',
          features: [
            { name: 'Employee Onboarding Workflow', description: 'Automated onboarding process with document collection, task assignments, and progress tracking', priority: 'High', complexity: 'Medium', estimate: '3 weeks' },
            { name: 'Real-time Analytics Dashboard', description: 'Interactive dashboard with KPIs, workforce metrics, and customizable reports', priority: 'High', complexity: 'High', estimate: '4 weeks' },
            { name: 'Role-Based Access Control', description: 'Granular permissions system supporting Admin, HR, Employee, and Department Head roles', priority: 'Critical', complexity: 'Medium', estimate: '2 weeks' },
            { name: 'Automated Reporting', description: 'Scheduled report generation with PDF/Excel export and email distribution', priority: 'Medium', complexity: 'Medium', estimate: '2 weeks' },
            { name: 'Leave Management', description: 'Leave request, approval workflow, balance tracking, and calendar integration', priority: 'High', complexity: 'Low', estimate: '2 weeks' },
            { name: 'Performance Reviews', description: 'Configurable review cycles, 360° feedback, and performance analytics', priority: 'Medium', complexity: 'High', estimate: '3 weeks' },
          ],
          timeline: [
            { phase: 'Discovery & Design', duration: '2 weeks', color: '#00d4ff' },
            { phase: 'Core Development', duration: '8 weeks', color: '#7c3aed' },
            { phase: 'Integration & Testing', duration: '4 weeks', color: '#10b981' },
            { phase: 'UAT & Launch', duration: '2 weeks', color: '#f59e0b' },
          ],
          costEstimate: { min: 55000, max: 75000, currency: 'USD' },
          assumptions: [
            'SAP provides API access for integration',
            'Client provides test data for development',
            'Hosting infrastructure managed by client',
            'Content and branding assets provided by client',
          ],
          valueProposition: 'This solution will reduce HR administrative overhead by 60%, enable real-time workforce insights, and ensure full GDPR compliance — positioning NovaTech for scalable growth.',
          status: 'sent',
        },
        plan: {
          modules: [
            {
              id: 'mod_1',
              name: 'Authentication & RBAC',
              tasks: [
                { id: 't1', name: 'Design auth flow', status: 'done', priority: 'critical', effort: 'Medium' },
                { id: 't2', name: 'Implement JWT auth', status: 'done', priority: 'critical', effort: 'Medium' },
                { id: 't3', name: 'Build RBAC middleware', status: 'in-progress', priority: 'critical', effort: 'High' },
                { id: 't4', name: 'Role management UI', status: 'todo', priority: 'high', effort: 'Medium' },
              ],
            },
            {
              id: 'mod_2',
              name: 'Analytics Dashboard',
              tasks: [
                { id: 't5', name: 'Design dashboard layout', status: 'done', priority: 'high', effort: 'Low' },
                { id: 't6', name: 'Build chart components', status: 'in-progress', priority: 'high', effort: 'High' },
                { id: 't7', name: 'Implement data aggregation API', status: 'todo', priority: 'high', effort: 'High' },
                { id: 't8', name: 'Real-time WebSocket updates', status: 'todo', priority: 'medium', effort: 'High' },
              ],
            },
            {
              id: 'mod_3',
              name: 'Employee Onboarding',
              tasks: [
                { id: 't9', name: 'Design onboarding workflow', status: 'todo', priority: 'high', effort: 'Low' },
                { id: 't10', name: 'Build form components', status: 'todo', priority: 'high', effort: 'Medium' },
                { id: 't11', name: 'Document upload system', status: 'todo', priority: 'medium', effort: 'Medium' },
                { id: 't12', name: 'Email notifications', status: 'todo', priority: 'low', effort: 'Low' },
              ],
            },
          ],
          milestones: [
            { name: 'Core Auth Complete', date: '2026-04-15', status: 'completed' },
            { name: 'Dashboard MVP', date: '2026-05-01', status: 'in-progress' },
            { name: 'Onboarding Ready', date: '2026-05-20', status: 'upcoming' },
            { name: 'SAP Integration', date: '2026-06-10', status: 'upcoming' },
            { name: 'UAT Launch', date: '2026-06-25', status: 'upcoming' },
          ],
        },
        scopeLog: [
          {
            id: 'scope_1',
            request: 'Can we add a chatbot for employee queries?',
            classification: 'out-scope',
            justification: 'A chatbot with NLP capabilities was not part of the original scope. This would require AI/ML integration, training data preparation, and additional development effort of approximately 4-6 weeks.',
            impact: { time: '+4-6 weeks', cost: '+$15,000-$20,000' },
            timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
          {
            id: 'scope_2',
            request: 'Add leave balance to the analytics dashboard',
            classification: 'in-scope',
            justification: 'Leave management and analytics dashboard are both in the original scope. Displaying leave balance data as a dashboard widget is a natural extension of existing features.',
            impact: { time: 'No additional time', cost: 'Included' },
            timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ],
        activityLog: [
          { id: 'a1', type: 'scope', message: 'Scope evaluation: "Add chatbot" classified as Out of Scope', agent: 'auditor', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
          { id: 'a2', type: 'task', message: 'Task "Build chart components" moved to In Progress', agent: 'planner', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
          { id: 'a3', type: 'proposal', message: 'Proposal sent to client', agent: 'consultant', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
          { id: 'a4', type: 'analysis', message: 'Requirements analysis completed with 6 features extracted', agent: 'analyst', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
          { id: 'a5', type: 'created', message: 'Project created', agent: 'orchestrator', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
        ],
      },
      {
        id: 'demo_2',
        status: 'proposal',
        clientName: 'Sarah Williams',
        company: 'GreenLeaf Organics',
        email: 'sarah@greenleaf.com',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        requirements: {
          objective: 'E-commerce platform for organic food delivery with subscription model',
          features: [
            'Product catalog with categories',
            'Subscription box management',
            'Payment gateway integration',
            'Delivery tracking',
            'Customer reviews & ratings',
          ],
          userTypes: ['Customer', 'Admin', 'Delivery Partner'],
          constraints: ['Launch within 3 months', 'PCI-DSS compliance for payments', 'Mobile-first design'],
          risks: ['Payment gateway integration timeline', 'Delivery partner API availability'],
          budgetRange: '$30,000 - $50,000',
          timeline: '3 months',
          rawInput: 'We want to build an e-commerce platform for organic food delivery...',
        },
        proposal: null,
        plan: null,
        scopeLog: [],
        activityLog: [
          { id: 'a6', type: 'analysis', message: 'Requirements analysis completed', agent: 'analyst', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
          { id: 'a7', type: 'created', message: 'Project created', agent: 'orchestrator', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
        ],
      },
    ];

    data.projects = demoProjects;
    save(data);
    return demoProjects;
  }

  return {
    getData,
    getProjects,
    getProject,
    createProject,
    updateProject,
    addProjectActivity,
    addScopeEntry,
    deleteProject,
    getSettings,
    updateSettings,
    getStats,
    getRecentActivity,
    clearAll,
    seedDemoData,
    generateId,
  };
})();

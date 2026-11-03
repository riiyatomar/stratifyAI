// ========================================
// STRATIFY AI — Data Store (API-backed)
// ========================================
// Talks to the FastAPI backend at /api/*
// Falls back to localStorage when the backend is unreachable.

const Store = (() => {
  // Configurable backend base: can be set via window.STRATIFY_API_URL or localStorage
  function getApiBase() {
    return window.STRATIFY_API_URL || localStorage.getItem('stratify_api_url') || '/api';
  }

  const STORAGE_KEY = 'stratify_ai_data';
  let _useApi = true;

  // ---------- low-level helpers ----------

  async function apiFetch(path, opts = {}) {
    if (!_useApi) return null;
    try {
      const base = getApiBase().replace(/\/+$/, '');
      const url = base.startsWith('http') ? `${base}${path}` : `${base}${path}`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...opts.headers },
        ...opts,
      });
      if (!res.ok) {
        const err = await res.text();
        console.warn(`API ${opts.method || 'GET'} ${path} -> ${res.status}`, err);
        return null;
      }
      if (res.status === 204) return true;
      return await res.json();
    } catch (e) {
      console.warn('API unreachable, falling back to localStorage', e);
      _useApi = false;
      return null;
    }
  }

  // ---------- localStorage fallback (offline resilient) ----------

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

  function _lsLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultData };
      return { ...defaultData, ...JSON.parse(raw) };
    } catch { return { ...defaultData }; }
  }

  function _lsSave(data) {
    try {
      data.meta.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.error('Store: ls save failed', e); }
  }

  function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  // ---- Projects ----

  async function getProjects() {
    if (_useApi) {
      const data = await apiFetch('/projects');
      if (data) return data;
    }
    return _lsLoad().projects || [];
  }

  async function getProject(id) {
    if (_useApi) {
      const data = await apiFetch(`/projects/${id}`);
      if (data) return data;
    }
    const projects = _lsLoad().projects || [];
    return projects.find(p => p.id === id) || null;
  }

  async function createProject(projectData) {
    if (_useApi) {
      const data = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      if (data) return data;
    }
    const store = _lsLoad();
    const project = {
      id: generateId(),
      status: 'requirements',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientName: projectData.clientName || '',
      company: projectData.company || '',
      email: projectData.email || '',
      requirements: projectData.requirements || null,
      proposal: projectData.proposal || null,
      plan: projectData.plan || null,
      scopeLog: [],
      activityLog: [{ id: generateId(), type: 'created', message: 'Project created', agent: 'orchestrator', timestamp: new Date().toISOString() }],
    };
    store.projects.unshift(project);
    _lsSave(store);
    return project;
  }

  async function updateProject(id, updates) {
    if (_useApi) {
      const data = await apiFetch(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (data) return data;
    }
    const store = _lsLoad();
    const idx = store.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    store.projects[idx] = { ...store.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    _lsSave(store);
    return store.projects[idx];
  }

  async function deleteProject(id) {
    if (_useApi) {
      const ok = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      if (ok !== null) return;
    }
    const store = _lsLoad();
    store.projects = store.projects.filter(p => p.id !== id);
    _lsSave(store);
  }

  async function addProjectActivity(projectId, activity) {
    if (_useApi) {
      const data = await apiFetch(`/projects/${projectId}/activity`, {
        method: 'POST',
        body: JSON.stringify(activity),
      });
      if (data) return data;
    }
    const store = _lsLoad();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return;
    project.activityLog = project.activityLog || [];
    project.activityLog.unshift({ id: generateId(), timestamp: new Date().toISOString(), ...activity });
    project.updatedAt = new Date().toISOString();
    _lsSave(store);
  }

  async function addScopeEntry(projectId, entry) {
    if (_useApi) {
      const data = await apiFetch(`/projects/${projectId}/scope`, {
        method: 'POST',
        body: JSON.stringify(entry),
      });
      if (data) return data;
    }
    const store = _lsLoad();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return;
    project.scopeLog = project.scopeLog || [];
    project.scopeLog.unshift({ id: generateId(), timestamp: new Date().toISOString(), ...entry });
    project.updatedAt = new Date().toISOString();
    _lsSave(store);
  }

  // ---- Settings ----

  async function getSettings() {
    if (_useApi) {
      const data = await apiFetch('/settings');
      if (data) return data;
    }
    return _lsLoad().settings;
  }

  async function updateSettings(updates) {
    if (_useApi) {
      const data = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (data) return data;
    }
    const store = _lsLoad();
    store.settings = { ...store.settings, ...updates };
    _lsSave(store);
    return store.settings;
  }

  // ---- Stats ----

  async function getStats() {
    if (_useApi) {
      const data = await apiFetch('/projects/stats');
      if (data) return data;
    }
    const projects = _lsLoad().projects || [];
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

  async function getRecentActivity(limit = 10) {
    if (_useApi) {
      const data = await apiFetch(`/projects/recent-activity?limit=${limit}`);
      if (data) return data;
    }
    const projects = _lsLoad().projects || [];
    const activities = [];
    projects.forEach(project => {
      (project.activityLog || []).forEach(activity => {
        activities.push({ ...activity, projectId: project.id, projectName: project.clientName || project.company || 'Untitled' });
      });
    });
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return activities.slice(0, limit);
  }

  function getData() {
    return _lsLoad();
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  async function seedDemoData() {
    if (_useApi) {
      const data = await apiFetch('/projects/seed', { method: 'POST' });
      if (data) return;
    }
    // localStorage demo data fallback
    const store = _lsLoad();
    if (store.projects && store.projects.length > 0) return;

    store.projects = [
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
          risks: ['SAP integration complexity', 'Data migration from legacy system'],
          budgetRange: '$50,000 - $80,000',
          timeline: '4-6 months',
          rawInput: 'We need an employee management portal...',
        },
        proposal: {
          problemStatement: 'NovaTech Solutions currently relies on disparate spreadsheets and manual processes for employee management, leading to inefficiencies and compliance risks.',
          solution: 'We propose building a modern, cloud-based Employee Management Portal that centralizes all HR operations.',
          features: [
            { name: 'Employee Onboarding Workflow', description: 'Automated onboarding process with document collection', priority: 'High', complexity: 'Medium', estimate: '3 weeks' },
            { name: 'Real-time Analytics Dashboard', description: 'Interactive dashboard with KPIs', priority: 'High', complexity: 'High', estimate: '4 weeks' },
          ],
          timeline: [{ phase: 'Core Development', duration: '8 weeks', color: '#7c3aed' }],
          costEstimate: { min: 55000, max: 75000, currency: 'USD' },
          status: 'sent',
        },
        plan: null,
        scopeLog: [],
        activityLog: [
          { id: 'a1', type: 'created', message: 'Project created', agent: 'orchestrator', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() }
        ],
      }
    ];
    _lsSave(store);
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
    getApiBase,
  };
})();

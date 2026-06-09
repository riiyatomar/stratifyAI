// ========================================
// AGENT 2: Pre-Sales Consultant AI
// ========================================
// Role: Generate client-friendly proposals
// Input: Structured requirements from Analyst Agent
// Output: Professional proposal with solution approach, features, timeline, value prop
// Tone: Professional, persuasive, clear

const ConsultantAgent = (() => {
  const AGENT_NAME = 'Pre-Sales Consultant';
  const AGENT_ICON = '💼';
  const AGENT_COLOR = 'consultant';

  /**
   * Generate a professional proposal from structured requirements
   * @param {Object} requirements - Output from AnalystAgent
   * @param {Object} clientInfo - { clientName, company }
   * @returns {Object} Structured proposal
   */
  function generateProposal(requirements, clientInfo) {
    if (!requirements) {
      return { success: false, message: 'No requirements data available.' };
    }

    const problemStatement = buildProblemStatement(requirements, clientInfo);
    const solution = buildSolutionApproach(requirements, clientInfo);
    const features = buildFeatureBreakdown(requirements);
    const timeline = buildTimeline(requirements, features);
    const costEstimate = estimateCost(features, requirements);
    const assumptions = buildAssumptions(requirements);
    const valueProposition = buildValueProposition(requirements, clientInfo);

    return {
      success: true,
      data: {
        problemStatement,
        solution,
        features,
        timeline,
        costEstimate,
        assumptions,
        valueProposition,
        status: 'draft',
        generatedAt: new Date().toISOString(),
      },
      summary: `Proposal generated with ${features.length} deliverables across ${timeline.length} phases.`,
    };
  }

  function buildProblemStatement(req, client) {
    const company = client.company || 'The client';
    const objective = req.objective || 'achieve their business goals';

    const templates = [
      `${company} faces challenges in their current operations that require a modern, technology-driven solution. The existing processes lack the efficiency, scalability, and user experience needed in today's competitive landscape. Without a centralized platform to ${objective.toLowerCase()}, the organization risks falling behind in operational efficiency and customer satisfaction.`,
      `In today's rapidly evolving digital landscape, ${company} recognizes the need to ${objective.toLowerCase()}. Current manual processes and fragmented systems create bottlenecks, inconsistencies, and missed opportunities. A comprehensive digital solution is critical to streamline operations and unlock growth potential.`,
      `${company} requires a transformative solution to address key operational gaps. The objective to ${objective.toLowerCase()} cannot be met with existing tools and processes, necessitating a purpose-built platform that combines modern technology with intuitive user experience.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  function buildSolutionApproach(req, client) {
    const featureCount = (req.features || []).length;
    const userTypeCount = (req.userTypes || []).length;

    return `We propose building a comprehensive, modern platform tailored to ${client.company || 'your'} specific needs. The solution will incorporate ${featureCount} core feature modules, designed to serve ${userTypeCount} distinct user roles with role-appropriate interfaces and capabilities. Our approach emphasizes scalability, security, and exceptional user experience — ensuring the platform grows with your business while maintaining performance and reliability.`;
  }

  function buildFeatureBreakdown(req) {
    const features = req.features || [];
    return features.map((feature, idx) => {
      const name = typeof feature === 'string' ? feature : feature.name || feature;
      const details = getFeatureDetails(name);

      return {
        name: capitalizeFirst(name),
        description: details.description,
        priority: details.priority,
        complexity: details.complexity,
        estimate: details.estimate,
      };
    });
  }

  function getFeatureDetails(featureName) {
    const lower = featureName.toLowerCase();

    const detailsMap = {
      auth: {
        description: 'Secure user authentication with login, registration, password recovery, and optional multi-factor authentication. Includes session management and security best practices.',
        priority: 'Critical',
        complexity: 'Medium',
        estimate: '1-2 weeks',
      },
      dashboard: {
        description: 'Interactive, data-rich dashboard with real-time metrics, customizable widgets, and visual analytics to empower data-driven decision making.',
        priority: 'High',
        complexity: 'High',
        estimate: '2-3 weeks',
      },
      payment: {
        description: 'Secure payment processing with support for major payment gateways, subscription billing, invoice generation, and comprehensive transaction records.',
        priority: 'High',
        complexity: 'High',
        estimate: '2-3 weeks',
      },
      user: {
        description: 'Comprehensive user management with role-based access control, profile management, and administrative tools for user lifecycle management.',
        priority: 'High',
        complexity: 'Medium',
        estimate: '1-2 weeks',
      },
      notification: {
        description: 'Multi-channel notification system supporting email, in-app, and optional SMS/push notifications with configurable preferences and templates.',
        priority: 'Medium',
        complexity: 'Medium',
        estimate: '1-2 weeks',
      },
      search: {
        description: 'Powerful search and filtering capabilities with keyword search, advanced filters, sorting options, and results pagination for efficient data discovery.',
        priority: 'Medium',
        complexity: 'Medium',
        estimate: '1-2 weeks',
      },
      file: {
        description: 'Secure file management with upload, preview, organization, and storage capabilities. Supports multiple file types with proper validation and virus scanning.',
        priority: 'Medium',
        complexity: 'Medium',
        estimate: '1-2 weeks',
      },
      api: {
        description: 'RESTful API integration layer for connecting with third-party services, with proper error handling, rate limiting, and documentation.',
        priority: 'High',
        complexity: 'High',
        estimate: '2-3 weeks',
      },
      mobile: {
        description: 'Fully responsive, mobile-first design ensuring optimal experience across all devices and screen sizes. Progressive Web App capabilities for app-like experience.',
        priority: 'High',
        complexity: 'Medium',
        estimate: '1-2 weeks',
      },
      'e-commerce': {
        description: 'Complete e-commerce functionality including product catalog, shopping cart, checkout flow, order management, and inventory tracking.',
        priority: 'Critical',
        complexity: 'High',
        estimate: '3-4 weeks',
      },
      workflow: {
        description: 'Automated workflow engine with configurable business processes, approval flows, conditional routing, and status tracking.',
        priority: 'High',
        complexity: 'High',
        estimate: '2-3 weeks',
      },
      chat: {
        description: 'Real-time messaging system with one-on-one and group conversations, message history, file sharing, and typing indicators.',
        priority: 'Medium',
        complexity: 'High',
        estimate: '2-3 weeks',
      },
      'real-time': {
        description: 'Live data updates using WebSocket technology for instant content refresh, real-time collaboration, and live activity feeds.',
        priority: 'Medium',
        complexity: 'High',
        estimate: '2-3 weeks',
      },
    };

    for (const [key, details] of Object.entries(detailsMap)) {
      if (lower.includes(key)) {
        return details;
      }
    }

    // Default details
    return {
      description: `Implementation of ${featureName} with attention to usability, performance, and maintainability. Includes thorough testing and documentation.`,
      priority: 'Medium',
      complexity: 'Medium',
      estimate: '1-2 weeks',
    };
  }

  function buildTimeline(req, features) {
    const totalFeatures = features.length;
    const complexity = features.filter(f => f.complexity === 'High').length;

    if (totalFeatures <= 3) {
      return [
        { phase: 'Discovery & Design', duration: '1 week', color: '#00d4ff' },
        { phase: 'Development', duration: '3-4 weeks', color: '#7c3aed' },
        { phase: 'Testing & Launch', duration: '1 week', color: '#10b981' },
      ];
    }

    if (totalFeatures <= 6) {
      return [
        { phase: 'Discovery & Design', duration: '1-2 weeks', color: '#00d4ff' },
        { phase: 'Core Development', duration: '4-6 weeks', color: '#7c3aed' },
        { phase: 'Integration & Testing', duration: '2-3 weeks', color: '#10b981' },
        { phase: 'UAT & Launch', duration: '1-2 weeks', color: '#f59e0b' },
      ];
    }

    return [
      { phase: 'Discovery & Design', duration: '2-3 weeks', color: '#00d4ff' },
      { phase: 'Phase 1: Core Development', duration: '4-6 weeks', color: '#7c3aed' },
      { phase: 'Phase 2: Advanced Features', duration: '3-5 weeks', color: '#3b82f6' },
      { phase: 'Integration & Testing', duration: '2-4 weeks', color: '#10b981' },
      { phase: 'UAT & Launch', duration: '1-2 weeks', color: '#f59e0b' },
    ];
  }

  function estimateCost(features, req) {
    const baseRate = 100; // Per hour
    let totalHours = 0;

    features.forEach(f => {
      const weeks = parseEstimateWeeks(f.estimate);
      totalHours += weeks * 40; // 40 hours/week
    });

    // Add 20% buffer for PM, meetings, revisions
    totalHours = Math.round(totalHours * 1.2);

    const min = Math.round((totalHours * baseRate * 0.8) / 1000) * 1000;
    const max = Math.round((totalHours * baseRate * 1.2) / 1000) * 1000;

    return {
      min,
      max,
      currency: 'USD',
      estimatedHours: totalHours,
    };
  }

  function parseEstimateWeeks(estimate) {
    const match = (estimate || '').match(/(\d+)/);
    return match ? parseInt(match[1]) : 2;
  }

  function buildAssumptions(req) {
    const assumptions = [
      'Client will provide timely feedback during review cycles (within 3 business days)',
      'All necessary accounts, credentials, and API access will be provided before development begins',
      'Content, brand assets, and copy will be supplied by the client',
    ];

    if ((req.constraints || []).some(c => c.toLowerCase().includes('integrat'))) {
      assumptions.push('Third-party APIs/services have stable, documented interfaces');
    }

    if ((req.constraints || []).some(c => c.toLowerCase().includes('hosting'))) {
      assumptions.push('Hosting infrastructure will be managed by the client');
    } else {
      assumptions.push('Cloud hosting costs are not included in the estimate');
    }

    assumptions.push('Scope changes after project kickoff will be handled through the change request process');

    return assumptions;
  }

  function buildValueProposition(req, client) {
    const featureCount = (req.features || []).length;
    const company = client.company || 'your organization';

    const templates = [
      `This solution will transform ${company}'s operations by automating key workflows, providing real-time visibility into business metrics, and delivering an exceptional user experience. With ${featureCount} integrated modules working in harmony, the platform eliminates manual processes, reduces errors, and positions ${company} for sustainable growth.`,
      `By investing in this platform, ${company} gains a competitive advantage through streamlined operations, enhanced data-driven decision making, and a modern user experience that drives engagement and retention. The ${featureCount} modules are designed to work together seamlessly, delivering immediate value while supporting long-term scalability.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    generateProposal,
    AGENT_NAME,
    AGENT_ICON,
    AGENT_COLOR,
  };
})();

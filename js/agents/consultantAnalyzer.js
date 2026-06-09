// ========================================
// AGENT 5: Project Consultant Analyzer AI
// ========================================
// Role: Analyze raw client briefs before project creation
// Classify each input: Feature | Vague | Constraint | Scope Change | Valid Extension
// Apply decision logic: Accept / Reject / Clarify / Out-of-scope
// Generate: Problem Understanding, Base Scope, Evaluation Table, Budget, Execution Plan
// Think like a consultant, not a generator

const ConsultantAnalyzerAgent = (() => {
  const AGENT_NAME = 'Project Consultant';
  const AGENT_ICON = '🎯';
  const AGENT_COLOR = 'consultant-analyzer';

  // ---- Classification keywords & patterns ----

  const FEATURE_SIGNALS = {
    keywords: [
      'dashboard', 'login', 'signup', 'authentication', 'payment', 'checkout',
      'notification', 'email', 'search', 'filter', 'upload', 'download',
      'report', 'analytics', 'chat', 'messaging', 'profile', 'admin panel',
      'user management', 'role', 'permission', 'api', 'integration', 'export',
      'import', 'tracking', 'calendar', 'booking', 'scheduling', 'inventory',
      'catalog', 'cart', 'review', 'rating', 'comment', 'forum', 'blog',
      'cms', 'workflow', 'automation', 'subscription', 'billing', 'invoice',
      'onboarding', 'multi-language', 'localization', 'dark mode', 'theme',
      'file management', 'document', 'media', 'image', 'video', 'audit log',
      'activity log', 'settings', 'preferences', 'data visualization',
      'real-time', 'websocket', 'push notification', 'sms', 'two-factor',
    ],
    patterns: [
      /(?:need|want|require|should have|must have|include)\s+(?:a|an|the)?\s*\w+/i,
      /(?:build|create|develop|implement|add|design)\s+(?:a|an|the)?\s*\w+/i,
      /\w+\s+(?:module|feature|system|page|section|panel|interface|component)/i,
    ],
  };

  const VAGUE_SIGNALS = {
    keywords: [
      'good', 'nice', 'modern', 'beautiful', 'best', 'cool', 'great',
      'awesome', 'amazing', 'professional', 'world-class', 'innovative',
      'cutting-edge', 'state-of-the-art', 'user-friendly', 'intuitive',
      'fast', 'quick', 'easy', 'simple', 'smooth', 'something like',
      'kind of', 'sort of', 'maybe', 'possibly', 'might', 'could be',
      'flexible', 'scalable', 'robust', 'powerful', 'advanced', 'smart',
      'seamless',
    ],
    patterns: [
      /(?:make it|it should be|i want it)\s+(?:good|nice|modern|beautiful|professional)/i,
      /(?:something|stuff|things)\s+(?:like|similar)/i,
      /(?:etc|and so on|and more|and all|and everything)/i,
      /\b(?:maybe|perhaps|i think|i guess|not sure)\b/i,
    ],
  };

  const CONSTRAINT_SIGNALS = {
    keywords: [
      'budget', 'cost', 'price', 'dollar', 'usd', 'inr', 'eur',
      'deadline', 'timeline', 'launch date', 'go live', 'by next',
      'within', 'must be', 'should be', 'required', 'mandatory',
      'compliance', 'gdpr', 'hipaa', 'pci', 'security', 'ssl', 'https',
      'mobile', 'responsive', 'cross-browser', 'performance', 'uptime',
      'availability', 'concurrent', 'users', 'scalability', 'max',
      'minimum', 'at least', 'no more than', 'limited', 'only',
      'platform', 'technology', 'stack', 'framework', 'language',
      'hosting', 'aws', 'azure', 'gcp', 'server',
    ],
    patterns: [
      /\$[\d,]+/i,
      /\d+\s*(?:k|K|lakh|lakhs|crore|million|thousand)/i,
      /(?:budget|cost)\s*(?:is|of|around|about|approximately)?\s*[\$₹€]?\s*[\d,]+/i,
      /(?:within|by|before|deadline)\s+\d+\s*(?:days?|weeks?|months?|years?)/i,
      /(?:must|should|need to|has to|required to)\s+(?:be|have|support|comply|run)/i,
    ],
  };

  const SCOPE_CHANGE_SIGNALS = {
    keywords: [
      'also', 'additionally', 'plus', 'on top of', 'besides',
      'new platform', 'separate app', 'mobile app', 'native app',
      'completely different', 'another project', 'phase 2', 'v2',
      'rebuild', 'redesign', 'from scratch', 'migration',
      'blockchain', 'ai ', 'machine learning', 'ml ', 'nlp',
      'chatbot', 'voice assistant', 'ar ', 'vr ', 'iot',
      'cryptocurrency', 'nft', 'metaverse',
      'social media', 'marketplace', 'multi-tenant', 'white label',
      'video streaming', 'live stream',
    ],
    patterns: [
      /(?:can you also|we also need|oh and|by the way|one more thing)/i,
      /(?:completely|totally|entirely)\s+(?:new|different|separate|redesign)/i,
      /(?:new|separate|additional)\s+(?:app|application|platform|website|system)/i,
    ],
  };

  const EXTENSION_SIGNALS = {
    keywords: [
      'enhance', 'improve', 'upgrade', 'extend', 'expand',
      'add to', 'build on', 'on top of existing', 'additional field',
      'extra column', 'more options', 'additional page', 'sub-page',
      'variation', 'customize', 'tweak', 'modify', 'adjust',
      'refine', 'optimize', 'polish',
    ],
    patterns: [
      /(?:add|include)\s+(?:a|an|more|extra|additional)\s+\w+\s+(?:to|in|on|for)\s+/i,
      /(?:enhance|improve|upgrade|extend)\s+(?:the|existing|current)\s+/i,
      /(?:can we|could we)\s+(?:also|just|simply)\s+(?:add|include|put)/i,
    ],
  };

  // ---- Feasibility thresholds ----
  const BUDGET_THRESHOLDS = {
    min: 1000,      // Minimum realistic budget
    perFeature: 3000, // Avg cost per feature
    maxTimeline: 52, // Max weeks
  };

  /**
   * Main entry point: analyze a raw client brief
   * @param {string} rawInput - The raw client brief text
   * @returns {Object} Full consultant analysis
   */
  function analyzeClientBrief(rawInput) {
    if (!rawInput || rawInput.trim().length < 10) {
      return {
        success: false,
        message: 'Input too short. Please provide a detailed client brief (at least a few sentences).',
      };
    }

    const input = rawInput.trim();

    // Step 1: Parse into individual statements
    const statements = parseStatements(input);

    if (statements.length === 0) {
      return {
        success: false,
        message: 'Could not extract any meaningful statements from the input.',
      };
    }

    // Step 2: Classify each statement
    const classified = statements.map(stmt => classifyStatement(stmt));

    // Step 3: Apply decision logic
    const evaluated = classified.map(item => applyDecisionLogic(item));

    // Step 4: Build structured output
    const accepted = evaluated.filter(e => e.decision === 'accept');
    const rejected = evaluated.filter(e => e.decision === 'reject');
    const needsClarification = evaluated.filter(e => e.decision === 'clarify');

    const problemUnderstanding = buildProblemUnderstanding(input, evaluated);
    const baseScope = buildBaseScope(accepted);
    const budgetAnalysis = estimateBudget(accepted, evaluated);
    const executionPlan = buildExecutionPlan(accepted);

    // Summary stats
    const summary = {
      total: evaluated.length,
      features: evaluated.filter(e => e.classification === 'feature').length,
      vague: evaluated.filter(e => e.classification === 'vague').length,
      constraints: evaluated.filter(e => e.classification === 'constraint').length,
      scopeChanges: evaluated.filter(e => e.classification === 'scope-change').length,
      extensions: evaluated.filter(e => e.classification === 'valid-extension').length,
      accepted: accepted.length,
      rejected: rejected.length,
      needsClarification: needsClarification.length,
    };

    return {
      success: true,
      problemUnderstanding,
      baseScope,
      evaluationTable: evaluated,
      budgetAnalysis,
      executionPlan,
      summary,
      rawInput: input,
    };
  }

  /**
   * Parse raw text into individual statement items
   */
  function parseStatements(text) {
    const items = [];

    // Split by newlines first
    const lines = text.split(/[\n\r]+/)
      .map(l => l.trim())
      .filter(l => l.length > 3);

    if (lines.length > 1) {
      lines.forEach(line => {
        // Remove bullet markers, numbering
        const cleaned = line.replace(/^[-•*●◦▪▸►→]\s*/, '')
          .replace(/^\d+[.):\-]\s*/, '')
          .trim();
        if (cleaned.length > 3) {
          items.push(cleaned);
        }
      });
    } else {
      // Single block — split by sentences and conjunctions
      const sentences = text.split(/(?<=[.!?])\s+|(?:,\s*and\s+)|(?:\s+and\s+)|(?:,\s+also\s+)|(?:;\s*)/i);
      sentences.forEach(s => {
        const cleaned = s.trim().replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '');
        if (cleaned.length > 5) {
          items.push(cleaned);
        }
      });
    }

    return items;
  }

  /**
   * Classify a single statement into one of the 5 categories
   */
  function classifyStatement(statement) {
    const lower = statement.toLowerCase();
    const scores = {
      'feature': 0,
      'vague': 0,
      'constraint': 0,
      'scope-change': 0,
      'valid-extension': 0,
    };

    // Score against each category
    scores['feature'] = scoreAgainstCategory(lower, FEATURE_SIGNALS);
    scores['vague'] = scoreAgainstCategory(lower, VAGUE_SIGNALS);
    scores['constraint'] = scoreAgainstCategory(lower, CONSTRAINT_SIGNALS);
    scores['scope-change'] = scoreAgainstCategory(lower, SCOPE_CHANGE_SIGNALS);
    scores['valid-extension'] = scoreAgainstCategory(lower, EXTENSION_SIGNALS);

    // Boost vague if too generic and short
    if (statement.split(/\s+/).length < 4 && scores['vague'] < 2) {
      const hasActionableKeyword = FEATURE_SIGNALS.keywords.some(kw => lower.includes(kw)) ||
        CONSTRAINT_SIGNALS.keywords.some(kw => lower.includes(kw));
      if (!hasActionableKeyword) {
        scores['vague'] += 3;
      }
    }

    // Determine winner
    let classification = 'feature'; // default
    let maxScore = 0;

    for (const [cat, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        classification = cat;
      }
    }

    // If all scores are 0 or tied, use heuristics
    if (maxScore === 0) {
      classification = inferClassification(lower);
    }

    return {
      statement,
      classification,
      scores,
      confidence: Math.min(100, Math.round((maxScore / 6) * 100)),
    };
  }

  /**
   * Score text against a category's keywords and patterns
   */
  function scoreAgainstCategory(text, signals) {
    let score = 0;

    // Keyword matches
    const keywordMatches = signals.keywords.filter(kw => text.includes(kw));
    score += keywordMatches.length * 2;

    // Pattern matches
    const patternMatches = signals.patterns.filter(p => p.test(text));
    score += patternMatches.length * 3;

    return score;
  }

  /**
   * Fallback classification when scores are all 0
   */
  function inferClassification(text) {
    const wordCount = text.split(/\s+/).length;

    // Very short = likely vague
    if (wordCount < 4) return 'vague';

    // Contains action verbs → feature
    if (/(?:build|create|develop|implement|add|design|make|need|want|include)/i.test(text)) {
      return 'feature';
    }

    // Contains numbers/measurements → constraint
    if (/\d+/.test(text)) return 'constraint';

    // Default
    return 'feature';
  }

  /**
   * Apply decision logic based on classification
   */
  function applyDecisionLogic(item) {
    const { classification, statement } = item;
    const lower = statement.toLowerCase();
    let decision, justification;

    switch (classification) {
      case 'feature':
        decision = 'accept';
        justification = `Clear, actionable feature requirement. Included in base scope.`;
        break;

      case 'vague':
        decision = 'clarify';
        justification = buildVagueJustification(statement);
        break;

      case 'constraint':
        const feasibility = validateConstraintFeasibility(statement);
        decision = feasibility.feasible ? 'accept' : 'reject';
        justification = feasibility.reason;
        break;

      case 'scope-change':
        decision = 'reject';
        justification = buildScopeChangeJustification(statement);
        break;

      case 'valid-extension':
        decision = 'accept';
        justification = `Valid extension of core functionality. Included as enhancement.`;
        break;

      default:
        decision = 'clarify';
        justification = 'Unable to determine intent. Needs client clarification.';
    }

    return {
      ...item,
      decision,
      justification,
    };
  }

  /**
   * Build justification for vague items
   */
  function buildVagueJustification(statement) {
    const lower = statement.toLowerCase();

    if (/(?:etc|and so on|and more|and all)/i.test(lower)) {
      return `Statement is ambiguous — "etc." and open-ended lists prevent accurate scoping. Need specific feature list.`;
    }

    if (/(?:something like|kind of|sort of)/i.test(lower)) {
      return `Reference is too vague to define scope. Please provide a specific feature description or reference example.`;
    }

    if (/(?:good|nice|modern|beautiful|professional|user-friendly)/i.test(lower)) {
      return `Subjective quality descriptor without measurable criteria. Define specific UX/UI requirements.`;
    }

    if (/(?:maybe|perhaps|not sure|i think|i guess)/i.test(lower)) {
      return `Uncertain requirement cannot be scoped. Client should confirm whether this is needed.`;
    }

    return `Statement lacks specificity for accurate scoping. Request concrete details from the client.`;
  }

  /**
   * Validate if a constraint is feasible
   */
  function validateConstraintFeasibility(statement) {
    const lower = statement.toLowerCase();

    // Budget constraint check
    const budgetMatch = statement.match(/\$\s*([\d,]+)/);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1].replace(/,/g, ''));
      if (amount < BUDGET_THRESHOLDS.min) {
        return {
          feasible: false,
          reason: `Budget of $${amount.toLocaleString()} is below minimum viable threshold ($${BUDGET_THRESHOLDS.min.toLocaleString()}). Unrealistic for any meaningful development.`,
        };
      }
      return {
        feasible: true,
        reason: `Budget constraint of $${amount.toLocaleString()} noted. Will be factored into scope and feature prioritization.`,
      };
    }

    // Timeline constraint check
    const timelineMatch = lower.match(/(\d+)\s*(days?|weeks?|months?)/);
    if (timelineMatch) {
      const amount = parseInt(timelineMatch[1]);
      const unit = timelineMatch[2];
      let weeks = amount;
      if (unit.startsWith('day')) weeks = Math.ceil(amount / 7);
      if (unit.startsWith('month')) weeks = amount * 4;

      if (weeks < 1) {
        return {
          feasible: false,
          reason: `Timeline of ${amount} ${unit} is unrealistic for any meaningful development. Minimum viable timeline is 2 weeks.`,
        };
      }

      return {
        feasible: true,
        reason: `Timeline constraint of ${amount} ${unit} acknowledged. Development plan will be prioritized to fit this window.`,
      };
    }

    // Technical constraints are generally feasible
    return {
      feasible: true,
      reason: `Technical constraint acknowledged and factored into project planning.`,
    };
  }

  /**
   * Build justification for scope change items
   */
  function buildScopeChangeJustification(statement) {
    const lower = statement.toLowerCase();

    if (/(?:blockchain|crypto|nft|metaverse)/i.test(lower)) {
      return `Involves blockchain/crypto technology — requires specialized expertise, separate architecture, and its own project lifecycle. Marked out of scope.`;
    }

    if (/(?:ai |machine learning|ml |nlp|chatbot)/i.test(lower)) {
      return `AI/ML capabilities require specialized resources, data preparation, model training, and dedicated infrastructure. This constitutes a separate workstream.`;
    }

    if (/(?:mobile app|native app|ios|android)/i.test(lower)) {
      return `Native mobile app development is a separate project with its own design, development, and deployment lifecycle. Not included in web platform scope.`;
    }

    if (/(?:separate|another|new)\s+(?:app|platform|system|project)/i.test(lower)) {
      return `This describes a separate project entirely. Each platform/system should be scoped independently with its own timeline and budget.`;
    }

    return `This request significantly expands beyond the core project scope. It requires separate planning, budgeting, and potentially different technology choices. Marked as out of scope.`;
  }

  /**
   * Build the Problem Understanding section
   */
  function buildProblemUnderstanding(input, evaluated) {
    const lower = input.toLowerCase();
    const features = evaluated.filter(e => e.classification === 'feature' && e.decision === 'accept');
    const constraints = evaluated.filter(e => e.classification === 'constraint' && e.decision === 'accept');

    // Try to extract the core objective
    let coreObjective = '';
    const objectivePatterns = [
      /(?:we need|i need|we want|i want|looking for|goal is|objective is|we're building|build)\s+(.+?)(?:\.|$)/i,
      /(?:create|develop|design)\s+(?:a|an|the)\s+(.+?)(?:\.|$)/i,
    ];

    for (const pattern of objectivePatterns) {
      const match = input.match(pattern);
      if (match) {
        coreObjective = match[1].trim();
        break;
      }
    }

    if (!coreObjective) {
      // Use first meaningful statement
      const firstFeature = features[0]?.statement || evaluated[0]?.statement || '';
      coreObjective = firstFeature;
    }

    // Determine project type
    let projectType = 'Web Application';
    if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store')) {
      projectType = 'E-Commerce Platform';
    } else if (lower.includes('dashboard') || lower.includes('analytics')) {
      projectType = 'Analytics Dashboard';
    } else if (lower.includes('portal') || lower.includes('management')) {
      projectType = 'Management Portal';
    } else if (lower.includes('marketplace')) {
      projectType = 'Marketplace Platform';
    } else if (lower.includes('crm') || lower.includes('customer relationship')) {
      projectType = 'CRM System';
    } else if (lower.includes('saas') || lower.includes('subscription')) {
      projectType = 'SaaS Application';
    }

    return {
      coreObjective: capitalizeFirst(coreObjective),
      projectType,
      totalInputs: evaluated.length,
      acceptedFeatures: features.length,
      constraintsFound: constraints.length,
      issuesFound: evaluated.filter(e => e.decision !== 'accept').length,
      summary: `The client requires a ${projectType} focused on: ${capitalizeFirst(coreObjective)}. From ${evaluated.length} input statements, ${features.length} actionable features were identified, ${constraints.length} constraints noted, and ${evaluated.filter(e => e.decision !== 'accept').length} items flagged for review.`,
    };
  }

  /**
   * Build the Base Scope from accepted features
   */
  function buildBaseScope(accepted) {
    const features = accepted.filter(a => a.classification === 'feature' || a.classification === 'valid-extension');
    const constraints = accepted.filter(a => a.classification === 'constraint');

    return {
      features: features.map(f => ({
        name: capitalizeFirst(f.statement),
        type: f.classification === 'valid-extension' ? 'Extension' : 'Core Feature',
      })),
      constraints: constraints.map(c => ({
        name: capitalizeFirst(c.statement),
        feasibility: 'Validated',
      })),
      totalFeatures: features.length,
      totalConstraints: constraints.length,
    };
  }

  /**
   * Estimate budget from accepted features
   */
  function estimateBudget(accepted, allItems) {
    const features = accepted.filter(a => a.classification === 'feature' || a.classification === 'valid-extension');
    const featureCount = features.length;

    if (featureCount === 0) {
      return {
        estimated: false,
        message: 'No accepted features to estimate budget for.',
      };
    }

    // Calculate complexity-based estimates
    let totalHours = 0;
    const featureEstimates = features.map(f => {
      const complexity = estimateFeatureComplexity(f.statement);
      const hours = complexity.hours;
      totalHours += hours;
      return {
        name: capitalizeFirst(f.statement),
        complexity: complexity.level,
        hours,
        cost: hours * 100, // $100/hr rate
      };
    });

    // Add overhead (PM, QA, design, meetings — 30%)
    const overheadHours = Math.round(totalHours * 0.3);
    totalHours += overheadHours;

    const minCost = Math.round(totalHours * 80 / 1000) * 1000;
    const maxCost = Math.round(totalHours * 120 / 1000) * 1000;
    const avgCost = Math.round((minCost + maxCost) / 2 / 1000) * 1000;

    // Timeline estimate
    const devWeeks = Math.ceil(totalHours / 40);
    const minWeeks = Math.max(2, devWeeks - 2);
    const maxWeeks = devWeeks + 3;

    // Check if client-provided budget constraint exists
    let budgetFit = null;
    const budgetConstraint = allItems.find(i =>
      i.classification === 'constraint' && /\$[\d,]+/.test(i.statement)
    );
    if (budgetConstraint) {
      const clientBudget = parseInt(budgetConstraint.statement.match(/\$([\d,]+)/)[1].replace(/,/g, ''));
      if (clientBudget < minCost) {
        budgetFit = {
          status: 'over-budget',
          message: `Client budget ($${clientBudget.toLocaleString()}) is below the estimated minimum ($${minCost.toLocaleString()}). Scope reduction or phased delivery recommended.`,
          clientBudget,
        };
      } else if (clientBudget >= maxCost) {
        budgetFit = {
          status: 'within-budget',
          message: `Client budget ($${clientBudget.toLocaleString()}) comfortably covers the estimated range. Full scope delivery is feasible.`,
          clientBudget,
        };
      } else {
        budgetFit = {
          status: 'tight-budget',
          message: `Client budget ($${clientBudget.toLocaleString()}) is within range but tight. Prioritized feature delivery recommended.`,
          clientBudget,
        };
      }
    }

    return {
      estimated: true,
      featureEstimates,
      totalHours,
      overheadHours,
      costRange: { min: minCost, max: maxCost, avg: avgCost, currency: 'USD' },
      timelineRange: { min: minWeeks, max: maxWeeks, unit: 'weeks' },
      budgetFit,
      hourlyRate: 100,
    };
  }

  /**
   * Estimate complexity for a single feature
   */
  function estimateFeatureComplexity(statement) {
    const lower = statement.toLowerCase();

    const highComplexity = ['payment', 'billing', 'subscription', 'real-time', 'websocket',
      'integration', 'api', 'analytics', 'dashboard', 'e-commerce', 'marketplace',
      'workflow', 'automation', 'video', 'streaming'];

    const medComplexity = ['auth', 'login', 'signup', 'search', 'filter', 'notification',
      'email', 'report', 'export', 'upload', 'file', 'user management', 'role',
      'permission', 'calendar', 'booking', 'inventory', 'review', 'rating'];

    if (highComplexity.some(kw => lower.includes(kw))) {
      return { level: 'High', hours: 60 };
    }
    if (medComplexity.some(kw => lower.includes(kw))) {
      return { level: 'Medium', hours: 40 };
    }
    return { level: 'Low', hours: 24 };
  }

  /**
   * Build the Execution Plan from accepted features only
   */
  function buildExecutionPlan(accepted) {
    const features = accepted.filter(a => a.classification === 'feature' || a.classification === 'valid-extension');

    if (features.length === 0) {
      return {
        phases: [],
        message: 'No accepted features to plan execution for.',
      };
    }

    // Group features into phases
    const phases = [];

    // Phase 1: Discovery & Design (always exists)
    phases.push({
      name: 'Discovery & Design',
      icon: '🎨',
      duration: features.length <= 3 ? '1 week' : '1-2 weeks',
      tasks: [
        'Requirement finalization & sign-off',
        'Information architecture & wireframes',
        'UI/UX design mockups',
        'Technical architecture document',
      ],
      color: '#00d4ff',
    });

    // Phase 2: Core Development
    const coreFeatures = features.slice(0, Math.ceil(features.length * 0.6));
    phases.push({
      name: 'Core Development',
      icon: '⚙️',
      duration: coreFeatures.length <= 2 ? '2-3 weeks' : `${coreFeatures.length + 1}-${coreFeatures.length + 3} weeks`,
      tasks: coreFeatures.map(f => `Implement: ${capitalizeFirst(f.statement)}`),
      color: '#7c3aed',
    });

    // Phase 3: Extensions (if any)
    const extensionFeatures = features.slice(Math.ceil(features.length * 0.6));
    if (extensionFeatures.length > 0) {
      phases.push({
        name: 'Extensions & Enhancements',
        icon: '🔧',
        duration: `${extensionFeatures.length}-${extensionFeatures.length + 2} weeks`,
        tasks: extensionFeatures.map(f => `Implement: ${capitalizeFirst(f.statement)}`),
        color: '#3b82f6',
      });
    }

    // Phase 4: Testing & QA
    phases.push({
      name: 'Testing & QA',
      icon: '🧪',
      duration: features.length <= 3 ? '1 week' : '1-2 weeks',
      tasks: [
        'Unit & integration testing',
        'Cross-browser compatibility testing',
        'Performance & load testing',
        'Security audit',
        'Bug fixes & optimization',
      ],
      color: '#10b981',
    });

    // Phase 5: Launch
    phases.push({
      name: 'UAT & Launch',
      icon: '🚀',
      duration: '1 week',
      tasks: [
        'User acceptance testing',
        'Production deployment',
        'Post-launch monitoring',
        'Documentation & handover',
      ],
      color: '#f59e0b',
    });

    return {
      phases,
      totalPhases: phases.length,
    };
  }

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    analyzeClientBrief,
    AGENT_NAME,
    AGENT_ICON,
    AGENT_COLOR,
  };
})();
